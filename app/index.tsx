import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ImageBackground,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import SplashScreen from '../components/SplashScreen';
import { AppColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSignUp = () => {
    router.push('/auth');
  };

  // Sample merch data
  const merchData = [
    { id: '1', name: '1000Banks Hoodie', price: '$49.99', image: '👕', description: 'Premium quality hoodie with 1000Banks logo' },
    { id: '2', name: 'Financial Freedom Mug', price: '$19.99', image: '☕', description: 'Start your day with motivation' },
    { id: '3', name: 'Entrepreneur Cap', price: '$24.99', image: '🧢', description: 'Stylish cap for the modern entrepreneur' },
    { id: '4', name: 'Success Journal', price: '$29.99', image: '📔', description: 'Track your journey to financial freedom' },
    { id: '5', name: 'Investment Tee', price: '$24.99', image: '👔', description: 'Comfortable cotton tee with inspiring quotes' },
    { id: '6', name: 'Wealth Mindset Book', price: '$34.99', image: '📚', description: 'Essential reading for financial success' },
    { id: '7', name: 'Money Tracker Planner', price: '$39.99', image: '📅', description: 'Organize your finances effectively' },
    { id: '8', name: 'Motivational Water Bottle', price: '$22.99', image: '💧', description: 'Stay hydrated, stay motivated' },
  ];

  const renderHomeContent = () => (
    <>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Manifesting Positive Vision</Text>
        <Text style={styles.heroSubtitle}>
          Embracing Focus and{'\n'}Purpose in Our Brand Culture
        </Text>
        <Text style={styles.heroDescription}>
          Our program empowers entrepreneurs to invest, plan, and budget 
          effectively while developing corporate dropout plans.
        </Text>
        <TouchableOpacity style={styles.joinCommunityButton}>
          <Text style={styles.joinCommunityButtonText}>Join the Community</Text>
        </TouchableOpacity>
      </View>

      {/* Founder Quote */}
      <View style={styles.founderQuoteSection}>
        <Text style={styles.quoteText}>
          "If opportunity doesn't come knocking, BUILD A DOOR."
        </Text>
        <Text style={styles.founderName}>Devonne Stokes</Text>
        <Text style={styles.founderTitle}>Financial Freedom Expert</Text>
      </View>

      {/* Video Section */}
      <View style={styles.videoSection}>
        <Text style={styles.videoHeading}>Financial</Text>
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlayButton}>▶️</Text>
            <Text style={styles.videoText}>Video Content</Text>
          </View>
          <View style={styles.breakthroughTextContainer}>
            <Text style={styles.breakthroughText}>BREAKTHROUGH</Text>
          </View>
        </View>
      </View>

      {/* Academy Section */}
      <View style={styles.academySection}>
        <Text style={styles.academyText}>Want to know more about us?</Text>
        <Text style={styles.joinText}>JOIN OUR</Text>
        <Text style={styles.academyTitle}>ACADEMY</Text>
        <Text style={styles.comingSoonText}>coming soon</Text>
      </View>

      {/* Merch Preview Section */}
      <View style={styles.merchSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Merchandise</Text>
          <TouchableOpacity onPress={() => setActiveTab('shop')}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={merchData.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.merchCard}>
              <Text style={styles.merchImage}>{item.image}</Text>
              <Text style={styles.merchName}>{item.name}</Text>
              <Text style={styles.merchPrice}>{item.price}</Text>
            </View>
          )}
          contentContainerStyle={styles.merchList}
        />
      </View>
    </>
  );

  const renderShopContent = () => (
    <View style={styles.shopContainer}>
      <View style={styles.shopHeader}>
        <Text style={styles.shopTitle}>1000Banks Merchandise</Text>
        <Text style={styles.shopSubtitle}>Premium quality items to support your journey</Text>
      </View>
      
      <FlatList
        data={merchData}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.shopItemCard}>
            <Text style={styles.shopItemImage}>{item.image}</Text>
            <Text style={styles.shopItemName}>{item.name}</Text>
            <Text style={styles.shopItemDescription}>{item.description}</Text>
            <Text style={styles.shopItemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.shopGrid}
        columnWrapperStyle={styles.shopRow}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'shop':
        return renderShopContent();
      case 'courses':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>Courses</Text>
            <Text style={styles.placeholderText}>Coming Soon!</Text>
          </View>
        );
      case 'trading':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>Trading</Text>
            <Text style={styles.placeholderText}>Coming Soon!</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderTitle}>Settings</Text>
            <Text style={styles.placeholderText}>Coming Soon!</Text>
          </View>
        );
      default:
        return renderHomeContent();
    }
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background.dark} />
      
      {/* Header with Menu */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>1000</Text>
          <Text style={styles.logoSubText}>BANKS</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Overlay */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuCloseButton} onPress={() => setMenuOpen(false)}>
              <Text style={styles.menuCloseIcon}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('shop'); setMenuOpen(false); }}>
                <Text style={styles.menuItemText}>Buy Merch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>We're Hiring</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Contact Us</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'home' && styles.activeTab]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'courses' && styles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={styles.tabIcon}>📚</Text>
          <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>Courses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'shop' && styles.activeTab]}
          onPress={() => setActiveTab('shop')}
        >
          <Text style={styles.tabIcon}>🛍️</Text>
          <Text style={[styles.tabText, activeTab === 'shop' && styles.activeTabText]}>Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'trading' && styles.activeTab]}
          onPress={() => setActiveTab('trading')}
        >
          <Text style={styles.tabIcon}>📈</Text>
          <Text style={[styles.tabText, activeTab === 'trading' && styles.activeTabText]}>Trading</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: 15,
    backgroundColor: AppColors.background.dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
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
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: AppColors.text.primary,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: AppColors.background.card,
    borderRadius: 20,
    padding: 32,
    width: width * 0.85,
    maxHeight: '80%',
  },
  menuCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
  },
  menuCloseIcon: {
    fontSize: 24,
    color: AppColors.text.primary,
  },
  menuItems: {
    marginBottom: 32,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.dark,
  },
  menuItemText: {
    fontSize: 18,
    color: AppColors.text.primary,
    fontWeight: '500',
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  signInButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  scrollContent: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.primary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  heroDescription: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  joinCommunityButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  joinCommunityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  founderQuoteSection: {
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  founderName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 4,
  },
  founderTitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  videoSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  videoHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  videoContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: AppColors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    fontSize: 48,
    marginBottom: 8,
  },
  videoText: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  breakthroughTextContainer: {
    position: 'absolute',
    top: 20,
    right: -10,
    transform: [{ rotate: '15deg' }],
  },
  breakthroughText: {
    fontSize: 24,
    fontWeight: '900',
    color: AppColors.primary,
    textShadowColor: AppColors.background.dark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  academySection: {
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  academyText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  joinText: {
    fontSize: 16,
    color: AppColors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  academyTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: AppColors.primary,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
  },
  merchSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  shopNowText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  merchList: {
    paddingLeft: 20,
  },
  merchCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 140,
    alignItems: 'center',
  },
  merchImage: {
    fontSize: 40,
    marginBottom: 12,
  },
  merchName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  merchPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primary,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.card,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: AppColors.primary + '20',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  // Shop Screen Styles
  shopContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  shopHeader: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  shopSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  shopGrid: {
    paddingHorizontal: 16,
  },
  shopRow: {
    justifyContent: 'space-between',
  },
  shopItemCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  shopItemImage: {
    fontSize: 48,
    marginBottom: 12,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  shopItemDescription: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  shopItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  // Placeholder Content Styles
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 100,
  },
  placeholderTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});