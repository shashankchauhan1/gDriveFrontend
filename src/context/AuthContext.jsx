// Authentication context for managing user login state
// Provides login, logout, and authentication status across the app

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7500';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Store JWT token and authentication status
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // On mount, check for token in localStorage
  const fetchProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'x-auth-token': storedToken },
      });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to load profile', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Login: save token and update state
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    fetchProfile();
  };

  // Logout: remove token and update state
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  // Provide auth state and functions to children
  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, user, refreshProfile: fetchProfile, profileLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};