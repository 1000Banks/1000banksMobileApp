import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import firebaseService, { Course } from '@/services/firebase';
import { fallbackCoursesData } from './courses';

const CourseDetailScreen = () => {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      // First try to get from Firebase
      const firebaseCourse = await firebaseService.getCourse(courseId as string);
      if (firebaseCourse) {
        setCourse(firebaseCourse);
      } else {
        // Fallback to static data
        const fallbackCourse = fallbackCoursesData.find(c => c.id === courseId);
        if (fallbackCourse) {
          // Convert fallback course to Firebase format
          setCourse({
            ...fallbackCourse,
            studentsCount: fallbackCourse.students || 0,
            category: 'Finance',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            curriculum: fallbackCourse.modules || [],
          });
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      // Try fallback data
      const fallbackCourse = fallbackCoursesData.find(c => c.id === courseId);
      if (fallbackCourse) {
        setCourse({
          ...fallbackCourse,
          studentsCount: fallbackCourse.students || 0,
          category: 'Finance',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          curriculum: fallbackCourse.modules || [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Course not found</Text>
        <TouchableOpacity style={styles.backToCoursesButton} onPress={() => router.back()}>
          <Text style={styles.backToCoursesText}>Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEnroll = () => {
    addToCart({
      id: course.id,
      name: course.title,
      price: course.price,
      type: 'course',
      image: course.image,
      description: course.description
    });
    router.push('/checkout');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={20} color={AppColors.primary} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={20} color={AppColors.primary} />
      );
    }
    
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Course Header */}
        <View style={styles.courseHeader}>
          <View style={styles.courseImageContainer}>
            <Text style={styles.courseImage}>{course.image}</Text>
          </View>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseInstructor}>by {course.instructor}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                {renderStars(course.rating)}
                <Text style={styles.ratingText}>{course.rating}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color={AppColors.text.secondary} />
              <Text style={styles.statText}>{course.studentsCount || course.students || 0} students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={AppColors.text.secondary} />
              <Text style={styles.statText}>{course.duration}</Text>
            </View>
          </View>
        </View>

        {/* Course Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="bar-chart" size={24} color={AppColors.primary} />
            <Text style={styles.infoCardText}>{course.level}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="cash" size={24} color={AppColors.primary} />
            <Text style={styles.infoCardText}>{course.price}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="infinite" size={24} color={AppColors.primary} />
            <Text style={styles.infoCardText}>Lifetime Access</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* Course Modules */}
        {(course.curriculum || course.modules) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Curriculum</Text>
            {(course.curriculum || course.modules || []).map((module, index) => (
              <View key={index} style={styles.moduleItem}>
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.moduleText}>{module}</Text>
                <Ionicons name="lock-closed" size={16} color={AppColors.text.secondary} />
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {course.benefits && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            {course.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instructor Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Instructor</Text>
          <View style={styles.instructorCard}>
            <View style={styles.instructorAvatar}>
              <Ionicons name="person" size={40} color={AppColors.primary} />
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{course.instructor}</Text>
              <Text style={styles.instructorTitle}>Expert Instructor</Text>
              <Text style={styles.instructorBio}>
                Dedicated to helping you achieve financial freedom through comprehensive education and practical strategies.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Course Price</Text>
            <Text style={styles.price}>{course.price}</Text>
          </View>
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={handleEnroll}
          >
            <Text style={styles.enrollButtonText}>Enroll Now</Text>
          </TouchableOpacity>
          <Text style={styles.guarantee}>
            30-day money-back guarantee
          </Text>
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
  courseHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  courseImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  courseImage: {
    fontSize: 48,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: AppColors.text.secondary + '30',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  statText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginLeft: 6,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  infoCardText: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: AppColors.text.secondary,
    lineHeight: 24,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  moduleText: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text.secondary,
    marginLeft: 12,
  },
  instructorCard: {
    backgroundColor: AppColors.background.card,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    color: AppColors.primary,
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  enrollButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 80,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 12,
  },
  enrollButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  guarantee: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginTop: 16,
  },
  backToCoursesButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backToCoursesText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default CourseDetailScreen;