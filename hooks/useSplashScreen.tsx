import { useState, useEffect } from 'react';

let hasShownSplash = false;

export const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(!hasShownSplash);
  
  const hideSplash = () => {
    hasShownSplash = true;
    setShowSplash(false);
  };
  
  return { showSplash, hideSplash };
};