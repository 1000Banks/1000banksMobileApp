import { Stack } from 'expo-router';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
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
        <Stack.Screen name="+not-found" />
      </Stack>
    </CartProvider>
  );
}