import { useEffect } from 'react';
import { telegramService } from '@/services/telegram';
// import { telegramProxyService } from '@/services/telegram-proxy'; // Temporarily disabled
import firebaseService from '@/services/firebase';

export default function TelegramPollingInitializer() {
  useEffect(() => {
    // Initialize Telegram polling for active channels when app starts
    const initTelegram = async () => {
      try {
        console.log('🚀 Initializing Telegram polling...');

        // Check if app settings indicate using proxy
        let useProxy = true; // Default to proxy for regions with restrictions

        try {
          const isAdmin = await firebaseService.isAdmin();
          if (isAdmin) {
            const appSettings = await firebaseService.getAppSettings();
            useProxy = appSettings?.telegram?.useProxy ?? true;
          }
        } catch (error) {
          console.log('Could not check admin settings, defaulting to proxy mode');
        }

        // For now, always use direct service (proxy disabled until Firebase Functions setup)
        const service = telegramService;
        console.log(`🌐 Using DIRECT mode for Telegram API (proxy temporarily disabled)`);

        await service.initializeActiveChannels();
      } catch (error) {
        console.error('Error initializing Telegram polling:', error);
      }
    };

    initTelegram();

    // Cleanup function to stop polling when app unmounts
    return () => {
      console.log('🛑 Stopping Telegram polling...');
      telegramService.stopAllPolling();
      // telegramProxyService.stopAllPolling(); // Disabled
    };
  }, []);

  return null; // This component doesn't render anything
}