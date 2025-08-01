import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Button } from 'react-native';
import {FirebaseError} from 'firebase/app'
import auth from '@react-native-firebase/auth';

export default function HomeScreen() {

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
    <View style={{ flex: 1 }}>
      <Text style={styles.titleContainer}>
        Sign up here
        </Text>
        <KeyboardAvoidingView>

        <TextInput
        style={styles.stepContainer}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        />
        <TextInput
        style={styles.stepContainer}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        />
        <Button
          title="Sign Up"
          onPress={handleSignUp} />
        <Button
          title="Sign In"
          onPress={handleSignIn} />
        </KeyboardAvoidingView>

      </View>
   
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});