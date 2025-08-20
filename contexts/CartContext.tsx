import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebaseService from '../services/firebase';
import { getAuth } from '@react-native-firebase/auth';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  type: 'product' | 'course';
  quantity: number;
  image?: string;
  description?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeCart: (() => void) | undefined;
    let isMounted = true;

    const unsubscribeAuth = firebaseService.onAuthStateChanged(async (user) => {
      if (!isMounted) return;
      
      // Clean up previous cart subscription
      if (unsubscribeCart) {
        unsubscribeCart();
        unsubscribeCart = undefined;
      }
      
      if (user) {
        setLoading(true);
        try {
          unsubscribeCart = firebaseService.subscribeToUserCart((items) => {
            if (!isMounted) return;
            // Limit cart items to prevent memory issues
            setCartItems(items.slice(0, 50));
            setLoading(false);
          });
        } catch (error) {
          console.error('Error loading cart:', error);
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) {
          setCartItems([]);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeCart) {
        unsubscribeCart();
      }
    };
  }, []);

  const syncCart = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      await firebaseService.saveUserCart(cartItems);
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    const newCartItems = (() => {
      const existingItem = cartItems.find(i => i.id === item.id);
      if (existingItem) {
        // For courses, don't increase quantity - keep at 1
        if (item.type === 'course') {
          return cartItems;
        }
        // For products, increase quantity
        return cartItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...cartItems, { ...item, quantity: 1 }];
    })();
    
    setCartItems(newCartItems);
    
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await firebaseService.saveUserCart(newCartItems);
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  };

  const removeFromCart = async (id: string) => {
    const newCartItems = cartItems.filter(item => item.id !== id);
    setCartItems(newCartItems);
    
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await firebaseService.saveUserCart(newCartItems);
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    const newCartItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newCartItems);
    
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await firebaseService.saveUserCart(newCartItems);
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await firebaseService.clearUserCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};