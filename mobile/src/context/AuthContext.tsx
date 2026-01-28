import React, { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { TokenManager } from '../services/secureStorage';

interface User {
  id: number;
  email: string;
  name: string;
  plan: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await TokenManager.getValidAccessToken();
        if (token) {
          const response = await userAPI.getProfile();
          setUser(response.data);
        }
      } catch (err: any) {
        console.error('Auth check failed:', err);
        await TokenManager.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(email, password, name);
      setUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
