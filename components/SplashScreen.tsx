import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { AppColors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
  loadingProgress?: number; // 0-100
  loadingText?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onAnimationComplete, 
  loadingProgress = 0, 
  loadingText = 'Loading...' 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;
  
  // Cleanup animated values on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      fadeAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      loadingWidth.removeAllListeners();
    };
  }, [fadeAnim, scaleAnim, loadingWidth]);

useEffect(() => {
  // Simple entrance animations - fade in and scale up once
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 2,
      useNativeDriver: true,
    }),
  ]).start();
}, [fadeAnim, scaleAnim]);

// Update loading progress
useEffect(() => {
  Animated.timing(loadingWidth, {
    toValue: (loadingProgress / 100) * width * 0.6,
    duration: 300,
    useNativeDriver: false,
  }).start();
}, [loadingProgress, loadingWidth]);

// Complete loading when progress reaches 100%
useEffect(() => {
  if (loadingProgress >= 100) {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 500); // Small delay after loading complete
    return () => clearTimeout(timer);
  }
}, [loadingProgress, onAnimationComplete]);


  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image 
          source={require('../assets/images/logo.webp')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>{loadingText}</Text>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: loadingWidth,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(loadingProgress)}%</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logoImage: {
    width: 200,
    height: 120,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 20,
    fontWeight: '500',
  },
  loadingBar: {
    width: width * 0.6,
    height: 4,
    backgroundColor: AppColors.background.card,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '600',
  },
});

export default SplashScreen;