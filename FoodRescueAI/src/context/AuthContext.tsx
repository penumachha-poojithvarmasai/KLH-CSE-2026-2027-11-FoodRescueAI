import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSession, UserRecord, UserRole, AuthCredentials } from '../types';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  session: UserSession | null;
  user: UserRecord | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [isLoading, setIsLoading] = useState<boolean>(() => !authService.getCurrentSession());
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const validated = await authService.validateSession();
        if (isMounted) {
          setSession(validated);
        }
      } catch {
        if (isMounted) {
          setSession(authService.getCurrentSession());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    initSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const newSession = await authService.login(credentials);
      setSession(newSession);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organization: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const newSession = await authService.register(payload);
      setSession(newSession);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await authService.logout();
    setSession(null);
    setIsLoading(false);
  };

  const clearAuthError = () => setAuthError(null);

  const activeSession = session || authService.getCurrentSession();
  const user = activeSession?.user || null;
  const userRole = (user?.role as UserRole) || 'FOOD_PROVIDER';
  const isAuthenticated = !!activeSession;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      userRole,
      isAuthenticated,
      isLoading,
      authError,
      login,
      register,
      logout,
      clearAuthError
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
