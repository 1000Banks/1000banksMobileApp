import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, TouchableOpacity, StatusBar } from 'react-native';
import {FirebaseError} from 'firebase/app'
import auth from '@react-native-firebase/auth';
import { AppColors } from '../constants/Colors';

export default function AuthScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async() => {
    setLoading(true);
    await auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch((error: FirebaseError) => {
        if (error.code === 'auth/email-already-in-use') {
          console.error('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          console.error('That email address is invalid!');
        } else {
          console.error(error);
        }
      });
    setLoading(false);

    // Handle sign up logic here
  };
  const handleSignIn = async() => {
    setLoading(true);
    await auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User signed in!');
      })
      .catch((error: FirebaseError) => {
        if (error.code === 'auth/user-not-found') {
          console.error('No user found with this email address!');
        } else if (error.code === 'auth/wrong-password') {    
          console.error('Incorrect password!');
        } else {
          console.error(error);
        }
      });
    setLoading(false);
    // Handle sign in logic here
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
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
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
});