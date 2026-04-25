import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch favorites from database when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        } else {
            // Clear favorites when logged out
            setFavorites([]);
        }
    }, [isAuthenticated]);

    // Fetch favorites from server (database)
    const fetchFavorites = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.favorites) {
                    setFavorites(data.favorites);
                }
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle favorite (add/remove) - saves directly to database
    const toggleFavorite = async (productId) => {
        if (!isAuthenticated) {
            console.warn('User must be logged in to save favorites');
            return;
        }

        const isFav = favorites.includes(productId);

        // Optimistically update UI
        if (isFav) {
            setFavorites(prev => prev.filter(id => id !== productId));
        } else {
            setFavorites(prev => [...prev, productId]);
        }

        // Sync with database
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/auth/favorites/${productId}`, {
                method: isFav ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error syncing favorite:', error);
            // Revert on error
            if (isFav) {
                setFavorites(prev => [...prev, productId]);
            } else {
                setFavorites(prev => prev.filter(id => id !== productId));
            }
        }
    };

    // Check if product is favorite
    const isFavorite = (productId) => {
        return favorites.includes(productId);
    };

    // Get count
    const favoritesCount = favorites.length;

    const value = {
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount,
        isLoading,
        fetchFavorites
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export default FavoritesContext;
