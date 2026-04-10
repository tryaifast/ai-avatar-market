-- ============================================
-- AI Avatar Market - Supabase Database Schema
-- ============================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- bcrypt加密
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'client', -- 'creator', 'client', 'both'
    identity TEXT[] DEFAULT '{}', -- 身份标签数组
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 钱包
    wallet_balance INTEGER DEFAULT 0, -- 余额（分）
    wallet_total_earned INTEGER DEFAULT 0,
    wallet_total_spent INTEGER DEFAULT 0,
    
    -- 信用
    credit_score INTEGER DEFAULT 80, -- 0-100
    credit_as_creator_rating NUMERIC(2,1) DEFAULT 0, -- 1-5
    credit_as_creator_completed INTEGER DEFAULT 0,
    credit_as_creator_review_count INTEGER DEFAULT 0,
    credit_as_client_rating NUMERIC(2,1) DEFAULT 0,
    credit_as_client_posted INTEGER DEFAULT 0,
    credit_as_client_review_count INTEGER DEFAULT 0
);

-- ============================================
-- AI分身表
-- ============================================
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    avatar_url TEXT, -- 头像URL（Base64或COS）
    
    -- 人格配置
    personality_mbti TEXT,
    personality_communication_style TEXT DEFAULT 'friendly', -- 'professional', 'friendly', 'humorous', 'concise', 'detailed'
    personality_proactivity INTEGER DEFAULT 5, -- 1-10
    personality_expertise TEXT[] DEFAULT '{}',
    
    -- 记忆文件（存储文本内容或URL）
    memory_soul TEXT,
    memory_memory TEXT,
    memory_history TEXT[] DEFAULT '{}',
    memory_custom TEXT[] DEFAULT '{}',
    
    -- 技能绑定
    skills TEXT[] DEFAULT '{}',
    
    -- 定价
    pricing_type TEXT DEFAULT 'per_task', -- 'per_task', 'subscription'
    pricing_per_task_min INTEGER,
    pricing_per_task_max INTEGER,
    pricing_per_task_estimate TEXT,
    pricing_subscription_monthly INTEGER,
    pricing_subscription_yearly INTEGER,
    
    -- 工作范围
    scope_can_do TEXT[] DEFAULT '{}',
    scope_cannot_do TEXT[] DEFAULT '{}',
    scope_response_time TEXT,
    
    -- 状态
    status TEXT DEFAULT 'draft', -- 'draft', 'reviewing', 'active', 'paused', 'banned'
    
    -- 统计
    stats_hired_count INTEGER DEFAULT 0,
    stats_completed_tasks INTEGER DEFAULT 0,
    stats_total_work_time INTEGER DEFAULT 0, -- 分钟
    stats_rating NUMERIC(2,1) DEFAULT 0,
    stats_review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 任务表
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id),
    client_id UUID NOT NULL REFERENCES users(id),
    
    -- 任务信息
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'chat', -- 'chat', 'document', 'code', 'design', 'analysis', 'other'
    
    -- 定价
    price INTEGER NOT NULL, -- 价格（分）
    pricing_type TEXT DEFAULT 'estimate', -- 'fixed', 'estimate'
    
    -- 状态
    status TEXT DEFAULT 'pending', -- 详见types定义
    
    -- AI工作阶段
    ai_status TEXT DEFAULT 'pending', -- 'pending', 'working', 'completed', 'failed'
    ai_started_at TIMESTAMP WITH TIME ZONE,
    ai_completed_at TIMESTAMP WITH TIME ZONE,
    ai_deliverables JSONB DEFAULT '[]'::jsonb,
    
    -- 真人审核阶段
    human_status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected', 'revised'
    human_assigned_to UUID REFERENCES users(id),
    human_started_at TIMESTAMP WITH TIME ZONE,
    human_completed_at TIMESTAMP WITH TIME ZONE,
    human_review_notes TEXT,
    human_revision_notes TEXT,
    
    -- 最终交付
    final_status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'accepted', 'disputed'
    final_delivered_at TIMESTAMP WITH TIME ZONE,
    final_accepted_at TIMESTAMP WITH TIME ZONE,
    final_client_notes TEXT,
    
    -- 时间线
    timeline_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timeline_ai_completed_at TIMESTAMP WITH TIME ZONE,
    timeline_human_review_at TIMESTAMP WITH TIME ZONE,
    timeline_delivered_at TIMESTAMP WITH TIME ZONE,
    timeline_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 支付
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'held', 'released', 'refunded'
    payment_platform_fee INTEGER DEFAULT 0,
    payment_creator_earnings INTEGER DEFAULT 0
);

