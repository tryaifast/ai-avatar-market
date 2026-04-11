// ============================================
// AI分身市场 - Mock数据服务
// ============================================

import { User } from '@/lib/types';

// ============================================
// 1. 用户数据
// ============================================

export let mockUsers: User[] = [
  {
    id: '1',
    email: 'creator@example.com',
    name: '张三',
    role: 'creator',
    isVerified: true,
    onboardingStatus: 'approved',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    email: 'client@example.com',
    name: '李四',
    role: 'client',
    isVerified: false,
    onboardingStatus: 'pending',
    createdAt: '2024-03-20',
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: '管理员',
    role: 'admin',
    isVerified: true,
    onboardingStatus: 'approved',
    createdAt: '2024-01-01',
  },
];

// 添加新用户到mockUsers
export function addMockUser(user: User) {
  mockUsers.push(user);
}

// ============================================
// 2. AI分身数据
// ============================================

export interface Avatar {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  avatar: string;
  category: string;
  tags: string[];
  pricePerHour: number;
  pricePerTask: number;
  rating: number;
  reviewCount: number;
  hireCount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';
  expertise: string[];
  canDo: string[];
  cannotDo: string[];
  createdAt: string;
  views: number;
  earnings: number;
}

export const mockAvatars: Avatar[] = [
  {
    id: '1',
    name: '产品经理小助手',
    description: '10年产品经验，擅长需求分析、原型设计、用户研究',
    creatorId: '1',
    creatorName: '张三',
    avatar: '',
    category: '产品',
    tags: ['产品经理', '需求分析', '原型设计', '用户研究'],
    pricePerHour: 200,
    pricePerTask: 500,
    rating: 4.9,
    reviewCount: 128,
    hireCount: 256,
    status: 'approved',
    expertise: ['产品设计', '需求分析', '用户研究', '数据分析'],
    canDo: ['产品需求文档撰写', '竞品分析', '用户访谈', '原型设计'],
    cannotDo: ['实际编程开发', 'UI视觉设计'],
    createdAt: '2024-02-01',
    views: 5000,
    earnings: 45000,
  },
  {
    id: '2',
    name: '法律顾问AI',
    description: '资深律师，专注民商事诉讼、合同审查',
    creatorId: '1',
    creatorName: '张三',
    avatar: '',
    category: '法律',
    tags: ['法律顾问', '合同审查', '民商事诉讼'],
    pricePerHour: 500,
    pricePerTask: 2000,
    rating: 4.8,
    reviewCount: 86,
    hireCount: 172,
    status: 'approved',
    expertise: ['民商事法律', '合同法', '公司法', '劳动法'],
    canDo: ['合同审查', '法律咨询', '诉讼策略', '风险评估'],
    cannotDo: ['出庭代理', '签署法律文件'],
    createdAt: '2024-02-15',
    views: 3200,
    earnings: 68000,
  },
  {
    id: '3',
    name: '市场营销专家',
    description: '8年品牌营销经验，擅长内容策划、社媒运营',
    creatorId: '1',
    creatorName: '张三',
    avatar: '',
    category: '营销',
    tags: ['品牌营销', '内容策划', '社媒运营'],
    pricePerHour: 150,
    pricePerTask: 300,
    rating: 4.7,
    reviewCount: 64,
    hireCount: 128,
    status: 'pending',
    expertise: ['品牌营销', '内容策划', '社媒运营', '数据分析'],
    canDo: ['营销方案策划', '内容创作', '社媒运营', '数据分析'],
    cannotDo: ['广告投放执行', '线下活动执行'],
    createdAt: '2024-03-10',
    views: 1500,
    earnings: 0,
  },
  {
    id: '4',
    name: '前端开发助手',
    description: '精通React/Vue/Node.js，5年全栈开发经验',
    creatorId: '1',
    creatorName: '张三',
    avatar: '',
    category: '技术',
    tags: ['前端开发', 'React', 'Vue', 'Node.js'],
    pricePerHour: 300,
    pricePerTask: 1000,
    rating: 4.9,
    reviewCount: 156,
    hireCount: 312,
    status: 'approved',
    expertise: ['前端开发', 'React', 'Vue', 'Node.js', 'TypeScript'],
    canDo: ['代码审查', '技术方案', 'Bug排查', '性能优化'],
    cannotDo: ['直接访问您的代码库', '执行代码部署'],
    createdAt: '2024-01-20',
    views: 8000,
    earnings: 92000,
  },
  {
    id: '5',
    name: '财务顾问AI',
    description: '注册会计师，擅长财务报表分析、税务筹划',
    creatorId: '1',
    creatorName: '张三',
    avatar: '',
    category: '财务',
    tags: ['财务顾问', '税务筹划', '报表分析'],
    pricePerHour: 400,
    pricePerTask: 1500,
    rating: 4.8,
    reviewCount: 92,
    hireCount: 184,
    status: 'approved',
    expertise: ['财务管理', '税务筹划', '报表分析', '预算管理'],
    canDo: ['财务分析', '税务咨询', '报表解读', '预算规划'],
    cannotDo: ['代做账', '代报税', '出具审计报告'],
    createdAt: '2024-02-28',
    views: 2800,
    earnings: 56000,
  },
];

