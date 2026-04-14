-- ============================================
-- Phase 21: 修复 membership_orders 表结构
-- 确保 id 为 UUID 自动生成，order_no 为 TEXT
-- 确保所有字段类型与代码一致
-- ============================================

-- 先删除旧表（如果存在结构不一致的问题）
-- 注意：这会清除所有订单数据，但当前无有效支付订单
DROP TABLE IF EXISTS membership_orders;

-- 重新创建 membership_orders 表
CREATE TABLE membership_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT NOT NULL, -- MEM 格式的订单号，用于支付宝 out_trade_no
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('yearly', 'lifetime')),
  amount INTEGER NOT NULL, -- 单位：分
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'alipay',
  trade_no TEXT, -- 支付宝交易号
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_membership_orders_user_id ON membership_orders(user_id);
CREATE INDEX idx_membership_orders_status ON membership_orders(status);
CREATE INDEX idx_membership_orders_order_no ON membership_orders(order_no);

-- 启用 RLS
ALTER TABLE membership_orders ENABLE ROW LEVEL SECURITY;

-- RLS 策略：仅 service_role 可操作（API 路由都用 service role key）
CREATE POLICY "Service role can do everything on membership_orders"
  ON membership_orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 确认 users 表的 membership_type 和 membership_expires_at 字段存在
-- 如果已存在则不会报错
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'free'
  CHECK (membership_type IN ('free', 'yearly', 'lifetime'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ DEFAULT NULL;
