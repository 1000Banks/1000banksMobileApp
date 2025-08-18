import { useState, useEffect } from 'react';
import { AppState } from 'react-native';

let hasShownSplash = false;

export const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(!hasShownSplash);
  
  // Reset splash screen flag when app goes to background/foreground to prevent memory accumulation
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // Reset after app has been in background for memory cleanup
        const resetTimer = setTimeout(() => {
          hasShownSplash = false;
        }, 300000); // 5 minutes
        
        return () => clearTimeout(resetTimer);
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
  
  const hideSplash = () => {
    hasShownSplash = true;
    setShowSplash(false);
  };
  
  return { showSplash, hideSplash };
};