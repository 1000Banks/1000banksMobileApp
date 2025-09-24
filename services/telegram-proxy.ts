import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from '@react-native-firebase/firestore';
// import { httpsCallable } from '@react-native-firebase/functions'; // Commented until Firebase Functions is set up
import firebaseService from './firebase';

const db = firebaseService.db;

export interface TelegramChannel {
  id: string;
  name: string;
  chatId: string;
  botToken: string;
  isActive: boolean;
  subscriptionType: 'free' | 'paid';
  subscriptionPrice: number;
  description: string;
  createdAt: any;
}

export interface ChannelSubscription {
  id: string;
  userId: string;
  channelId: string;
  subscribedAt: any;
  expiresAt?: any;
  isPaid: boolean;
  amountPaid?: number;
}

export class TelegramProxyService {
  private static instance: TelegramProxyService;
  private pollingIntervals: Map<string, NodeJS.Timeout | number> = new Map();
  // private telegramProxy = httpsCallable(firebaseService.functions, 'telegramProxy'); // Commented until setup

  private constructor() {}

  static getInstance(): TelegramProxyService {
    if (!TelegramProxyService.instance) {
      TelegramProxyService.instance = new TelegramProxyService();
    }
    return TelegramProxyService.instance;
  }

  // Proxy method to call Telegram API through Firebase Functions
  private async callTelegramAPI(endpoint: string, botToken: string): Promise<any> {
    // Placeholder until Firebase Functions is set up
    throw new Error('Firebase Functions not available yet. Please upgrade to Blaze plan to enable proxy service.');
  }

