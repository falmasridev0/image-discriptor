// /app/login.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/(tabs)');
        } catch (error) {
            setErrorMessage((error as Error).message);
        }
    };

    const handleSignUpRedirect = () => {
        router.push('/signup');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
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
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.orText}>Or</Text>
            <Button title="Create an Account" onPress={handleSignUpRedirect} />
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
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    orText: {
        color: '#fff',
        textAlign: 'center',
        marginVertical: 8,
    },
});