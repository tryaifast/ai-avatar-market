/**
 * @jest-environment jsdom
 * 
 * TDD: 全局状态管理测试
 * RED-GREEN-REFACTOR
 */

import { useAppStore, useUserStore, useNotificationStore } from '@/lib/store';

// 重置store状态
const resetStores = () => {
  useAppStore.setState({
    isLoading: false,
    sidebarOpen: true,
    theme: 'light',
    activeModal: null,
  });
  useUserStore.setState({
    isAuthenticated: false,
    user: null,
  });
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
  });
};

describe('UserStore - 用户状态管理', () => {
  beforeEach(resetStores);

  // RED: 测试登录功能
  test('用户应该能够登录', () => {
    const { login } = useUserStore.getState();
    const mockUser = {
      id: '1',
      name: '测试用户',
      email: 'test@example.com',
      type: 'creator' as const,
      avatar: '👤',
      verified: false,
      createdAt: new Date().toISOString(),
    };

    login(mockUser);

    const state = useUserStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  // RED: 测试登出功能
  test('用户应该能够登出', () => {
    const { login, logout } = useUserStore.getState();
    const mockUser = {
      id: '1',
      name: '测试用户',
      email: 'test@example.com',
      type: 'creator' as const,
      avatar: '👤',
      verified: false,
      createdAt: new Date().toISOString(),
    };

    login(mockUser);
    logout();

    const state = useUserStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  // RED: 测试更新用户信息
  test('应该能够更新用户信息', () => {
    const { login, updateUser } = useUserStore.getState();
    const mockUser = {
      id: '1',
      name: '测试用户',
      email: 'test@example.com',
      type: 'creator' as const,
      avatar: '👤',
      verified: false,
      createdAt: new Date().toISOString(),
    };

    login(mockUser);
    updateUser({ name: '更新后的名字' });

    const state = useUserStore.getState();
    expect(state.user?.name).toBe('更新后的名字');
  });
});

describe('NotificationStore - 通知状态管理', () => {
  beforeEach(resetStores);

  // RED: 测试添加通知
  test('应该能够添加通知', () => {
    const { addNotification } = useNotificationStore.getState();

    addNotification({
      type: 'info',
      title: '测试通知',
      message: '这是一条测试通知',
    });

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0].title).toBe('测试通知');
  });

  // RED: 测试标记已读
  test('应该能够标记通知为已读', () => {
    const { addNotification, markAsRead } = useNotificationStore.getState();

    addNotification({ type: 'info', title: '测试', message: '测试消息' });
    const notificationId = useNotificationStore.getState().notifications[0].id;
    
    markAsRead(notificationId);

    const state = useNotificationStore.getState();
    expect(state.notifications[0].read).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  // RED: 测试移除通知
  test('应该能够移除通知', () => {
    const { addNotification, removeNotification } = useNotificationStore.getState();

    addNotification({ type: 'info', title: '测试', message: '测试消息' });
    const notificationId = useNotificationStore.getState().notifications[0].id;
    
    removeNotification(notificationId);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(0);
  });
});

describe('AppStore - 应用状态管理', () => {
  beforeEach(resetStores);

  // RED: 测试侧边栏切换
  test('应该能够切换侧边栏状态', () => {
    const { toggleSidebar } = useAppStore.getState();

    toggleSidebar();

    const state = useAppStore.getState();
    expect(state.sidebarOpen).toBe(false);

    toggleSidebar();
    expect(state.sidebarOpen).toBe(true);
  });

  // RED: 测试加载状态
  test('应该能够设置加载状态', () => {
    const { setLoading } = useAppStore.getState();

    setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);

    setLoading(false);
    expect(useAppStore.getState().isLoading).toBe(false);
  });
});
