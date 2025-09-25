import { Stack } from 'expo-router';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import TelegramPollingInitializer from '@/components/TelegramPollingInitializer';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <TelegramPollingInitializer />
            <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="about" />
            <Stack.Screen name="services" />
            <Stack.Screen name="contact" />
            <Stack.Screen name="faq" />
            <Stack.Screen name="hiring" />
            <Stack.Screen name="course-detail" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="courses" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="trading" />
            <Stack.Screen name="account" />
            <Stack.Screen name="notification-center" />
            <Stack.Screen name="privacy-security" />
            <Stack.Screen name="help-support" />
            <Stack.Screen name="admin-dashboard" />
            <Stack.Screen name="admin-signals" />
            <Stack.Screen name="admin-settings" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="product-detail" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}