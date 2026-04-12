// ============================================
// AI分身市场 - 核心类型定义
// ============================================

// 用户身份
export type UserRole = 'creator' | 'client' | 'both' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string; // 加密后的密码
  name: string;
  avatar?: string;
  role: UserRole;
  identity: IdentityTag[]; // 身份标签：程序员、设计师、运营等
  bio?: string;
  createdAt: string;
  onboardingStatus?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'banned'; // 创作者入驻状态
  membershipType?: 'free' | 'yearly' | 'lifetime'; // 会员类型
  membershipExpiresAt?: string; // 年费会员到期时间
  wallet: {
    balance: number; // 余额（分）
    totalEarned: number; // 累计收益
    totalSpent: number; // 累计消费
  };
  credit: {
    score: number; // 信用分 0-100
    asCreator: {
      rating: number; // 评分 1-5
      completedTasks: number;
      reviewCount: number;
    };
    asClient: {
      rating: number;
      postedTasks: number;
      reviewCount: number;
    };
  };
}

export type IdentityTag = 
  | '程序员' | '产品经理' | '设计师' | '运营' | '市场' 
  | '医生' | '律师' | '教师' | '咨询顾问' | '作家'
  | '翻译' | '数据分析师' | '财务' | 'HR' | '管理员' | '其他';

// AI分身
export interface Avatar {
  id: string;
  creatorId: string;
  name: string; // 分身名称
  description: string; // 简介
  avatar: string; // 头像URL
  
  // 人格配置
  personality: {
    mbti?: string; // MBTI类型
    communicationStyle: 'professional' | 'friendly' | 'humorous' | 'concise' | 'detailed';
    proactivity: number; // 主动性 1-10
    expertise: string[]; // 专业领域
  };
  
  // 记忆文件（B方案：存储路径；A方案：存储内容）
  memoryFiles: {
    soul?: string; // SOUL.md 路径或内容
    memory?: string; // MEMORY.md 路径或内容
    history?: string[]; // 历史对话文件路径
    custom?: string[]; // 自定义知识文件
  };
  
  // 技能绑定
  skills: string[]; // 绑定的Skill ID列表
  
  // 定价
  pricing: {
    type: 'per_task' | 'subscription';
    perTask?: {
      min: number; // 最低价格（分）
      max: number; // 最高价格（分）
      estimate: string; // 估价说明
    };
    subscription?: {
      monthly: number; // 月订阅价格（分）
      yearly: number; // 年订阅价格（分）
    };
  };
  
  // 工作范围
  scope: {
    canDo: string[]; // 能做什么
    cannotDo: string[]; // 不能做什么
    responseTime: string; // 响应时间承诺
  };
  
  // 状态
  status: 'draft' | 'reviewing' | 'active' | 'paused' | 'rejected' | 'banned';
  
  // 统计
  stats: {
    hiredCount: number; // 被雇佣次数
    completedTasks: number; // 完成任务数
    totalWorkTime: number; // 累计工作时长（分钟）
    rating: number; // 评分
    reviewCount: number; // 评价数
  };
  
  createdAt: string;
  updatedAt: string;
}

// 任务/雇佣
export interface Task {
  id: string;
  avatarId: string;
  creatorId: string; // 分身创作者ID
  clientId: string; // 雇佣者ID
  
  // 任务信息
  title: string;
  description: string;
  type: 'chat' | 'document' | 'code' | 'design' | 'analysis' | 'other';
  
  // 定价
  price: number; // 价格（分）
  pricingType: 'fixed' | 'estimate';
  
  // 状态流转
  status: TaskStatus;
  
  // 人机协同工作流
  workflow: {
    // AI工作阶段
    aiStage: {
      status: 'pending' | 'working' | 'completed' | 'failed';
      startedAt?: string;
      completedAt?: string;
      messages: Message[];
      deliverables: Deliverable[];
    };
    
    // 真人审核阶段
    humanReview: {
      status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'revised';
      assignedTo?: string; // 分配给哪个真人
      startedAt?: string;
      completedAt?: string;
      reviewNotes?: string;
      revisionNotes?: string;
    };
    
    // 最终交付
    finalDelivery: {
      status: 'pending' | 'delivered' | 'accepted' | 'disputed';
      deliveredAt?: string;
      acceptedAt?: string;
      clientNotes?: string;
    };
  };
  
  // 时间线
  timeline: {
    createdAt: string;
    aiCompletedAt?: string;
    humanReviewAt?: string;
    deliveredAt?: string;
    completedAt?: string;
  };
  
  // 支付
  payment: {
    status: 'pending' | 'held' | 'released' | 'refunded';
    platformFee: number; // 平台抽成（分）
    creatorEarnings: number; // 创作者收益（分）
  };
}

export type TaskStatus = 
  | 'pending' // 待AI处理
  | 'ai_working' // AI工作中
  | 'ai_completed' // AI完成，待真人审核
  | 'human_reviewing' // 真人审核中
  | 'human_revising' // 真人修改中
  | 'delivered' // 已交付
  | 'accepted' // 客户已确认
  | 'disputed' // 有争议
  | 'completed' // 已完成
  | 'cancelled'; // 已取消

// 消息
export interface Message {
  id: string;
  taskId: string;
  role: 'system' | 'ai' | 'client' | 'human_creator';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

// 交付物
export interface Deliverable {
  id: string;
  taskId: string;
  type: 'text' | 'file' | 'code' | 'link' | 'image';
  content: string;
  description?: string;
  createdAt: string;
  createdBy: 'ai' | 'human';
}

// 附件
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// 评价
export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  targetId: string; // 被评价对象（avatar或client）
  targetType: 'avatar' | 'client';
  rating: number; // 1-5
  content: string;
  tags?: string[];
  createdAt: string;
}

// 通知
export interface Notification {
  id: string;
  userId: string;
  type: 'task_new' | 'task_ai_completed' | 'task_human_review' | 'task_delivered' | 'task_completed' | 'payment_received' | 'review_received';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

// 创作者仪表盘数据
export interface CreatorDashboard {
  today: {
    earnings: number;
    tasks: number;
    newHires: number;
  };
  thisWeek: {
    earnings: number;
    tasks: number;
    workTime: number;
  };
  thisMonth: {
    earnings: number;
    tasks: number;
  };
  pendingReviews: number; // 待审核任务数
  activeTasks: number; // 进行中任务数
  topAvatars: {
    avatarId: string;
    name: string;
    earnings: number;
    tasks: number;
  }[];
}
