-- Phase 28: 创作者定价与任务计费系统
-- 执行位置: Supabase SQL Editor
-- 三种定价模式: hourly(按小时) / fixed(按项目) / token(按百万tokens)

-- 1. avatars 表新增定价字段
ALTER TABLE avatars 
  ADD COLUMN IF NOT EXISTS hourly_price INTEGER DEFAULT 200 CHECK (hourly_price > 0),
  ADD COLUMN IF NOT EXISTS fixed_price INTEGER DEFAULT 5000 CHECK (fixed_price > 0),
  ADD COLUMN IF NOT EXISTS token_price INTEGER DEFAULT 500000 CHECK (token_price > 0);  -- 分/百万tokens

-- 2. tasks 表新增计费字段
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_earnings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_budget INTEGER DEFAULT 1000000;

-- 修改 pricing_type 约束为包含 'token'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_pricing_type;
ALTER TABLE tasks ADD CONSTRAINT chk_pricing_type CHECK (pricing_type IN ('hourly', 'fixed', 'token'));

-- 3. task_messages 表新增 token 统计
ALTER TABLE task_messages 
  ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0;

-- 4. 为已有数据设置默认值
UPDATE avatars SET hourly_price = 200 WHERE hourly_price IS NULL;
UPDATE avatars SET fixed_price = 5000 WHERE fixed_price IS NULL;
UPDATE avatars SET token_price = 500000 WHERE token_price IS NULL;
UPDATE tasks SET pricing_type = 'hourly' WHERE pricing_type IS NULL OR pricing_type NOT IN ('hourly', 'fixed', 'token');
UPDATE tasks SET token_budget = 1000000 WHERE token_budget IS NULL;
