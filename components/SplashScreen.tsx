import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { AppColors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;

useEffect(() => {
  // Parallel animations
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 2,
      useNativeDriver: true,
    }),
    Animated.timing(loadingWidth, {
      toValue: width * 0.6, // match loadingBar width
      duration: 2500,
      useNativeDriver: false, // width animation must not use native driver
    }),
  ]).start();

  const timer = setTimeout(() => {
    onAnimationComplete();
  }, 3000);

  return () => clearTimeout(timer);
}, [fadeAnim, scaleAnim, loadingWidth, onAnimationComplete]);


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
        <Text style={styles.logoText}>1000</Text>
        <Text style={styles.logoSubText}>BANKS</Text>
      </Animated.View>
      
      <Animated.View style={[styles.taglineContainer, { opacity: fadeAnim }]}>
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
    marginBottom: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: -1,
  },
  logoSubText: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.text.primary,
    letterSpacing: 3,
    marginTop: -10,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingBar: {
    width: width * 0.6,
    height: 3,
    backgroundColor: AppColors.background.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
});

export default SplashScreen;