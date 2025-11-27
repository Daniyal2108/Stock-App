import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirm: string, riskTolerance?: string, goal?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser({
            name: userData.name,
            email: userData.email,
            riskTolerance: userData.riskTolerance as any,
            goal: userData.goal,
            balance: userData.balance || 100000,
          });
        } catch (error) {
          // Token invalid, clear it
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const userData: UserProfile = {
        name: response.data.user.name,
        email: response.data.user.email,
        riskTolerance: response.data.user.riskTolerance as any,
        goal: response.data.user.goal,
        balance: response.data.user.balance || 100000,
      };
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    riskTolerance?: string,
    goal?: string
  ) => {
    try {
      const response = await authService.signup({
        name,
        email,
        password,
        passwordConfirm,
        riskTolerance,
        goal,
      });
      const userData: UserProfile = {
        name: response.data.user.name,
        email: response.data.user.email,
        riskTolerance: response.data.user.riskTolerance as any,
        goal: response.data.user.goal,
        balance: response.data.user.balance || 100000,
      };
      setUser(userData);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    isAuthenticated,
    loading,
  }), [user, login, signup, logout, isAuthenticated, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

