import React, { createContext, useContext, useState, useEffect } from 'react';
import useProductService from '../server/server';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Use cached data for instant UI on first render
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached).isAdmin : false;
    } catch { return false; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const { registerUser, loginUser, getUserProfile } = useProductService();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Fetch fresh user profile from DB (DATA FIRST)
          const result = await getUserProfile(token);

          if (result && result.success) {
            const userData = result.data;
            setIsAuthenticated(true);
            setUser(userData);
            setIsAdmin(userData.isAdmin);
            setToken(token);
            // Update localStorage just as a backup/cache
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // If token is invalid or user not found, logout
            logout();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (username, phone, password) => {
    const result = await registerUser({ username, phone, password });

    if (result.success) {
      const { token, ...userData } = result.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(token);

      setIsAuthenticated(true);
      setUser(userData);
      setIsAdmin(userData.isAdmin);
      return { success: true };
    }

    return { success: false, error: result.message };
  };

  const login = async (identifier, password) => {


    const result = await loginUser({ identifier, password });

    if (result.success) {
      const { token, ...userData } = result.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(token);

      setIsAuthenticated(true);
      setUser(userData);
      setIsAdmin(userData.isAdmin);
      return { success: true };
    }

    return { success: false, error: result.message };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{
      token,
      isAuthenticated,
      user,
      isAdmin,
      loading,
      register,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
