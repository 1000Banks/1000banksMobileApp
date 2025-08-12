import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
  const { addToCart } = useCart();

  // Sample merch data
  const merchData = [
    { id: '1', name: '1000Banks Hoodie', price: '$49.99', image: '👕', description: 'Premium quality hoodie with 1000Banks logo' },
    { id: '2', name: 'Financial Freedom Mug', price: '$19.99', image: '☕', description: 'Start your day with motivation' },
    { id: '3', name: 'Entrepreneur Cap', price: '$24.99', image: '🧢', description: 'Stylish cap for the modern entrepreneur' },
    { id: '4', name: 'Success Journal', price: '$29.99', image: '📔', description: 'Track your journey to financial freedom' },
    { id: '5', name: 'Investment Tee', price: '$24.99', image: '👔', description: 'Comfortable cotton tee with inspiring quotes' },
    { id: '6', name: 'Wealth Mindset Book', price: '$34.99', image: '📚', description: 'Essential reading for financial success' },
    { id: '7', name: 'Money Tracker Planner', price: '$39.99', image: '📅', description: 'Organize your finances effectively' },
    { id: '8', name: 'Motivational Water Bottle', price: '$22.99', image: '💧', description: 'Stay hydrated, stay motivated' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showMenuAndCart={true} />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopTitle}>1000Banks Merchandise</Text>
          <Text style={styles.shopSubtitle}>Premium quality items to support your journey</Text>
        </View>
        
        <FlatList
          data={merchData}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.shopItemCard}>
              <Text style={styles.shopItemImage}>{item.image}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDescription}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>{item.price}</Text>
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={() => addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  type: 'product',
                  image: item.image,
                  description: item.description
                })}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.shopGrid}
          columnWrapperStyle={styles.shopRow}
          scrollEnabled={false}
        />
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
  scrollContent: {
    flex: 1,
  },
  shopHeader: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  shopSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  shopGrid: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  shopRow: {
    justifyContent: 'space-between',
  },
  shopItemCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  shopItemImage: {
    fontSize: 48,
    marginBottom: 12,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  shopItemDescription: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  shopItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default ShopScreen;