import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, confirmPassword?: string) => Promise<void>;
  loginDemo: (role: 'PASSENGER' | 'ADMIN') => Promise<void>;
  forgotPassword: (email: string, newPassword?: string) => Promise<string>;
  updateProfile: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('railsathi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Clean initial guest state: Users can browse, register, or sign in freely
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('railsathi_token');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('railsathi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('railsathi_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const result = await api.login(email, pass);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('railsathi_token', result.token);
  };

  const register = async (name: string, email: string, pass: string, phone: string, confirmPassword?: string) => {
    const result = await api.register(name, email, pass, phone, confirmPassword);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('railsathi_token', result.token);
  };

  const loginDemo = async (role: 'PASSENGER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      await login('admin@rail.in', 'admin123');
    } else {
      await login('passenger@rail.in', 'pass123');
    }
  };

  const forgotPassword = async (email: string, newPassword?: string): Promise<string> => {
    const res = await api.forgotPassword(email, newPassword);
    return res.message;
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!user) throw new Error('Not logged in');
    const res = await api.updateProfile(name, phone, user);
    setUser(res.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('railsathi_user');
    localStorage.removeItem('railsathi_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        loginDemo,
        forgotPassword,
        updateProfile,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
