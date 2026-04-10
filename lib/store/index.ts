// ============================================
// AI Avatar Market - Global State Store
// 使用 Zustand + 持久化
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Avatar, Task, Notification } from '../types';

// ============================================
// Auth Store - 用户认证状态
// ============================================
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }

          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      register: async (email, password, name, role = 'client') => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false });
            return { success: false, error: data.error };
          }

          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
          // 这里需要添加更新用户API
          set({ user: { ...user, ...updates } });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ============================================
// Avatar Store - 分身管理
// ============================================
interface AvatarState {
  avatars: Avatar[];
  currentAvatar: Avatar | null;
  isLoading: boolean;

  // Actions
  fetchAvatars: (query?: string) => Promise<void>;
  fetchAvatarById: (id: string) => Promise<void>;
  createAvatar: (data: any) => Promise<{ success: boolean; avatar?: Avatar; error?: string }>;
  updateAvatar: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  setCurrentAvatar: (avatar: Avatar | null) => void;
}

export const useAvatarStore = create<AvatarState>()((set, get) => ({
  avatars: [],
  currentAvatar: null,
  isLoading: false,

  fetchAvatars: async (query?: string) => {
    set({ isLoading: true });
    try {
      const url = query ? `/api/avatars?q=${encodeURIComponent(query)}` : '/api/avatars';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        set({ avatars: data.avatars, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchAvatarById: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/avatars/${id}`);
      const data = await res.json();
      
      if (data.success) {
        set({ currentAvatar: data.avatar, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createAvatar: async (data) => {
    try {
      const res = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({ avatars: [...state.avatars, result.avatar] }));
        return { success: true, avatar: result.avatar };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateAvatar: async (id, data) => {
    try {
      const res = await fetch(`/api/avatars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({
          avatars: state.avatars.map((a) => (a.id === id ? result.avatar : a)),
          currentAvatar: state.currentAvatar?.id === id ? result.avatar : state.currentAvatar,
        }));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  setCurrentAvatar: (avatar) => set({ currentAvatar: avatar }),
}));

// ============================================
// Task Store - 任务管理
// ============================================
interface TaskState {
  tasks: Task[];
  currentTask: (Task & { messages?: any[] }) | null;
  isLoading: boolean;

  // Actions
  fetchTasks: (userId: string, type: 'client' | 'creator') => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<{ success: boolean; task?: Task; error?: string }>;
  updateTask: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (taskId: string, content: string, history?: any[]) => Promise<{ success: boolean; message?: any; error?: string }>;
  processAITask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,

  fetchTasks: async (userId, type) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/tasks?userId=${userId}&type=${type}`);
      const data = await res.json();
      
      if (data.success) {
        set({ tasks: data.tasks, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/tasks/${id}`);
      const data = await res.json();
      
      if (data.success) {
        set({ currentTask: data.task, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({ tasks: [...state.tasks, result.task] }));
        return { success: true, task: result.task };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? result.task : t)),
          currentTask: state.currentTask?.id === id ? result.task : state.currentTask,
        }));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  sendMessage: async (taskId, content, history = []) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, content, history }),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({
          currentTask: state.currentTask ? {
            ...state.currentTask,
            messages: [...(state.currentTask.messages || []), result.message],
          } : null,
        }));
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  processAITask: async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/process`, {
        method: 'POST',
      });

      const result = await res.json();

      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}));

// ============================================
// Creator Application Store - 创作者入驻申请
// ============================================
interface ApplicationState {
  applications: any[];
  myApplication: any | null;
  isLoading: boolean;

  // Actions
  fetchApplications: (status?: string) => Promise<void>;
  fetchMyApplication: (userId: string) => Promise<void>;
  submitApplication: (data: any) => Promise<{ success: boolean; error?: string }>;
  reviewApplication: (id: string, status: string, reviewNotes: string, reviewedBy: string) => Promise<{ success: boolean; error?: string }>;
}

export const useApplicationStore = create<ApplicationState>()((set, get) => ({
  applications: [],
  myApplication: null,
  isLoading: false,

  fetchApplications: async (status) => {
    set({ isLoading: true });
    try {
      const url = status ? `/api/creator-applications?status=${status}` : '/api/creator-applications';
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        set({ applications: data.applications, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchMyApplication: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/creator-applications?userId=${userId}`);
      const data = await res.json();
      
      if (data.success && data.applications.length > 0) {
        set({ myApplication: data.applications[0], isLoading: false });
      } else {
        set({ myApplication: null, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  submitApplication: async (data) => {
    try {
      const res = await fetch('/api/creator-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        set({ myApplication: result.application });
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  reviewApplication: async (id, status, reviewNotes, reviewedBy) => {
    try {
      const res = await fetch(`/api/creator-applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes, reviewedBy }),
      });

      const result = await res.json();

      if (result.success) {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? result.application : app
          ),
        }));
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}));

// ============================================
// App Store - 综合应用状态（兼容旧代码）
// ============================================
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
