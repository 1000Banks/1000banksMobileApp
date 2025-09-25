import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebase';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from '@react-native-firebase/firestore';

const db = getFirestore();

interface SignalTemplate {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  message: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'alert' | 'custom';
}

const signalTemplates: SignalTemplate[] = [
  {
    id: 'buy_signal',
    title: 'BUY Signal',
    icon: 'trending-up',
    color: '#4CAF50',
    message: '🟢 BUY SIGNAL: Strong bullish momentum detected. Consider opening long positions.',
    type: 'bullish'
  },
  {
    id: 'sell_signal',
    title: 'SELL Signal',
    icon: 'trending-down',
    color: '#F44336',
    message: '🔴 SELL SIGNAL: Bearish trend confirmed. Consider closing long positions or opening shorts.',
    type: 'bearish'
  },
  {
    id: 'take_profit',
    title: 'Take Profit',
    icon: 'cash-outline',
    color: '#FF9800',
    message: '💰 TAKE PROFIT: Target reached! Consider taking partial or full profits.',
    type: 'bullish'
  },
  {
    id: 'stop_loss',
    title: 'Stop Loss Alert',
    icon: 'warning',
    color: '#FF5722',
    message: '⚠️ STOP LOSS: Risk level reached. Protect your capital and exit positions.',
    type: 'alert'
  },
  {
    id: 'market_update',
    title: 'Market Update',
    icon: 'information-circle',
    color: '#2196F3',
    message: '📊 MARKET UPDATE: ',
    type: 'neutral'
  },
  {
    id: 'consolidation',
    title: 'Consolidation',
    icon: 'pause-circle',
    color: '#9C27B0',
    message: '⏸️ CONSOLIDATION: Market in sideways movement. Wait for clear direction.',
    type: 'neutral'
  },
  {
    id: 'breakout',
    title: 'Breakout Alert',
    icon: 'rocket',
    color: '#00BCD4',
    message: '🚀 BREAKOUT: Price breaking key resistance/support levels!',
    type: 'bullish'
  },
  {
    id: 'reversal',
    title: 'Trend Reversal',
    icon: 'swap-vertical',
    color: '#FFC107',
    message: '🔄 REVERSAL: Potential trend reversal detected. Stay cautious.',
    type: 'alert'
  }
];

const AdminSignalsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSignal, setCustomSignal] = useState({
    title: '',
    message: '',
    coin: 'BTC',
    price: '',
    target: '',
    stopLoss: '',
    saveAsTemplate: false,
  });
  // Global signal data that applies to all quick signals
  const [globalSignalData, setGlobalSignalData] = useState({
    coin: 'BTC/USDT',
    description: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<SignalTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<SignalTemplate[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [allTemplates, setAllTemplates] = useState<SignalTemplate[]>([]);

  useEffect(() => {
    checkAdminAccess();
    loadSubscribers();
    loadCustomTemplates();
  }, []);

  useEffect(() => {
    // Combine predefined and custom templates
    setAllTemplates([...signalTemplates, ...customTemplates]);
  }, [customTemplates]);

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

  const loadCustomTemplates = async () => {
    try {
      const templatesQuery = query(
        collection(db, 'signalTemplates'),
        where('createdBy', '==', firebaseService.getCurrentUser()?.uid)
      );
      const snapshot = await getDocs(templatesQuery);

      const templates: SignalTemplate[] = [];
      snapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data() as Omit<SignalTemplate, 'id'>
        });
      });

      setCustomTemplates(templates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  const saveCustomTemplate = async (template: Omit<SignalTemplate, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'signalTemplates'), {
        ...template,
        createdBy: firebaseService.getCurrentUser()?.uid,
        createdAt: serverTimestamp(),
      });

      const newTemplate = { id: docRef.id, ...template };
      setCustomTemplates(prev => [...prev, newTemplate]);

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving template:', error);
      return { success: false, error };
    }
  };

  const deleteCustomTemplate = async (templateId: string) => {
    try {
      await firebaseService.deleteDocument('signalTemplates', templateId);
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error };
    }
  };

  const loadSubscribers = async () => {
    try {
      setLoading(true);

      // Get all active channel subscriptions
      const channelsQuery = query(
        collection(db, 'telegramChannels'),
        where('isActive', '==', true)
      );
      const channelsSnapshot = await getDocs(channelsQuery);

      if (!channelsSnapshot.empty) {
        const channelId = channelsSnapshot.docs[0].id;

        // Get all subscribers for this channel
        const subscriptionsQuery = query(
          collection(db, 'channelSubscriptions'),
          where('channelId', '==', channelId)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

        const subs: any[] = [];
        subscriptionsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if subscription is active
          const isActive = !data.isPaid ||
            (data.expiresAt && data.expiresAt.toDate() > new Date());

          if (isActive) {
            subs.push({
              id: doc.id,
              userId: data.userId,
              ...data
            });
          }
        });

        setSubscribers(subs);
        setSubscriberCount(subs.length);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendSignal = async (template: SignalTemplate, customMessage?: string) => {
    if (subscriberCount === 0) {
      Alert.alert('No Subscribers', 'There are no active subscribers to send signals to.');
      return;
    }

    try {
      setSending(true);

      const finalMessage = customMessage || template.message;
      const title = `Trading Signal - ${template.title}`;

      // Create notifications for all subscribers
      const notificationPromises = subscribers.map(subscriber =>
        addDoc(collection(db, 'notifications'), {
          userId: subscriber.userId,
          title,
          message: finalMessage,
          timestamp: serverTimestamp(),
          read: false,
          type: 'trading',
          signalType: template.type,
          templateId: template.id,
        })
      );

      await Promise.all(notificationPromises);

      // Log the signal sent
      await firebaseService.createAuditLog({
        action: 'SEND_TRADING_SIGNAL',
        details: {
          template: template.id,
          subscriberCount,
          message: finalMessage
        }
      });

      Alert.alert(
        'Success',
        `Signal sent to ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending signal:', error);
      Alert.alert('Error', 'Failed to send signal. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickSignal = async (template: SignalTemplate) => {
    if (!globalSignalData.coin.trim()) {
      Alert.alert('Error', 'Please enter coin pair before sending signals.');
      return;
    }

    // Create enhanced message with coin and description
    let enhancedMessage = template.message;

    // Add coin information
    enhancedMessage += `\n\n💱 COIN: ${globalSignalData.coin}`;

    // Add description if provided
    if (globalSignalData.description.trim()) {
      enhancedMessage += `\n📋 NOTE: ${globalSignalData.description}`;
    }

    const enhancedTemplate = {
      ...template,
      message: enhancedMessage
    };

    Alert.alert(
      'Send Signal',
      `Send "${template.title}" for ${globalSignalData.coin} to ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => sendSignal(enhancedTemplate, enhancedMessage),
          style: 'default'
        }
      ]
    );
  };

  const handleCustomSignal = () => {
    setShowCustomModal(true);
    setSelectedTemplate(signalTemplates.find(t => t.id === 'market_update') || signalTemplates[0]);
  };

  const sendCustomSignal = async () => {
    if (!customSignal.title.trim() || !customSignal.message.trim()) {
      Alert.alert('Error', 'Please enter both title and message.');
      return;
    }

    let detailedMessage = customSignal.message;

    // Add trading details if provided
    if (customSignal.coin || customSignal.price || customSignal.target || customSignal.stopLoss) {
      detailedMessage += '\n\n📈 DETAILS:';
      if (customSignal.coin) detailedMessage += `\n• Coin: ${customSignal.coin}`;
      if (customSignal.price) detailedMessage += `\n• Entry: $${customSignal.price}`;
      if (customSignal.target) detailedMessage += `\n• Target: $${customSignal.target}`;
      if (customSignal.stopLoss) detailedMessage += `\n• Stop Loss: $${customSignal.stopLoss}`;
    }

    const customTemplate: SignalTemplate = {
      id: customSignal.saveAsTemplate ? `custom_${Date.now()}` : 'custom',
      title: customSignal.title,
      icon: 'megaphone',
      color: '#673AB7',
      message: detailedMessage,
      type: 'custom'
    };

    // Save as template if requested
    if (customSignal.saveAsTemplate) {
      const result = await saveCustomTemplate(customTemplate);
      if (result.success) {
        Alert.alert('Success', 'Template saved and signal sent!');
      } else {
        Alert.alert('Warning', 'Signal sent but failed to save template.');
      }
    }

    await sendSignal(customTemplate, detailedMessage);
    setShowCustomModal(false);

    // Reset form
    setCustomSignal({
      title: '',
      message: '',
      coin: 'BTC',
      price: '',
      target: '',
      stopLoss: '',
      saveAsTemplate: false,
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this custom template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCustomTemplate(templateId);
            if (result.success) {
              Alert.alert('Success', 'Template deleted successfully.');
            } else {
              Alert.alert('Error', 'Failed to delete template.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trading Signals</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trading Signals</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setDeleteMode(!deleteMode)}
            style={[styles.headerButton, deleteMode && styles.deleteActive]}
          >
            <Ionicons name="trash-outline" size={24} color={deleteMode ? AppColors.error : AppColors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadSubscribers}>
            <Ionicons name="refresh" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Coin and Description Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Signal Configuration</Text>
          <Text style={styles.sectionSubtitle}>These values will be included in all quick signals</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Coin/Pair *</Text>
              <TextInput
                style={styles.mainInput}
                placeholder="e.g., BTC/USDT, ETH/USDT"
                placeholderTextColor={AppColors.text.secondary}
                value={globalSignalData.coin}
                onChangeText={(text) => setGlobalSignalData({ ...globalSignalData, coin: text })}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.mainInput, styles.descriptionInput]}
              placeholder="Add context or details that apply to all signals..."
              placeholderTextColor={AppColors.text.secondary}
              value={globalSignalData.description}
              onChangeText={(text) => setGlobalSignalData({ ...globalSignalData, description: text })}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Subscriber Count Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={32} color={AppColors.primary} />
            <Text style={styles.statNumber}>{subscriberCount}</Text>
            <Text style={styles.statLabel}>Active Subscribers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="notifications" size={32} color={AppColors.success} />
            <Text style={styles.statNumber}>Ready</Text>
            <Text style={styles.statLabel}>Signal Status</Text>
          </View>
        </View>

        {/* Quick Signals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Signals</Text>
          <Text style={styles.sectionSubtitle}>Tap to send pre-configured trading signals</Text>

          <View style={styles.signalGrid}>
            {allTemplates.map((template) => {
              const isCustom = customTemplates.some(ct => ct.id === template.id);
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.signalCard, { borderColor: template.color + '40' }]}
                  onPress={() => deleteMode && isCustom ? handleDeleteTemplate(template.id) : handleQuickSignal(template)}
                  disabled={sending}
                >
                  <View style={[styles.signalIcon, { backgroundColor: template.color + '20' }]}>
                    <Ionicons name={template.icon} size={24} color={template.color} />
                    {deleteMode && isCustom && (
                      <View style={styles.deleteOverlay}>
                        <Ionicons name="trash" size={16} color={AppColors.error} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.signalTitle}>{template.title}</Text>
                  {isCustom && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Signal Button */}
        <TouchableOpacity
          style={styles.customSignalButton}
          onPress={handleCustomSignal}
          disabled={sending}
        >
          <Ionicons name="create-outline" size={24} color={AppColors.background.dark} />
          <Text style={styles.customSignalButtonText}>Create Custom Signal</Text>
        </TouchableOpacity>

        {/* Recent Signals (placeholder for future feature) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signal Guidelines</Text>
          <View style={styles.guidelineCard}>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
              <Text style={styles.guidelineText}>Always include clear entry and exit points</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
              <Text style={styles.guidelineText}>Specify risk management (stop loss)</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
              <Text style={styles.guidelineText}>Mention market conditions and timeframe</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
              <Text style={styles.guidelineText}>Include confidence level when applicable</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Signal Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Signal</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Signal Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., BTC Breakout Alert"
                placeholderTextColor={AppColors.text.secondary}
                value={customSignal.title}
                onChangeText={(text) => setCustomSignal({ ...customSignal, title: text })}
              />

              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Enter your trading signal message..."
                placeholderTextColor={AppColors.text.secondary}
                value={customSignal.message}
                onChangeText={(text) => setCustomSignal({ ...customSignal, message: text })}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Trading Details (Optional)</Text>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Coin/Pair</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="BTC, ETH, etc."
                    placeholderTextColor={AppColors.text.secondary}
                    value={customSignal.coin}
                    onChangeText={(text) => setCustomSignal({ ...customSignal, coin: text })}
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Entry Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={AppColors.text.secondary}
                    value={customSignal.price}
                    onChangeText={(text) => setCustomSignal({ ...customSignal, price: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Target Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={AppColors.text.secondary}
                    value={customSignal.target}
                    onChangeText={(text) => setCustomSignal({ ...customSignal, target: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Stop Loss</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={AppColors.text.secondary}
                    value={customSignal.stopLoss}
                    onChangeText={(text) => setCustomSignal({ ...customSignal, stopLoss: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setCustomSignal({ ...customSignal, saveAsTemplate: !customSignal.saveAsTemplate })}
                >
                  <Ionicons
                    name={customSignal.saveAsTemplate ? "checkbox" : "checkbox-outline"}
                    size={24}
                    color={customSignal.saveAsTemplate ? AppColors.primary : AppColors.text.secondary}
                  />
                  <Text style={styles.checkboxText}>Save as reusable template</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendCustomSignal}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={AppColors.background.dark} />
                ) : (
                  <Text style={styles.sendButtonText}>Send Signal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.text.secondary + '20',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: AppColors.text.secondary + '20',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  signalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  signalCard: {
    width: '48%',
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  signalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  customSignalButton: {
    flexDirection: 'row',
    backgroundColor: AppColors.primary,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  customSignalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.background.dark,
    marginLeft: 8,
  },
  guidelineCard: {
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.text.secondary + '20',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: AppColors.background.default,
    borderWidth: 1,
    borderColor: AppColors.text.secondary + '30',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.text.secondary + '20',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: AppColors.background.default,
  },
  sendButton: {
    backgroundColor: AppColors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.background.dark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
    borderRadius: 6,
  },
  deleteActive: {
    backgroundColor: AppColors.error + '20',
  },
  deleteOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: AppColors.background.card,
    borderRadius: 10,
    padding: 2,
  },
  customBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  previewContainer: {
    backgroundColor: AppColors.background.default,
    borderWidth: 1,
    borderColor: AppColors.text.secondary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text.secondary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: AppColors.text.primary,
    lineHeight: 20,
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginLeft: 8,
  },
  inputSection: {
    backgroundColor: AppColors.background.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  inputRow: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  mainInput: {
    backgroundColor: AppColors.background.default,
    borderWidth: 1,
    borderColor: AppColors.text.secondary + '30',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  descriptionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
});

export default AdminSignalsScreen;