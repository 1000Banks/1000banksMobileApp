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
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import paymentService, { PaymentMethod, PaymentRequest } from '@/services/payment';
import firebaseService from '@/services/firebase';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

const CheckoutScreen = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useUser();
  
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.displayName || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethods] = useState(paymentService.getAvailablePaymentMethods());
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  
  // Test card info
  const TEST_CARD_INFO = {
    number: '4242 4242 4242 4242',
    expiry: '12/34',
    cvc: '123',
    name: 'Test User',
  };

  useEffect(() => {
    fetchSavedCards();
  }, [user]);

  const fetchSavedCards = async () => {
    if (!user) {
      setLoadingCards(false);
      setCardsError(null);
      return;
    }
    
    try {
      setCardsError(null);
      const cards = await firebaseService.getUserPaymentMethods();
      setSavedCards(cards || []); // Ensure it's always an array
      
      // Select default card if available
      if (cards && cards.length > 0) {
        const defaultCard = cards.find(card => card.isDefault);
        if (defaultCard) {
          setSelectedCardId(defaultCard.id);
        }
      }
    } catch (error: any) {
      console.log('Payment methods fetch result:', error.code);
      setSavedCards([]); // Always set empty array on error
      
      // Handle different types of errors
      if (error.code === 'firestore/permission-denied') {
        // This is normal for new users - no error needed
        console.log('No payment methods collection access - user likely has no saved cards');
        setCardsError(null);
      } else if (error.code === 'firestore/unavailable') {
        setCardsError('Unable to load payment methods. Please try again.');
      } else {
        console.error('Unexpected error fetching payment methods:', error);
        setCardsError('Error loading saved cards');
      }
    } finally {
      setLoadingCards(false);
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

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item && item.type !== 'course') { // Don't allow quantity changes for courses
      updateQuantity(id, item.quantity + delta);
    }
  };

  const handleCheckout = async () => {
    if (!email || !name || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please fill in all required fields and select a payment method');
      return;
    }
    
    // Additional validation for card payment
    if (selectedPaymentMethod.type === 'stripe') {
      if (!selectedCardId && !showCardForm) {
        Alert.alert('Error', 'Please select a saved card or add a new one');
        return;
      }
      
      if (showCardForm && (!cardNumber || !cardExpiry || !cardCVC || !cardName)) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    const paymentRequest: PaymentRequest = {
      amount: total,
      currency: 'USD',
      description: `1000Banks Purchase - ${cartItems.length} item(s)`,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.replace('$', '')),
        type: item.type,
      })),
      customerEmail: email,
      customerName: name,
    };

    const validation = paymentService.validatePaymentRequest(paymentRequest);
    if (!validation.valid) {
      Alert.alert('Error', validation.errors.join('\n'));
      return;
    }

    setProcessing(true);

    try {
      // Save card if requested
      if (selectedPaymentMethod.type === 'stripe' && showCardForm && saveCard) {
        try {
          const [month, year] = cardExpiry.split('/');
          const cardData = {
            last4: cardNumber.replace(/\s/g, '').slice(-4),
            brand: 'Visa', // In production, detect from card number
            expiryMonth: parseInt(month),
            expiryYear: parseInt(`20${year}`),
            holderName: cardName,
            isDefault: savedCards.length === 0,
          };
          
          const newCardId = await firebaseService.savePaymentMethod(cardData);
          setSelectedCardId(newCardId);
          
          // Refresh saved cards
          await fetchSavedCards();
        } catch (error) {
          console.error('Error saving card:', error);
          // Continue with payment even if save fails
        }
      }
      
      const paymentResult = await paymentService.processPayment(selectedPaymentMethod, paymentRequest);
      
      if (paymentResult.success) {
        const purchaseId = await paymentService.createPurchaseRecord(paymentResult, paymentRequest);
        await clearCart();
        
        Alert.alert(
          'Order Confirmed!',
          `Thank you for your purchase! Your order ID is ${purchaseId}. You will receive a confirmation email shortly.`,
          [
            {
              text: 'View My Learning',
              onPress: () => router.push('/account?tab=learning'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => router.push('/'),
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.error || 'Please try again or use a different payment method.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color={AppColors.text.secondary} />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemImage}>{item.image || '📦'}</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  {item.type === 'course' && (
                    <Text style={styles.courseNote}>Digital Course - Lifetime Access</Text>
                  )}
                </View>
              </View>
              
              {item.type !== 'course' && (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, -1)}
                  >
                    <Ionicons name="remove" size={16} color={AppColors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.id, 1)}
                  >
                    <Ionicons name="add" size={16} color={AppColors.text.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {item.type === 'course' && (
                <View style={styles.courseQuantity}>
                  <Text style={styles.quantityText}>Qty: 1</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={AppColors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={AppColors.text.secondary}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {/* Test Card Info Banner */}
          <View style={styles.testCardBanner}>
            <Ionicons name="information-circle" size={20} color={AppColors.primary} />
            <Text style={styles.testCardText}>Test Mode: Use card {TEST_CARD_INFO.number}</Text>
          </View>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => {
                setSelectedPaymentMethod(method);
                if (method.type === 'stripe' && savedCards.length === 0) {
                  setShowCardForm(true);
                }
              }}
            >
              <View style={styles.paymentMethodInfo}>
                <Ionicons name={method.icon as any} size={24} color={AppColors.primary} />
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPaymentMethod?.id === method.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Saved Cards Section */}
          {selectedPaymentMethod?.type === 'stripe' && !loadingCards && (
            <View style={styles.savedCardsSection}>
              {savedCards.length > 0 ? (
                <>
                  <Text style={styles.savedCardsTitle}>Saved Cards</Text>
                  {savedCards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.savedCard,
                        selectedCardId === card.id && styles.selectedSavedCard
                      ]}
                      onPress={() => {
                        setSelectedCardId(card.id);
                        setShowCardForm(false);
                      }}
                    >
                      <View style={styles.savedCardInfo}>
                        <Ionicons name="card" size={24} color={AppColors.primary} />
                        <View style={styles.savedCardDetails}>
                          <Text style={styles.savedCardBrand}>
                            {card.brand} •••• {card.last4}
                          </Text>
                          <Text style={styles.savedCardExpiry}>
                            Expires {card.expiryMonth}/{card.expiryYear}
                          </Text>
                          <Text style={styles.savedCardHolder}>{card.holderName}</Text>
                        </View>
                      </View>
                      <View style={styles.cardRadioButton}>
                        {selectedCardId === card.id && (
                          <View style={styles.cardRadioButtonSelected} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    style={styles.addNewCardButton}
                    onPress={() => {
                      setShowCardForm(true);
                      setSelectedCardId(null);
                    }}
                  >
                    <Ionicons name="add" size={20} color={AppColors.primary} />
                    <Text style={styles.addNewCardText}>Use a different card</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.manageCardsButton}
                    onPress={() => router.push('/payment-methods')}
                  >
                    <Ionicons name="settings-outline" size={16} color={AppColors.text.secondary} />
                    <Text style={styles.manageCardsText}>Manage payment methods</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.noCardsMessage}>
                  <Text style={styles.noCardsText}>No saved cards</Text>
                  <TouchableOpacity
                    style={styles.addFirstCardButton}
                    onPress={() => setShowCardForm(true)}
                  >
                    <Text style={styles.addFirstCardText}>Add a card</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Inline Card Form */}
              {showCardForm && (
                <View style={styles.inlineCardForm}>
                  <Text style={styles.cardFormTitle}>Card Details</Text>
                  
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
                    style={styles.saveCardOption}
                    onPress={() => setSaveCard(!saveCard)}
                  >
                    <View style={styles.checkbox}>
                      {saveCard && (
                        <Ionicons name="checkmark" size={16} color={AppColors.primary} />
                      )}
                    </View>
                    <Text style={styles.saveCardText}>
                      Save this card for future purchases
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {paymentMethods.length === 0 && (
            <View style={styles.noPaymentMethods}>
              <Text style={styles.noPaymentMethodsText}>
                No payment methods available. Please check your configuration.
              </Text>
            </View>
          )}
        </View>

        {/* Order Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (8%):</Text>
            <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutButton, processing && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={processing || !selectedPaymentMethod || paymentMethods.length === 0}
        >
          {processing ? (
            <ActivityIndicator size="small" color={AppColors.background.dark} />
          ) : (
            <Text style={styles.checkoutButtonText}>
              Complete Purchase - ${total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureNote}>
          🔒 Your payment information is secure and encrypted
        </Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    fontSize: 24,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  courseNote: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    color: AppColors.text.primary,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  courseQuantity: {
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  noPaymentMethods: {
    padding: 20,
    alignItems: 'center',
  },
  noPaymentMethodsText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  totalValue: {
    fontSize: 16,
    color: AppColors.text.primary,
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: AppColors.text.secondary + '30',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  checkoutButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  secureNote: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  testCardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  testCardText: {
    fontSize: 13,
    color: AppColors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  savedCardsSection: {
    marginTop: 16,
  },
  savedCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSavedCard: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  savedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedCardDetails: {
    marginLeft: 12,
    flex: 1,
  },
  savedCardBrand: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  savedCardExpiry: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  savedCardHolder: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  cardRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRadioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  addNewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  addNewCardText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  manageCardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  manageCardsText: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginLeft: 6,
  },
  noCardsMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCardsText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 12,
  },
  addFirstCardButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: AppColors.primary + '20',
    borderRadius: 20,
  },
  addFirstCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  inlineCardForm: {
    backgroundColor: AppColors.background.dark,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  cardFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
  saveCardText: {
    fontSize: 14,
    color: AppColors.text.primary,
  },
});

export default CheckoutScreen;