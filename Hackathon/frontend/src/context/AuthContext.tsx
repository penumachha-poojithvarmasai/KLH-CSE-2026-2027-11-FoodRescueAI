import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('cp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('cp_token', userData.token);
    localStorage.setItem('cp_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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

