/**
 * @jest-environment jsdom
 * 
 * TDD: Mock数据服务测试
 */

import { mockApi } from '@/lib/mock/data';

describe('Mock API - 用户相关', () => {
  // RED: 测试获取当前用户
  test('getCurrentUser 应该返回用户数据', async () => {
    const user = await mockApi.getCurrentUser();
    
    expect(user).toBeDefined();
    expect(user.id).toBe('user-001');
    expect(user.name).toBe('张明');
    expect(user.email).toBe('zhangming@example.com');
    expect(user.type).toBe('creator');
  });

  // RED: 测试用户登录
  test('login 应该成功验证用户', async () => {
    const result = await mockApi.login('zhangming@example.com', 'password123');
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe('zhangming@example.com');
  });

  // RED: 测试用户注册
  test('register 应该成功创建用户', async () => {
    const result = await mockApi.register({
      name: '新用户',
      email: 'newuser@example.com',
      password: 'password123',
      type: 'client',
    });
    
    expect(result.success).toBe(true);
    expect(result.user.name).toBe('新用户');
    expect(result.user.email).toBe('newuser@example.com');
  });
});

describe('Mock API - AI分身相关', () => {
  // RED: 测试获取AI分身列表
  test('getAvatars 应该返回AI分身列表', async () => {
    const avatars = await mockApi.getAvatars();
    
    expect(Array.isArray(avatars)).toBe(true);
    expect(avatars.length).toBeGreaterThan(0);
    
    const firstAvatar = avatars[0];
    expect(firstAvatar).toHaveProperty('id');
    expect(firstAvatar).toHaveProperty('name');
    expect(firstAvatar).toHaveProperty('title');
    expect(firstAvatar).toHaveProperty('price');
  });

  // RED: 测试根据ID获取AI分身
  test('getAvatarById 应该返回指定AI分身', async () => {
    const avatar = await mockApi.getAvatarById('avatar-001');
    
    expect(avatar).toBeDefined();
    expect(avatar?.id).toBe('avatar-001');
    expect(avatar?.name).toBe('张明');
  });

  // RED: 测试不存在的AI分身
  test('getAvatarById 应该对不存在的ID返回null', async () => {
    const avatar = await mockApi.getAvatarById('non-existent');
    
    expect(avatar).toBeNull();
  });
});

describe('Mock API - 订单相关', () => {
  // RED: 测试获取订单列表
  test('getOrders 应该返回订单列表', async () => {
    const orders = await mockApi.getOrders('user-001');
    
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    
    const firstOrder = orders[0];
    expect(firstOrder).toHaveProperty('id');
    expect(firstOrder).toHaveProperty('status');
    expect(firstOrder).toHaveProperty('amount');
  });

  // RED: 测试创建订单
  test('createOrder 应该成功创建订单', async () => {
    const result = await mockApi.createOrder({
      clientId: 'user-001',
      avatarId: 'avatar-001',
      plan: 'hourly',
      hours: 3,
      requirements: '测试需求',
      amount: 600,
    });
    
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.status).toBe('pending');
    expect(result.order.amount).toBe(600);
  });
});

describe('Mock API - 入驻申请相关', () => {
  // RED: 测试提交入驻申请
  test('submitApplication 应该成功提交申请', async () => {
    const result = await mockApi.submitApplication({
      userId: 'user-001',
      realName: '张明',
      title: '产品经理',
      company: '某科技公司',
      experience: '10年产品经验',
      skills: ['产品设计', '数据分析'],
      bio: '专注于B端产品设计',
      approach: 'platform',
    });
    
    expect(result.success).toBe(true);
    expect(result.application).toBeDefined();
    expect(result.application.status).toBe('pending');
  });

  // RED: 测试获取申请状态
  test('getApplicationStatus 应该返回申请状态', async () => {
    const status = await mockApi.getApplicationStatus('user-001');
    
    expect(status).toBeDefined();
    expect(['pending', 'approved', 'rejected']).toContain(status?.status);
  });
});
