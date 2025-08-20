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

interface Purchase {
  id: string;
  uid: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    type: 'product' | 'course';
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
  customerEmail?: string;
  customerName?: string;
}

const AdminOrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Purchase | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allPurchases = await firebaseService.getAllPurchases();
      
      // Enhance with customer info
      const enhancedOrders = await Promise.all(
        allPurchases.map(async (purchase) => {
          try {
            const userProfile = await firebaseService.getUserProfile(purchase.uid);
            return {
              ...purchase,
              customerEmail: userProfile?.email || 'Unknown',
              customerName: userProfile?.displayName || 'Unknown User',
            };
          } catch (error) {
            return {
              ...purchase,
              customerEmail: 'Unknown',
              customerName: 'Unknown User',
            };
          }
        })
      );

      // Sort by creation date (newest first)
      enhancedOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(enhancedOrders);
      updateStats(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (orderList: Purchase[]) => {
    setStats({
      totalOrders: orderList.length,
      pendingOrders: orderList.filter(o => o.status === 'pending').length,
      completedOrders: orderList.filter(o => o.status === 'completed').length,
      totalRevenue: orderList
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0),
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Purchase['status']) => {
    Alert.alert(
      'Update Order Status',
      `Change order status to ${newStatus.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setUpdating(true);
              await firebaseService.updatePurchaseStatus(orderId, newStatus);
              await firebaseService.createAuditLog({
                action: 'UPDATE_ORDER_STATUS',
                details: { orderId, newStatus },
              });
              await fetchOrders();
              setShowOrderModal(false);
              Alert.alert('Success', 'Order status updated successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'processing':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      case 'failed':
        return '#EF4444';
      default:
        return AppColors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'pending':
        return 'ellipse';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderOrderCard = (order: Purchase) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(order);
        setShowOrderModal(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
          <View style={styles.orderMeta}>
            <Text style={styles.customerText}>
              {order.customerName} ({order.customerEmail})
            </Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(order.status) as any} 
            size={14} 
            color={getStatusColor(order.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.itemText}>
            {item.quantity}x {item.name} - {item.price}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItemsText}>
            +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.paymentMethod}>
          {order.paymentMethod || 'Unknown payment method'}
        </Text>
        <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Order Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Ionicons name="refresh" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statTitle}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedOrders}</Text>
            <Text style={styles.statTitle}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${stats.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statTitle}>Revenue</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={AppColors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              placeholderTextColor={AppColors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <Text style={[
                styles.filterButtonText,
                statusFilter === status && styles.filterButtonTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Orders List */}
        {loading ? (
          <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
        ) : (
          <View style={styles.ordersList}>
            <Text style={styles.ordersCount}>
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </Text>
            {filteredOrders.map(renderOrderCard)}
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailSectionTitle}>Order Information</Text>
                  <Text style={styles.detailText}>ID: #{selectedOrder.id.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.detailText}>
                    Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.detailText}>Status: {selectedOrder.status.toUpperCase()}</Text>
                  <Text style={styles.detailText}>Payment: {selectedOrder.paymentMethod || 'Unknown'}</Text>
                  <Text style={styles.detailText}>Total: ${selectedOrder.total.toFixed(2)}</Text>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailSectionTitle}>Customer</Text>
                  <Text style={styles.detailText}>Name: {selectedOrder.customerName}</Text>
                  <Text style={styles.detailText}>Email: {selectedOrder.customerEmail}</Text>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.detailSectionTitle}>Items ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemDetail}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemInfo}>
                        {item.quantity}x {item.price} • {item.type}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.statusActions}>
                  <Text style={styles.detailSectionTitle}>Update Status</Text>
                  {['pending', 'processing', 'completed', 'failed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        selectedOrder.status === status && styles.currentStatusButton,
                        { backgroundColor: getStatusColor(status) + '20' }
                      ]}
                      onPress={() => {
                        if (selectedOrder.status !== status) {
                          handleUpdateOrderStatus(selectedOrder.id, status as any);
                        }
                      }}
                      disabled={updating || selectedOrder.status === status}
                    >
                      <Ionicons 
                        name={getStatusIcon(status) as any} 
                        size={20} 
                        color={getStatusColor(status)} 
                      />
                      <Text style={[styles.statusButtonText, { color: getStatusColor(status) }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {selectedOrder.status === status && ' (Current)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 11,
    color: AppColors.text.secondary,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.background.card,
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: AppColors.background.dark,
  },
  loader: {
    marginTop: 50,
  },
  ordersList: {
    marginBottom: 20,
  },
  ordersCount: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  orderMeta: {
    marginBottom: 4,
  },
  customerText: {
    fontSize: 13,
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 11,
    color: AppColors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppColors.background.dark,
  },
  paymentMethod: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textTransform: 'capitalize',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
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
    maxHeight: '85%',
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
    paddingBottom: 32,
  },
  orderDetailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 6,
  },
  itemDetail: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  itemInfo: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  statusActions: {
    marginBottom: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentStatusButton: {
    opacity: 0.5,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AdminOrdersScreen;