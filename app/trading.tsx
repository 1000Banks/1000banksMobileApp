import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';
import { WebView } from 'react-native-webview';
import firebaseService from '@/services/firebase';
import TradingCalendar from '@/components/TradingCalendar';
import CoinSelector from '@/components/CoinSelector';
import TelegramSubscription from '@/components/TelegramSubscription';
import { BlurView } from 'expo-blur';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

const TradingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [tradingDays, setTradingDays] = useState<Array<{date: string; isLive: boolean}>>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [user, setUser] = useState(auth().currentUser);


  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    loadTradingDays();
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [tradingDays]);

  const loadTradingDays = async () => {
    try {
      setLoading(true);
      const days = await firebaseService.getPublicTradingDays();
      setTradingDays(days);
    } catch (error) {
      console.error('Error loading trading days:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = () => {
    const marked: any = {};
    tradingDays.forEach(day => {
      marked[day.date] = true;
    });
    setMarkedDates(marked);
  };

  const getTradingViewWidget = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { 
            height: 100%; 
            width: 100%;
            overflow: hidden;
            background-color: #1a1a1a; 
          }
          #tradingview_widget { 
            height: 100%; 
            width: 100%;
          }
          .tradingview-widget-container {
            height: 100%;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="tradingview-widget-container">
          <div id="tradingview_widget"></div>
        </div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "BINANCE:${selectedCoin}",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#1a1a1a",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": false,
            "details": false,
            "hotlist": false,
            "calendar": false,
            "studies": [
              "MASimple@tv-basicstudies",
              "RSI@tv-basicstudies",
              "Volume@tv-basicstudies"
            ],
            "container_id": "tradingview_widget"
          });
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader showMenuAndCart={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
        <BottomTabs />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showMenuAndCart={true} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Live Trading Chart</Text>
          <View style={styles.coinSelectorWrapper}>
            <CoinSelector 
              selectedCoin={selectedCoin} 
              onCoinSelect={setSelectedCoin}
            />
          </View>
          
          <View style={styles.chartContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: getTradingViewWidget() }}
              style={styles.webview}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        </View>

        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Live Trading Days</Text>
          <Text style={styles.sectionSubtitle}>
            Days marked with dots are live trading days
          </Text>
          <View style={styles.calendarWrapper}>
            {user ? (
              <TradingCalendar markedDates={markedDates} />
            ) : (
              <View style={styles.authOverlayContainer}>
                <TradingCalendar markedDates={markedDates} />
                <BlurView
                  intensity={20}
                  style={styles.blurOverlay}
                  experimentalBlurMethod="dimezisBlurView"
                >
                  <View style={styles.signInPrompt}>
                    <Ionicons name="lock-closed" size={48} color={AppColors.primary} />
                    <Text style={styles.signInTitle}>Sign In Required</Text>
                    <Text style={styles.signInMessage}>
                      Sign in to view scheduled live trading days and get access to exclusive trading content.
                    </Text>
                    <TouchableOpacity
                      style={styles.signInButton}
                      onPress={() => router.push('/sign-in')}
                    >
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            )}
          </View>
        </View>

        {/* Telegram Subscription Component */}
        <TelegramSubscription />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSection: {
    paddingTop: 16,
  },
  chartTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  coinSelectorWrapper: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  chartContainer: {
    height: 600,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: AppColors.background.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: AppColors.background.card,
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  calendarWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1.84,
    marginBottom: 20,
  },
  authOverlayContainer: {
    position: 'relative',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPrompt: {
    backgroundColor: AppColors.background.card + '95',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  signInMessage: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 120,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
    textAlign: 'center',
  },
});

export default TradingScreen;