// ============================================
// 3. 订单数据
// ============================================

export interface Order {
  id: string;
  avatarId: string;
  avatarName: string;
  clientId: string;
  clientName: string;
  creatorId: string;
  type: 'hourly' | 'perTask' | 'project';
  status: 'pending' | 'paid' | 'inProgress' | 'completed' | 'cancelled';
  amount: number;
  duration?: number;
  taskCount?: number;
  projectDescription: string;
  createdAt: string;
  paidAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    avatarId: '1',
    avatarName: '产品经理小助手',
    clientId: '2',
    clientName: '李四',
    creatorId: '1',
    type: 'hourly',
    status: 'inProgress',
    amount: 600,
    duration: 3,
    projectDescription: '协助完成新产品的需求分析和原型设计',
    createdAt: '2024-04-01T10:00:00Z',
    paidAt: '2024-04-01T10:05:00Z',
    startedAt: '2024-04-01T10:10:00Z',
  },
  {
    id: 'ORD-002',
    avatarId: '2',
    avatarName: '法律顾问AI',
    clientId: '2',
    clientName: '李四',
    creatorId: '1',
    type: 'perTask',
    status: 'completed',
    amount: 2000,
    taskCount: 1,
    projectDescription: '审查合作协议，提供法律风险评估',
    createdAt: '2024-03-25T14:00:00Z',
    paidAt: '2024-03-25T14:05:00Z',
    startedAt: '2024-03-25T14:10:00Z',
    completedAt: '2024-03-26T10:00:00Z',
  },
  {
    id: 'ORD-003',
    avatarId: '4',
    avatarName: '前端开发助手',
    clientId: '2',
    clientName: '李四',
    creatorId: '1',
    type: 'project',
    status: 'pending',
    amount: 5000,
    projectDescription: '技术架构咨询和代码审查服务',
    createdAt: '2024-04-08T09:00:00Z',
  },
];

// ============================================
// 4. 入驻申请数据
// ============================================

export interface Application {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  profession: string;
  company: string;
  experience: string;
  skills: string[];
  bio: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export const mockApplications: Application[] = [
  {
    id: 'APP-001',
    userId: '1',
    userName: '张三',
    email: 'creator@example.com',
    phone: '13800138000',
    profession: '产品经理',
    company: '某互联网公司',
    experience: '10年产品设计经验，主导过多个百万级用户产品',
    skills: ['产品设计', '需求分析', '用户研究', '数据分析'],
    bio: '专注用户体验和产品增长，擅长从0到1打造产品',
    status: 'approved',
    reviewNote: '经验丰富，通过审核',
    submittedAt: '2024-01-10',
    reviewedAt: '2024-01-12',
  },
  {
    id: 'APP-002',
    userId: '4',
    userName: '王五',
    email: 'wangwu@example.com',
    phone: '13900139000',
    profession: '前端工程师',
    company: '某科技公司',
    experience: '5年前端开发经验，精通React生态',
    skills: ['React', 'TypeScript', 'Node.js', '前端架构'],
    bio: '热爱技术分享，专注前端工程化和性能优化',
    status: 'pending',
    submittedAt: '2024-04-08',
  },
];

// ============================================
// 5. 交易/财务数据
// ============================================

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'income' | 'withdraw' | 'refund' | 'platform_fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  orderId?: string;
  createdAt: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    userId: '1',
    userName: '张三',
    type: 'income',
    amount: 570,
    status: 'completed',
    description: '订单收入 - 产品经理小助手',
    orderId: 'ORD-001',
    createdAt: '2024-04-01T10:05:00Z',
  },
  {
    id: 'TXN-002',
    userId: '1',
    userName: '张三',
    type: 'platform_fee',
    amount: -30,
    status: 'completed',
    description: '平台服务费 (5%)',
    orderId: 'ORD-001',
    createdAt: '2024-04-01T10:05:00Z',
  },
  {
    id: 'TXN-003',
    userId: '1',
    userName: '张三',
    type: 'withdraw',
    amount: -5000,
    status: 'completed',
    description: '提现到支付宝',
    createdAt: '2024-03-30T15:00:00Z',
  },
  {
    id: 'TXN-004',
    userId: '1',
    userName: '张三',
    type: 'income',
    amount: 1900,
    status: 'completed',
    description: '订单收入 - 法律顾问AI',
    orderId: 'ORD-002',
    createdAt: '2024-03-25T14:05:00Z',
  },
];

// ============================================
// 6. 消息数据
// ============================================

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
  createdAt: string;
}

