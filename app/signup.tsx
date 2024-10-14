// /app/signup.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/(tabs)');
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unknown error occurred');
            }
        }
    };
    const handleBackToLogin = () => {
        router.push('/login');
      };

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="silver"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="silver"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="silver"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Button title="Sign Up" onPress={handleSignUp} />
          <Text style={styles.orText}>Already have an account?</Text>
          <Button title="Back to Login" onPress={handleBackToLogin} />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        padding: 16,
      },
      title: {
        color: '#fff',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 16,
      },
      input: {
        backgroundColor: '#fff',
        padding: 8,
        marginBottom: 16,
        borderRadius: 4,
      },
      orText: {
        color: '#fff',
        textAlign: 'center',
        marginVertical: 8,
      },
      errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    });