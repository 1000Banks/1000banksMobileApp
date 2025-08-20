import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import firebaseService from '@/services/firebase';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt: Date;
}

const PaymentMethodsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Test card info
  const TEST_CARD_INFO = {
    number: '4242 4242 4242 4242',
    expiry: '12/34',
    cvc: '123',
    name: 'Test User',
    note: 'This is a Stripe test card that will always succeed'
  };
  
  // Form state for new card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveForFuture, setSaveForFuture] = useState(true);

  useEffect(() => {
    fetchSavedCards();
  }, [user]);

  const fetchSavedCards = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const cards = await firebaseService.getUserPaymentMethods();
      setSavedCards(cards || []); // Ensure it's always an array
    } catch (error: any) {
      console.error('Error fetching saved cards:', error);
      // Don't show error to user for permission denied - just means no cards saved
      if (error.code !== 'firestore/permission-denied') {
        console.error('Unexpected error fetching payment methods:', error);
      }
      setSavedCards([]); // Set empty array on any error
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    setProcessing(true);
    try {
      const [month, year] = cardExpiry.split('/');
      const cardData = {
        last4: cardNumber.replace(/\s/g, '').slice(-4),
        brand: 'Visa', // In production, detect card brand from number
        expiryMonth: parseInt(month),
        expiryYear: parseInt(`20${year}`),
        holderName: cardName,
        isDefault: savedCards.length === 0,
      };

      await firebaseService.savePaymentMethod(cardData);
      await fetchSavedCards();
      setShowAddCardModal(false);
      resetForm();
      Alert.alert('Success', 'Card saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save card');
    } finally {
      setProcessing(false);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await firebaseService.setDefaultPaymentMethod(cardId);
      await fetchSavedCards();
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deletePaymentMethod(cardId);
              await fetchSavedCards();
              Alert.alert('Success', 'Payment method deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCardName('');
    setSaveForFuture(true);
  };

  const renderCard = (card: SavedCard) => (
    <View key={card.id} style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Ionicons name="card" size={32} color={AppColors.primary} />
          <View style={styles.cardDetails}>
            <Text style={styles.cardBrand}>{card.brand}</Text>
            <Text style={styles.cardNumber}>•••• {card.last4}</Text>
            <Text style={styles.cardExpiry}>Expires {card.expiryMonth}/{card.expiryYear}</Text>
            <Text style={styles.cardHolder}>{card.holderName}</Text>
          </View>
        </View>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(card.id)}
          >
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCard(card.id)}
        >
          <Ionicons name="trash-outline" size={20} color={AppColors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test Card Information */}
        <View style={styles.testCardInfo}>
          <View style={styles.testCardHeader}>
            <Ionicons name="information-circle" size={24} color={AppColors.primary} />
            <Text style={styles.testCardTitle}>Test Mode Active</Text>
          </View>
          <Text style={styles.testCardText}>
            You can use the following test card for payments:
          </Text>
          <View style={styles.testCardDetails}>
            <Text style={styles.testCardDetail}>Card Number: {TEST_CARD_INFO.number}</Text>
            <Text style={styles.testCardDetail}>Expiry: {TEST_CARD_INFO.expiry}</Text>
            <Text style={styles.testCardDetail}>CVC: {TEST_CARD_INFO.cvc}</Text>
            <Text style={styles.testCardDetail}>Name: {TEST_CARD_INFO.name}</Text>
          </View>
          <Text style={styles.testCardNote}>{TEST_CARD_INFO.note}</Text>
        </View>

        {/* Saved Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={AppColors.primary} />
          ) : savedCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={60} color={AppColors.text.secondary} />
              <Text style={styles.emptyText}>No payment methods saved</Text>
              <Text style={styles.emptySubtext}>Add a card to make checkout faster</Text>
            </View>
          ) : (
            savedCards.map(renderCard)
          )}
        </View>

        {/* Add Card Button */}
        <TouchableOpacity
          style={styles.addCardButton}
          onPress={() => setShowAddCardModal(true)}
        >
          <Ionicons name="add" size={24} color={AppColors.background.dark} />
          <Text style={styles.addCardButtonText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCardModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 1234 1234 1234"
                  placeholderTextColor={AppColors.text.secondary}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={cardExpiry}
                    onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                    placeholder="MM/YY"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>CVC</Text>
                  <TextInput
                    style={styles.input}
                    value={cardCVC}
                    onChangeText={setCardCVC}
                    placeholder="123"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="John Doe"
                  placeholderTextColor={AppColors.text.secondary}
                  autoCapitalize="words"
                />
              </View>

              <TouchableOpacity
                style={styles.saveForFutureOption}
                onPress={() => setSaveForFuture(!saveForFuture)}
              >
                <View style={styles.checkbox}>
                  {saveForFuture && (
                    <Ionicons name="checkmark" size={16} color={AppColors.primary} />
                  )}
                </View>
                <Text style={styles.saveForFutureText}>
                  Save this card for future purchases
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveCardButton, processing && styles.disabledButton]}
                onPress={handleAddCard}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={AppColors.background.dark} />
                ) : (
                  <Text style={styles.saveCardButtonText}>Save Card</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  testCardInfo: {
    backgroundColor: AppColors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginLeft: 8,
  },
  testCardText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  testCardDetails: {
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testCardDetail: {
    fontSize: 13,
    color: AppColors.text.primary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  testCardNote: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  cardItem: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    marginLeft: 12,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  cardNumber: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  cardHolder: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: AppColors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: AppColors.primary + '20',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 4,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.background.dark,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.background.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveForFutureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: AppColors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveForFutureText: {
    fontSize: 14,
    color: AppColors.text.primary,
  },
  saveCardButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveCardButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PaymentMethodsScreen;