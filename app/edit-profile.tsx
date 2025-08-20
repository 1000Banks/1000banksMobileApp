import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import auth from '@react-native-firebase/auth';

const EditProfileScreen = () => {
  const { user, refreshUser } = useAuth();
  const userContext = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.photoURL || '');

  const requestMediaLibraryPermissions = async () => {
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'Sorry, we need camera roll permissions to change your profile picture. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // This will open device settings on iOS
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            }
          }}
        ]
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'Sorry, we need camera permissions to take photos. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            }
          }}
        ]
      );
      return false;
    }
    return true;
  };

  const showImagePicker = async () => {
    // Check permissions status first
    const { status: mediaLibraryStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
    
    // If neither permission has been requested yet, show an informative dialog
    if (mediaLibraryStatus === 'undetermined' || cameraStatus === 'undetermined') {
      Alert.alert(
        'Photo Access',
        '1000Banks would like to access your photos and camera to let you update your profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: showImagePickerOptions }
        ]
      );
    } else {
      showImagePickerOptions();
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openImageLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Photo',
        'Choose how you want to select a photo',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Library', onPress: openImageLibrary },
        ]
      );
    }
  };

  const openCamera = async () => {
    const hasCameraPermission = await requestCameraPermissions();
    if (!hasCameraPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        presentationStyle: 'fullScreen', // iOS specific
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open image library. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    console.log('Starting profile update...');
    
    try {
      // Update display name
      if (displayName !== user.displayName) {
        console.log('Updating display name...');
        await auth().currentUser?.updateProfile({
          displayName: displayName.trim(),
        });
      }

      // Update profile photo
      if (profileImage !== user.photoURL) {
        console.log('Updating profile photo...');
        await auth().currentUser?.updateProfile({
          photoURL: profileImage,
        });
      }

      console.log('Profile updated successfully, refreshing user data...');
      
      // Refresh both contexts to ensure immediate reflection
      try {
        await refreshUser();
        console.log('Auth user refreshed');
      } catch (refreshError) {
        console.warn('Error refreshing auth user:', refreshError);
      }
      
      try {
        if (userContext?.refreshUserData) {
          await userContext.refreshUserData();
          console.log('User context refreshed');
        }
      } catch (refreshError) {
        console.warn('Error refreshing user data:', refreshError);
      }

      // Success - profile has been updated
      setLoading(false);
      console.log('Profile update completed successfully');
      
      // Note: Email updates require re-authentication in Firebase
      if (email !== user.email) {
        Alert.alert(
          'Email Update',
          'Email updates require additional verification. This feature will be available soon.',
          [{ text: 'OK' }]
        );
      } else {
        // Show success message and navigate back
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [
            { 
              text: 'OK',
              onPress: () => {
                // Navigate to account tab after success
                router.push('/account');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader title="Edit Profile" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to edit your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Edit Profile" />
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {profileImage ? (
                <Image 
                  key={profileImage}
                  source={{ uri: profileImage }} 
                  style={styles.profilePhoto} 
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={50} color={AppColors.primary} />
                </View>
              )}
              <TouchableOpacity style={styles.photoEditButton} onPress={showImagePicker}>
                <Ionicons name="camera" size={20} color={AppColors.background.dark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHint}>Tap camera icon to change photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={AppColors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={AppColors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
              <Text style={styles.inputHint}>
                Email changes require verification and will be available soon
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.providerInfo}>
                <Ionicons 
                  name={user.providerData[0]?.providerId === 'google.com' ? 'logo-google' : 'mail'} 
                  size={20} 
                  color={AppColors.primary} 
                />
                <Text style={styles.providerText}>
                  {user.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email Account'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  photoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.background.dark,
  },
  photoHint: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: AppColors.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: AppColors.background.card + '80',
  },
  inputHint: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  providerText: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 12,
  },
  buttonSection: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.text.secondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});

export default EditProfileScreen;