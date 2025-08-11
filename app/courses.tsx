import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import BottomTabs from '@/components/BottomTabs';
import AppHeader from '@/components/AppHeader';

const { width } = Dimensions.get('window');

export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
  description: string;
  image: string;
  modules: string[];
  benefits: string[];
}

export const coursesData: Course[] = [
  {
    id: 'c1',
    title: 'Financial Freedom Fundamentals',
    instructor: 'Devonne Stokes',
    price: '$297',
    duration: '8 weeks',
    level: 'Beginner',
    rating: 4.9,
    students: 1250,
    description: 'Master the basics of financial planning, budgeting, and wealth building. This comprehensive course covers everything you need to start your journey to financial independence.',
    image: '📚',
    modules: [
      'Introduction to Financial Freedom',
      'Understanding Money Mindset',
      'Budgeting Strategies',
      'Debt Management',
      'Investment Basics',
      'Creating Multiple Income Streams',
      'Tax Planning Essentials',
      'Building Your Financial Future'
    ],
    benefits: [
      'Lifetime access to course materials',
      'Weekly live Q&A sessions',
      'Private community access',
      'Downloadable worksheets and templates',
      'Certificate of completion'
    ]
  },
  {
    id: 'c2',
    title: 'Trading Mastery Program',
    instructor: '1000Banks Trading Team',
    price: '$997',
    duration: '12 weeks',
    level: 'Intermediate',
    rating: 4.8,
    students: 856,
    description: 'Learn professional trading strategies for stocks, forex, and cryptocurrency. Get real-time trade alerts and copy our proven strategies.',
    image: '📈',
    modules: [
      'Trading Psychology',
      'Technical Analysis Deep Dive',
      'Fundamental Analysis',
      'Risk Management Strategies',
      'Forex Trading Mastery',
      'Cryptocurrency Trading',
      'Options Trading Basics',
      'Building Your Trading Plan'
    ],
    benefits: [
      'Daily trade signals',
      'Copy-and-paste trade system',
      'Live trading sessions',
      'Risk management tools',
      '1-on-1 mentorship calls'
    ]
  },
  {
    id: 'c3',
    title: 'Become Your Own Bank',
    instructor: 'Devonne Stokes',
    price: '$1997',
    duration: '16 weeks',
    level: 'Advanced',
    rating: 5.0,
    students: 423,
    description: 'The ultimate program to achieve complete financial independence. Learn how to create your own banking system and build generational wealth.',
    image: '🏦',
    modules: [
      'Infinite Banking Concept',
      'Creating Your Banking System',
      'Advanced Investment Strategies',
      'Real Estate Investment',
      'Business Development',
      'Asset Protection',
      'Legacy Planning',
      'Wealth Preservation'
    ],
    benefits: [
      'Personal financial advisor access',
      'Done-for-you templates',
      'Exclusive mastermind group',
      'Quarterly strategy sessions',
      'Implementation support'
    ]
  },
  {
    id: 'c4',
    title: 'Entrepreneurship Accelerator',
    instructor: 'Business Development Team',
    price: '$497',
    duration: '6 weeks',
    level: 'All Levels',
    rating: 4.7,
    students: 2100,
    description: 'Turn your business idea into reality. Learn proven strategies to start, grow, and scale your business while maintaining financial stability.',
    image: '🚀',
    modules: [
      'Business Ideation',
      'Market Research & Validation',
      'Business Planning',
      'Funding Your Business',
      'Marketing & Sales',
      'Operations Management',
      'Scaling Strategies',
      'Exit Planning'
    ],
    benefits: [
      'Business plan templates',
      'Funding resources',
      'Marketing toolkit',
      'Mentor network access',
      'Pitch deck reviews'
    ]
  },
  {
    id: 'c5',
    title: 'Insurance & Protection Mastery',
    instructor: 'GFI Team',
    price: '$397',
    duration: '4 weeks',
    level: 'Beginner',
    rating: 4.6,
    students: 678,
    description: 'Understand and implement comprehensive financial protection strategies. Learn how to safeguard your wealth and family\'s future.',
    image: '🛡️',
    modules: [
      'Insurance Fundamentals',
      'Life Insurance Strategies',
      'Health & Disability Coverage',
      'Property Protection',
      'Liability Management',
      'Estate Planning Basics',
      'Trust Structures',
      'Legacy Protection'
    ],
    benefits: [
      'Personal coverage analysis',
      'Insurance comparison tools',
      'Expert consultations',
      'Planning worksheets',
      'Family protection guide'
    ]
  },
  {
    id: 'c6',
    title: 'Real Estate Wealth Building',
    instructor: 'Real Estate Investment Team',
    price: '$797',
    duration: '10 weeks',
    level: 'Intermediate',
    rating: 4.9,
    students: 945,
    description: 'Build wealth through strategic real estate investments. Learn how to find, fund, and flip properties or build a rental portfolio.',
    image: '🏠',
    modules: [
      'Real Estate Market Analysis',
      'Finding Investment Properties',
      'Financing Strategies',
      'Property Management',
      'Fix & Flip Techniques',
      'Rental Property Success',
      'Commercial Real Estate',
      'REITs and Syndications'
    ],
    benefits: [
      'Property analysis tools',
      'Financing connections',
      'Contractor network',
      'Deal flow access',
      'Investment calculators'
    ]
  }
];

interface CoursesScreenProps {
  embedded?: boolean;
}

const CoursesScreen: React.FC<CoursesScreenProps> = ({ embedded = false }) => {
  const router = useRouter();
  const { addToCart } = useCart();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color={AppColors.primary} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color={AppColors.primary} />
      );
    }
    
    return stars;
  };

  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/course-detail',
      params: { courseId: course.id }
    });
  };

  const CourseContent = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Courses</Text>
        <Text style={styles.headerSubtitle}>
          Invest in your education and transform your financial future
        </Text>
      </View>

      <View style={styles.coursesGrid}>
        {coursesData.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => handleCoursePress(course)}
            activeOpacity={0.8}
          >
            <View style={styles.courseImageContainer}>
              <Text style={styles.courseImage}>{course.image}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{course.level}</Text>
              </View>
            </View>
            
            <View style={styles.courseContent}>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {course.title}
              </Text>
              <Text style={styles.courseInstructor}>{course.instructor}</Text>
              
              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <View style={styles.ratingContainer}>
                    {renderStars(course.rating)}
                    <Text style={styles.ratingText}>{course.rating}</Text>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color={AppColors.text.secondary} />
                  <Text style={styles.statText}>{course.students}</Text>
                </View>
              </View>
              
              <View style={styles.courseFooter}>
                <View>
                  <Text style={styles.coursePrice}>{course.price}</Text>
                  <Text style={styles.courseDuration}>{course.duration}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.enrollButton}
                  onPress={() => handleCoursePress(course)}
                >
                  <Text style={styles.enrollButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Not sure which course to choose?</Text>
        <Text style={styles.ctaText}>
          Schedule a free consultation with our education advisors
        </Text>
        <TouchableOpacity style={styles.consultationButton}>
          <Text style={styles.consultationButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (embedded) {
    return <CourseContent />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader title="Courses" showBackButton={false} />
      <CourseContent />
      <BottomTabs />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  coursesGrid: {
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.primary + '20',
  },
  courseImageContainer: {
    height: 120,
    backgroundColor: AppColors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  courseImage: {
    fontSize: 48,
  },
  levelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  courseContent: {
    padding: 20,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  statText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginLeft: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  courseDuration: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  enrollButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  enrollButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 100,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  consultationButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  consultationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
});

export default CoursesScreen;