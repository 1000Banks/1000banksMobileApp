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
import { useAuth } from '@/contexts/AuthContext';
import firebaseService from '@/services/firebase';

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

  // Safe cart access with fallback
  let cartCount = 0;
  try {
    const { getCartCount } = useCart();
    cartCount = getCartCount();
  } catch (error) {
    console.warn('CartProvider not available, using default cart count');
  }

  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  React.useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    const unsubscribe = firebaseService.onUnreadNotificationsCount(
      user.uid,
      (count) => setUnreadNotifications(count)
    );

    return () => unsubscribe();
  }, [user]);

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
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={AppColors.text.primary} />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {user ? (
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                {user.photoURL ? (
                  <Image 
                    key={user.photoURL}
                    source={{ uri: user.photoURL }} 
                    style={styles.userAvatar} 
                  />
                ) : (
                  <View style={styles.userAvatarPlaceholder}>
                    <Text style={styles.userInitial}>
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
            )}
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

              {user ? (
                <View style={styles.userSection}>
                  <View style={styles.userInfo}>
                    {user.photoURL ? (
                      <Image 
                        key={user.photoURL}
                        source={{ uri: user.photoURL }} 
                        style={styles.menuUserAvatar} 
                      />
                    ) : (
                      <View style={styles.menuUserAvatarPlaceholder}>
                        <Text style={styles.menuUserInitial}>
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.signOutButton} onPress={() => { signOut(); setMenuOpen(false); }}>
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.authButtons}>
                  <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
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
  notificationButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: AppColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: AppColors.text.primary,
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
  profileButton: {
    padding: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  userSection: {
    marginTop: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuUserAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuUserInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.error,
  },
});

export default AppHeader;