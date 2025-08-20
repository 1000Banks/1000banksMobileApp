import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: any;
}

const NotificationCenter = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive push notifications about updates and announcements',
      enabled: true,
      icon: 'notifications',
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Get emails about your courses and purchases',
      enabled: true,
      icon: 'mail',
    },
    {
      id: 'course_updates',
      title: 'Course Updates',
      description: 'Notify me when my enrolled courses are updated',
      enabled: true,
      icon: 'school',
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Receive notifications about special offers and discounts',
      enabled: false,
      icon: 'pricetag',
    },
    {
      id: 'reminders',
      title: 'Learning Reminders',
      description: 'Get reminders to continue your learning journey',
      enabled: true,
      icon: 'time',
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Notify me when I unlock new achievements',
      enabled: true,
      icon: 'trophy',
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Center</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Manage how you receive notifications from 1000Banks
          </Text>
        </View>

        {settings.map((setting) => (
          <View key={setting.id} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={setting.icon} size={24} color={AppColors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => toggleSetting(setting.id)}
              trackColor={{ false: AppColors.text.secondary + '30', true: AppColors.primary }}
              thumbColor={setting.enabled ? '#FFFFFF' : AppColors.text.secondary}
            />
          </View>
        ))}

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={AppColors.primary} />
            <Text style={styles.infoText}>
              You can manage device-level notification settings in your device's Settings app
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: AppColors.text.secondary,
    lineHeight: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: AppColors.background.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  infoSection: {
    padding: 24,
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: AppColors.text.primary,
    lineHeight: 20,
  },
});

export default NotificationCenter;