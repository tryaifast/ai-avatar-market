-- ============================================
-- Phase 19: 支付宝支付 + 审核详情完善
-- ============================================

-- 1. 确保membership_orders表存在
CREATE TABLE IF NOT EXISTS membership_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('yearly', 'lifetime')),
  amount INTEGER NOT NULL, -- 单位：分
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'alipay',
  trade_no TEXT, -- 支付宝交易号
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 确保creator_applications表有experiences等字段
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]';
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS company TEXT;

-- 3. 确保users表有phone字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. 为membership_orders添加索引
CREATE INDEX IF NOT EXISTS idx_membership_orders_user_id ON membership_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_orders_status ON membership_orders(status);
