// @ts-nocheck
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';

// useAuth 统一使用 Zustand Store 的认证状态
// 关键修复：token 必须使用真正的 JWT token，不能是 userId
// login 方法必须同步 token 到 store

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
  const storeToken = useAuthStore((s) => s.token); // 从 store 读真正的 JWT token
  const storeLogout = useAuthStore((s) => s.logout);

  const login = (token: string, user: any) => {
    // 关键修复：同时设置 user 和 token
    // 之前只 setUser 不存 token，导致 authFetch 读不到 token
    useAuthStore.getState().setUser(user);
    // 直接 set token（setUser 不包含 token 设置）
    useAuthStore.setState({ token, isAuthenticated: true });
  };

  const logout = () => {
    storeLogout();
    // 不强制跳转，让调用方决定
  };

  return (
    <AuthContext.Provider value={{ user: storeUser, token: storeToken, login, logout, isLoading: false }}>
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