export const mockMessages: Message[] = [
  {
    id: 'MSG-001',
    senderId: '2',
    senderName: '李四',
    receiverId: '1',
    receiverName: '张三',
    content: '你好，我想咨询一下产品经理服务',
    type: 'text',
    read: true,
    createdAt: '2024-04-01T09:00:00Z',
  },
  {
    id: 'MSG-002',
    senderId: '1',
    senderName: '张三',
    receiverId: '2',
    receiverName: '李四',
    content: '您好，请问有什么具体需求？',
    type: 'text',
    read: true,
    createdAt: '2024-04-01T09:05:00Z',
  },
  {
    id: 'MSG-003',
    senderId: '2',
    senderName: '李四',
    receiverId: '1',
    receiverName: '张三',
    content: '我需要做一个新产品的需求分析',
    type: 'text',
    read: false,
    createdAt: '2024-04-01T09:10:00Z',
  },
];

// ============================================
// 7. 统计数据
// ============================================

export const mockStats = {
  // 平台概览
  overview: {
    totalUsers: 1256,
    totalCreators: 328,
    totalClients: 928,
    totalAvatars: 512,
    totalOrders: 1847,
    totalRevenue: 456780,
    todayRevenue: 5680,
    todayOrders: 23,
  },
  
  // 今日实时数据
  today: {
    pv: 5680,
    uv: 2340,
    newUsers: 45,
    newApplications: 12,
    newOrders: 23,
    onlineUsers: 128,
  },
  
  // 趋势数据（近7天）
  trends: {
    dates: ['04-02', '04-03', '04-04', '04-05', '04-06', '04-07', '04-08'],
    visitors: [3200, 3500, 3800, 4200, 4500, 5200, 5680],
    orders: [18, 22, 19, 25, 28, 30, 23],
    revenue: [4200, 5800, 4900, 6800, 7500, 8900, 5680],
  },
  
  // 分类分布
  categories: [
    { name: '技术', count: 128, percentage: 25 },
    { name: '产品', count: 96, percentage: 18.7 },
    { name: '设计', count: 85, percentage: 16.6 },
    { name: '营销', count: 72, percentage: 14.1 },
    { name: '法律', count: 48, percentage: 9.4 },
    { name: '财务', count: 42, percentage: 8.2 },
    { name: '其他', count: 41, percentage: 8 },
  ],
};

// ============================================
// 8. 分类数据
// ============================================

export const categories = [
  { id: 'tech', name: '技术', icon: 'Code', description: '开发、架构、技术咨询' },
  { id: 'product', name: '产品', icon: 'Lightbulb', description: '产品设计、需求分析' },
  { id: 'design', name: '设计', icon: 'Palette', description: 'UI/UX、视觉设计' },
  { id: 'marketing', name: '营销', icon: 'TrendingUp', description: '品牌营销、内容运营' },
  { id: 'legal', name: '法律', icon: 'Scale', description: '法律咨询、合同审查' },
  { id: 'finance', name: '财务', icon: 'Calculator', description: '财务顾问、税务筹划' },
  { id: 'hr', name: '人力', icon: 'Users', description: '招聘、培训、组织发展' },
  { id: 'consulting', name: '咨询', icon: 'Briefcase', description: '管理咨询、战略规划' },
];

// ============================================
// Mock API 函数
// ============================================

// 延迟模拟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有分身
export async function getAvatars(): Promise<Avatar[]> {
  await delay(300);
  return mockAvatars.filter(a => a.status === 'approved');
}

// 获取分身详情
export async function getAvatarById(id: string): Promise<Avatar | undefined> {
  await delay(200);
  return mockAvatars.find(a => a.id === id);
}

// 获取推荐分身
export async function getRecommendedAvatars(limit: number = 4): Promise<Avatar[]> {
  await delay(300);
  return mockAvatars
    .filter(a => a.status === 'approved')
    .sort((a, b) => b.hireCount - a.hireCount)
    .slice(0, limit);
}

// 获取用户订单
export async function getUserOrders(userId: string): Promise<Order[]> {
  await delay(400);
  return mockOrders.filter(o => o.clientId === userId || o.creatorId === userId);
}

// 获取用户交易记录
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  await delay(300);
  return mockTransactions.filter(t => t.userId === userId);
}

// 获取用户消息
export async function getUserMessages(userId: string): Promise<Message[]> {
  await delay(200);
  return mockMessages.filter(m => m.senderId === userId || m.receiverId === userId);
}

// 搜索分身
export async function searchAvatars(query: string): Promise<Avatar[]> {
  await delay(500);
  const lowerQuery = query.toLowerCase();
  return mockAvatars.filter(a => 
    a.status === 'approved' && (
      a.name.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  );
}

// 获取统计数据
export async function getStats() {
  await delay(300);
  return mockStats;
}

// 登录验证
export async function login(email: string, password: string): Promise<User | null> {
  await delay(800);
  const user = mockUsers.find(u => u.email === email);
  return user || null;
}
