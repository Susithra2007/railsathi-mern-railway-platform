import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'PASSENGER' | 'ADMIN') => void;
  isAdmin: boolean;
}

const DEFAULT_PASSENGER: User = {
  id: 'usr_passenger_1',
  name: 'Priya Sharma',
  email: 'passenger@rail.in',
  phone: '+91 98765 43210',
  role: 'PASSENGER',
};

const DEFAULT_ADMIN: User = {
  id: 'usr_admin_1',
  name: 'Rajesh Kumar (Station Super)',
  email: 'admin@rail.in',
  phone: '+91 98111 22334',
  role: 'ADMIN',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('railsathi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PASSENGER;
      }
    }
    return DEFAULT_PASSENGER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('railsathi_token') || 'demo_token';
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

  const register = async (name: string, email: string, pass: string, phone: string) => {
    const result = await api.register(name, email, pass, phone);
    setUser(result.user);
    setToken(result.token);
    localStorage.setItem('railsathi_token', result.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('railsathi_user');
    localStorage.removeItem('railsathi_token');
  };

  const switchRole = (role: 'PASSENGER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_PASSENGER);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        switchRole,
        isAdmin: user?.role === 'ADMIN',
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
