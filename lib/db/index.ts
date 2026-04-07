// ============================================
// AI分身市场 - 数据层
// B方案：本地JSON文件存储（创作者自托管）
// 预留A方案迁移接口（未来切换到PostgreSQL）
// ============================================

import { User, Avatar, Task, Message, Review, Notification, CreatorDashboard } from '../types';
import fs from 'fs';
import path from 'path';

// 数据目录
const DATA_DIR = path.join(process.cwd(), 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// JSON文件路径
const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  avatars: path.join(DATA_DIR, 'avatars.json'),
  tasks: path.join(DATA_DIR, 'tasks.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
  notifications: path.join(DATA_DIR, 'notifications.json'),
};

// 初始化文件
function initFile<T>(filepath: string, defaultValue: T[]): T[] {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

// 读取数据
function readData<T>(filepath: string, defaultValue: T[]): T[] {
  return initFile(filepath, defaultValue);
}

// 写入数据
function writeData<T>(filepath: string, data: T[]): void {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// ============================================
// 用户操作
// ============================================
export const UserDB = {
  getAll(): User[] {
    return readData(FILES.users, []);
  },
  
  getById(id: string): User | undefined {
    return this.getAll().find(u => u.id === id);
  },
  
  getByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email === email);
  },
  
  create(user: Omit<User, 'id' | 'createdAt' | 'wallet' | 'credit'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      wallet: { balance: 0, totalEarned: 0, totalSpent: 0 },
      credit: {
        score: 80,
        asCreator: { rating: 0, completedTasks: 0, reviewCount: 0 },
        asClient: { rating: 0, postedTasks: 0, reviewCount: 0 },
      },
    };
    users.push(newUser);
    writeData(FILES.users, users);
    return newUser;
  },
  
  update(id: string, updates: Partial<User>): User | undefined {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    writeData(FILES.users, users);
    return users[index];
  },
};

// ============================================
// 分身操作
// ============================================
export const AvatarDB = {
  getAll(): Avatar[] {
    return readData(FILES.avatars, []);
  },
  
  getById(id: string): Avatar | undefined {
    return this.getAll().find(a => a.id === id);
  },
  
  getByCreator(creatorId: string): Avatar[] {
    return this.getAll().filter(a => a.creatorId === creatorId);
  },
  
  getActive(): Avatar[] {
    return this.getAll().filter(a => a.status === 'active');
  },
  
  create(avatar: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Avatar {
    const avatars = this.getAll();
    const newAvatar: Avatar = {
      ...avatar,
      id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        hiredCount: 0,
        completedTasks: 0,
        totalWorkTime: 0,
        rating: 0,
        reviewCount: 0,
      },
    };
    avatars.push(newAvatar);
    writeData(FILES.avatars, avatars);
    return newAvatar;
  },
  
  update(id: string, updates: Partial<Avatar>): Avatar | undefined {
    const avatars = this.getAll();
    const index = avatars.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    avatars[index] = { 
      ...avatars[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    writeData(FILES.avatars, avatars);
    return avatars[index];
  },
  
  search(query: string, filters?: { identity?: string; expertise?: string[] }): Avatar[] {
    let results = this.getActive();
    
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.personality.expertise.some(e => e.toLowerCase().includes(q))
      );
    }
    
    if (filters?.identity) {
      // 通过creator的identity过滤
      const users = UserDB.getAll();
      const creatorIds = users
        .filter(u => u.identity.includes(filters.identity as any))
        .map(u => u.id);
      results = results.filter(a => creatorIds.includes(a.creatorId));
    }
    
    if (filters?.expertise?.length) {
      results = results.filter(a => 
        filters.expertise!.some(e => a.personality.expertise.includes(e))
      );
    }
    
    return results;
  },
};

