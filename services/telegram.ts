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
      // First verify the chat ID is valid
      const verification = await this.verifyChatId(settings.botToken, settings.chatId);
      if (!verification.success) {
        console.error('Invalid chat ID or bot token:', verification.error);
        return {
          success: false,
          error: `Failed to verify chat: ${verification.error}. Please check your Bot Token and Chat ID.`
        };
      }

      // Use the actual chat ID from Telegram (in case format is different)
      const actualChatId = verification.chatInfo.id.toString();
      console.log(`Using verified chat ID: ${actualChatId}`);

      // Stop any existing polling for this chat
      this.stopPolling(actualChatId);

      const channelRef = doc(db, 'telegramChannels', actualChatId);
      await setDoc(channelRef, {
        ...settings,
        chatId: actualChatId,  // Use the verified chat ID
        createdAt: serverTimestamp(),
      });

      if (settings.isActive) {
        await this.startPolling(actualChatId, settings.botToken);
      }

      return { success: true, channelId: actualChatId };
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

    // First, get the bot info to verify it's working with retry mechanism
    let botConnected = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!botConnected && retryCount < maxRetries) {
      try {
        console.log(`🔄 Attempting to connect to bot (attempt ${retryCount + 1}/${maxRetries})...`);
        console.log(`🔗 Testing URL: https://api.telegram.org/bot${botToken.substring(0, 10)}***/getMe`);

        // Simple fetch without complex timeout handling
        const startTime = Date.now();
        console.log(`🌐 Making request to Telegram API...`);

        const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseTime = Date.now() - startTime;
        console.log(`📊 Response received in ${responseTime}ms`);

        if (!botInfoResponse.ok) {
          const errorText = await botInfoResponse.text().catch(() => 'Unable to read error response');
          throw new Error(`HTTP ${botInfoResponse.status}: ${errorText}`);
        }

        const botInfo = await botInfoResponse.json();
        console.log(`📋 Bot API response:`, JSON.stringify(botInfo, null, 2));

        if (botInfo.ok) {
          console.log('✅ Bot connected successfully:', botInfo.result.username);
          console.log('🤖 Bot details:', {
            id: botInfo.result.id,
            username: botInfo.result.username,
            canJoinGroups: botInfo.result.can_join_groups,
            canReadAllGroupMessages: botInfo.result.can_read_all_group_messages
          });
          botConnected = true;
        } else {
          throw new Error(`Bot API error: ${botInfo.description}`);
        }
      } catch (error) {
        retryCount++;
        console.error(`❌ Bot connection attempt ${retryCount} failed:`, {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 200)
        });

        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    if (!botConnected) {
      console.error('❌ Failed to connect to Telegram bot after all retries. Stopping polling.');
      return;
    }

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    const pollMessages = async () => {
      try {
        // Simple fetch without AbortController
        console.log(`🔍 Polling for messages (lastUpdateId: ${lastUpdateId})...`);

        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.ok) {
          console.error('Telegram API error:', data);
          consecutiveErrors++;
          return;
        }

        // Reset error count on successful request
        consecutiveErrors = 0;

        if (data.result && data.result.length > 0) {
          console.log(`📨 Received ${data.result.length} updates from Telegram`);

          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);

            // Check for all types of messages
            const message = update.message || update.channel_post || update.edited_message || update.edited_channel_post;

            if (message && message.chat) {
              const messageChatId = message.chat.id.toString();

              console.log(`📱 Message from chat ${messageChatId} (${message.chat.type}): "${message.text}"`);

              // Compare chat IDs
              const storedChatIdStr = chatId.toString();

              if (messageChatId === storedChatIdStr) {
                console.log('✅ Chat ID matches! Processing message...');
                await this.processMessage(chatId, message);
              } else {
                console.log(`⚠️ Ignoring message from different chat: ${messageChatId} !== ${storedChatIdStr}`);
              }
            }
          }
        }
        // Removed "No new messages" log to reduce noise

      } catch (error) {
        consecutiveErrors++;

        if (error.name === 'AbortError') {
          console.log('⏱️ Telegram polling request timed out, continuing...');
        } else {
          console.error(`❌ Error polling Telegram messages (${consecutiveErrors}/${maxConsecutiveErrors}):`, error.message || error);
        }

        // If we have too many consecutive errors, stop polling
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`🛑 Too many consecutive errors (${consecutiveErrors}). Stopping polling for chat ${chatId}.`);
          this.stopPolling(chatId);
          return;
        }
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(pollMessages, 5000);
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

  // Helper method to verify chat ID and get chat info
  async verifyChatId(botToken: string, chatId: string): Promise<any> {
    try {
      console.log(`🔍 Verifying chat ID: ${chatId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout

      // Try to get chat info
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/getChat?chat_id=${chatId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok) {
        console.log('✅ Chat verification successful:', {
          id: data.result.id,
          type: data.result.type,
          title: data.result.title || data.result.username || 'No title'
        });
        return {
          success: true,
          chatInfo: data.result
        };
      } else {
        console.error('❌ Chat verification failed:', data);
        return {
          success: false,
          error: data.description || 'Unknown error'
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏱️ Chat verification timed out');
        return {
          success: false,
          error: 'Request timed out. Please check your internet connection.'
        };
      }

      console.error('❌ Error verifying chat ID:', error.message || error);
      return {
        success: false,
        error: error.message || 'Network error occurred'
      };
    }
  }
}

export const telegramService = TelegramService.getInstance();