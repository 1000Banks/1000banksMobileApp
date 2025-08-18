import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import firebaseService, { Course, ModuleContent } from '@/services/firebase';
import { fallbackCoursesData } from './courses';

const CourseDetailScreen = () => {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, enrollments } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ModuleContent | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    // Check if user is enrolled in this course
    if (enrollments && courseId) {
      setIsEnrolled(enrollments.some(e => e.courseId === courseId));
    }
  }, [enrollments, courseId]);

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
            curriculum: fallbackCourse.curriculum || [],
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
          curriculum: fallbackCourse.curriculum || [],
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

  const handleContentClick = (content: ModuleContent) => {
    // Check if content is locked and user is not enrolled
    if (content.isLocked && !isEnrolled) {
      Alert.alert(
        'Content Locked',
        'This content is locked. Please enroll in the course to access all content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enroll Now', onPress: handleEnroll }
        ]
      );
      return;
    }

    // If content is unlocked or user is enrolled, show content
    setSelectedContent(content);
    setContentModalVisible(true);
  };

  const handleOpenExternalContent = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open content');
    }
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
        {course.modules && course.modules.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Modules</Text>
            {course.modules.map((module, moduleIndex) => (
              <View key={module.id} style={styles.moduleContainer}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleTitle}>{module.order}. {module.title}</Text>
                </View>
                {module.description && (
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                )}
                
                {/* Module Contents */}
                <View style={styles.moduleContents}>
                  {module.contents.map((content, contentIndex) => (
                    <TouchableOpacity 
                      key={content.id} 
                      style={styles.contentItem}
                      onPress={() => handleContentClick(content)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.contentIcon}>
                        <Ionicons 
                          name={
                            content.type === 'video' ? 'play-circle' :
                            content.type === 'image' ? 'image' :
                            content.type === 'audio' ? 'musical-notes' :
                            content.type === 'pdf' ? 'document' : 'text'
                          } 
                          size={16} 
                          color={content.isLocked && !isEnrolled ? AppColors.text.secondary : AppColors.primary} 
                        />
                      </View>
                      <Text style={[styles.contentTitle, { 
                        color: content.isLocked && !isEnrolled ? AppColors.text.secondary : AppColors.text.primary 
                      }]}>
                        {content.title}
                      </Text>
                      <View style={styles.contentLockStatus}>
                        <Ionicons 
                          name={content.isLocked && !isEnrolled ? "lock-closed" : "lock-open"} 
                          size={14} 
                          color={content.isLocked && !isEnrolled ? "#EF4444" : "#10B981"} 
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (course.curriculum || course.modules) && (
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

      {/* Content Viewing Modal */}
      <Modal
        visible={contentModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setContentModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setContentModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedContent?.title}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
          >
            {selectedContent && (
              <>
                {/* Content Type Icon */}
                <View style={styles.contentTypeIndicator}>
                  <Ionicons 
                    name={
                      selectedContent.type === 'video' ? 'play-circle' :
                      selectedContent.type === 'image' ? 'image' :
                      selectedContent.type === 'audio' ? 'musical-notes' :
                      selectedContent.type === 'pdf' ? 'document' : 'text'
                    } 
                    size={48} 
                    color={AppColors.primary} 
                  />
                  <Text style={styles.contentTypeText}>
                    {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)} Content
                  </Text>
                </View>

                {/* Content Description */}
                {selectedContent.description && (
                  <Text style={styles.contentDescription}>
                    {selectedContent.description}
                  </Text>
                )}

                {/* Content Display */}
                {selectedContent.type === 'text' ? (
                  <View style={styles.textContentContainer}>
                    <Text style={styles.textContent}>
                      {selectedContent.content}
                    </Text>
                  </View>
                ) : selectedContent.type === 'image' && selectedContent.url ? (
                  <View style={styles.imageContentContainer}>
                    <Image 
                      source={{ uri: selectedContent.url }} 
                      style={styles.contentImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.mediaContentContainer}>
                    <Text style={styles.mediaContentText}>
                      This is a {selectedContent.type} content.
                    </Text>
                    {selectedContent.url && (
                      <TouchableOpacity 
                        style={styles.openExternalButton}
                        onPress={() => handleOpenExternalContent(selectedContent.url!)}
                      >
                        <Ionicons name="open-outline" size={20} color={AppColors.background.dark} />
                        <Text style={styles.openExternalButtonText}>
                          Open {selectedContent.type}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Access Status */}
                <View style={styles.accessStatusContainer}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="#10B981" 
                  />
                  <Text style={styles.accessStatusText}>
                    You have access to this content
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
  // New module styles
  moduleContainer: {
    backgroundColor: AppColors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  moduleHeader: {
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  moduleDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  moduleContents: {
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
    padding: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  contentIcon: {
    marginRight: 12,
  },
  contentTitle: {
    flex: 1,
    fontSize: 14,
  },
  contentLockStatus: {
    marginLeft: 8,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    flex: 1,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  contentTypeIndicator: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contentTypeText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginTop: 8,
  },
  contentDescription: {
    fontSize: 16,
    color: AppColors.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  textContentContainer: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  textContent: {
    fontSize: 16,
    color: AppColors.text.primary,
    lineHeight: 24,
  },
  imageContentContainer: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  contentImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  mediaContentContainer: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  mediaContentText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  openExternalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  openExternalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  accessStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  accessStatusText: {
    fontSize: 14,
    color: '#10B981',
  },
});

export default CourseDetailScreen;