// ============================================
// AI Avatar Market - Supabase Data Layer
// 替换原有的文件存储，使用Supabase PostgreSQL
// ============================================

import { supabase, createServiceClient } from '../supabase/client';
import { User, Avatar, Task, Message, Review, Notification, CreatorDashboard } from '../types';

// ============================================
// 用户操作
// ============================================
export const UserDB = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data?.map(this.toUser) || [];
  },

  async getById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return this.toUser(data);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !data) return undefined;
    return this.toUser(data);
  },

  async create(user: Omit<User, 'id' | 'createdAt' | 'wallet' | 'credit'>): Promise<User> {
    const dbUser = {
      email: user.email,
      password: user.password || '',
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      identity: user.identity || [],
      bio: user.bio,
    };

    const { data, error } = await (supabase as any).from('users').insert(dbUser).select().single();
    if (error) throw error;
    return this.toUser(data);
  },

  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.identity !== undefined) dbUpdates.identity = updates.identity;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.wallet?.balance !== undefined) dbUpdates.wallet_balance = updates.wallet.balance;

    const { data, error } = await (supabase as any).from('users').update(dbUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return this.toUser(data);
  },

  // 转换数据库格式为应用格式
  toUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      avatar: data.avatar,
      role: data.role as any,
      identity: data.identity || [],
      bio: data.bio,
      createdAt: data.created_at,
      wallet: {
        balance: data.wallet_balance || 0,
        totalEarned: data.wallet_total_earned || 0,
        totalSpent: data.wallet_total_spent || 0,
      },
      credit: {
        score: data.credit_score || 80,
        asCreator: {
          rating: data.credit_as_creator_rating || 0,
          completedTasks: data.credit_as_creator_completed || 0,
          reviewCount: data.credit_as_creator_review_count || 0,
        },
        asClient: {
          rating: data.credit_as_client_rating || 0,
          postedTasks: data.credit_as_client_posted || 0,
          reviewCount: data.credit_as_client_review_count || 0,
        },
      },
    };
  },
};