-- ============================================
-- 消息表
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'system', 'ai', 'client', 'human_creator'
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attachments JSONB DEFAULT '[]'::jsonb -- {name, type, size, url}数组
);

-- ============================================
-- 评价表
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL REFERENCES users(id),
    target_type TEXT NOT NULL, -- 'avatar', 'client'
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 通知表
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'task_new', 'task_ai_completed', 'task_human_review', 'task_delivered', 'task_completed', 'payment_received', 'review_received'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}'::jsonb, -- 额外数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 创作者入驻申请表
-- ============================================
CREATE TABLE creator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    real_name TEXT NOT NULL,
    id_number TEXT, -- 身份证号（加密存储）
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    profession TEXT NOT NULL,
    experience_years INTEGER,
    bio TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 创建索引
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_avatars_creator_id ON avatars(creator_id);
CREATE INDEX idx_avatars_status ON avatars(status);
CREATE INDEX idx_tasks_avatar_id ON tasks(avatar_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_messages_task_id ON messages(task_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_creator_applications_user_id ON creator_applications(user_id);
CREATE INDEX idx_creator_applications_status ON creator_applications(status);

-- ============================================
-- 创建触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_avatars_updated_at
    BEFORE UPDATE ON avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 启用行级安全策略 (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 创建基础RLS策略
-- ============================================

-- Users: 用户可以读自己的数据，管理员可以读所有
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Avatars: 公开的active分身所有人可读，创作者可以管理自己的
CREATE POLICY "Avatars are viewable by everyone" ON avatars
    FOR SELECT USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Creators can insert own avatars" ON avatars
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own avatars" ON avatars
    FOR UPDATE USING (auth.uid() = creator_id);

-- Tasks: 相关方可以访问
CREATE POLICY "Tasks viewable by participants" ON tasks
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = creator_id);

CREATE POLICY "Clients can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Messages: 任务参与者可以访问
CREATE POLICY "Messages viewable by task participants" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = messages.task_id 
            AND (tasks.client_id = auth.uid() OR tasks.creator_id = auth.uid())
        )
    );

-- Notifications: 用户可以访问自己的通知
CREATE POLICY "Users can access own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 插入测试数据
-- ============================================

-- 管理员账号
INSERT INTO users (id, email, password, name, role, identity, bio) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@example.com', '$2a$10$YourHashedPasswordHere', '管理员', 'both', ARRAY['程序员', '产品经理'], '平台管理员');

-- 测试创作者
INSERT INTO users (id, email, password, name, role, identity, bio, wallet_balance) VALUES
('00000000-0000-0000-0000-000000000002', 'creator@example.com', '$2a$10$YourHashedPasswordHere', '测试创作者', 'creator', ARRAY['程序员'], '全栈开发者，擅长React和Node.js', 10000);

-- 测试客户
INSERT INTO users (id, email, password, name, role, identity, bio, wallet_balance) VALUES
('00000000-0000-0000-0000-000000000003', 'client@example.com', '$2a$10$YourHashedPasswordHere', '测试客户', 'client', ARRAY[]::TEXT[], '寻找AI助手的企业主', 50000);

-- 测试分身
INSERT INTO avatars (
    creator_id, name, description, avatar_url,
    personality_communication_style, personality_proactivity, personality_expertise,
    pricing_type, pricing_per_task_min, pricing_per_task_max, pricing_per_task_estimate,
    scope_can_do, scope_cannot_do, scope_response_time,
    status
) VALUES
(
    '00000000-0000-0000-0000-000000000002',
    '代码助手小A',
    '你的专属编程助手，精通前端开发、代码审查和技术方案设计',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=coder',
    'professional', 8, ARRAY['JavaScript', 'React', 'TypeScript', 'Node.js'],
    'per_task', 5000, 50000, '根据任务复杂度评估',
    ARRAY['代码审查', '技术方案设计', 'Bug修复', '代码重构'], 
    ARRAY['直接修改生产代码', '访问您的私有仓库'],
    '通常在30分钟内响应',
    'active'
);
