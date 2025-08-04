import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showSplash, setShowSplash] = useState(true);

  const handleGetStarted = () => {
    // Navigate to auth screen
    router.push('/auth');
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>1000</Text>
          <Text style={styles.logoSubText}>BANKS</Text>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Your Gateway to Financial Excellence
        </Text>
        <Text style={styles.heroSubtitle}>
          Connect with over 1000 banks worldwide. Manage your finances seamlessly 
          with our comprehensive banking platform.
        </Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Get Started</Text>
      </TouchableOpacity>

      {/* Features Overview */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.iconPlaceholder}>🏦</Text>
          </View>
          <Text style={styles.featureTitle}>1000+ Banks</Text>
          <Text style={styles.featureDescription}>
            Access a vast network of financial institutions
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.iconPlaceholder}>🔒</Text>
          </View>
          <Text style={styles.featureTitle}>Secure Platform</Text>
          <Text style={styles.featureDescription}>
            Bank-level security for all your transactions
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.iconPlaceholder}>📱</Text>
          </View>
          <Text style={styles.featureTitle}>Mobile First</Text>
          <Text style={styles.featureDescription}>
            Designed for seamless mobile banking experience
          </Text>
        </View>
      </View>

      {/* Secondary CTA */}
      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Learn More</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 32,
    fontWeight: '600',
    color: '#046bd2',
    letterSpacing: -0.5,
  },
  logoSubText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: 2,
    marginLeft: 5,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#f9fafb',
  },
  heroTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 40,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 48,
    marginBottom: 20,
  },
  heroSubtitle: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 17,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 27,
  },
  ctaButton: {
    marginHorizontal: 20,
    backgroundColor: '#046bd2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 2,
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonText: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f9fafb',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconPlaceholder: {
    fontSize: 28,
  },
  featureTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  featureDescription: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 17,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 27,
  },
  secondaryButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#046bd2',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 17,
    fontWeight: '600',
    color: '#046bd2',
  },
});