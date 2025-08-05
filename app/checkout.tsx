import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';

const CheckoutScreen = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const handleCheckout = () => {
    if (!email || !name || !cardNumber || !expiryDate || !cvv || !billingAddress) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Order Confirmed!',
      `Thank you for your purchase of $${total.toFixed(2)}. You will receive a confirmation email shortly.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.push('/');
          }
        }
      ]
    );
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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

        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemImage}>{item.image}</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemType}>{item.type === 'course' ? 'Course' : 'Product'}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Ionicons name="remove" size={20} color={AppColors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Ionicons name="add" size={20} color={AppColors.text.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={AppColors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={AppColors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={AppColors.text.secondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            placeholderTextColor={AppColors.text.secondary}
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
            maxLength={16}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/YY"
              placeholderTextColor={AppColors.text.secondary}
              value={expiryDate}
              onChangeText={setExpiryDate}
              keyboardType="numeric"
              maxLength={5}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVV"
              placeholderTextColor={AppColors.text.secondary}
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Billing Address"
            placeholderTextColor={AppColors.text.secondary}
            value={billingAddress}
            onChangeText={setBillingAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Total</Text>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Complete Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.secureText}>
          <Ionicons name="lock-closed" size={14} /> Secure checkout powered by 1000Banks
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
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyCartText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  cartItem: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    fontSize: 32,
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
  itemType: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  input: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.text.primary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.background.card,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  totalContainer: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  totalValue: {
    fontSize: 16,
    color: AppColors.text.primary,
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: AppColors.primary + '30',
    paddingTop: 12,
    marginBottom: 0,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  finalTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  checkoutButton: {
    backgroundColor: AppColors.primary,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  secureText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default CheckoutScreen;