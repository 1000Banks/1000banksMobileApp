import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

const ProductDetailScreen = () => {
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Parse product data from params
  const product: Product = {
    id: params.id as string,
    name: params.name as string,
    price: params.price as string,
    image: params.image as string,
    description: params.description as string,
    fullDescription: params.fullDescription as string,
    features: params.features ? JSON.parse(params.features as string) : [],
    specifications: params.specifications ? JSON.parse(params.specifications as string) : {},
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        type: 'product',
        image: product.image,
        description: product.description,
      });
    }
    Alert.alert(
      'Added to Cart',
      `${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to your cart`,
      [{ text: 'OK' }]
    );
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getDefaultProductDetails = (productName: string) => {
    const defaults: Record<string, { fullDescription: string; features: string[]; specifications: Record<string, string> }> = {
      '1000Banks Hoodie': {
        fullDescription: 'Our premium quality hoodie features the iconic 1000Banks logo embroidered on the chest. Made from 80% cotton and 20% polyester blend, this hoodie offers comfort and durability. Perfect for entrepreneurs who want to represent the financial freedom movement.',
        features: [
          'Premium cotton-polyester blend',
          'Embroidered 1000Banks logo',
          'Kangaroo pocket with hidden phone pocket',
          'Adjustable drawstring hood',
          'Machine washable',
        ],
        specifications: {
          'Material': '80% Cotton, 20% Polyester',
          'Sizes': 'S, M, L, XL, XXL',
          'Colors': 'Black, Navy, Gold',
          'Care': 'Machine wash cold, tumble dry low',
        },
      },
      'Financial Freedom Mug': {
        fullDescription: 'Start your day with motivation! This ceramic mug features inspiring quotes about financial freedom and success. High-quality print that won\'t fade, dishwasher and microwave safe.',
        features: [
          'High-quality ceramic construction',
          'Fade-resistant printing',
          'Dishwasher and microwave safe',
          '11oz capacity',
          'Comfortable C-handle',
        ],
        specifications: {
          'Material': 'Ceramic',
          'Capacity': '11oz (325ml)',
          'Height': '3.75 inches',
          'Care': 'Dishwasher and microwave safe',
        },
      },
    };

    return defaults[productName] || {
      fullDescription: product.description + '. This premium quality item is designed to inspire and support your journey to financial freedom.',
      features: [
        'Premium quality materials',
        'Durable construction',
        'Officially licensed 1000Banks merchandise',
        'Satisfaction guaranteed',
      ],
      specifications: {
        'Brand': '1000Banks',
        'Quality': 'Premium',
        'Warranty': '30-day satisfaction guarantee',
      },
    };
  };

  const productDetails = product.fullDescription ? product : { ...product, ...getDefaultProductDetails(product.name) };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{product.image}</Text>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{productDetails.fullDescription}</Text>
          </View>

          {productDetails.features && productDetails.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Features</Text>
              {productDetails.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {productDetails.specifications && Object.keys(productDetails.specifications).length > 0 && (
            <View style={styles.specificationsSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(productDetails.specifications).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
              >
                <Ionicons name="remove" size={20} color={AppColors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Ionicons name="add" size={20} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color={AppColors.background.dark} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.buyNowButton} onPress={() => {
            handleAddToCart();
            router.push('/checkout');
          }}>
            <Text style={styles.buyNowText}>Buy Now</Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: AppColors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  productImage: {
    fontSize: 120,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 24,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  specificationsSection: {
    marginBottom: 24,
  },
  specItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    width: 120,
  },
  specValue: {
    fontSize: 14,
    color: AppColors.text.secondary,
    flex: 1,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 24,
    paddingHorizontal: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginHorizontal: 16,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
  },
  addToCartButton: {
    backgroundColor: AppColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
    marginLeft: 8,
  },
  buyNowButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
});

export default ProductDetailScreen;