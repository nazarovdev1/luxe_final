import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import useProductService from '../server/server';

// Cart reducer for state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || action.payload || [],
        lookItems: action.payload.lookItems || [],
        totalItems: (action.payload.items || action.payload || []).reduce((sum, item) => sum + item.quantity, 0)
          + (action.payload.lookItems || []).reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
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
          + state.lookItems.reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
      };
    case 'ADD_LOOK_TO_CART': {
      const newLookItems = [...state.lookItems, action.payload];
      return {
        ...state,
        lookItems: newLookItems,
        totalItems: state.items.reduce((sum, item) => sum + item.quantity, 0)
          + newLookItems.reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
      };
    }
    case 'REMOVE_LOOK_FROM_CART': {
      const filteredLookItems = state.lookItems.filter(look => look.cartLookId !== action.payload);
      return {
        ...state,
        lookItems: filteredLookItems,
        totalItems: state.items.reduce((sum, item) => sum + item.quantity, 0)
          + filteredLookItems.reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
      };
    }
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
          + state.lookItems.reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
      };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0)
          + state.lookItems.reduce((sum, look) => sum + look.products.reduce((s, p) => s + p.quantity, 0), 0)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        lookItems: [],
        totalItems: 0
      };
    default:
      return state;
  }
};

const CartContext = createContext();

const initialState = {
  items: [],
  lookItems: [],
  totalItems: 0
};

// Helper: Get cart from localStorage for guests
const getGuestCart = () => {
  try {
    const cart = localStorage.getItem('guestCart');
    if (cart) {
      const parsed = JSON.parse(cart);
      // Support both old format (array) and new format ({items, lookItems})
      if (Array.isArray(parsed)) return { items: parsed, lookItems: [] };
      return parsed;
    }
    return { items: [], lookItems: [] };
  } catch {
    return { items: [], lookItems: [] };
  }
};

// Helper: Save cart to localStorage for guests
const saveGuestCart = (items, lookItems) => {
  try {
    localStorage.setItem('guestCart', JSON.stringify({ items, lookItems }));
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
      const userCart = user.cart || [];
      const guestCart = getGuestCart();

      if (userCart.length > 0) {
        console.log('📥 Loading user cart from DB:', userCart);
        dispatch({ type: 'LOAD_CART', payload: { items: userCart, lookItems: [] } });
      } else if (guestCart.items.length > 0 || guestCart.lookItems.length > 0) {
        console.log('📥 Merging guest cart to user account');
        dispatch({ type: 'LOAD_CART', payload: guestCart });
        const token = localStorage.getItem('token');
        if (token) {
          updateUserCart(guestCart.items, token);
        }
        localStorage.removeItem('guestCart');
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }
    } else {
      const guestCart = getGuestCart();
      dispatch({ type: 'LOAD_CART', payload: guestCart });
    }
  }, [isAuthenticated, user]);

  // Auto-save cart whenever items change
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }

    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        updateUserCart(state.items, token).then(() => {
          console.log('💾 Synced cart to database:', state.items);
        }).catch(err => console.error('Sync error:', err));
      }
    } else {
      saveGuestCart(state.items, state.lookItems);
      console.log('💾 Saved guest cart:', state.items, state.lookItems);
    }
  }, [state.items, state.lookItems, isAuthenticated, updateUserCart]);

  // Sync cart with backend database (for authenticated users)
  const syncWithBackend = useCallback(async (newItems) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        await updateUserCart(newItems, token);
      }
    }
  }, [isAuthenticated, updateUserCart]);

  const addToCart = (product, selectedColor, selectedSize, quantity = 1) => {
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

  // Add entire look to cart as a group
  const addLookToCart = (look, selectedVariants) => {
    const cartLookId = `look_${look._id || look.id}_${Date.now()}`;

    const lookProducts = (look.products || []).map(p => {
      const variant = selectedVariants?.[p.id || p._id] || {};
      return {
        productId: p.id || p._id,
        name: p.name,
        price: p.price,
        image: p.image || p.images?.[0] || '/placeholder.jpg',
        selectedColor: variant.color || null,
        selectedSize: variant.size || null,
        quantity: 1
      };
    });

    const originalPrice = look.originalPrice || lookProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    let discountAmount = 0;
    let discountedPrice = originalPrice;

    if (look.discountType === 'percentage' && look.discountValue > 0) {
      discountAmount = originalPrice * (look.discountValue / 100);
      discountedPrice = originalPrice - discountAmount;
    } else if (look.discountType === 'fixed' && look.discountValue > 0) {
      discountAmount = look.discountValue;
      discountedPrice = Math.max(0, originalPrice - look.discountValue);
    }

    const lookCartItem = {
      cartLookId,
      lookId: look._id || look.id,
      title: look.title,
      heroImage: look.heroImage,
      products: lookProducts,
      originalPrice,
      discountAmount,
      discountedPrice,
      discountType: look.discountType,
      discountValue: look.discountValue,
      addedAt: new Date().toISOString()
    };

    console.log('👗 Adding look to cart:', lookCartItem);
    dispatch({ type: 'ADD_LOOK_TO_CART', payload: lookCartItem });
    return true;
  };

  // Remove entire look from cart
  const removeLookFromCart = (cartLookId) => {
    dispatch({ type: 'REMOVE_LOOK_FROM_CART', payload: cartLookId });
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

  // Total for individual items only
  const getCartTotal = () => {
    const itemsTotal = state.items.reduce((total, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : parseFloat(item.price);
      return total + (price * item.quantity);
    }, 0);

    const looksTotal = state.lookItems.reduce((total, look) => {
      return total + (look.discountedPrice || 0);
    }, 0);

    return itemsTotal + looksTotal;
  };

  // Original total (before look discounts)
  const getCartOriginalTotal = () => {
    const itemsTotal = state.items.reduce((total, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : parseFloat(item.price);
      return total + (price * item.quantity);
    }, 0);

    const looksOriginalTotal = state.lookItems.reduce((total, look) => {
      return total + (look.originalPrice || 0);
    }, 0);

    return itemsTotal + looksOriginalTotal;
  };

  // Total savings from look discounts
  const getCartSavings = () => {
    return state.lookItems.reduce((total, look) => {
      return total + (look.discountAmount || 0);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      lookItems: state.lookItems,
      totalItems: state.totalItems,
      addToCart,
      addLookToCart,
      removeLookFromCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartOriginalTotal,
      getCartSavings
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
