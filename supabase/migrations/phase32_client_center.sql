-- ============================================
-- Phase 32: 雇佣者中心数据表
-- ============================================
-- 执行位置: Supabase SQL Editor

-- 1. 用户雇佣过的分身记录表
-- 用于"我的雇佣分身"快速访问
CREATE TABLE IF NOT EXISTS client_hired_avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 雇佣统计
    total_tasks INTEGER DEFAULT 0,           -- 总任务数
    completed_tasks INTEGER DEFAULT 0,       -- 已完成任务数
    total_spent INTEGER DEFAULT 0,           -- 总花费（分）
    last_hired_at TIMESTAMPTZ,               -- 最后雇佣时间
    
    -- 快捷设置
    is_favorite BOOLEAN DEFAULT FALSE,       -- 是否收藏
    nickname TEXT,                           -- 用户给分身起的别名
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一约束：一个用户对同一个分身只有一条记录
    UNIQUE(client_id, avatar_id)
);

-- 2. 雇佣者与创作者的真人对消息表
-- 区别于 task_messages（这是真人咨询，不是任务对话）
CREATE TABLE IF NOT EXISTS client_creator_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 消息内容
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'creator')),
    content TEXT NOT NULL,
    
    -- 关联的上下文（可选）
    related_avatar_id UUID REFERENCES avatars(id) ON DELETE SET NULL,
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    -- 消息状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 系统通知表（扩展已有的 notifications 表）
-- 如果 notifications 表不存在则创建
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'task_update', 'payment', 'system', 'creator_message'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- 关联数据
    data JSONB DEFAULT '{}', -- { avatarId, taskId, orderId, etc. }
    
    -- 状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 索引
CREATE INDEX IF NOT EXISTS idx_client_hired_avatars_client_id ON client_hired_avatars(client_id);
CREATE INDEX IF NOT EXISTS idx_client_hired_avatars_avatar_id ON client_hired_avatars(avatar_id);
CREATE INDEX IF NOT EXISTS idx_client_hired_avatars_last_hired ON client_hired_avatars(last_hired_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_creator_messages_client_id ON client_creator_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_creator_messages_creator_id ON client_creator_messages(creator_id);
CREATE INDEX IF NOT EXISTS idx_client_creator_messages_created_at ON client_creator_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 5. RLS 策略
ALTER TABLE client_hired_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_creator_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- client_hired_avatars: 用户只能看到自己的雇佣记录
DROP POLICY IF EXISTS "Users can view own hired avatars" ON client_hired_avatars;
CREATE POLICY "Users can view own hired avatars" ON client_hired_avatars
    FOR ALL USING (client_id = auth.uid());

-- client_creator_messages: 参与双方可以访问
DROP POLICY IF EXISTS "Participants can view messages" ON client_creator_messages;
CREATE POLICY "Participants can view messages" ON client_creator_messages
    FOR ALL USING (client_id = auth.uid() OR creator_id = auth.uid());

-- notifications: 用户只能看到自己的通知
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- 6. 触发器：自动更新 client_hired_avatars 统计
-- 当任务完成时，更新雇佣记录
CREATE OR REPLACE FUNCTION update_client_hired_avatar_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO client_hired_avatars (client_id, avatar_id, creator_id, total_tasks, completed_tasks, total_spent, last_hired_at)
        SELECT 
            NEW.client_id,
            NEW.avatar_id,
            NEW.creator_id,
            1,
            1,
            NEW.price,
            NOW()
        ON CONFLICT (client_id, avatar_id) 
        DO UPDATE SET
            total_tasks = client_hired_avatars.total_tasks + 1,
            completed_tasks = client_hired_avatars.completed_tasks + 1,
            total_spent = client_hired_avatars.total_spent + NEW.price,
            last_hired_at = NOW(),
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_hired_stats ON tasks;
CREATE TRIGGER trigger_update_hired_stats
    AFTER UPDATE ON tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_client_hired_avatar_stats();
