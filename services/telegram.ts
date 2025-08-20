import firebaseService from './firebase';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from '@react-native-firebase/firestore';

const db = getFirestore();

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

export interface TelegramMessage {
  id: string;
  channelId: string;
  text: string;
  timestamp: any;
  fromUser?: string;
  messageId: number;
}

export class TelegramService {
  private static instance: TelegramService;
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  async saveTelegramSettings(settings: Omit<TelegramChannel, 'id' | 'createdAt'>) {
    try {
      // Stop any existing polling for this chat
      this.stopPolling(settings.chatId);
      
      const channelRef = doc(db, 'telegramChannels', settings.chatId);
      await setDoc(channelRef, {
        ...settings,
        createdAt: serverTimestamp(),
      });
      
      if (settings.isActive) {
        await this.startPolling(settings.chatId, settings.botToken);
      }
      
      return { success: true, channelId: settings.chatId };
    } catch (error) {
      console.error('Error saving Telegram settings:', error);
      return { success: false, error };
    }
  }

  async getTelegramChannel(channelId: string): Promise<TelegramChannel | null> {
    try {
      const channelDoc = await getDoc(doc(db, 'telegramChannels', channelId));
      if (channelDoc.exists()) {
        return {
          id: channelDoc.id,
          ...channelDoc.data() as Omit<TelegramChannel, 'id'>
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting Telegram channel:', error);
      return null;
    }
  }

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

      // Only add amountPaid if it's defined
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

  async getUserSubscriptions(userId: string): Promise<ChannelSubscription[]> {
    try {
      const subscriptionsQuery = query(
        collection(db, 'channelSubscriptions'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(subscriptionsQuery);
      
      const subscriptions: ChannelSubscription[] = [];
      snapshot.forEach((doc) => {
        subscriptions.push({
          id: doc.id,
          ...doc.data() as Omit<ChannelSubscription, 'id'>
        });
      });
      
      return subscriptions;
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
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

  private async startPolling(chatId: string, botToken: string) {
    if (this.pollingIntervals.has(chatId)) {
      clearInterval(this.pollingIntervals.get(chatId)!);
    }

    console.log(`Starting Telegram polling for chat ID: ${chatId}`);
    let lastUpdateId = 0;

    const pollMessages = async () => {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}`
        );
        const data = await response.json();

        if (!data.ok) {
          console.error('Telegram API error:', data);
          return;
        }

        if (data.result.length > 0) {
          console.log(`Received ${data.result.length} updates from Telegram`);

          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            // Check both channel_post for channels and message for groups
            const message = update.channel_post || update.message;

            if (message) {
              const messageChatId = message.chat.id.toString();
              // Handle negative chat IDs (groups/channels)
              const normalizedChatId = messageChatId.replace('-', '');
              const normalizedStoredChatId = chatId.replace('-', '');

              console.log(`Checking message from chat ${messageChatId} against ${chatId}`);

              if (messageChatId === chatId || normalizedChatId === normalizedStoredChatId) {
                console.log('Processing message:', message.text);
                await this.processMessage(chatId, message);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling Telegram messages:', error);
      }
    };

    // Poll every 3 seconds for better responsiveness
    const interval = setInterval(pollMessages, 3000);
    this.pollingIntervals.set(chatId, interval);

    // Do initial poll immediately
    pollMessages();
  }

  private async processMessage(channelId: string, message: any) {
    try {
      console.log('Processing Telegram message for channel:', channelId);

      const telegramMessage: Omit<TelegramMessage, 'id'> = {
        channelId,
        text: message.text || '',
        timestamp: serverTimestamp(),
        fromUser: message.from?.username || message.from?.first_name || 'Unknown',
        messageId: message.message_id,
      };

      const messageDoc = await addDoc(collection(db, 'telegramMessages'), telegramMessage);
      console.log('Saved Telegram message to database:', messageDoc.id);

      const subscribers = await this.getChannelSubscribers(channelId);
      console.log(`Found ${subscribers.length} active subscribers for channel ${channelId}`);

      for (const subscriber of subscribers) {
        console.log(`Creating notification for user: ${subscriber.userId}`);
        await this.createNotification(
          subscriber.userId,
          channelId,
          message.text || 'New message',
          telegramMessage.fromUser
        );
      }
    } catch (error) {
      console.error('Error processing Telegram message:', error);
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
      
      for (const doc of snapshot.docs) {
        const subscription = {
          id: doc.id,
          ...doc.data() as Omit<ChannelSubscription, 'id'>
        };
        
        const isActive = !subscription.isPaid || 
          (subscription.expiresAt && subscription.expiresAt.toDate() > new Date());
        
        if (isActive) {
          activeSubscriptions.push(subscription);
        }
      }
      
      return activeSubscriptions;
    } catch (error) {
      console.error('Error getting channel subscribers:', error);
      return [];
    }
  }

  private async createNotification(
    userId: string,
    channelId: string,
    message: string,
    fromUser?: string
  ) {
    try {
      const channel = await this.getTelegramChannel(channelId);
      const title = channel ? `${channel.name} - Trading Signal` : 'Trading Signal';
      const body = fromUser ? `${fromUser}: ${message}` : message;

      console.log(`Creating notification - Title: ${title}, Body: ${body}, User: ${userId}`);

      // Save notification to database
      const notificationDoc = await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message: body,
        timestamp: serverTimestamp(),
        read: false,
        type: 'trading',
        channelId,
      });

      console.log('Notification created successfully:', notificationDoc.id);

      // TODO: Add push notifications when expo-notifications is properly configured
      // For now, notifications will be shown in the app's notification center
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  stopPolling(chatId: string) {
    if (this.pollingIntervals.has(chatId)) {
      clearInterval(this.pollingIntervals.get(chatId)!);
      this.pollingIntervals.delete(chatId);
    }
  }

  stopAllPolling() {
    for (const [chatId, interval] of this.pollingIntervals) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
  }

  // Initialize polling for all active channels
  async initializeActiveChannels() {
    try {
      const activeChannels = await this.getAllActiveChannels();

      for (const channel of activeChannels) {
        if (channel.botToken && channel.chatId) {
          await this.startPolling(channel.chatId, channel.botToken);
        }
      }

      console.log(`Initialized polling for ${activeChannels.length} active channels`);
    } catch (error) {
      console.error('Error initializing active channels:', error);
    }
  }

  // Test function to manually create a notification for all subscribers
  async sendTestNotification(channelId: string, testMessage: string = 'Test Trading Signal') {
    try {
      console.log('Sending test notification for channel:', channelId);

      const subscribers = await this.getChannelSubscribers(channelId);
      console.log(`Found ${subscribers.length} subscribers for test notification`);

      for (const subscriber of subscribers) {
        await this.createNotification(
          subscriber.userId,
          channelId,
          testMessage,
          'System'
        );
      }

      console.log('Test notifications sent successfully');
      return { success: true, subscribersNotified: subscribers.length };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, error };
    }
  }
}

export const telegramService = TelegramService.getInstance();