import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebase';
import { telegramService } from '@/services/telegram';
import { telegramProxyService } from '@/services/telegram-proxy';

interface AppSettings {
  general: {
    appName: string;
    appVersion: string;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    taxRate: number;
    currency: string;
    minimumOrderAmount: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    orderConfirmations: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPasswords: boolean;
    twoFactorRequired: boolean;
  };
  content: {
    autoApproveReviews: boolean;
    moderateComments: boolean;
    allowGuestCheckout: boolean;
    showOutOfStock: boolean;
  };
  telegram: {
    enabled: boolean;
    useProxy: boolean;
    channelName: string;
    chatId: string;
    botToken: string;
    subscriptionType: 'free' | 'paid';
    subscriptionPrice: number;
    channelDescription: string;
  };
}

const AdminSettingsScreen = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<keyof AppSettings>('general');

  const defaultSettings: AppSettings = {
    general: {
      appName: '1000Banks',
      appVersion: '1.0.0',
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: false,
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: false,
      taxRate: 8.0,
      currency: 'USD',
      minimumOrderAmount: 10,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      orderConfirmations: true,
    },
    security: {
      sessionTimeout: 3600, // 1 hour
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
      twoFactorRequired: false,
    },
    content: {
      autoApproveReviews: false,
      moderateComments: true,
      allowGuestCheckout: false,
      showOutOfStock: true,
    },
    telegram: {
      enabled: false,
      useProxy: true, // Default to proxy for regions with restrictions
      channelName: '',
      chatId: '',
      botToken: '',
      subscriptionType: 'free',
      subscriptionPrice: 0,
      channelDescription: 'Subscribe to get insights into trading news, trends, and live trading signals from one of the world\'s best traders.',
    },
  };

  useEffect(() => {
    checkAdminAccess();
    loadSettings();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await firebaseService.isAdmin();
      if (!isAdmin) {
        router.replace('/');
      }
    } catch (error) {
      router.replace('/');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await firebaseService.getAppSettings();
      setSettings(savedSettings || defaultSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await firebaseService.updateAppSettings(settings);
      
      // Handle Telegram settings
      if (activeSection === 'telegram' && settings.telegram.enabled) {
        // Use proxy service if enabled, otherwise use direct service
        const service = settings.telegram.useProxy ? telegramProxyService : telegramService;

        const result = await service.saveTelegramSettings({
          name: settings.telegram.channelName,
          chatId: settings.telegram.chatId,
          botToken: settings.telegram.botToken,
          isActive: settings.telegram.enabled,
          subscriptionType: settings.telegram.subscriptionType,
          subscriptionPrice: settings.telegram.subscriptionPrice,
          description: settings.telegram.channelDescription,
        });

        if (!result.success) {
          const errorMessage = typeof result.error === 'string'
            ? result.error
            : 'Failed to activate Telegram integration';
          Alert.alert('Telegram Setup Error', errorMessage);
          setSaving(false);
          return;
        } else {
          // Update the chat ID with the verified one
          if (result.channelId) {
            settings.telegram.chatId = result.channelId;
          }
        }
      }
      
      await firebaseService.createAuditLog({
        action: 'UPDATE_APP_SETTINGS',
        details: { sections: [activeSection] },
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const handleBackupData = async () => {
    try {
      setBackupProgress(0);
      setShowBackupModal(true);
      
      // Simulate backup progress
      const steps = [
        'Backing up users...',
        'Backing up courses...',
        'Backing up products...',
        'Backing up purchases...',
        'Backing up settings...',
        'Finalizing backup...',
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBackupProgress(((i + 1) / steps.length) * 100);
      }

      await firebaseService.createDataBackup();
      await firebaseService.createAuditLog({
        action: 'CREATE_BACKUP',
      });

      Alert.alert('Success', 'Data backup created successfully');
      setShowBackupModal(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
      setShowBackupModal(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.clearCache();
              await firebaseService.createAuditLog({
                action: 'CLEAR_CACHE',
              });
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: AppColors.background.card, true: AppColors.primary + '40' }}
        thumbColor={value ? AppColors.primary : AppColors.text.secondary}
      />
    </View>
  );

  const renderInputItem = (
    title: string,
    value: string | number,
    onChangeText: (text: string) => void,
    keyboardType: 'default' | 'numeric' = 'default',
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
        <TextInput
          style={styles.settingInput}
          value={value.toString()}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={AppColors.text.secondary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={AppColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {Object.keys(defaultSettings).map((section) => (
            <TouchableOpacity
              key={section}
              style={[
                styles.tabButton,
                activeSection === section && styles.tabButtonActive
              ]}
              onPress={() => setActiveSection(section as keyof AppSettings)}
            >
              <Text style={[
                styles.tabButtonText,
                activeSection === section && styles.tabButtonTextActive
              ]}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Settings Content */}
        <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {activeSection === 'general' && settings && (
            <View style={styles.section}>
              {renderInputItem(
                'App Name',
                settings.general.appName,
                (value) => updateSetting('general', 'appName', value),
                'default',
                'The display name of your application'
              )}
              {renderInputItem(
                'App Version',
                settings.general.appVersion,
                (value) => updateSetting('general', 'appVersion', value),
                'default',
                'Current version number'
              )}
              {renderSettingItem(
                'Maintenance Mode',
                settings.general.maintenanceMode,
                (value) => updateSetting('general', 'maintenanceMode', value),
                'Temporarily disable app for maintenance'
              )}
              {renderSettingItem(
                'Allow New Registrations',
                settings.general.allowNewRegistrations,
                (value) => updateSetting('general', 'allowNewRegistrations', value),
                'Allow new users to create accounts'
              )}
              {renderSettingItem(
                'Require Email Verification',
                settings.general.requireEmailVerification,
                (value) => updateSetting('general', 'requireEmailVerification', value),
                'Users must verify email before access'
              )}
            </View>
          )}

          {activeSection === 'payment' && settings && (
            <View style={styles.section}>
              {renderSettingItem(
                'Stripe Payments',
                settings.payment.stripeEnabled,
                (value) => updateSetting('payment', 'stripeEnabled', value),
                'Enable Stripe payment processing'
              )}
              {renderSettingItem(
                'PayPal Payments',
                settings.payment.paypalEnabled,
                (value) => updateSetting('payment', 'paypalEnabled', value),
                'Enable PayPal payment processing'
              )}
              {renderInputItem(
                'Tax Rate (%)',
                settings.payment.taxRate,
                (value) => updateSetting('payment', 'taxRate', parseFloat(value) || 0),
                'numeric',
                'Default tax rate for purchases'
              )}
              {renderInputItem(
                'Currency',
                settings.payment.currency,
                (value) => updateSetting('payment', 'currency', value),
                'default',
                'Default currency (USD, EUR, etc.)'
              )}
              {renderInputItem(
                'Minimum Order Amount',
                settings.payment.minimumOrderAmount,
                (value) => updateSetting('payment', 'minimumOrderAmount', parseFloat(value) || 0),
                'numeric',
                'Minimum amount required for orders'
              )}
            </View>
          )}

          {activeSection === 'notifications' && settings && (
            <View style={styles.section}>
              {renderSettingItem(
                'Email Notifications',
                settings.notifications.emailNotifications,
                (value) => updateSetting('notifications', 'emailNotifications', value),
                'Send system emails to users'
              )}
              {renderSettingItem(
                'Push Notifications',
                settings.notifications.pushNotifications,
                (value) => updateSetting('notifications', 'pushNotifications', value),
                'Send push notifications to mobile devices'
              )}
              {renderSettingItem(
                'Marketing Emails',
                settings.notifications.marketingEmails,
                (value) => updateSetting('notifications', 'marketingEmails', value),
                'Send promotional emails to users'
              )}
              {renderSettingItem(
                'Order Confirmations',
                settings.notifications.orderConfirmations,
                (value) => updateSetting('notifications', 'orderConfirmations', value),
                'Send email confirmations for orders'
              )}
            </View>
          )}

          {activeSection === 'security' && settings && (
            <View style={styles.section}>
              {renderInputItem(
                'Session Timeout (seconds)',
                settings.security.sessionTimeout,
                (value) => updateSetting('security', 'sessionTimeout', parseInt(value) || 3600),
                'numeric',
                'Auto-logout inactive users after this time'
              )}
              {renderInputItem(
                'Max Login Attempts',
                settings.security.maxLoginAttempts,
                (value) => updateSetting('security', 'maxLoginAttempts', parseInt(value) || 5),
                'numeric',
                'Block user after failed login attempts'
              )}
              {renderSettingItem(
                'Require Strong Passwords',
                settings.security.requireStrongPasswords,
                (value) => updateSetting('security', 'requireStrongPasswords', value),
                'Enforce strong password requirements'
              )}
              {renderSettingItem(
                'Two-Factor Authentication Required',
                settings.security.twoFactorRequired,
                (value) => updateSetting('security', 'twoFactorRequired', value),
                'Require 2FA for all users'
              )}
            </View>
          )}

          {activeSection === 'content' && settings && (
            <View style={styles.section}>
              {renderSettingItem(
                'Auto-Approve Reviews',
                settings.content.autoApproveReviews,
                (value) => updateSetting('content', 'autoApproveReviews', value),
                'Automatically publish user reviews'
              )}
              {renderSettingItem(
                'Moderate Comments',
                settings.content.moderateComments,
                (value) => updateSetting('content', 'moderateComments', value),
                'Review comments before publishing'
              )}
              {renderSettingItem(
                'Allow Guest Checkout',
                settings.content.allowGuestCheckout,
                (value) => updateSetting('content', 'allowGuestCheckout', value),
                'Allow purchases without registration'
              )}
              {renderSettingItem(
                'Show Out of Stock Items',
                settings.content.showOutOfStock,
                (value) => updateSetting('content', 'showOutOfStock', value),
                'Display items even when out of stock'
              )}
            </View>
          )}

          {activeSection === 'telegram' && settings && (
            <View style={styles.section}>
              {renderSettingItem(
                'Enable Telegram Integration',
                settings.telegram.enabled,
                (value) => updateSetting('telegram', 'enabled', value),
                'Connect a Telegram channel for trading signals'
              )}

              {renderSettingItem(
                'Use Proxy Service (for restricted regions)',
                settings.telegram.useProxy,
                (value) => updateSetting('telegram', 'useProxy', value),
                'Route Telegram API calls through Firebase Functions (recommended for Pakistan/restricted regions)'
              )}
              
              {settings.telegram.enabled && (
                <>
                  {renderInputItem(
                    'Channel Name',
                    settings.telegram.channelName,
                    (value) => updateSetting('telegram', 'channelName', value),
                    'default',
                    'Display name for your channel'
                  )}
                  {renderInputItem(
                    'Chat ID',
                    settings.telegram.chatId,
                    (value) => updateSetting('telegram', 'chatId', value),
                    'default',
                    'Telegram chat ID (e.g., -1001234567890)'
                  )}
                  {renderInputItem(
                    'Bot Token',
                    settings.telegram.botToken,
                    (value) => updateSetting('telegram', 'botToken', value),
                    'default',
                    'Bot token from BotFather'
                  )}

                  {settings.telegram.botToken && (
                    <TouchableOpacity
                      style={[styles.actionButton, { marginTop: 8, marginBottom: 8, backgroundColor: AppColors.success + '20' }]}
                      onPress={async () => {
                        try {
                          console.log('🧪 Manual bot test started...');

                          const startTime = Date.now();
                          const response = await fetch(`https://api.telegram.org/bot${settings.telegram.botToken}/getMe`, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });

                          const responseTime = Date.now() - startTime;
                          console.log(`📊 Manual test response time: ${responseTime}ms`);

                          if (response.ok) {
                            const data = await response.json();
                            console.log('✅ Manual bot test successful:', data);
                            Alert.alert(
                              'Bot Test Successful',
                              `Bot: @${data.result.username}\nID: ${data.result.id}\nResponse time: ${responseTime}ms`
                            );
                          } else {
                            const errorText = await response.text();
                            console.error('❌ Manual bot test failed:', errorText);
                            Alert.alert('Bot Test Failed', `HTTP ${response.status}: ${errorText}`);
                          }
                        } catch (error) {
                          console.error('❌ Manual bot test error:', error);
                          Alert.alert('Error', `Network error: ${error.message}`);
                        }
                      }}
                    >
                      <Ionicons name="flash" size={20} color={AppColors.success} />
                      <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { fontSize: 14, color: AppColors.success }]}>
                          Test Bot Token
                        </Text>
                        <Text style={[styles.actionDescription, { fontSize: 12 }]}>
                          Quick network test
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {settings.telegram.chatId && settings.telegram.botToken && (
                    <TouchableOpacity
                      style={[styles.actionButton, { marginTop: 8, marginBottom: 16, backgroundColor: AppColors.text.secondary + '20' }]}
                      onPress={async () => {
                        try {
                          const result = await telegramService.verifyChatId(
                            settings.telegram.botToken,
                            settings.telegram.chatId
                          );
                          if (result.success) {
                            Alert.alert(
                              'Verification Successful',
                              `Connected to: ${result.chatInfo.title || result.chatInfo.username}\nType: ${result.chatInfo.type}\nID: ${result.chatInfo.id}`
                            );
                          } else {
                            Alert.alert('Verification Failed', result.error || 'Unable to connect to chat');
                          }
                        } catch (error) {
                          Alert.alert('Error', 'Failed to verify chat connection');
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={AppColors.text.secondary} />
                      <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { fontSize: 14 }]}>
                          Verify Chat Connection
                        </Text>
                        <Text style={[styles.actionDescription, { fontSize: 12 }]}>
                          Test bot and chat ID
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.subscriptionTypeContainer}>
                    <Text style={styles.settingTitle}>Subscription Type</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={[
                          styles.radioButton,
                          settings.telegram.subscriptionType === 'free' && styles.radioButtonActive
                        ]}
                        onPress={() => updateSetting('telegram', 'subscriptionType', 'free')}
                      >
                        <Text style={[
                          styles.radioButtonText,
                          settings.telegram.subscriptionType === 'free' && styles.radioButtonTextActive
                        ]}>
                          Free
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.radioButton,
                          settings.telegram.subscriptionType === 'paid' && styles.radioButtonActive
                        ]}
                        onPress={() => updateSetting('telegram', 'subscriptionType', 'paid')}
                      >
                        <Text style={[
                          styles.radioButtonText,
                          settings.telegram.subscriptionType === 'paid' && styles.radioButtonTextActive
                        ]}>
                          Paid
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {settings.telegram.subscriptionType === 'paid' && (
                    renderInputItem(
                      'Subscription Price',
                      settings.telegram.subscriptionPrice,
                      (value) => updateSetting('telegram', 'subscriptionPrice', parseFloat(value) || 0),
                      'numeric',
                      'Monthly subscription fee in USD'
                    )
                  )}
                  
                  {renderInputItem(
                    'Channel Description',
                    settings.telegram.channelDescription,
                    (value) => updateSetting('telegram', 'channelDescription', value),
                    'default',
                    'Description shown to users'
                  )}

                  {settings.telegram.enabled && settings.telegram.chatId && (
                    <TouchableOpacity
                      style={[styles.actionButton, { marginTop: 16, backgroundColor: AppColors.primary + '20' }]}
                      onPress={async () => {
                        try {
                          const result = await telegramService.sendTestNotification(
                            settings.telegram.chatId,
                            'Test notification from 1000Banks Admin Panel'
                          );
                          if (result.success) {
                            Alert.alert('Success', `Test notification sent to ${result.subscribersNotified} subscriber(s)`);
                          } else {
                            Alert.alert('Error', 'Failed to send test notification');
                          }
                        } catch (error) {
                          Alert.alert('Error', 'Failed to send test notification');
                        }
                      }}
                    >
                      <Ionicons name="send" size={20} color={AppColors.primary} />
                      <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: AppColors.primary }]}>
                          Send Test Notification
                        </Text>
                        <Text style={styles.actionDescription}>
                          Send a test notification to all subscribers
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* System Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleBackupData}>
              <Ionicons name="cloud-download" size={24} color={AppColors.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Backup Data</Text>
                <Text style={styles.actionDescription}>Create a backup of all app data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
              <Ionicons name="trash" size={24} color={AppColors.error} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Clear Cache</Text>
                <Text style={styles.actionDescription}>Clear all cached data and temporary files</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/admin-audit-logs')}
            >
              <Ionicons name="document-text" size={24} color={AppColors.text.secondary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Audit Logs</Text>
                <Text style={styles.actionDescription}>View system activity and changes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Backup Progress Modal */}
      <Modal
        visible={showBackupModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.backupModal}>
            <Text style={styles.backupTitle}>Creating Backup</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${backupProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(backupProgress)}%</Text>
            </View>
            <Text style={styles.backupDescription}>
              Please wait while we backup your data...
            </Text>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  saveButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: AppColors.background.card,
    marginRight: 12,
  },
  tabButtonActive: {
    backgroundColor: AppColors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  tabButtonTextActive: {
    color: AppColors.background.dark,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingContent: {
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
    fontSize: 12,
    color: AppColors.text.secondary,
    lineHeight: 16,
  },
  settingInput: {
    marginTop: 8,
    padding: 12,
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
    color: AppColors.text.primary,
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backupModal: {
    backgroundColor: AppColors.background.dark,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  backupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: AppColors.background.card,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  backupDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  subscriptionTypeContainer: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  radioButtonActive: {
    backgroundColor: AppColors.primary,
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  radioButtonTextActive: {
    color: AppColors.background.dark,
  },
});

export default AdminSettingsScreen;