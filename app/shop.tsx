import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';
import firebaseService, { Product } from '@/services/firebase';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await firebaseService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to sample data if Firebase fails
      setProducts([
        { id: '1', name: '1000Banks Hoodie', price: '$49.99', image: '👕', description: 'Premium quality hoodie with 1000Banks logo', category: 'Apparel', stock: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Financial Freedom Mug', price: '$19.99', image: '☕', description: 'Start your day with motivation', category: 'Accessories', stock: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'Entrepreneur Cap', price: '$24.99', image: '🧢', description: 'Stylish cap for the modern entrepreneur', category: 'Apparel', stock: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', name: 'Success Journal', price: '$29.99', image: '📔', description: 'Track your journey to financial freedom', category: 'Books', stock: 25, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showMenuAndCart={true} />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopTitle}>1000Banks Merchandise</Text>
          <Text style={styles.shopSubtitle}>Premium quality items to support your journey</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.shopItemCard}
              onPress={() => router.push({
                pathname: '/product-detail',
                params: {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  description: item.description,
                  fullDescription: item.fullDescription || '',
                  features: JSON.stringify(item.features || []),
                  specifications: JSON.stringify(item.specifications || {}),
                }
              })}
            >
              <Text style={styles.shopItemImage}>{item.image}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemDescription}>{item.description}</Text>
              <Text style={styles.shopItemPrice}>{item.price}</Text>
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    type: 'product',
                    image: item.image,
                    description: item.description
                  });
                }}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
            contentContainerStyle={styles.shopGrid}
            columnWrapperStyle={styles.shopRow}
            scrollEnabled={false}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.text.secondary,
  },
});

export default ShopScreen;