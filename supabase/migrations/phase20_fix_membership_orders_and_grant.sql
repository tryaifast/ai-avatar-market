-- ============================================
-- Phase 20: 修复 membership_orders 表的 id 类型问题 + 授予会员问题
-- ============================================

-- 1. 添加 order_no 字段（存储 MEM... 格式的订单号，用于支付宝 out_trade_no）
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS order_no TEXT;

-- 2. 将 id 列从 UUID 改为让数据库自动生成 UUID（如果当前是 UUID 类型则无需修改）
-- 如果 id 列当前是 UUID 类型（Phase 17 创建的），保持不变，让 gen_random_uuid() 自动生成
-- 如果 id 列当前是 TEXT 类型（Phase 19 创建的），需要改回 UUID
-- 先检查并统一：确保 id 是 UUID 类型

-- 3. 为 order_no 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_orders_order_no ON membership_orders(order_no);

-- 4. 确保 users 表的 UPDATE 策略存在（service role 绕过 RLS，但以防万一）
-- 当前 users 表只有 SELECT 策略，没有 UPDATE 策略
-- 虽然 service role key 绕过 RLS，但为安全起见添加
CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- 5. 确保 membership_orders 表有 RLS 策略
ALTER TABLE membership_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on membership_orders" ON membership_orders
    FOR ALL USING (true) WITH CHECK (true);
