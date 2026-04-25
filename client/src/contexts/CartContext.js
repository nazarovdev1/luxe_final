import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import useProductService from '../server/server';

// Cart reducer for state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.reduce((sum, item) => sum + item.quantity, 0)
      };
    case 'ADD_TO_CART':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedSize === action.payload.selectedSize
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0
      };
    default:
      return state;
  }
};

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0
};

// Helper: Get cart from localStorage for guests
const getGuestCart = () => {
  try {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

// Helper: Save cart to localStorage for guests
const saveGuestCart = (items) => {
  try {
    localStorage.setItem('guestCart', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save guest cart:', e);
  }
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const { updateUserCart } = useProductService();

  // Load cart on mount or auth change
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is logged in - load from user.cart (database)
      // User is logged in
      const userCart = user.cart || [];
      const guestCart = getGuestCart();

      if (userCart.length > 0) {
        // User has items in DB - load them
        console.log('📥 Loading user cart from DB:', userCart);
        dispatch({ type: 'LOAD_CART', payload: userCart });
      } else if (guestCart.length > 0) {
        // User DB is empty, but we have a guest cart to merge
        console.log('📥 Merging guest cart to user account');
        dispatch({ type: 'LOAD_CART', payload: guestCart });
        // Sync guest cart to backend
        const token = localStorage.getItem('token');
        if (token) {
          updateUserCart(guestCart, token);
        }
        // Clear guest cart after merge
        localStorage.removeItem('guestCart');
      } else {
        // Both DB and guest cart are empty - ensure state is cleared
        // This fixes the bug where stale localStorage data might persist or items reappear
        dispatch({ type: 'CLEAR_CART' });
      }
    } else {
      // Guest user - load from localStorage
      const guestCart = getGuestCart();
      dispatch({ type: 'LOAD_CART', payload: guestCart });
    }
  }, [isAuthenticated, user]);

  // Auto-save cart whenever items change
  // Use a ref to track if we've loaded the cart initially
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    // Skip only the very first render before loading from localStorage/database
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }

    if (isAuthenticated) {
      // Authenticated user - sync to database
      const token = localStorage.getItem('token');
      if (token) {
        // Optimistically update backend
        updateUserCart(state.items, token).then(() => {
          console.log('💾 Synced cart to database:', state.items);
        }).catch(err => console.error('Sync error:', err));
      }
    } else {
      // Guest user - save to localStorage
      saveGuestCart(state.items);
      console.log('💾 Saved guest cart:', state.items);
    }
  }, [state.items, isAuthenticated, updateUserCart]);

  // Sync cart with backend database (for authenticated users)
  const syncWithBackend = useCallback(async (newItems) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        await updateUserCart(newItems, token);
      }
    }
    // Guest cart is now handled by useEffect above
  }, [isAuthenticated, updateUserCart]);

  const addToCart = (product, selectedColor, selectedSize, quantity = 1) => {
    // ALLOW GUESTS TO ADD TO CART (removed auth check here)

    const cartItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor,
      selectedSize,
      quantity,
      addedAt: new Date().toISOString()
    };

    console.log('🛍️ Adding to cart:', cartItem);

    const currentItems = state.items;
    const existingItemIndex = currentItems.findIndex(
      item => item.productId === cartItem.productId &&
        item.selectedColor === cartItem.selectedColor &&
        item.selectedSize === cartItem.selectedSize
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...currentItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      };
    } else {
      newItems = [...currentItems, cartItem];
    }

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    syncWithBackend(newItems);
    return true;
  };

  const updateQuantity = (itemId, quantity) => {
    const newItems = state.items.map(item =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    syncWithBackend(newItems);
  };

  const removeFromCart = (itemId) => {
    const newItems = state.items.filter(item => item.id !== itemId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    syncWithBackend(newItems);
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    syncWithBackend([]);
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : parseFloat(item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems: state.totalItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal
    }}>
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
