import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'toggle' | 'action';
  action?: () => void;
}

const PrivacySecurity = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: 'two_factor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      enabled: false,
      type: 'toggle',
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      description: 'Use fingerprint or face ID to sign in',
      enabled: false,
      type: 'toggle',
    },
    {
      id: 'privacy_mode',
      title: 'Private Profile',
      description: 'Hide your profile from other users',
      enabled: false,
      type: 'toggle',
    },
    {
      id: 'data_collection',
      title: 'Analytics & Data Collection',
      description: 'Help improve the app by sharing usage data',
      enabled: true,
      type: 'toggle',
    },
  ]);

  const actionItems: SecuritySetting[] = [
    {
      id: 'change_password',
      title: 'Change Password',
      description: 'Update your account password',
      enabled: false,
      type: 'action',
      action: () => Alert.alert('Change Password', 'Password change functionality coming soon'),
    },
    {
      id: 'download_data',
      title: 'Download My Data',
      description: 'Get a copy of all your account data',
      enabled: false,
      type: 'action',
      action: () => Alert.alert('Download Data', 'Data export functionality coming soon'),
    },
    {
      id: 'delete_account',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      enabled: false,
      type: 'action',
      action: () => {
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => Alert.alert('Account Deletion', 'Account deletion functionality coming soon')
            },
          ]
        );
      },
    },
  ];

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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <Text style={styles.sectionDescription}>
            Manage your account security and privacy preferences
          </Text>
        </View>

        <View style={styles.settingsGroup}>
          {settings.map((setting) => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: AppColors.text.secondary + '30', true: AppColors.primary }}
                thumbColor={setting.enabled ? '#FFFFFF' : AppColors.text.secondary}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
        </View>

        <View style={styles.settingsGroup}>
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                item.id === 'delete_account' && styles.dangerItem,
              ]}
              onPress={item.action}
            >
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  item.id === 'delete_account' && styles.dangerText,
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.settingDescription,
                  item.id === 'delete_account' && styles.dangerTextLight,
                ]}>
                  {item.description}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={item.id === 'delete_account' ? AppColors.error : AppColors.text.secondary} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
            <Text style={styles.infoText}>
              Your data is encrypted and stored securely. We never share your personal information without your consent.
            </Text>
          </View>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Alert.alert('Privacy Policy', 'Opening privacy policy...')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={AppColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Alert.alert('Terms of Service', 'Opening terms of service...')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color={AppColors.primary} />
          </TouchableOpacity>
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
    paddingBottom: 16,
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
  settingsGroup: {
    marginHorizontal: 16,
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.dark,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
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
  dangerItem: {
    backgroundColor: AppColors.error + '10',
  },
  dangerText: {
    color: AppColors.error,
  },
  dangerTextLight: {
    color: AppColors.error + '80',
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
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
  linksSection: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  linkText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
});

export default PrivacySecurity;