-- Phase 26: 雇佣订单表 hire_orders
-- 执行位置: Supabase SQL Editor

-- 1. 创建雇佣订单表
CREATE TABLE IF NOT EXISTS hire_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,          -- HIRE格式订单号（支付宝 out_trade_no）
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- 冗余，方便查询
  plan_type TEXT NOT NULL CHECK (plan_type IN ('hourly', 'fixed')),
  hours INTEGER,                          -- 小时数（plan_type=hourly时）
  duration TEXT,                           -- 项目周期（plan_type=fixed时）
  requirements TEXT,                       -- 需求描述
  amount INTEGER NOT NULL,                 -- 总金额（分），含10%平台费
  platform_fee INTEGER NOT NULL,           -- 平台服务费（分）
  creator_earnings INTEGER NOT NULL,       -- 创作者收入（分）
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'alipay',
  trade_no TEXT,                           -- 支付宝交易号
  task_id UUID REFERENCES tasks(id),       -- 支付成功后关联的task
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 添加索引
CREATE INDEX IF NOT EXISTS idx_hire_orders_client_id ON hire_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_hire_orders_creator_id ON hire_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_hire_orders_order_no ON hire_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_hire_orders_status ON hire_orders(status);

-- 3. 启用 RLS
ALTER TABLE hire_orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略：客户端只能查看自己的订单
CREATE POLICY "Clients can view their own hire orders"
  ON hire_orders FOR SELECT
  USING (client_id = auth.uid()::text);

-- 5. RLS 策略：创作者可以查看自己被雇佣的订单
CREATE POLICY "Creators can view orders for their avatars"
  ON hire_orders FOR SELECT
  USING (creator_id = auth.uid()::text);

-- 注意：INSERT/UPDATE 通过 service role key 操作，不受 RLS 限制
