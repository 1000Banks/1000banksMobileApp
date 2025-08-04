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
import { AppColors } from '../constants/Colors';

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
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background.dark} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>1000</Text>
          <Text style={styles.logoSubText}>BANKS</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>$288,648.43</Text>
        <View style={styles.balanceChange}>
          <Text style={styles.changeText}>▲ $18,540.00 (2.5%)</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>⬇</Text>
          </View>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>⬆</Text>
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>📊</Text>
          </View>
          <Text style={styles.actionText}>Insight</Text>
        </TouchableOpacity>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Get Started</Text>
      </TouchableOpacity>

      {/* Portfolio Section */}
      <View style={styles.portfolioSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.portfolioCard}>
          <View style={styles.stockInfo}>
            <View style={styles.stockIcon}>
              <Text style={styles.stockIconText}>🍎</Text>
            </View>
            <View style={styles.stockDetails}>
              <Text style={styles.stockSymbol}>AAPL</Text>
              <Text style={styles.stockName}>Apple Inc.</Text>
            </View>
          </View>
          <View style={styles.stockPrice}>
            <Text style={styles.priceText}>$327.82</Text>
            <Text style={styles.changePositive}>▲ 0.65%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: AppColors.background.dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: -0.5,
  },
  logoSubText: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
    letterSpacing: 1.5,
    marginLeft: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
    color: AppColors.text.secondary,
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    color: AppColors.accent.success,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: AppColors.background.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  ctaButton: {
    marginHorizontal: 20,
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  portfolioSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '500',
  },
  portfolioCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    width: 40,
    height: 40,
    backgroundColor: AppColors.background.dark,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stockIconText: {
    fontSize: 20,
  },
  stockDetails: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  stockName: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  changePositive: {
    fontSize: 12,
    color: AppColors.accent.success,
    fontWeight: '500',
    marginTop: 2,
  },
});