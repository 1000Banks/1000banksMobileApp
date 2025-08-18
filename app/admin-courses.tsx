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
import firebaseService, { Course, CourseModule, ModuleContent } from '@/services/firebase';

const AdminCourses = () => {
  const params = useLocalSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    image: '📚',
    imageUrl: '',
    curriculum: [''],
    modules: [] as CourseModule[],
    duration: '',
    level: 'Beginner' as Course['level'],
    category: '',
    instructor: '',
    rating: 0,
    studentsCount: 0,
    isActive: true,
  });
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState(-1);
  const [editingContent, setEditingContent] = useState<ModuleContent | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
  });
  const [contentForm, setContentForm] = useState({
    type: 'text' as ModuleContent['type'],
    title: '',
    description: '',
    content: '',
    url: '',
    isLocked: true,
    order: 1,
  });
  const [uploadingContent, setUploadingContent] = useState(false);

  useEffect(() => {
    loadCourses();
    if (params.action === 'new') {
      setModalVisible(true);
    }
  }, []);

  const loadCourses = async () => {
    try {
      const allCourses = await firebaseService.getAllCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      price: '',
      image: '📚',
      imageUrl: '',
      curriculum: [''],
      modules: [],
      duration: '',
      level: 'Beginner',
      category: '',
      instructor: '',
      rating: 0,
      studentsCount: 0,
      isActive: true,
    });
    setEditingCourse(null);
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      description: '',
      order: 1,
    });
    setEditingModule(null);
    setEditingModuleIndex(-1);
  };

  const resetContentForm = () => {
    setContentForm({
      type: 'text',
      title: '',
      description: '',
      content: '',
      url: '',
      isLocked: true,
      order: 1,
    });
    setEditingContent(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      image: course.image || '📚',
      imageUrl: '',
      curriculum: course.curriculum || [''],
      modules: course.modules || [],
      duration: course.duration,
      level: course.level,
      category: course.category,
      instructor: course.instructor,
      rating: course.rating,
      studentsCount: course.studentsCount,
      isActive: course.isActive,
    });
    setModalVisible(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.price || !courseForm.category || !courseForm.instructor) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        price: courseForm.price,
        image: courseForm.image,
        curriculum: courseForm.curriculum.filter(c => c.trim() !== ''),
        modules: courseForm.modules,
        duration: courseForm.duration,
        level: courseForm.level,
        category: courseForm.category,
        instructor: courseForm.instructor,
        rating: courseForm.rating,
        studentsCount: courseForm.studentsCount,
        isActive: courseForm.isActive,
      };

      if (editingCourse) {
        await firebaseService.updateCourse(editingCourse.id, courseData);
        Alert.alert('Success', 'Course updated successfully');
      } else {
        await firebaseService.createCourse(courseData);
        Alert.alert('Success', 'Course created successfully');
      }

      setModalVisible(false);
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      Alert.alert('Error', 'Failed to save course');
    }
  };

  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${course.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deleteCourse(course.id);
              Alert.alert('Success', 'Course deleted successfully');
              loadCourses();
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
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
          aspect: [16, 9],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });

    if (!result.canceled) {
      setCourseForm({ ...courseForm, imageUrl: result.assets[0].uri });
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

  const addCurriculumItem = () => {
    setCourseForm({
      ...courseForm,
      curriculum: [...courseForm.curriculum, ''],
    });
  };

  const updateCurriculumItem = (index: number, value: string) => {
    const newCurriculum = [...courseForm.curriculum];
    newCurriculum[index] = value;
    setCourseForm({ ...courseForm, curriculum: newCurriculum });
  };

  const removeCurriculumItem = (index: number) => {
    const newCurriculum = courseForm.curriculum.filter((_, i) => i !== index);
    setCourseForm({ ...courseForm, curriculum: newCurriculum });
  };

  // Module management functions
  const handleAddModule = () => {
    setModuleModalVisible(true);
    resetModuleForm();
  };

  const handleEditModule = (module: CourseModule, index: number) => {
    setEditingModule(module);
    setEditingModuleIndex(index);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      order: module.order,
    });
    setModuleModalVisible(true);
  };

  const handleSaveModule = () => {
    if (!moduleForm.title.trim()) {
      Alert.alert('Error', 'Module title is required');
      return;
    }

    const moduleId = editingModule ? editingModule.id : `module_${Date.now()}`;
    const newModule: CourseModule = {
      id: moduleId,
      title: moduleForm.title,
      description: moduleForm.description,
      order: moduleForm.order,
      contents: editingModule ? editingModule.contents : [],
    };

    const modules = [...courseForm.modules];
    
    if (editingModuleIndex >= 0) {
      modules[editingModuleIndex] = newModule;
    } else {
      modules.push(newModule);
    }
    
    modules.sort((a, b) => a.order - b.order);
    setCourseForm({ ...courseForm, modules });
    setModuleModalVisible(false);
    resetModuleForm();
  };

  const handleDeleteModule = (index: number) => {
    Alert.alert(
      'Delete Module',
      'Are you sure you want to delete this module and all its content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const modules = [...courseForm.modules];
            modules.splice(index, 1);
            setCourseForm({ ...courseForm, modules });
          },
        },
      ]
    );
  };

  // Content management functions
  const handleAddContent = (moduleIndex: number) => {
    setEditingModuleIndex(moduleIndex);
    setContentModalVisible(true);
    resetContentForm();
  };

  const handleEditContent = (moduleIndex: number, content: ModuleContent, contentIndex: number) => {
    setEditingModuleIndex(moduleIndex);
    setEditingContent(content);
    setContentForm({
      type: content.type,
      title: content.title,
      description: content.description || '',
      content: content.content || '',
      url: content.url || '',
      isLocked: content.isLocked,
      order: content.order,
    });
    setContentModalVisible(true);
  };

  const handleSaveContent = () => {
    if (!contentForm.title.trim()) {
      Alert.alert('Error', 'Content title is required');
      return;
    }

    if (contentForm.type === 'text' && !contentForm.content.trim()) {
      Alert.alert('Error', 'Text content is required');
      return;
    }

    if (contentForm.type !== 'text' && !contentForm.url.trim()) {
      Alert.alert('Error', 'Media file is required');
      return;
    }

    const contentId = editingContent ? editingContent.id : `content_${Date.now()}`;
    const newContent: ModuleContent = {
      id: contentId,
      type: contentForm.type,
      title: contentForm.title,
      description: contentForm.description,
      content: contentForm.type === 'text' ? contentForm.content : undefined,
      url: contentForm.type !== 'text' ? contentForm.url : undefined,
      isLocked: contentForm.isLocked,
      order: contentForm.order,
    };

    const modules = [...courseForm.modules];
    const module = { ...modules[editingModuleIndex] };
    
    if (editingContent) {
      const contentIndex = module.contents.findIndex(c => c.id === editingContent.id);
      if (contentIndex >= 0) {
        module.contents[contentIndex] = newContent;
      }
    } else {
      module.contents.push(newContent);
    }
    
    module.contents.sort((a, b) => a.order - b.order);
    modules[editingModuleIndex] = module;
    
    setCourseForm({ ...courseForm, modules });
    setContentModalVisible(false);
    resetContentForm();
  };

  const handleDeleteContent = (moduleIndex: number, contentIndex: number) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const modules = [...courseForm.modules];
            const module = { ...modules[moduleIndex] };
            module.contents.splice(contentIndex, 1);
            modules[moduleIndex] = module;
            setCourseForm({ ...courseForm, modules });
          },
        },
      ]
    );
  };

  const pickMediaFile = async () => {
    try {
      if (contentForm.type === 'image') {
        showImagePickerForContent();
      } else {
        // For now, we'll use a placeholder approach
        // In production, you would use expo-document-picker or another file picker
        Alert.alert(
          'File Upload',
          'File upload functionality requires additional setup. For now, you can enter a direct URL to your media file.',
          [
            {
              text: 'Enter URL',
              onPress: () => {
                Alert.prompt(
                  'Enter Media URL',
                  'Please enter the URL of your media file:',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: (url) => {
                        if (url) {
                          setContentForm({ ...contentForm, url });
                        }
                      },
                    },
                  ],
                  'plain-text',
                  contentForm.url
                );
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const showImagePickerForContent = () => {
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        { text: 'Camera', onPress: () => pickImageForContent('camera') },
        { text: 'Gallery', onPress: () => pickImageForContent('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const pickImageForContent = async (source: 'camera' | 'gallery') => {
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
          aspect: [16, 9],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });

    if (!result.canceled) {
      setUploadingContent(true);
      try {
        const downloadURL = await firebaseService.uploadMediaFile(
          result.assets[0].uri,
          'image'
        );
        setContentForm({ ...contentForm, url: downloadURL });
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setUploadingContent(false);
      }
    }
  };

  const categoryOptions = ['Trading', 'Investing', 'Business', 'Finance', 'Entrepreneurship', 'Real Estate'];
  const levelOptions: Course['level'][] = ['Beginner', 'Intermediate', 'Advanced'];
  const emojiOptions = ['📚', '📈', '💰', '🎯', '📊', '💡', '🏆', '📱', '💳', '🔥'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Courses</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.courseList}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseEmoji}>{item.image}</Text>
              <View style={styles.courseDetails}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseCategory}>{item.category} • {item.level}</Text>
                <Text style={styles.courseInstructor}>by {item.instructor}</Text>
                <View style={styles.courseStats}>
                  <Text style={styles.coursePrice}>{item.price}</Text>
                  <Text style={styles.courseDuration}>{item.duration}</Text>
                </View>
                <Text style={[styles.courseStatus, { color: item.isActive ? '#10B981' : '#EF4444' }]}>
                  {item.isActive ? 'Active' : 'Inactive'} • {item.studentsCount} students
                </Text>
              </View>
            </View>
            <View style={styles.courseActions}>
              <TouchableOpacity
                onPress={() => handleEditCourse(item)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={20} color={AppColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteCourse(item)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No courses found</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add First Course</Text>
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
                {editingCourse ? 'Edit Course' : 'Add New Course'}
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
                <Text style={styles.inputLabel}>Course Image</Text>
                <View style={styles.imageContainer}>
                  {courseForm.imageUrl ? (
                    <Image source={{ uri: courseForm.imageUrl }} style={styles.courseImage} />
                  ) : (
                    <Text style={styles.courseImageEmoji}>{courseForm.image}</Text>
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
                        courseForm.image === emoji && styles.emojiButtonActive,
                      ]}
                      onPress={() => setCourseForm({ ...courseForm, image: emoji })}
                    >
                      <Text style={styles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Basic Information */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  value={courseForm.title}
                  onChangeText={(text) => setCourseForm({ ...courseForm, title: text })}
                  placeholder="Enter course title"
                  placeholderTextColor={AppColors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={courseForm.description}
                  onChangeText={(text) => setCourseForm({ ...courseForm, description: text })}
                  placeholder="Course description"
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
                    value={courseForm.price}
                    onChangeText={(text) => setCourseForm({ ...courseForm, price: text })}
                    placeholder="$0.00"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    value={courseForm.duration}
                    onChangeText={(text) => setCourseForm({ ...courseForm, duration: text })}
                    placeholder="e.g., 8 weeks"
                    placeholderTextColor={AppColors.text.secondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Instructor *</Text>
                <TextInput
                  style={styles.input}
                  value={courseForm.instructor}
                  onChangeText={(text) => setCourseForm({ ...courseForm, instructor: text })}
                  placeholder="Instructor name"
                  placeholderTextColor={AppColors.text.secondary}
                />
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
                          courseForm.category === category && styles.categoryButtonActive,
                        ]}
                        onPress={() => setCourseForm({ ...courseForm, category })}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            courseForm.category === category && styles.categoryTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Level</Text>
                <View style={styles.levelContainer}>
                  {levelOptions.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelButton,
                        courseForm.level === level && styles.levelButtonActive,
                      ]}
                      onPress={() => setCourseForm({ ...courseForm, level })}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          courseForm.level === level && styles.levelTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Curriculum */}
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Curriculum</Text>
                  <TouchableOpacity onPress={addCurriculumItem}>
                    <Ionicons name="add-circle" size={24} color={AppColors.primary} />
                  </TouchableOpacity>
                </View>
                {courseForm.curriculum.map((item, index) => (
                  <View key={index} style={styles.curriculumRow}>
                    <Text style={styles.curriculumNumber}>{index + 1}.</Text>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={item}
                      onChangeText={(text) => updateCurriculumItem(index, text)}
                      placeholder="Module/Lesson title"
                      placeholderTextColor={AppColors.text.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => removeCurriculumItem(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Course Modules */}
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.inputLabel}>Course Modules</Text>
                  <TouchableOpacity onPress={handleAddModule}>
                    <Ionicons name="add-circle" size={24} color={AppColors.primary} />
                  </TouchableOpacity>
                </View>
                {courseForm.modules.map((module, moduleIndex) => (
                  <View key={module.id} style={styles.moduleCard}>
                    <View style={styles.moduleHeader}>
                      <Text style={styles.moduleTitle}>{module.order}. {module.title}</Text>
                      <View style={styles.moduleActions}>
                        <TouchableOpacity onPress={() => handleEditModule(module, moduleIndex)}>
                          <Ionicons name="pencil" size={20} color={AppColors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteModule(moduleIndex)}>
                          <Ionicons name="trash" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {module.description && (
                      <Text style={styles.moduleDescription}>{module.description}</Text>
                    )}
                    
                    {/* Module Contents */}
                    <View style={styles.contentSection}>
                      <View style={styles.contentSectionHeader}>
                        <Text style={styles.contentSectionTitle}>Content ({module.contents.length})</Text>
                        <TouchableOpacity onPress={() => handleAddContent(moduleIndex)}>
                          <Ionicons name="add-circle-outline" size={20} color={AppColors.primary} />
                        </TouchableOpacity>
                      </View>
                      {module.contents.map((content, contentIndex) => (
                        <View key={content.id} style={styles.contentItem}>
                          <View style={styles.contentIcon}>
                            <Ionicons 
                              name={
                                content.type === 'video' ? 'play-circle' :
                                content.type === 'image' ? 'image' :
                                content.type === 'audio' ? 'musical-notes' :
                                content.type === 'pdf' ? 'document' : 'text'
                              } 
                              size={16} 
                              color={AppColors.text.secondary} 
                            />
                          </View>
                          <Text style={styles.contentTitle}>{content.title}</Text>
                          <View style={styles.contentStatus}>
                            {content.isLocked ? (
                              <Ionicons name="lock-closed" size={14} color="#EF4444" />
                            ) : (
                              <Ionicons name="lock-open" size={14} color="#10B981" />
                            )}
                          </View>
                          <View style={styles.contentActions}>
                            <TouchableOpacity onPress={() => handleEditContent(moduleIndex, content, contentIndex)}>
                              <Ionicons name="pencil" size={16} color={AppColors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteContent(moduleIndex, contentIndex)}>
                              <Ionicons name="trash" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      {module.contents.length === 0 && (
                        <Text style={styles.noContentText}>No content added yet</Text>
                      )}
                    </View>
                  </View>
                ))}
                {courseForm.modules.length === 0 && (
                  <Text style={styles.noModulesText}>No modules added yet. Click + to add your first module.</Text>
                )}
              </View>

              {/* Active Status */}
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Active Status</Text>
                <Switch
                  value={courseForm.isActive}
                  onValueChange={(value) => setCourseForm({ ...courseForm, isActive: value })}
                  trackColor={{ false: '#374151', true: AppColors.primary }}
                  thumbColor={courseForm.isActive ? AppColors.background.dark : '#9CA3AF'}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCourse}>
                <Text style={styles.saveButtonText}>
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Module Modal */}
      <Modal
        visible={moduleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModuleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingModule ? 'Edit Module' : 'Add Module'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModuleModalVisible(false);
                  resetModuleForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Module Title *</Text>
                <TextInput
                  style={styles.input}
                  value={moduleForm.title}
                  onChangeText={(text) => setModuleForm({ ...moduleForm, title: text })}
                  placeholder="Enter module title"
                  placeholderTextColor={AppColors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={moduleForm.description}
                  onChangeText={(text) => setModuleForm({ ...moduleForm, description: text })}
                  placeholder="Module description (optional)"
                  placeholderTextColor={AppColors.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Module Order</Text>
                <TextInput
                  style={styles.input}
                  value={moduleForm.order.toString()}
                  onChangeText={(text) => setModuleForm({ ...moduleForm, order: parseInt(text) || 1 })}
                  placeholder="1"
                  placeholderTextColor={AppColors.text.secondary}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveModule}>
                <Text style={styles.saveButtonText}>
                  {editingModule ? 'Update Module' : 'Add Module'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Content Modal */}
      <Modal
        visible={contentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setContentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContent ? 'Edit Content' : 'Add Content'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setContentModalVisible(false);
                  resetContentForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Content Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Content Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.typeContainer}>
                    {['text', 'video', 'image', 'audio', 'pdf'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          contentForm.type === type && styles.typeButtonActive,
                        ]}
                        onPress={() => setContentForm({ ...contentForm, type: type as ModuleContent['type'] })}
                      >
                        <Ionicons
                          name={
                            type === 'video' ? 'play-circle' :
                            type === 'image' ? 'image' :
                            type === 'audio' ? 'musical-notes' :
                            type === 'pdf' ? 'document' : 'text'
                          }
                          size={20}
                          color={contentForm.type === type ? AppColors.primary : AppColors.text.secondary}
                        />
                        <Text
                          style={[
                            styles.typeText,
                            contentForm.type === type && styles.typeTextActive,
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Content Title *</Text>
                <TextInput
                  style={styles.input}
                  value={contentForm.title}
                  onChangeText={(text) => setContentForm({ ...contentForm, title: text })}
                  placeholder="Enter content title"
                  placeholderTextColor={AppColors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={contentForm.description}
                  onChangeText={(text) => setContentForm({ ...contentForm, description: text })}
                  placeholder="Content description (optional)"
                  placeholderTextColor={AppColors.text.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Content Input */}
              {contentForm.type === 'text' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Text Content *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { minHeight: 120 }]}
                    value={contentForm.content}
                    onChangeText={(text) => setContentForm({ ...contentForm, content: text })}
                    placeholder="Enter your text content here..."
                    placeholderTextColor={AppColors.text.secondary}
                    multiline
                    numberOfLines={6}
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Media File *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.fileButton]}
                    onPress={pickMediaFile}
                    disabled={uploadingContent}
                  >
                    {uploadingContent ? (
                      <Text style={styles.fileButtonText}>Uploading...</Text>
                    ) : contentForm.url ? (
                      <Text style={styles.fileButtonText}>File Selected ✓</Text>
                    ) : (
                      <Text style={styles.fileButtonText}>
                        Select {contentForm.type} file
                      </Text>
                    )}
                    <Ionicons 
                      name="cloud-upload" 
                      size={20} 
                      color={AppColors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Order</Text>
                  <TextInput
                    style={styles.input}
                    value={contentForm.order.toString()}
                    onChangeText={(text) => setContentForm({ ...contentForm, order: parseInt(text) || 1 })}
                    placeholder="1"
                    placeholderTextColor={AppColors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Access Status</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>
                      {contentForm.isLocked ? 'Locked' : 'Unlocked'}
                    </Text>
                    <Switch
                      value={!contentForm.isLocked}
                      onValueChange={(value) => setContentForm({ ...contentForm, isLocked: !value })}
                      trackColor={{ false: '#374151', true: AppColors.primary }}
                      thumbColor={!contentForm.isLocked ? AppColors.background.dark : '#9CA3AF'}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveContent}
                disabled={uploadingContent}
              >
                <Text style={styles.saveButtonText}>
                  {editingContent ? 'Update Content' : 'Add Content'}
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
  courseList: {
    padding: 20,
  },
  courseCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 2,
  },
  courseInstructor: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  courseDuration: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  courseStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  courseActions: {
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
  courseImage: {
    width: 200,
    height: 112,
    borderRadius: 12,
    marginBottom: 12,
  },
  courseImageEmoji: {
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
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.background.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  levelButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '20',
  },
  levelText: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  levelTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  curriculumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  curriculumNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
    width: 20,
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
  // Module styles
  moduleCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    flex: 1,
  },
  moduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  moduleDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  contentSection: {
    backgroundColor: AppColors.background.dark,
    borderRadius: 8,
    padding: 12,
  },
  contentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
    backgroundColor: AppColors.background.card,
    borderRadius: 8,
  },
  contentIcon: {
    marginRight: 8,
  },
  contentTitle: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text.primary,
  },
  contentStatus: {
    marginRight: 8,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noContentText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  noModulesText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Content type styles
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: AppColors.background.card,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
  },
  typeButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '20',
  },
  typeText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 4,
  },
  typeTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileButtonText: {
    fontSize: 14,
    color: AppColors.text.primary,
  },
  switchLabel: {
    fontSize: 14,
    color: AppColors.text.primary,
    marginRight: 8,
  },
});

export default AdminCourses;