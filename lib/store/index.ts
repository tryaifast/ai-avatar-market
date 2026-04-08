import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'creator' | 'client' | 'admin';
  isVerified: boolean;
  onboardingStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
}

// 应用状态
interface AppState {
  // 用户信息
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  
  // UI状态
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // 通知
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAllAsRead: () => void;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      notifications: [],
      
      // Actions
      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        notifications: []
      }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      // 通知管理
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50)
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
    }),
    {
      name: 'ai-avatar-market-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        notifications: state.notifications
      }),
    }
  )
);

// 选择器
export const selectUser = (state: AppState) => state.user;
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated;
export const selectUnreadCount = (state: AppState) => 
  state.notifications.filter(n => !n.read).length;
