import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import firebaseService from '@/services/firebase';
import auth from '@react-native-firebase/auth';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCourses: 0,
    activeProducts: 0,
    activeCourses: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    const isAdmin = await firebaseService.isAdmin();
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin access');
      router.replace('/');
    }
  };

  const loadStats = async () => {
    try {
      const products = await firebaseService.getAllProducts();
      const courses = await firebaseService.getAllCourses();
      
      setStats({
        totalProducts: products.length,
        totalCourses: courses.length,
        activeProducts: products.filter(p => p.isActive).length,
        activeCourses: courses.filter(c => c.isActive).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await auth().signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    {
      title: 'Manage Products',
      icon: 'pricetag',
      description: 'Add, edit, or remove merchandise',
      onPress: () => router.push('/admin-products'),
      color: '#F5B800',
    },
    {
      title: 'Manage Courses',
      icon: 'school',
      description: 'Create and manage educational content',
      onPress: () => router.push('/admin-courses'),
      color: '#10B981',
    },
    {
      title: 'View Orders',
      icon: 'receipt',
      description: 'Track and manage customer orders',
      onPress: () => router.push('/admin-orders'),
      color: '#3B82F6',
    },
    {
      title: 'User Management',
      icon: 'people',
      description: 'View and manage user accounts',
      onPress: () => router.push('/admin-users'),
      color: '#8B5CF6',
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      description: 'View sales and engagement metrics',
      onPress: () => router.push('/admin-analytics'),
      color: '#EF4444',
    },
    {
      title: 'Settings',
      icon: 'settings',
      description: 'Configure app settings',
      onPress: () => router.push('/admin-settings'),
      color: '#6B7280',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
            <Text style={styles.statActive}>{stats.activeProducts} active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Total Courses</Text>
            <Text style={styles.statActive}>{stats.activeCourses} active</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: AppColors.primary }]}
              onPress={() => router.push('/admin-products?action=new')}
            >
              <Ionicons name="add-circle" size={20} color={AppColors.background.dark} />
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/admin-courses?action=new')}
            >
              <Ionicons name="add-circle" size={20} color={AppColors.text.primary} />
              <Text style={[styles.quickActionText, { color: AppColors.text.primary }]}>Add Course</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Back to App Button */}
        <TouchableOpacity 
          style={styles.backToAppButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.primary} />
          <Text style={styles.backToAppText}>Back to Main App</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  signOutButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  statActive: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  menuGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  menuItem: {
    width: '47%',
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: AppColors.text.secondary,
    lineHeight: 16,
  },
  backToAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primary,
    gap: 8,
  },
  backToAppText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
});

export default AdminDashboard;