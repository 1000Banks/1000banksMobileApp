import { useState, useEffect, useCallback } from 'react';
import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { Video } from 'expo-av';

interface ResourceLoaderState {
  progress: number;
  isLoading: boolean;
  loadingText: string;
  error?: string;
}

export const useResourceLoader = () => {
  const [state, setState] = useState<ResourceLoaderState>({
    progress: 0,
    isLoading: true,
    loadingText: 'Initializing...',
  });

  const updateProgress = useCallback((progress: number, text: string) => {
    setState(prev => ({
      ...prev,
      progress,
      loadingText: text,
      isLoading: progress < 100,
    }));
  }, []);

  const loadResources = useCallback(async () => {
    try {
      updateProgress(5, 'Initializing app...');
      await new Promise(resolve => setTimeout(resolve, 100));

      updateProgress(15, 'Loading logo...');
      // Preload logo image
      try {
        await Asset.fromModule(require('@/assets/images/logo.webp')).downloadAsync();
      } catch (error) {
        console.warn('Logo loading error:', error);
      }

      updateProgress(30, 'Loading course data...');
      // Simulate loading course data (you can replace with actual data loading)
      await new Promise(resolve => setTimeout(resolve, 400));

      updateProgress(50, 'Loading merchandise...');
      // Simulate loading merch data
      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress(70, 'Loading video content...');
      // Preload video asset
      try {
        await Asset.fromModule(require('@/assets/images/Final_Funds_Vision_Book.mp4')).downloadAsync();
      } catch (error) {
        console.warn('Video loading error:', error);
        // Continue even if video fails to load
      }

      updateProgress(85, 'Loading UI assets...');
      // Load any other UI assets
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(95, 'Finalizing...');
      // Final setup
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(100, 'Welcome to 1000Banks!');

    } catch (error) {
      console.error('Resource loading error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load resources',
        isLoading: false,
      }));
    }
  }, [updateProgress]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  return state;
};