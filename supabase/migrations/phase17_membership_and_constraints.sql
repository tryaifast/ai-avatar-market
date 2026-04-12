-- Phase 17: 昵称唯一约束 + 分身名称唯一约束 + 会员系统
-- 执行位置: Supabase SQL Editor

-- 1. 用户昵称唯一约束
ALTER TABLE users ADD CONSTRAINT users_name_unique UNIQUE (name);

-- 2. 分身名称唯一约束（同一创建者下不能重名）
ALTER TABLE avatars ADD CONSTRAINT avatars_name_creator_unique UNIQUE (name, creator_id);

-- 3. 用户表添加会员字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'free'
  CHECK (membership_type IN ('free', 'yearly', 'lifetime'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 4. 创建会员订单表（用于记录付费记录）
CREATE TABLE IF NOT EXISTS membership_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('yearly', 'lifetime')),
  amount INTEGER NOT NULL, -- 价格（分）
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT, -- 支付方式
  payment_id TEXT, -- 第三方支付ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE -- 年费会员到期时间
);

-- 5. 添加索引
CREATE INDEX IF NOT EXISTS idx_membership_orders_user_id ON membership_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_users_membership_type ON users(membership_type);
