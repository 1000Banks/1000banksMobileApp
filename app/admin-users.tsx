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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  isAdmin?: boolean;
  isBlocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  enrollmentCount?: number;
  purchaseCount?: number;
  totalSpent?: number;
}

const AdminUsersScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'blocked' | 'active'>('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    blockedUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await firebaseService.isAdmin();
      if (!isAdmin) {
        Alert.alert('Access Denied', 'You do not have admin access');
        router.replace('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.replace('/');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userList = await firebaseService.getAllUsers();
      
      // Enhance user data with additional info
      const enhancedUsers = await Promise.all(
        userList.map(async (user) => {
          try {
            const enrollments = await firebaseService.getUserEnrollmentsById(user.uid);
            const purchases = await firebaseService.getUserPurchasesById(user.uid);
            const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
            
            return {
              ...user,
              enrollmentCount: enrollments.length,
              purchaseCount: purchases.length,
              totalSpent,
            };
          } catch (error) {
            console.error(`Error enhancing data for user ${user.uid}:`, error);
            return {
              ...user,
              enrollmentCount: 0,
              purchaseCount: 0,
              totalSpent: 0,
            };
          }
        })
      );
      
      setUsers(enhancedUsers);
      updateStats(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (userList: UserProfile[]) => {
    setStats({
      totalUsers: userList.length,
      adminUsers: userList.filter(u => u.isAdmin).length,
      blockedUsers: userList.filter(u => u.isBlocked).length,
      activeUsers: userList.filter(u => !u.isBlocked).length,
    });
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    Alert.alert(
      user.isAdmin ? 'Remove Admin Rights' : 'Grant Admin Rights',
      `Are you sure you want to ${user.isAdmin ? 'remove admin rights from' : 'grant admin rights to'} ${user.displayName || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: user.isAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setProcessing(true);
              await firebaseService.updateUserRole(user.uid, { isAdmin: !user.isAdmin });
              await firebaseService.createAuditLog({
                action: user.isAdmin ? 'REMOVE_ADMIN' : 'GRANT_ADMIN',
                targetUserId: user.uid,
                targetUserEmail: user.email,
              });
              await fetchUsers();
              Alert.alert('Success', `Admin rights ${user.isAdmin ? 'removed' : 'granted'} successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleBlock = async (user: UserProfile) => {
    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      `Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.displayName || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: user.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              await firebaseService.updateUserRole(user.uid, { isBlocked: !user.isBlocked });
              await firebaseService.createAuditLog({
                action: user.isBlocked ? 'UNBLOCK_USER' : 'BLOCK_USER',
                targetUserId: user.uid,
                targetUserEmail: user.email,
              });
              await fetchUsers();
              Alert.alert('Success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: UserProfile) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${user.displayName || user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              await firebaseService.deleteUser(user.uid);
              await firebaseService.createAuditLog({
                action: 'DELETE_USER',
                targetUserId: user.uid,
                targetUserEmail: user.email,
              });
              await fetchUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    switch (filterType) {
      case 'admin':
        return matchesSearch && user.isAdmin;
      case 'blocked':
        return matchesSearch && user.isBlocked;
      case 'active':
        return matchesSearch && !user.isBlocked;
      default:
        return matchesSearch;
    }
  });

  const renderUserCard = (user: UserProfile) => (
    <View key={user.uid} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color={AppColors.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName || 'No Name'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userBadges}>
            {user.isAdmin && (
              <View style={[styles.badge, styles.adminBadge]}>
                <Text style={styles.badgeText}>Admin</Text>
              </View>
            )}
            {user.isBlocked && (
              <View style={[styles.badge, styles.blockedBadge]}>
                <Text style={styles.badgeText}>Blocked</Text>
              </View>
            )}
            <View style={[styles.badge, styles.providerBadge]}>
              <Text style={styles.badgeText}>{user.provider}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedUser(user);
            setShowUserModal(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.enrollmentCount}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.purchaseCount}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${user.totalSpent?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
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
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchUsers}
        >
          <Ionicons name="refresh" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statTitle}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.adminUsers}</Text>
            <Text style={styles.statTitle}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statTitle}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.blockedUsers}</Text>
            <Text style={styles.statTitle}>Blocked</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={AppColors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={AppColors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          {['all', 'active', 'admin', 'blocked'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterType === filter && styles.filterButtonActive
              ]}
              onPress={() => setFilterType(filter as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filterType === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Users List */}
        {loading ? (
          <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
        ) : (
          <View style={styles.usersList}>
            <Text style={styles.usersCount}>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </Text>
            {filteredUsers.map(renderUserCard)}
          </View>
        )}
      </ScrollView>

      {/* User Actions Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Actions</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <View style={styles.modalBody}>
                <Text style={styles.selectedUserName}>{selectedUser.displayName || 'No Name'}</Text>
                <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.adminButton]}
                    onPress={() => {
                      setShowUserModal(false);
                      handleToggleAdmin(selectedUser);
                    }}
                    disabled={processing}
                  >
                    <Ionicons 
                      name={selectedUser.isAdmin ? "remove-circle" : "shield-checkmark"} 
                      size={20} 
                      color={AppColors.background.dark} 
                    />
                    <Text style={styles.actionButtonText}>
                      {selectedUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.blockButton]}
                    onPress={() => {
                      setShowUserModal(false);
                      handleToggleBlock(selectedUser);
                    }}
                    disabled={processing}
                  >
                    <Ionicons 
                      name={selectedUser.isBlocked ? "unlock" : "lock-closed"} 
                      size={20} 
                      color={AppColors.background.dark} 
                    />
                    <Text style={styles.actionButtonText}>
                      {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      setShowUserModal(false);
                      handleDeleteUser(selectedUser);
                    }}
                    disabled={processing}
                  >
                    <Ionicons name="trash" size={20} color={AppColors.background.dark} />
                    <Text style={styles.actionButtonText}>Delete User</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
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
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: AppColors.background.dark,
  },
  loader: {
    marginTop: 50,
  },
  usersList: {
    marginBottom: 20,
  },
  usersCount: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadge: {
    backgroundColor: AppColors.primary + '20',
  },
  blockedBadge: {
    backgroundColor: AppColors.error + '20',
  },
  providerBadge: {
    backgroundColor: AppColors.text.secondary + '20',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  moreButton: {
    padding: 4,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.background.dark,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: AppColors.text.secondary,
    marginTop: 2,
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
  selectedUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  selectedUserEmail: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  adminButton: {
    backgroundColor: AppColors.primary,
  },
  blockButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: AppColors.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default AdminUsersScreen;