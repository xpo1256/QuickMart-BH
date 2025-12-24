import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loginUser, signupUser, fetchMe, logoutUser, API_BASE } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mapUser = (u: any): User => ({
    id: u?._id ?? u?.id ?? String(u?.id ?? ''),
    name: u?.name ?? u?.fullName ?? '',
    email: u?.email ?? '',
    phone: u?.phone,
    avatar: u?.avatar,
    createdAt: u?.createdAt ? new Date(u.createdAt) : new Date(),
  });

  // Only attempt automatic cookie-based authentication if the user previously
  // chose "remember me". This prevents users from being logged in automatically
  // on every page load unless they explicitly opted in.
  useEffect(() => {
    const remember = localStorage.getItem('auth_remember') === '1';
    if (!remember) return;
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetchMe();
        if (!mounted) return;
        const apiUser = res && (res.user ?? res.data ?? res);
        if (apiUser) setUser(mapUser(apiUser));
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Simulate login (in production, this would call a backend API)
  const login = async (email: string, password: string, remember: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      const apiUser = res && (res.user ?? res.data ?? res);
      if (apiUser) setUser(mapUser(apiUser));
      else throw new Error('Invalid response from server');
      // store remember preference locally so future loads know whether to
      // attempt cookie-based auto-login
      if (remember) localStorage.setItem('auth_remember', '1');
      else localStorage.removeItem('auth_remember');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await signupUser({ name, email, password });
      const apiUser = res && (res.user ?? res.data ?? res);
      if (apiUser) setUser(mapUser(apiUser));
      else throw new Error('Signup failed');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('auth_remember');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('User not authenticated');
    setIsLoading(true);
    try {
      // Persist updates to backend (cookie-based auth)
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('Failed to update profile: ' + txt);
      }
      const j = await res.json();
      const apiUser = j.user ?? j;
      if (apiUser) setUser(mapUser(apiUser));
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
