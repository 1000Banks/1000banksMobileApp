import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

const TradingScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Trading" showBackButton={false} />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="trending-up" size={80} color={AppColors.primary} />
          </View>
          <Text style={styles.title}>Trading Platform</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          <Text style={styles.description}>
            Our comprehensive trading platform with real-time market data, 
            expert analysis, and trading signals is currently under development.
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's Coming:</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
              <Text style={styles.featureText}>Real-time market data</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
              <Text style={styles.featureText}>Expert trading signals</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
              <Text style={styles.featureText}>Live trading calls</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
              <Text style={styles.featureText}>Portfolio management</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
              <Text style={styles.featureText}>Educational resources</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomTabs />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginLeft: 12,
  },
  notifyButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
});

export default TradingScreen;