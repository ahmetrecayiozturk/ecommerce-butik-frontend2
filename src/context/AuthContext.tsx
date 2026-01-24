"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Remember user on page refresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch user details if token exists
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Invalid token, logging out...", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (token: string, email: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    try {
      // Fetch user details immediately after login
      const response = await api.get('/users/me');
      setUser(response.data);
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      console.error('Failed to fetch user information.', error);
      toast.error('Failed to fetch user information.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
    toast.info('Logged out.');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};