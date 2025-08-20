import { useEffect } from 'react';
import { telegramService } from '@/services/telegram';

export default function TelegramPollingInitializer() {
  useEffect(() => {
    // Initialize Telegram polling for active channels when app starts
    const initTelegram = async () => {
      try {
        console.log('Initializing Telegram polling...');
        await telegramService.initializeActiveChannels();
      } catch (error) {
        console.error('Error initializing Telegram polling:', error);
      }
    };

    initTelegram();

    // Cleanup function to stop polling when app unmounts
    return () => {
      console.log('Stopping Telegram polling...');
      telegramService.stopAllPolling();
    };
  }, []);

  return null; // This component doesn't render anything
}