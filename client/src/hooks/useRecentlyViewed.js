import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'luxe_recently_viewed';
const MAX_ITEMS = 20;

const getStoredItems = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // Storage full or unavailable
  }
};

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(getStoredItems);

  useEffect(() => {
    // Sync across tabs
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setRecentlyViewed(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    if (!product || !product.id) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.id !== product.id);

      // Add to beginning
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
        category: product.category || '',
        rating: product.rating || 0,
        badge: product.badge || '',
        viewedAt: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
};

export default useRecentlyViewed;
