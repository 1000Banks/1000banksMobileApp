import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import BottomTabs from '@/components/BottomTabs';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import firebaseService from '@/services/firebase';

interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'delivered' | 'shipped' | 'processing';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Financial Freedom Blueprint',
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
  },
  {
    id: '2',
    title: 'Trading Fundamentals',
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
  },
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    date: '2024-01-15',
    total: 89.99,
    status: 'delivered',
    items: [
      { name: 'Affirmation T-Shirt', quantity: 2, price: 29.99 },
      { name: 'Success Mindset Course', quantity: 1, price: 29.99 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    date: '2024-01-10',
    total: 149.99,
    status: 'shipped',
    items: [
      { name: 'Financial Planning Course', quantity: 1, price: 149.99 },
    ],
  },
];

const AccountScreen = () => {
  const [activeTab, setActiveTab] = useState<'learnings' | 'orders' | 'profile'>('learnings');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (user?.email) {
      const adminEmail = await firebaseService.checkAdminEmail(user.email);
      const userProfile = await firebaseService.getUserProfile();
      setIsAdmin(adminEmail || userProfile?.isAdmin || false);
    }
  };

  // If user is not authenticated, show sign-in prompt
  if (!loading && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader showMenuAndCart={true} />
        <View style={styles.signInPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={AppColors.primary} />
          <Text style={styles.signInTitle}>Sign In to Your Account</Text>
          <Text style={styles.signInSubtitle}>
            Access your courses, orders, and profile information
          </Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <BottomTabs />
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        },
      ]
    );
  };

  const renderLearnings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My Courses</Text>
      {mockCourses.map((course) => (
        <View key={course.id} style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseProgress}>{course.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${course.progress}%` }]} 
            />
          </View>
          <Text style={styles.courseStats}>
            {course.completedLessons} of {course.totalLessons} lessons completed
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => Alert.alert('Continue Learning', 'Course content will be available soon')}
          >
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Order History</Text>
      {mockOrders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{order.date}</Text>
          <View style={styles.orderItems}>
            {order.items.map((item, index) => (
              <Text key={index} style={styles.orderItem}>
                {item.quantity}x {item.name} - ${item.price}
              </Text>
            ))}
          </View>
          <Text style={styles.orderTotal}>Total: ${order.total}</Text>
        </View>
      ))}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={50} color={AppColors.primary} />
          )}
        </View>
        <Text style={styles.profileName}>
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.providerInfo}>
          Signed in with {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}
        </Text>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Ionicons name="create" size={16} color={AppColors.primary} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Notifications', 'Notification settings coming soon')}
        >
          <Ionicons name="notifications" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon')}
        >
          <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Help', 'Help center coming soon')}
        >
          <Ionicons name="help-circle" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/admin-dashboard')}
          >
            <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
            <Text style={styles.settingText}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutItem]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out" size={24} color={AppColors.error} />
          <Text style={[styles.settingText, { color: AppColors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showMenuAndCart={true} />

      {/* Internal Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'learnings' && styles.activeTabButton]}
          onPress={() => setActiveTab('learnings')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'learnings' && styles.activeTabButtonText]}>
            My Learnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'orders' && styles.activeTabButton]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'orders' && styles.activeTabButtonText]}>
            My Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabButtonText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'learnings' && renderLearnings()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'profile' && renderProfile()}
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
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: AppColors.background.card,
  },
  activeTabButton: {
    backgroundColor: AppColors.primary,
  },
  tabButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  activeTabButtonText: {
    color: AppColors.background.dark,
  },
  scrollContent: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 20,
  },
  courseCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    flex: 1,
  },
  courseProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: AppColors.background.dark,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  courseStats: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: AppColors.background.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_delivered: {
    backgroundColor: AppColors.success + '20',
  },
  status_shipped: {
    backgroundColor: AppColors.primary + '20',
  },
  status_processing: {
    backgroundColor: AppColors.text.secondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  orderDate: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'right',
  },
  profileCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: AppColors.primary + '20',
    borderRadius: 20,
  },
  editProfileText: {
    color: AppColors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsSection: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.dark,
  },
  settingText: {
    fontSize: 16,
    color: AppColors.text.primary,
    flex: 1,
    marginLeft: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  signInSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  providerInfo: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 20,
  },
});

export default AccountScreen;