import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import BottomTabs from '@/components/BottomTabs';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import firebaseService from '@/services/firebase';

interface EnrolledCourse {
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
}

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
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod?: string;
}

const AccountScreen = () => {
  const [activeTab, setActiveTab] = useState<'learnings' | 'orders' | 'profile'>('learnings');
  const [isAdmin, setIsAdmin] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchUserData();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (user?.email) {
      const adminEmail = await firebaseService.checkAdminEmail(user.email);
      const userProfile = await firebaseService.getUserProfile();
      setIsAdmin(adminEmail || userProfile?.isAdmin || false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch enrolled courses
      setCoursesLoading(true);
      const enrollments = await firebaseService.getUserEnrollments();
      
      // Get course details for each enrollment
      const coursesWithDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          const courseData = await firebaseService.getCourse(enrollment.courseId);
          return {
            courseId: enrollment.courseId,
            title: courseData?.title || 'Unknown Course',
            description: courseData?.description || '',
            thumbnail: courseData?.thumbnail || '',
            progress: enrollment.progress || 0,
            enrolledAt: enrollment.enrolledAt,
            lastAccessedAt: enrollment.lastAccessedAt,
          };
        })
      );
      setEnrolledCourses(coursesWithDetails);
      
      // Fetch purchase history
      setOrdersLoading(true);
      const userPurchases = await firebaseService.getUserPurchases();
      setPurchases(userPurchases as Purchase[]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setCoursesLoading(false);
      setOrdersLoading(false);
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
      {coursesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : enrolledCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={60} color={AppColors.text.secondary} />
          <Text style={styles.emptyTitle}>No Courses Yet</Text>
          <Text style={styles.emptySubtitle}>Start learning by enrolling in a course</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        enrolledCourses.map((course) => (
          <View key={course.courseId} style={styles.courseCard}>
            {course.thumbnail && (
              <Image source={{ uri: course.thumbnail }} style={styles.courseThumbnail} />
            )}
            <View style={styles.courseInfo}>
              <View style={styles.courseHeader}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseProgress}>{Math.round(course.progress)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${course.progress}%` }]} 
                />
              </View>
              <Text style={styles.courseStats}>
                Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => router.push(`/course-detail?id=${course.courseId}`)}
              >
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Order History</Text>
      {ordersLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={60} color={AppColors.text.secondary} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Your purchase history will appear here</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.browseButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        purchases.map((order) => {
          const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
          const totalAmount = order.items.reduce((sum, item) => {
            const price = typeof item.price === 'string' 
              ? parseFloat(item.price.replace('$', ''))
              : parseFloat(item.price);
            return sum + (price * item.quantity);
          }, 0);
          
          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{orderDate.toLocaleDateString()}</Text>
              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.orderItem}>
                    {item.quantity}x {item.name} - {item.price}
                  </Text>
                ))}
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.paymentMethod}>
                  {order.paymentMethod ? `Paid with ${order.paymentMethod}` : 'Payment method unknown'}
                </Text>
                <Text style={styles.orderTotal}>Total: ${totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          {user?.photoURL ? (
            <Image 
              key={user.photoURL} 
              source={{ uri: user.photoURL }} 
              style={styles.avatarImage} 
            />
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
          onPress={() => router.push('/notification-center')}
        >
          <Ionicons name="notifications" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/payment-methods')}
        >
          <Ionicons name="card" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/privacy-security')}
        >
          <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={AppColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/help-support')}
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
  status_completed: {
    backgroundColor: AppColors.success + '20',
  },
  status_processing: {
    backgroundColor: AppColors.primary + '20',
  },
  status_pending: {
    backgroundColor: AppColors.text.secondary + '20',
  },
  status_failed: {
    backgroundColor: AppColors.error + '20',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseButtonText: {
    color: AppColors.background.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  courseThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.background.dark,
  },
  paymentMethod: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textTransform: 'capitalize',
  },
});

export default AccountScreen;