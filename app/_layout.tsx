import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerTitle: 'Login' }} />
        <Stack.Screen name="signup" options={{ headerTitle: 'Sign Up' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}

