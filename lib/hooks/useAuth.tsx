// @ts-nocheck
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';

// useAuth 统一使用 Zustand Store 的认证状态
// 不再维护独立的 localStorage user/token

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storeUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeLogout = useAuthStore((s) => s.logout);

  const login = (token: string, user: any) => {
    // Zustand store 的 login 是 (email, password) 模式
    // 这里直接 setUser 同步状态
    useAuthStore.getState().setUser(user);
  };

  const logout = () => {
    storeLogout();
    // 不强制跳转，让调用方决定
  };

  const token = storeUser?.id || null;

  return (
    <AuthContext.Provider value={{ user: storeUser, token, login, logout, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
