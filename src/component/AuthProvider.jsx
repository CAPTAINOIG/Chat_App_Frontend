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
        // Check if we have stored auth data
        if (checkAuth()) {
          // Verify token is still valid by calling dashboard
          await dashboard();
          // If successful, auth is valid
        } else {
          // No stored auth or invalid
          logout();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
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