  async verifyBotToken(botToken: string): Promise<any> {
    try {
      const response = await this.callTelegramAPI('getMe', botToken);
      console.log('✅ Bot verification successful via proxy:', response.result.username);
      return {
        success: true,
        botInfo: response.result
      };
    } catch (error) {
      console.error('❌ Bot verification failed:', error);
      return {
        success: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  async verifyChatId(botToken: string, chatId: string): Promise<any> {
    try {
      console.log(`🔍 Verifying chat ID via proxy: ${chatId}`);

      const response = await this.callTelegramAPI(`getChat?chat_id=${chatId}`, botToken);

      console.log('✅ Chat verification successful:', {
        id: response.result.id,
        type: response.result.type,
        title: response.result.title || response.result.username || 'No title'
      });

      return {
        success: true,
        chatInfo: response.result
      };
    } catch (error) {
      console.error('❌ Chat verification failed:', error);
      return {
        success: false,
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Chat verification failed'
      };
    }
  }

  async getUpdates(botToken: string, offset: number = 0): Promise<any> {
    try {
      const endpoint = offset > 0 ? `getUpdates?offset=${offset}` : 'getUpdates';
      const response = await this.callTelegramAPI(endpoint, botToken);
      return response.result || [];
    } catch (error) {
      console.error('❌ Failed to get updates:', error);
      return [];
    }
  }

  async saveTelegramSettings(settings: Omit<TelegramChannel, 'id' | 'createdAt'>) {
    try {
      // First verify the bot and chat via proxy
      const botVerification = await this.verifyBotToken(settings.botToken);
      if (!botVerification.success) {
        return {
          success: false,
          error: `Bot verification failed: ${botVerification.error}`
        };
      }

      if (settings.chatId) {
        const chatVerification = await this.verifyChatId(settings.botToken, settings.chatId);
        if (!chatVerification.success) {
          return {
            success: false,
            error: `Chat verification failed: ${chatVerification.error}`
          };
        }

        // Use the actual chat ID from Telegram
        const actualChatId = chatVerification.chatInfo.id.toString();

        // Stop any existing polling
        this.stopPolling(actualChatId);

        // Save to Firestore
        await setDoc(doc(db, 'telegramChannels', actualChatId), {
          ...settings,
          chatId: actualChatId,
          createdAt: serverTimestamp(),
        });

        // Start polling if active
        if (settings.isActive) {
          await this.startPolling(actualChatId, settings.botToken);
        }

        return { success: true, channelId: actualChatId };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving Telegram settings:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Polling with proxy
  private async startPolling(chatId: string, botToken: string) {
    console.log(`🚀 Starting Telegram polling via proxy for chat: ${chatId}`);

    if (this.pollingIntervals.has(chatId)) {
      clearInterval(this.pollingIntervals.get(chatId)!);
    }

    let lastUpdateId = 0;

    const pollMessages = async () => {
      try {
        const updates = await this.getUpdates(botToken, lastUpdateId + 1);

        if (updates.length > 0) {
          console.log(`📨 Received ${updates.length} updates via proxy`);

          for (const update of updates) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            const message = update.message || update.channel_post || update.edited_message || update.edited_channel_post;

            if (message && message.chat) {
              const messageChatId = message.chat.id.toString();

              if (messageChatId === chatId) {
                console.log('✅ Processing message via proxy:', message.text);
                await this.processMessage(chatId, message);
              }
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Poll every 10 seconds (longer interval for proxy)
    const interval = setInterval(pollMessages, 10000);
    this.pollingIntervals.set(chatId, interval);

    // Initial poll
    pollMessages();
  }

  private async processMessage(channelId: string, message: any) {
    try {
      console.log('📝 Processing message for notifications...');

      // Save message to database
      await addDoc(collection(db, 'telegramMessages'), {
        channelId,
        text: message.text || '',
        timestamp: serverTimestamp(),
        fromUser: message.from?.username || message.from?.first_name || 'Unknown',
        messageId: message.message_id,
      });

      // Get subscribers and create notifications
      const subscribers = await this.getChannelSubscribers(channelId);
      console.log(`📢 Creating notifications for ${subscribers.length} subscribers`);

      for (const subscriber of subscribers) {
        await this.createNotification(
          subscriber.userId,
          channelId,
          message.text || 'New message',
          message.from?.username || message.from?.first_name || 'Unknown'
        );
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private async getChannelSubscribers(channelId: string): Promise<ChannelSubscription[]> {
    try {
      const subscriptionsQuery = query(
        collection(db, 'channelSubscriptions'),
        where('channelId', '==', channelId)
      );
      const snapshot = await getDocs(subscriptionsQuery);

      const activeSubscriptions: ChannelSubscription[] = [];

      for (const docSnapshot of snapshot.docs) {
        const subscription = {
          id: docSnapshot.id,
          ...docSnapshot.data() as Omit<ChannelSubscription, 'id'>
        };

        const isActive = !subscription.isPaid ||
          (subscription.expiresAt && subscription.expiresAt.toDate() > new Date());

        if (isActive) {
          activeSubscriptions.push(subscription);
        }
      }

      return activeSubscriptions;
    } catch (error) {
      console.error('Error getting subscribers:', error);
      return [];
    }
  }

  private async createNotification(userId: string, channelId: string, message: string, fromUser?: string) {
    try {
      const channelDoc = await getDoc(doc(db, 'telegramChannels', channelId));
      const channelData = channelDoc.exists() ? channelDoc.data() : null;

      const title = channelData ? `${channelData.name} - Trading Signal` : 'Trading Signal';
      const body = fromUser ? `${fromUser}: ${message}` : message;

      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message: body,
        timestamp: serverTimestamp(),
        read: false,
        type: 'trading',
        channelId,
      });

      console.log(`✅ Notification created for user: ${userId}`);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  stopPolling(chatId: string) {
    if (this.pollingIntervals.has(chatId)) {
      clearInterval(this.pollingIntervals.get(chatId)!);
      this.pollingIntervals.delete(chatId);
      console.log(`🛑 Stopped polling for chat: ${chatId}`);
    }
  }

  stopAllPolling() {
    for (const [chatId, interval] of this.pollingIntervals) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    console.log('🛑 Stopped all polling');
  }

  // Other methods from original service...
  async getAllActiveChannels(): Promise<TelegramChannel[]> {
    try {
      const channelsQuery = query(
        collection(db, 'telegramChannels'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(channelsQuery);

      const channels: TelegramChannel[] = [];
      snapshot.forEach((doc) => {
        channels.push({
          id: doc.id,
          ...doc.data() as Omit<TelegramChannel, 'id'>
        });
      });

      return channels;
    } catch (error) {
      console.error('Error getting active channels:', error);
      return [];
    }
  }

  async subscribeToChannel(userId: string, channelId: string, isPaid: boolean = false, amountPaid?: number) {
    try {
      const subscription: any = {
        userId,
        channelId,
        subscribedAt: serverTimestamp(),
        isPaid,
      };

      if (amountPaid !== undefined) {
        subscription.amountPaid = amountPaid;
      }

      if (isPaid) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        subscription.expiresAt = expiryDate;
      }

      const docRef = await addDoc(collection(db, 'channelSubscriptions'), subscription);
      return { success: true, subscriptionId: docRef.id };
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      return { success: false, error };
    }
  }

  async isUserSubscribed(userId: string, channelId: string): Promise<boolean> {
    try {
      const subscriptionsQuery = query(
        collection(db, 'channelSubscriptions'),
        where('userId', '==', userId),
        where('channelId', '==', channelId)
      );
      const snapshot = await getDocs(subscriptionsQuery);

      if (snapshot.empty) return false;

      const subscription = snapshot.docs[0].data() as ChannelSubscription;

      if (!subscription.isPaid) return true;

      if (subscription.expiresAt) {
        const expiryDate = subscription.expiresAt.toDate();
        return expiryDate > new Date();
      }

      return true;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  async initializeActiveChannels() {
    try {
      const activeChannels = await this.getAllActiveChannels();

      for (const channel of activeChannels) {
        if (channel.botToken && channel.chatId) {
          await this.startPolling(channel.chatId, channel.botToken);
        }
      }

      console.log(`🚀 Initialized proxy polling for ${activeChannels.length} channels`);
    } catch (error) {
      console.error('Error initializing active channels:', error);
    }
  }

  async sendTestNotification(channelId: string, testMessage: string = 'Test Trading Signal') {
    try {
      const subscribers = await this.getChannelSubscribers(channelId);

      for (const subscriber of subscribers) {
        await this.createNotification(
          subscriber.userId,
          channelId,
          testMessage,
          'System'
        );
      }

      return { success: true, subscribersNotified: subscribers.length };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, error };
    }
  }
}

export const telegramProxyService = TelegramProxyService.getInstance();