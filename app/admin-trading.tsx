import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import firebaseService from '@/services/firebase';
import TradingCalendar from '@/components/TradingCalendar';

interface TradingDay {
  date: string;
  isLive: boolean;
  description?: string;
}

const AdminTrading = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [tradingDays, setTradingDays] = useState<{ [key: string]: TradingDay }>({});
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    checkAdminAccess();
    loadTradingDays();
  }, []);

  useEffect(() => {
    updateMarkedDates();
  }, [tradingDays, selectedDate]);

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await firebaseService.isAdmin();
      if (!isAdmin) {
        Alert.alert('Access Denied', 'You do not have admin access');
        router.replace('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      router.replace('/');
    }
  };

  const loadTradingDays = async () => {
    try {
      setLoading(true);
      const days = await firebaseService.getTradingDays();
      const tradingDaysMap: { [key: string]: TradingDay } = {};
      days.forEach(day => {
        tradingDaysMap[day.date] = day;
      });
      setTradingDays(tradingDaysMap);
    } catch (error) {
      console.error('Error loading trading days:', error);
      Alert.alert('Error', 'Failed to load trading days');
    } finally {
      setLoading(false);
    }
  };

  const updateMarkedDates = () => {
    const marked: any = {};
    Object.keys(tradingDays).forEach(date => {
      if (tradingDays[date].isLive) {
        marked[date] = true;
      }
    });
    setMarkedDates(marked);
  };

  const toggleTradingDay = async (date: string) => {
    try {
      const isCurrentlyLive = tradingDays[date]?.isLive || false;
      await firebaseService.setTradingDay(date, !isCurrentlyLive);
      
      setTradingDays(prev => ({
        ...prev,
        [date]: {
          date,
          isLive: !isCurrentlyLive,
        },
      }));
      
      Alert.alert(
        'Success',
        `Trading day ${isCurrentlyLive ? 'disabled' : 'enabled'} for ${date}`
      );
    } catch (error) {
      console.error('Error toggling trading day:', error);
      if (error instanceof Error && error.message.includes('permission-denied')) {
        Alert.alert(
          'Permission Error', 
          'Please deploy the updated Firestore rules:\n\n' +
          '1. Go to Firebase Console\n' +
          '2. Navigate to Firestore Database > Rules\n' +
          '3. Copy the content from firestore-simple.rules\n' +
          '4. Click Publish\n\n' +
          'The rules need to be updated to allow admin access to trading days.'
        );
      } else {
        Alert.alert('Error', 'Failed to update trading day');
      }
    }
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trading Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Tap on any date to mark it as a live trading day
          </Text>
        </View>

        <View style={styles.calendarContainer}>
          <TradingCalendar 
            markedDates={markedDates} 
            onDateSelect={handleDayPress}
          />
        </View>

        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateTitle}>
              Selected Date: {selectedDate}
            </Text>
            <Text style={styles.selectedDateStatus}>
              Status: {tradingDays[selectedDate]?.isLive ? 'Live Trading Day' : 'Regular Day'}
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                tradingDays[selectedDate]?.isLive && styles.disableButton,
              ]}
              onPress={() => toggleTradingDay(selectedDate)}
            >
              <Text style={styles.toggleButtonText}>
                {tradingDays[selectedDate]?.isLive 
                  ? 'Disable Live Trading' 
                  : 'Enable Live Trading'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: AppColors.primary }]} />
            <Text style={styles.legendText}>Live Trading Day</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedDateContainer: {
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  selectedDateStatus: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disableButton: {
    backgroundColor: AppColors.error,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  legendContainer: {
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
});

export default AdminTrading;