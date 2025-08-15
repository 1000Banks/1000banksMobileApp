import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppColors } from '../constants/Colors';
import firebaseService from '../services/firebase';
import { router } from 'expo-router';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      console.log('User account created & signed in!');
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let message = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        message = 'That email address is invalid!';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      }
      
      Alert.alert('Sign Up Error', message);
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('User signed in!');
      
      // Ensure user profile exists
      const userProfile = await firebaseService.getUserProfile();
      if (!userProfile) {
        await firebaseService.createUserProfile({
          email: email,
          provider: 'email',
        });
      }
      
      // Check if this is an admin email
      const isAdminEmail = await firebaseService.checkAdminEmail(email);
      
      if (isAdminEmail) {
        // Show dialog to choose between admin and normal account
        Alert.alert(
          'Admin Account Detected',
          'Would you like to sign in as an administrator?',
          [
            {
              text: 'Normal Account',
              onPress: () => {
                router.replace('/');
              }
            },
            {
              text: 'Admin Account',
              onPress: async () => {
                // Set admin flag in user profile
                await firebaseService.updateUserProfile({ isAdmin: true });
                router.replace('/admin-dashboard');
              },
              style: 'default'
            }
          ],
          { cancelable: false }
        );
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      let message = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email address!';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password!';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format!';
      }
      
      Alert.alert('Sign In Error', message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In requires additional setup. For now, please use email/password authentication.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background.dark} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to</Text>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>1000</Text>
          <Text style={styles.logoSubText}>BANKS</Text>
        </View>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <KeyboardAvoidingView style={styles.formContainer} behavior="padding">
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={AppColors.text.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={AppColors.text.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Processing...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            {loading ? 'Processing...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: AppColors.primary,
    letterSpacing: -1,
  },
  logoSubText: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text.primary,
    letterSpacing: 2,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  primaryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.background.card,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
  },
});