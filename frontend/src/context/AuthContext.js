import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('airbnb_token'));

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const { user } = await getProfile();
          setUser(user);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('airbnb_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const loginUser = async (email, password) => {
    try {
      const response = await login({ email, password });
      const { user, token } = response;
      
      localStorage.setItem('airbnb_token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await register(userData);
      const { user, token } = response;
      
      localStorage.setItem('airbnb_token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('airbnb_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginUser,
    registerUser,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

