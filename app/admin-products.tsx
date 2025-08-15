import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppColors } from '@/constants/Colors';
import firebaseService, { Product } from '@/services/firebase';

const AdminProducts = () => {
  const params = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    stock: '',
    isActive: true,
    image: '📦',
    imageUrl: '',
    features: [''],
    specifications: { '': '' },
  });

  useEffect(() => {
    loadProducts();
    if (params.action === 'new') {
      setModalVisible(true);
    }
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await firebaseService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      fullDescription: '',
      price: '',
      category: '',
      stock: '',
      isActive: true,
      image: '📦',
      imageUrl: '',
      features: [''],
      specifications: { '': '' },
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription || '',
      price: product.price,
      category: product.category,
      stock: product.stock.toString(),
      isActive: product.isActive,
      image: product.image || '📦',
      imageUrl: product.imageUrl || '',
      features: product.features || [''],
      specifications: product.specifications || { '': '' },
    });
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        fullDescription: productForm.fullDescription,
        price: productForm.price,
        category: productForm.category,
        stock: parseInt(productForm.stock) || 0,
        isActive: productForm.isActive,
        image: productForm.image,
        imageUrl: productForm.imageUrl,
        features: productForm.features.filter(f => f.trim() !== ''),
        specifications: Object.fromEntries(
          Object.entries(productForm.specifications).filter(([k, v]) => k.trim() !== '' && v.trim() !== '')
        ),
      };

      if (editingProduct) {
        await firebaseService.updateProduct(editingProduct.id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await firebaseService.createProduct(productData);
        Alert.alert('Success', 'Product created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deleteProduct(product.id);
              Alert.alert('Success', 'Product deleted successfully');
              loadProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ],
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const { status } = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera/gallery permissions to upload images.');
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (!result.canceled) {
      // In a real app, you would upload this to Firebase Storage
      // For now, we'll store the local URI
      setProductForm({ ...productForm, imageUrl: result.assets[0].uri });
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const addFeature = () => {
    setProductForm({
      ...productForm,
      features: [...productForm.features, ''],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...productForm.features];
    newFeatures[index] = value;
    setProductForm({ ...productForm, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = productForm.features.filter((_, i) => i !== index);
    setProductForm({ ...productForm, features: newFeatures });
  };

  const addSpecification = () => {
    setProductForm({
      ...productForm,
      specifications: { ...productForm.specifications, '': '' },
    });
  };

  const updateSpecification = (oldKey: string, newKey: string, value: string) => {
    const newSpecs = { ...productForm.specifications };
    if (oldKey !== newKey) {
      delete newSpecs[oldKey];
    }
    newSpecs[newKey] = value;
    setProductForm({ ...productForm, specifications: newSpecs });
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...productForm.specifications };
    delete newSpecs[key];
    setProductForm({ ...productForm, specifications: newSpecs });
  };

  const categoryOptions = ['Apparel', 'Accessories', 'Books', 'Digital', 'Other'];
  const emojiOptions = ['👕', '👔', '🧢', '📚', '☕', '💧', '📔', '📅', '🎯', '📦'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productEmoji}>{item.image}</Text>
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
                <Text style={[styles.productStatus, { color: item.isActive ? '#10B981' : '#EF4444' }]}>
                  {item.isActive ? 'Active' : 'Inactive'} • Stock: {item.stock}
                </Text>
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity
                onPress={() => handleEditProduct(item)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={20} color={AppColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteProduct(item)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products found</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Selection */}
              <View style={styles.imageSection}>
                <Text style={styles.inputLabel}>Product Image</Text>
                <View style={styles.imageContainer}>
                  {productForm.imageUrl ? (
                    <Image source={{ uri: productForm.imageUrl }} style={styles.productImage} />
                  ) : (
                    <Text style={styles.productImageEmoji}>{productForm.image}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={showImagePicker}
                  >
                    <Ionicons name="camera" size={20} color={AppColors.primary} />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>

                {/* Emoji Selection */}
                <View style={styles.emojiContainer}>
                  {emojiOptions.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiButton,
                        productForm.image === emoji && styles.emojiButtonActive,
                      ]}
                      onPress={() => setProductForm({ ...productForm, image: emoji })}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Basic Information */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={productForm.name}
                  onChangeText={(text) => setProductForm({ ...productForm, name: text })}
                  placeholder="Enter product name"
                  placeholderTextColor={AppColors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Short Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={productForm.description}
                  onChangeText={(text) => setProductForm({ ...productForm, description: text })}
                  placeholder="Brief product description"
                  placeholderTextColor={AppColors.text.secondary}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={productForm.fullDescription}
                  onChangeText={(text) => setProductForm({ ...productForm, fullDescription: text })}
                  placeholder="Detailed product description"
                  placeholderTextColor={AppColors.text.secondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={productForm.price}
                    onChangeText={(text) => setProductForm({ ...productForm, price: text })}
                    placeholder="$0.00"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={productForm.stock}
                    onChangeText={(text) => setProductForm({ ...productForm, stock: text })}
                    placeholder="0"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categoryOptions.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          productForm.category === category && styles.categoryButtonActive,
                        ]}
                        onPress={() => setProductForm({ ...productForm, category })}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            productForm.category === category && styles.categoryTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Features */}
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Features</Text>
                  <TouchableOpacity onPress={addFeature}>
                    <Ionicons name="add-circle" size={24} color={AppColors.primary} />
                  </TouchableOpacity>
                </View>
                {productForm.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={feature}
                      onChangeText={(text) => updateFeature(index, text)}
                      placeholder="Feature description"
                      placeholderTextColor={AppColors.text.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => removeFeature(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Specifications */}
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Specifications</Text>
                  <TouchableOpacity onPress={addSpecification}>
                    <Ionicons name="add-circle" size={24} color={AppColors.primary} />
                  </TouchableOpacity>
                </View>
                {Object.entries(productForm.specifications).map(([key, value], index) => (
                  <View key={index} style={styles.specRow}>
                    <TextInput
                      style={[styles.input, { flex: 0.4 }]}
                      value={key}
                      onChangeText={(text) => updateSpecification(key, text, value)}
                      placeholder="Key"
                      placeholderTextColor={AppColors.text.secondary}
                    />
                    <TextInput
                      style={[styles.input, { flex: 0.6, marginLeft: 8 }]}
                      value={value}
                      onChangeText={(text) => updateSpecification(key, key, text)}
                      placeholder="Value"
                      placeholderTextColor={AppColors.text.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => removeSpecification(key)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Active Status */}
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Active Status</Text>
                <Switch
                  value={productForm.isActive}
                  onValueChange={(value) => setProductForm({ ...productForm, isActive: value })}
                  trackColor={{ false: '#374151', true: AppColors.primary }}
                  thumbColor={productForm.isActive ? AppColors.background.dark : '#9CA3AF'}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  addButton: {
    padding: 8,
  },
  productList: {
    padding: 20,
  },
  productCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 4,
  },
  productStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.background.dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  productImageEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: AppColors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonActive: {
    borderColor: AppColors.primary,
  },
  emoji: {
    fontSize: 24,
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
    fontSize: 14,
    color: AppColors.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.background.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '20',
  },
  categoryText: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  categoryTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default AdminProducts;