// ============================================
// 任务操作
// ============================================
export const TaskDB = {
  getAll(): Task[] {
    return readData(FILES.tasks, []);
  },
  
  getById(id: string): Task | undefined {
    return this.getAll().find(t => t.id === id);
  },
  
  getByClient(clientId: string): Task[] {
    return this.getAll().filter(t => t.clientId === clientId);
  },
  
  getByCreator(creatorId: string): Task[] {
    return this.getAll().filter(t => t.creatorId === creatorId);
  },
  
  getByAvatar(avatarId: string): Task[] {
    return this.getAll().filter(t => t.avatarId === avatarId);
  },
  
  getPendingReview(creatorId: string): Task[] {
    return this.getAll().filter(t => 
      t.creatorId === creatorId && 
      t.status === 'ai_completed'
    );
  },
  
  getActive(creatorId: string): Task[] {
    return this.getAll().filter(t => 
      t.creatorId === creatorId && 
      ['ai_working', 'human_reviewing', 'human_revising', 'delivered'].includes(t.status)
    );
  },
  
  create(task: Omit<Task, 'id' | 'timeline' | 'workflow'>): Task {
    const tasks = this.getAll();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timeline: {
        createdAt: now,
      },
      workflow: {
        aiStage: {
          status: 'pending',
          messages: [],
          deliverables: [],
        },
        humanReview: {
          status: 'pending',
        },
        finalDelivery: {
          status: 'pending',
        },
      },
    };
    tasks.push(newTask);
    writeData(FILES.tasks, tasks);
    return newTask;
  },
  
  update(id: string, updates: Partial<Task>): Task | undefined {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    tasks[index] = { ...tasks[index], ...updates };
    writeData(FILES.tasks, tasks);
    return tasks[index];
  },
};

// ============================================
// 消息操作
// ============================================
export const MessageDB = {
  getByTask(taskId: string): Message[] {
    return readData(FILES.messages, []).filter(m => m.taskId === taskId);
  },
  
  create(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const messages = readData(FILES.messages, []);
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    writeData(FILES.messages, messages);
    return newMessage;
  },
};

// ============================================
// 评价操作
// ============================================
export const ReviewDB = {
  getByTask(taskId: string): Review | undefined {
    return readData(FILES.reviews, []).find(r => r.taskId === taskId);
  },
  
  getByTarget(targetId: string, targetType: 'avatar' | 'client'): Review[] {
    return readData(FILES.reviews, []).filter(r => 
      r.targetId === targetId && r.targetType === targetType
    );
  },
  
  create(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = readData(FILES.reviews, []);
    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    writeData(FILES.reviews, reviews);
    return newReview;
  },
};

// ============================================
// 通知操作
// ============================================
export const NotificationDB = {
  getByUser(userId: string): Notification[] {
    return readData(FILES.notifications, [])
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getUnread(userId: string): Notification[] {
    return this.getByUser(userId).filter(n => !n.read);
  },
  
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = readData(FILES.notifications, []);
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    writeData(FILES.notifications, notifications);
    return newNotification;
  },
  
  markAsRead(id: string): void {
    const notifications = readData(FILES.notifications, []);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      writeData(FILES.notifications, notifications);
    }
  },
};

// ============================================
// 仪表盘数据（计算生成）
// ============================================
export const DashboardDB = {
  getCreatorDashboard(creatorId: string): CreatorDashboard {
    const tasks = TaskDB.getByCreator(creatorId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const todayTasks = tasks.filter(t => t.timeline.createdAt.startsWith(today));
    const weekTasks = tasks.filter(t => t.timeline.createdAt > weekAgo);
    const monthTasks = tasks.filter(t => t.timeline.createdAt > monthAgo);
    
    const avatars = AvatarDB.getByCreator(creatorId);
    
    return {
      today: {
        earnings: todayTasks.reduce((sum, t) => sum + t.payment.creatorEarnings, 0),
        tasks: todayTasks.length,
        newHires: todayTasks.filter(t => t.status === 'pending').length,
      },
      thisWeek: {
        earnings: weekTasks.reduce((sum, t) => sum + t.payment.creatorEarnings, 0),
        tasks: weekTasks.length,
        workTime: weekTasks.reduce((sum, t) => sum + (t.workflow.aiStage.completedAt ? 30 : 0), 0),
      },
      thisMonth: {
        earnings: monthTasks.reduce((sum, t) => sum + t.payment.creatorEarnings, 0),
        tasks: monthTasks.length,
      },
      pendingReviews: tasks.filter(t => t.status === 'ai_completed').length,
      activeTasks: tasks.filter(t => 
        ['ai_working', 'human_reviewing', 'human_revising', 'delivered'].includes(t.status)
      ).length,
      topAvatars: avatars
        .map(a => ({
          avatarId: a.id,
          name: a.name,
          earnings: tasks
            .filter(t => t.avatarId === a.id && t.payment.status === 'released')
            .reduce((sum, t) => sum + t.payment.creatorEarnings, 0),
          tasks: tasks.filter(t => t.avatarId === a.id && t.status === 'completed').length,
        }))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5),
    };
  },
};

// 导出统一接口
export const DB = {
  User: UserDB,
  Avatar: AvatarDB,
  Task: TaskDB,
  Message: MessageDB,
  Review: ReviewDB,
  Notification: NotificationDB,
  Dashboard: DashboardDB,
};