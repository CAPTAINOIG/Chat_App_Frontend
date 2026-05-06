import React, { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../store/auth';
import { dashboard } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    hydrated,
    setAuth,
    logout,
    setLoading,
    checkAuth
  } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        if (checkAuth()) {
          await dashboard();
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    hydrated,

    // Actions
    setAuth,
    logout,

    // Computed
    userId: user?._id,
    username: user?.username,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};