// ============================================
// 分身操作
// ============================================
export const AvatarDB = {
  async getAll(): Promise<Avatar[]> {
    const { data, error } = await supabase.from('avatars').select('*');
    if (error) throw error;
    return data?.map(this.toAvatar) || [];
  },

  async getById(id: string): Promise<Avatar | undefined> {
    const { data, error } = await supabase.from('avatars').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return this.toAvatar(data);
  },

  async getByCreator(creatorId: string): Promise<Avatar[]> {
    const { data, error } = await supabase.from('avatars').select('*').eq('creator_id', creatorId);
    if (error) throw error;
    return data?.map(this.toAvatar) || [];
  },

  async getActive(): Promise<Avatar[]> {
    const { data, error } = await supabase.from('avatars').select('*').eq('status', 'active');
    if (error) throw error;
    return data?.map(this.toAvatar) || [];
  },

  async create(avatar: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Avatar> {
    const dbAvatar = {
      creator_id: avatar.creatorId,
      name: avatar.name,
      description: avatar.description,
      avatar_url: avatar.avatar,
      personality_mbti: avatar.personality.mbti,
      personality_communication_style: avatar.personality.communicationStyle,
      personality_proactivity: avatar.personality.proactivity,
      personality_expertise: avatar.personality.expertise,
      memory_soul: avatar.memoryFiles.soul,
      memory_memory: avatar.memoryFiles.memory,
      memory_history: avatar.memoryFiles.history,
      memory_custom: avatar.memoryFiles.custom,
      skills: avatar.skills,
      pricing_type: avatar.pricing.type,
      pricing_per_task_min: avatar.pricing.perTask?.min,
      pricing_per_task_max: avatar.pricing.perTask?.max,
      pricing_per_task_estimate: avatar.pricing.perTask?.estimate,
      pricing_subscription_monthly: avatar.pricing.subscription?.monthly,
      pricing_subscription_yearly: avatar.pricing.subscription?.yearly,
      scope_can_do: avatar.scope.canDo,
      scope_cannot_do: avatar.scope.cannotDo,
      scope_response_time: avatar.scope.responseTime,
      status: avatar.status,
    };

    const { data, error } = await (supabase as any).from('avatars').insert(dbAvatar).select().single();
    if (error) throw error;
    return this.toAvatar(data);
  },

  async update(id: string, updates: Partial<Avatar>): Promise<Avatar | undefined> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.personality) {
      if (updates.personality.mbti !== undefined) dbUpdates.personality_mbti = updates.personality.mbti;
      if (updates.personality.communicationStyle !== undefined) dbUpdates.personality_communication_style = updates.personality.communicationStyle;
      if (updates.personality.proactivity !== undefined) dbUpdates.personality_proactivity = updates.personality.proactivity;
      if (updates.personality.expertise !== undefined) dbUpdates.personality_expertise = updates.personality.expertise;
    }

    const { data, error } = await (supabase as any).from('avatars').update(dbUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return this.toAvatar(data);
  },

  async search(query: string, filters?: { identity?: string; expertise?: string[] }): Promise<Avatar[]> {
    let qb = (supabase as any).from('avatars').select('*').eq('status', 'active');

    if (query) {
      qb = qb.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await qb;
    if (error) throw error;
    return data?.map(this.toAvatar) || [];
  },

  toAvatar(data: any): Avatar {
    return {
      id: data.id,
      creatorId: data.creator_id,
      name: data.name,
      description: data.description,
      avatar: data.avatar_url,
      personality: {
        mbti: data.personality_mbti,
        communicationStyle: data.personality_communication_style,
        proactivity: data.personality_proactivity,
        expertise: data.personality_expertise || [],
      },
      memoryFiles: {
        soul: data.memory_soul,
        memory: data.memory_memory,
        history: data.memory_history || [],
        custom: data.memory_custom || [],
      },
      skills: data.skills || [],
      pricing: {
        type: data.pricing_type,
        perTask: data.pricing_type === 'per_task' ? {
          min: data.pricing_per_task_min,
          max: data.pricing_per_task_max,
          estimate: data.pricing_per_task_estimate,
        } : undefined,
        subscription: data.pricing_type === 'subscription' ? {
          monthly: data.pricing_subscription_monthly,
          yearly: data.pricing_subscription_yearly,
        } : undefined,
      },
      scope: {
        canDo: data.scope_can_do || [],
        cannotDo: data.scope_cannot_do || [],
        responseTime: data.scope_response_time,
      },
      status: data.status,
      stats: {
        hiredCount: data.stats_hired_count || 0,
        completedTasks: data.stats_completed_tasks || 0,
        totalWorkTime: data.stats_total_work_time || 0,
        rating: data.stats_rating || 0,
        reviewCount: data.stats_review_count || 0,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};

// ============================================
// 任务操作
// ============================================
export const TaskDB = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async getById(id: string): Promise<Task | undefined> {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return this.toTask(data);
  },

  async getByClient(clientId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async getByCreator(creatorId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').eq('creator_id', creatorId);
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async getByAvatar(avatarId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').eq('avatar_id', avatarId);
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async getPendingReview(creatorId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*')
      .eq('creator_id', creatorId)
      .eq('status', 'ai_completed');
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async getActive(creatorId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*')
      .eq('creator_id', creatorId)
      .in('status', ['ai_working', 'human_reviewing', 'human_revising', 'delivered']);
    if (error) throw error;
    return data?.map(this.toTask) || [];
  },

  async create(task: Omit<Task, 'id' | 'timeline' | 'workflow'>): Promise<Task> {
    const dbTask = {
      avatar_id: task.avatarId,
      creator_id: task.creatorId,
      client_id: task.clientId,
      title: task.title,
      description: task.description,
      type: task.type,
      price: task.price,
      pricing_type: task.pricingType,
      status: task.status,
    };

    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
    if (error) throw error;
    return this.toTask(data);
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { data, error } = await (supabase as any).from('tasks').update(dbUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return this.toTask(data);
  },

  toTask(data: any): Task {
    return {
      id: data.id,
      avatarId: data.avatar_id,
      creatorId: data.creator_id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      type: data.type,
      price: data.price,
      pricingType: data.pricing_type,
      status: data.status,
      workflow: {
        aiStage: {
          status: data.ai_status,
          startedAt: data.ai_started_at,
          completedAt: data.ai_completed_at,
          messages: [],
          deliverables: data.ai_deliverables || [],
        },
        humanReview: {
          status: data.human_status,
          assignedTo: data.human_assigned_to,
          startedAt: data.human_started_at,
          completedAt: data.human_completed_at,
          reviewNotes: data.human_review_notes,
          revisionNotes: data.human_revision_notes,
        },
        finalDelivery: {
          status: data.final_status,
          deliveredAt: data.final_delivered_at,
          acceptedAt: data.final_accepted_at,
          clientNotes: data.final_client_notes,
        },
      },
      timeline: {
        createdAt: data.timeline_created_at,
        aiCompletedAt: data.timeline_ai_completed_at,
        humanReviewAt: data.timeline_human_review_at,
        deliveredAt: data.timeline_delivered_at,
        completedAt: data.timeline_completed_at,
      },
      payment: {
        status: data.payment_status,
        platformFee: data.payment_platform_fee,
        creatorEarnings: data.payment_creator_earnings,
      },
    };
  },
};

// ============================================
// 消息操作
// ============================================
export const MessageDB = {
  async getByTask(taskId: string): Promise<Message[]> {
    const { data, error } = await supabase.from('messages').select('*').eq('task_id', taskId).order('timestamp');
    if (error) throw error;
    return data?.map(this.toMessage) || [];
  },

  async create(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const dbMessage = {
      task_id: message.taskId,
      role: message.role,
      content: message.content,
      attachments: message.attachments || [],
    };

    const { data, error } = await (supabase as any).from('messages').insert(dbMessage).select().single();
    if (error) throw error;
    return this.toMessage(data);
  },

  toMessage(data: any): Message {
    return {
      id: data.id,
      taskId: data.task_id,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp,
      attachments: data.attachments || [],
    };
  },
};

// ============================================
// 评价操作
// ============================================
export const ReviewDB = {
  async getByTask(taskId: string): Promise<Review | undefined> {
    const { data, error } = await supabase.from('reviews').select('*').eq('task_id', taskId).single();
    if (error || !data) return undefined;
    return this.toReview(data);
  },

  async getByTarget(targetId: string, targetType: 'avatar' | 'client'): Promise<Review[]> {
    const { data, error } = await supabase.from('reviews').select('*')
      .eq('target_id', targetId)
      .eq('target_type', targetType);
    if (error) throw error;
    return data?.map(this.toReview) || [];
  },

  async create(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const dbReview = {
      task_id: review.taskId,
      reviewer_id: review.reviewerId,
      target_id: review.targetId,
      target_type: review.targetType,
      rating: review.rating,
      content: review.content,
      tags: review.tags || [],
    };

    const { data, error } = await (supabase as any).from('reviews').insert(dbReview).select().single();
    if (error) throw error;
    return this.toReview(data);
  },

  toReview(data: any): Review {
    return {
      id: data.id,
      taskId: data.task_id,
      reviewerId: data.reviewer_id,
      targetId: data.target_id,
      targetType: data.target_type,
      rating: data.rating,
      content: data.content,
      tags: data.tags || [],
      createdAt: data.created_at,
    };
  },
};

// ============================================
// 通知操作
// ============================================
export const NotificationDB = {
  async getByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.toNotification) || [];
  },

  async getUnread(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(this.toNotification) || [];
  },

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const dbNotification = {
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      read: notification.read,
      data: notification.data || {},
    };

    const { data, error } = await supabase.from('notifications').insert(dbNotification).select().single();
    if (error) throw error;
    return this.toNotification(data);
  },

  async markAsRead(id: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },

  toNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      content: data.content,
      read: data.read,
      createdAt: data.created_at,
      data: data.data || {},
    };
  },
};

// ============================================
// 仪表盘数据
// ============================================
export const DashboardDB = {
  async getCreatorDashboard(creatorId: string): Promise<CreatorDashboard> {
    const tasks = await TaskDB.getByCreator(creatorId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const todayTasks = tasks.filter(t => t.timeline.createdAt.startsWith(today));
    const weekTasks = tasks.filter(t => t.timeline.createdAt > weekAgo);
    const monthTasks = tasks.filter(t => t.timeline.createdAt > monthAgo);

    const avatars = await AvatarDB.getByCreator(creatorId);

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

// ============================================
// 创作者入驻申请
// ============================================
export const CreatorApplicationDB = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase.from('creator_applications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getByUserId(userId: string): Promise<any | undefined> {
    const { data, error } = await supabase.from('creator_applications').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return undefined;
    return data;
  },

  async create(application: any): Promise<any> {
    const { data, error } = await (supabase as any).from('creator_applications').insert(application).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any): Promise<any | undefined> {
    const { data, error } = await (supabase as any).from('creator_applications').update(updates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return data;
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
  CreatorApplication: CreatorApplicationDB,
};
