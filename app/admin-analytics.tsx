import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebase';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
  };
  users: {
    total: number;
    newThisMonth: number;
    activeUsers: number;
    retention: number;
  };
  courses: {
    totalEnrollments: number;
    popularCourses: Array<{
      id: string;
      title: string;
      enrollments: number;
      revenue: number;
    }>;
    completionRate: number;
  };
  products: {
    totalSales: number;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    averageOrderValue: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'enrollment' | 'purchase' | 'signup';
    description: string;
    timestamp: Date;
    value?: number;
  }>;
}

const AdminAnalyticsScreen = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchAnalyticsData();
  }, [selectedPeriod]);

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

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [users, purchases, enrollments, courses, products] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getAllPurchases(),
        firebaseService.getAllEnrollments(),
        firebaseService.getAllCourses(),
        firebaseService.getAllProducts(),
      ]);

      // Calculate date ranges
      const now = new Date();
      const periods = {
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      };

      const periodStart = periods[selectedPeriod];
      
      // Filter data by selected period
      const periodPurchases = purchases.filter(p => new Date(p.createdAt) >= periodStart);
      const periodEnrollments = enrollments.filter(e => new Date(e.enrolledAt) >= periodStart);
      const periodUsers = users.filter(u => new Date(u.createdAt) >= periodStart);

      // Calculate revenue metrics
      const totalRevenue = periodPurchases.reduce((sum, p) => sum + p.total, 0);
      const monthlyRevenue = purchases.filter(p => {
        const purchaseDate = new Date(p.createdAt);
        return purchaseDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }).reduce((sum, p) => sum + p.total, 0);

      const weeklyRevenue = purchases.filter(p => {
        const purchaseDate = new Date(p.createdAt);
        return purchaseDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }).reduce((sum, p) => sum + p.total, 0);

      const dailyRevenue = purchases.filter(p => {
        const purchaseDate = new Date(p.createdAt);
        return purchaseDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }).reduce((sum, p) => sum + p.total, 0);

      // Calculate course analytics
      const courseEnrollmentCounts = enrollments.reduce((acc, enrollment) => {
        acc[enrollment.courseId] = (acc[enrollment.courseId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularCourses = courses
        .map(course => ({
          id: course.id,
          title: course.title,
          enrollments: courseEnrollmentCounts[course.id] || 0,
          revenue: periodPurchases
            .filter(p => p.items.some(item => item.id === course.id && item.type === 'course'))
            .reduce((sum, p) => sum + p.total, 0),
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);

      // Calculate product analytics
      const productSalesCounts = periodPurchases.reduce((acc, purchase) => {
        purchase.items.forEach(item => {
          if (item.type === 'product') {
            acc[item.id] = (acc[item.id] || 0) + item.quantity;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      const topProducts = products
        .map(product => ({
          id: product.id,
          name: product.name,
          sales: productSalesCounts[product.id] || 0,
          revenue: periodPurchases
            .filter(p => p.items.some(item => item.id === product.id && item.type === 'product'))
            .reduce((sum, p) => sum + p.total, 0),
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Calculate completion rate
      const completedEnrollments = enrollments.filter(e => e.completed).length;
      const completionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length) * 100 : 0;

      // Generate recent activity
      const recentActivity = [
        ...periodPurchases.map(p => ({
          id: p.id,
          type: 'purchase' as const,
          description: `Purchase of ${p.items.length} item${p.items.length !== 1 ? 's' : ''}`,
          timestamp: new Date(p.createdAt),
          value: p.total,
        })),
        ...periodEnrollments.map(e => ({
          id: e.uid + e.courseId,
          type: 'enrollment' as const,
          description: `Course enrollment`,
          timestamp: new Date(e.enrolledAt),
        })),
        ...periodUsers.map(u => ({
          id: u.uid,
          type: 'signup' as const,
          description: `New user signup: ${u.email}`,
          timestamp: new Date(u.createdAt),
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

      const analyticsData: AnalyticsData = {
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          weekly: weeklyRevenue,
          daily: dailyRevenue,
        },
        users: {
          total: users.length,
          newThisMonth: periodUsers.length,
          activeUsers: users.filter(u => !u.isBlocked).length,
          retention: 85, // This would need more complex calculation in real implementation
        },
        courses: {
          totalEnrollments: enrollments.length,
          popularCourses,
          completionRate,
        },
        products: {
          totalSales: Object.values(productSalesCounts).reduce((sum, count) => sum + count, 0),
          topProducts,
          averageOrderValue: periodPurchases.length > 0 ? totalRevenue / periodPurchases.length : 0,
        },
        recentActivity,
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const exportData = async () => {
    try {
      // In a real implementation, you would generate and download a CSV/PDF report
      const csvData = `Analytics Report - ${selectedPeriod}\n\nRevenue Metrics:\nTotal Revenue: $${data?.revenue.total.toFixed(2)}\nMonthly Revenue: $${data?.revenue.monthly.toFixed(2)}\nWeekly Revenue: $${data?.revenue.weekly.toFixed(2)}\nDaily Revenue: $${data?.revenue.daily.toFixed(2)}\n\nUser Metrics:\nTotal Users: ${data?.users.total}\nNew This Month: ${data?.users.newThisMonth}\nActive Users: ${data?.users.activeUsers}\n\nCourse Metrics:\nTotal Enrollments: ${data?.courses.totalEnrollments}\nCompletion Rate: ${data?.courses.completionRate.toFixed(1)}%\n\nProduct Metrics:\nTotal Sales: ${data?.products.totalSales}\nAverage Order Value: $${data?.products.averageOrderValue.toFixed(2)}`;
      
      await firebaseService.createAuditLog({
        action: 'EXPORT_ANALYTICS',
        details: { period: selectedPeriod },
      });
      
      console.log('Analytics data exported:', csvData);
      // Here you would typically save to device or share
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={exportData}
          >
            <Ionicons name="download" size={20} color={AppColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={refreshing ? AppColors.text.secondary : AppColors.text.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['7d', '30d', '90d', '1y'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${data?.revenue.total.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${data?.revenue.monthly.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>This Month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${data?.revenue.weekly.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>This Week</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${data?.revenue.daily.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* User Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Analytics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.users.total}</Text>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.users.newThisMonth}</Text>
              <Text style={styles.metricLabel}>New This Month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.users.activeUsers}</Text>
              <Text style={styles.metricLabel}>Active Users</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.users.retention.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Retention Rate</Text>
            </View>
          </View>
        </View>

        {/* Popular Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Courses</Text>
          {data?.courses.popularCourses.map((course, index) => (
            <View key={course.id} style={styles.listItem}>
              <View style={styles.listItemRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{course.title}</Text>
                <Text style={styles.listItemSubtitle}>
                  {course.enrollments} enrollments • ${course.revenue.toFixed(2)} revenue
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {data?.products.topProducts.map((product, index) => (
            <View key={product.id} style={styles.listItem}>
              <View style={styles.listItemRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{product.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {product.sales} sales • ${product.revenue.toFixed(2)} revenue
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Course & Product Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.courses.totalEnrollments}</Text>
              <Text style={styles.metricLabel}>Total Enrollments</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.courses.completionRate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.products.totalSales}</Text>
              <Text style={styles.metricLabel}>Product Sales</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${data?.products.averageOrderValue.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Avg Order Value</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data?.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, styles[`${activity.type}Icon`]]}>
                <Ionicons 
                  name={
                    activity.type === 'purchase' ? 'card' :
                    activity.type === 'enrollment' ? 'school' : 'person-add'
                  } 
                  size={16} 
                  color={AppColors.background.dark} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>
                  {activity.timestamp.toLocaleString()}
                  {activity.value && ` • $${activity.value.toFixed(2)}`}
                </Text>
              </View>
            </View>
          ))}
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: AppColors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  periodButtonTextActive: {
    color: AppColors.background.dark,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  listItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  purchaseIcon: {
    backgroundColor: AppColors.primary,
  },
  enrollmentIcon: {
    backgroundColor: '#10B981',
  },
  signupIcon: {
    backgroundColor: '#8B5CF6',
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
});

export default AdminAnalyticsScreen;