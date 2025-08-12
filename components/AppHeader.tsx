import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';

const { width } = Dimensions.get('window');

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  showMenuAndCart?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  showBackButton = true, 
  rightComponent,
  showMenuAndCart = false
}) => {
  const router = useRouter();
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  if (showMenuAndCart) {
    return (
      <>
        <View style={styles.menuHeader}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.webp')} 
              style={{ width: 100, height: 40 }} 
              resizeMode="contain"/>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => router.push('/checkout')}
            >
              <Ionicons name="cart-outline" size={24} color={AppColors.text.primary} />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Overlay */}
        {menuOpen && (
          <View style={styles.menuOverlay}>
            <View style={styles.menuContent}>
              <TouchableOpacity style={styles.menuCloseButton} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuCloseIcon}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/about'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>About Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/services'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>Services</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/faq'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>FAQ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/hiring'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>We're Hiring</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/contact'); setMenuOpen(false); }}>
                  <Text style={styles.menuItemText}>Contact Us</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.authButtons}>
                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: AppColors.background.dark,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    flex: 1,
  },
  rightComponent: {
    marginLeft: 16,
  },
  menuHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: AppColors.background.dark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: AppColors.text.primary,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: AppColors.background.card,
    borderRadius: 20,
    padding: 32,
    width: width * 0.85,
    maxHeight: '80%',
  },
  menuCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
  },
  menuCloseIcon: {
    fontSize: 24,
    color: AppColors.text.primary,
  },
  menuItems: {
    marginBottom: 32,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.dark,
  },
  menuItemText: {
    fontSize: 18,
    color: AppColors.text.primary,
    fontWeight: '500',
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  signInButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default AppHeader;