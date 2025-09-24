import { Ionicons } from '@expo/vector-icons';
// import MaskedView from '@react-native-masked-view/masked-view';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// import Svg, { Text as SvgText, Path, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import SplashScreen from '../components/SplashScreen';
import BottomTabs from '../components/BottomTabs';
import AppHeader from '../components/AppHeader';
import { AppColors } from '../constants/Colors';
import { useCart } from '../contexts/CartContext';
import { useResourceLoader } from '../hooks/useResourceLoader';
import { useSplashScreen } from '../hooks/useSplashScreen';
import firebaseService, { Product } from '../services/firebase';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [videoError, setVideoError] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { cartItems, addToCart, getCartCount } = useCart();
  const videoContainerRef = useRef<View>(null);

  // Create video player instance
  const player = useVideoPlayer(require('@/assets/images/Final_Funds_Vision_Book.mp4'), player => {
    player.loop = true;
    player.muted = false;
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const { progress, isLoading, loadingText } = useResourceLoader();
  const { showSplash, hideSplash } = useSplashScreen();

  // Show splash screen while resources are loading only on first app load
  const shouldShowSplash = showSplash && isLoading;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await firebaseService.getProducts();
      setProducts(fetchedProducts.slice(0, 8)); // Show only first 8 products
    } catch (error) {
      console.error('Error loading products:', error);
      // Use fallback data
      setProducts([
        { id: '1', name: '1000Banks Hoodie', price: '$49.99', image: '👕', description: 'Premium quality hoodie with 1000Banks logo', category: 'Apparel', stock: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Financial Freedom Mug', price: '$19.99', image: '☕', description: 'Start your day with motivation', category: 'Accessories', stock: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Entrepreneur Cap', price: '$24.99', image: '🧢', description: 'Stylish cap for the modern entrepreneur', category: 'Apparel', stock: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', name: 'Success Journal', price: '$29.99', image: '📔', description: 'Track your journey to financial freedom', category: 'Books', stock: 25, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ]);
    }
  };

  const handleGetStarted = () => {
    router.push('/sign-up');
  };


  // Handle scroll to check video visibility
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const windowHeight = Dimensions.get('window').height;
    
    // Approximate video position (you can adjust these values based on your layout)
    const videoStartY = 400; // Approximate Y position where video starts
    const videoEndY = videoStartY + 240; // Video height is 240
    
    // Check if video is in view
    const isVisible = scrollY < videoEndY && (scrollY + windowHeight) > videoStartY;
    
    if (isVisible !== isVideoVisible) {
      setIsVideoVisible(isVisible);
      
      // Auto-play/pause video based on visibility
      if (player) {
        if (isVisible) {
          player.play();
        } else {
          player.pause();
        }
      }
    }
  };


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
        <View style={styles.brokenTextContainer}>
          <Text style={styles.brokenTextMain}>BREAKTHROUGH</Text>
          <View style={styles.brokenEffect}>
            {/* Subtle crack lines for broken glass effect */}
            <View style={[styles.crackLine, { left: '15%', transform: [{ rotate: '15deg' }] }]} />
            <View style={[styles.crackLine, { left: '35%', transform: [{ rotate: '-20deg' }] }]} />
            <View style={[styles.crackLine, { left: '55%', transform: [{ rotate: '25deg' }] }]} />
            <View style={[styles.crackLine, { left: '75%', transform: [{ rotate: '-15deg' }] }]} />
          </View>
        </View>
        <View style={styles.videoContainer} ref={videoContainerRef}>
          {videoError ? (
            <View style={styles.videoErrorContainer}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>📹</Text>
              <Text style={{ fontSize: 16, color: AppColors.text.primary, fontWeight: '600' }}>Financial Breakthrough Video</Text>
              <Text style={{ fontSize: 14, color: AppColors.text.secondary, marginTop: 4 }}>Video Unavailable</Text>
            </View>
          ) : (
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              contentFit="contain"
              onLoadStart={() => console.log('Video loading...')}
              onLoad={() => console.log('Video loaded successfully')}
              onError={(error) => {
                console.warn('Video error:', error);
                setVideoError(true);
              }}
            />
          )}
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
          <TouchableOpacity onPress={() => router.push('/shop')}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.merchCard}
              onPress={() => router.push({
                pathname: '/product-detail',
                params: {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  description: item.description,
                }
              })}
            >
              <Text style={styles.merchImage}>{item.image}</Text>
              <Text style={styles.merchName}>{item.name}</Text>
              <Text style={styles.merchPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.merchList}
        />
      </View>
    </>
  );


  if (shouldShowSplash) {
    return (
      <SplashScreen 
        onAnimationComplete={() => {
          hideSplash();
        }}
        loadingProgress={progress}
        loadingText={loadingText}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background.dark} />
      
      {/* Header with Menu */}
      <AppHeader showMenuAndCart={true} />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {renderHomeContent()}
      </ScrollView>
      
      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
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
    textAlign: 'center',
    marginBottom: 10,
  },
  videoContainer: {
    position: 'relative',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  video: {
    width: '100%',
    height: 240,
  },
  videoErrorContainer: {
    flex: 1,
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
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
  brokenTextContainer: {
    height: 80,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  brokenTextMain: {
    fontSize: 32,
    fontWeight: '900',
    color: AppColors.text.primary,
    letterSpacing: 8,
    textAlign: 'center',
    textShadowColor: AppColors.primary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 1,
  },
  brokenEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crackLine: {
    position: 'absolute',
    width: 1,
    height: 40,
    backgroundColor: AppColors.primary,
    opacity: 0.3,
  },
});