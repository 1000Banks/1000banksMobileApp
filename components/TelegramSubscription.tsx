import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { telegramService, TelegramChannel } from '@/services/telegram';
import { useRouter } from 'expo-router';
import firebaseService from '@/services/firebase';

export default function TelegramSubscription() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [channel, setChannel] = useState<TelegramChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadChannelData();
  }, [user]);

  const loadChannelData = async () => {
    try {
      setLoading(true);

      // Get active channels directly from public telegramChannels collection
      const channels = await telegramService.getAllActiveChannels();

      if (channels.length > 0) {
        const activeChannel = channels[0];
        setChannel(activeChannel);
        setSettings({ telegram: { enabled: activeChannel.isActive } });

        // Check subscription status if user is logged in
        if (user) {
          const subscribed = await telegramService.isUserSubscribed(user.uid, activeChannel.id);
          setIsSubscribed(subscribed);
        }
      } else {
        // No active channels found
        setSettings({ telegram: { enabled: false } });
      }
    } catch (error) {
      console.error('Error loading channel data:', error);
      // Fallback - assume no channels are available
      setSettings({ telegram: { enabled: false } });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!channel) return;

    try {
      setSubscribing(true);

      if (channel.subscriptionType === 'paid') {
        // Redirect to payment
        Alert.alert(
          'Premium Subscription',
          `Subscribe for $${channel.subscriptionPrice}/month to access exclusive trading signals`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue to Payment',
              onPress: () => {
                router.push({
                  pathname: '/checkout',
                  params: {
                    type: 'telegram_subscription',
                    channelId: channel.id,
                    price: channel.subscriptionPrice,
                  },
                });
              },
            },
          ]
        );
      } else {
        // Free subscription
        const result = await telegramService.subscribeToChannel(user.uid, channel.id, false);
        
        if (result.success) {
          setIsSubscribed(true);
          Alert.alert('Success', 'You have successfully subscribed to the channel!');
        } else {
          Alert.alert('Error', 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={AppColors.primary} />
      </View>
    );
  }

  if (!settings?.telegram?.enabled || !channel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="paper-plane" size={32} color={AppColors.primary} />
        <Text style={styles.title}>Trading Signals Channel</Text>
      </View>

      <View style={styles.channelInfo}>
        <Text style={styles.channelName}>{channel.name}</Text>
        <Text style={styles.channelDescription}>{channel.description}</Text>
        
        {channel.subscriptionType === 'paid' && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Monthly Subscription</Text>
            <Text style={styles.price}>${channel.subscriptionPrice}</Text>
          </View>
        )}
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={20} color={AppColors.success} />
          <Text style={styles.featureText}>Real-time trading signals</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="analytics" size={20} color={AppColors.success} />
          <Text style={styles.featureText}>Market analysis & insights</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="notifications" size={20} color={AppColors.success} />
          <Text style={styles.featureText}>Instant notifications</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="people" size={20} color={AppColors.success} />
          <Text style={styles.featureText}>Expert trader guidance</Text>
        </View>
      </View>

      {isSubscribed ? (
        <View style={styles.subscribedContainer}>
          <Ionicons name="checkmark-circle" size={24} color={AppColors.success} />
          <Text style={styles.subscribedText}>You're subscribed!</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            channel.subscriptionType === 'paid' && styles.premiumButton
          ]}
          onPress={handleSubscribe}
          disabled={subscribing}
        >
          {subscribing ? (
            <ActivityIndicator size="small" color={AppColors.background.dark} />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                {channel.subscriptionType === 'free' 
                  ? 'Subscribe for Free' 
                  : 'Subscribe Now'}
              </Text>
              {channel.subscriptionType === 'paid' && (
                <Text style={styles.subscribePrice}>
                  ${channel.subscriptionPrice}/month
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginLeft: 12,
  },
  channelInfo: {
    marginBottom: 24,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 8,
  },
  channelDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: AppColors.gold,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.background.dark,
  },
  subscribePrice: {
    fontSize: 14,
    color: AppColors.background.dark,
    marginTop: 4,
  },
  subscribedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: AppColors.success + '20',
    borderRadius: 12,
  },
  subscribedText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.success,
    marginLeft: 8,
  },
});