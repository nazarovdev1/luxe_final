import React, { createContext, useContext, useReducer, useEffect } from 'react';
import useProductService from '../server/server';

const CACHE_KEY = 'luxe_products_cache';
const CACHE_EXPIRY_KEY = 'luxe_products_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialState = {
  products: [],
  isLoading: true,
};

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      // SMART MERGE LOGIC
      // When setting a new list of products (usually simplified with 1 image),
      // we check if we already have a simplified version of the product in our state
      // that has MORE images (meaning it was fully loaded).
      // If so, we preserve the existing images.
      const newProducts = action.payload.map(newP => {
        const existingP = state.products.find(p => p.id === newP.id);

        // If existing product has more images than the new one, keep the existing images
        if (existingP && existingP.images && newP.images && existingP.images.length > newP.images.length) {
          return { ...newP, images: existingP.images };
        }
        return newP;
      });

      return {
        ...state,
        products: newProducts,
        isLoading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'ADD_PRODUCT':
      // Check if product already exists to avoid duplicates (though rare in add)
      if (state.products.some(p => p.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        products: [...state.products, action.payload],
      };

    case 'UPDATE_PRODUCT':
      const updatedProducts = state.products.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
      return {
        ...state,
        products: updatedProducts,
      };

    case 'DELETE_PRODUCT':
      const filteredProducts = state.products.filter((p) => p.id !== action.payload);
      return {
        ...state,
        products: filteredProducts,
      };

    default:
      return state;
  }
};

const ProductContext = createContext();

// Helper functions for localStorage caching
const getCachedProducts = () => {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    const now = Date.now();

    // Check if cache is expired
    if (expiry && now > parseInt(expiry, 10)) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading products cache:', error);
    return null;
  }
};

const setCachedProducts = (products) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  } catch (error) {
    console.error('Error caching products:', error);
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, {
    ...initialState,
    // Load cached products immediately for instant UI
    products: getCachedProducts() || [],
    isLoading: !getCachedProducts(), // Only show loading if no cache
  });

  const { getAllProducts, postProduct, putProduct, deleteProduct, getDetailedProduct, getImageKitAuth } = useProductService();

  // AUTO-CACHE EFFECT
  // Anytime state.products changes (add, update, delete, set), automatically update cache
  // This ensures cache is always in sync with valid data
  useEffect(() => {
    if (state.products.length > 0) {
      setCachedProducts(state.products);
    }
  }, [state.products]);

  useEffect(() => {
    const loadProducts = async () => {
      // Data is already loaded from cache in initialState.
      // Now fetch fresh data from API (background refresh)
      try {
        const backendProducts = await getAllProducts();

        if (backendProducts && backendProducts.length > 0) {
          // Send to reducer for smart merging
          dispatch({ type: 'SET_PRODUCTS', payload: backendProducts });
        } else if (state.products.length === 0) {
          // Only stop loading if we have absolutely no data
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (state.products.length === 0) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    loadProducts();
  }, []);

  const getProducts = () => state.products;

  const getNewCollectionProducts = () =>
    state.products
      .filter(p => p.badge === 'NEW')
      .slice(0, 4);

  const getBestsellerProducts = () =>
    state.products
      .filter(p => p.badge === 'BESTSELLER')
      .slice(0, 4);

  const getProduct = (id) => state.products.find((p) => p.id === id);

  const addProduct = async (productData) => {
    const token = localStorage.getItem('token');
    const newProduct = await postProduct(productData, token);
    if (newProduct) {
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    }
    return newProduct;
  };

  const updateProduct = async (id, productData) => {
    const token = localStorage.getItem('token');
    const updated = await putProduct(id, productData, token);
    if (updated) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
    }
    return updated;
  };

  const removeProduct = async (id) => {
    const token = localStorage.getItem('token');
    const success = await deleteProduct(id, token);
    if (success) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    }
    return success;
  };

  // Fetch full product details (including all images)
  const fetchProductDetails = async (id) => {
    try {
      const detailedProduct = await getDetailedProduct(id);
      if (detailedProduct) {
        // Update local state with full details
        dispatch({ type: 'UPDATE_PRODUCT', payload: detailedProduct });
        return detailedProduct;
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
    return null;
  };

  // Force refresh products (clear cache and reload)
  const refreshProducts = async () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    dispatch({ type: 'SET_LOADING', payload: true });

    const backendProducts = await getAllProducts();
    if (backendProducts) {
      dispatch({ type: 'SET_PRODUCTS', payload: backendProducts });
    } else {
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        isLoading: state.isLoading,
        getProducts,
        getNewCollectionProducts,
        getBestsellerProducts,
        getProduct,
        addProduct,
        updateProduct,
        removeProduct,
        refreshProducts,
        fetchProductDetails,
        getImageKitAuth,
        categories: [...new Set(state.products.map(p => p.category).filter(Boolean))],
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
