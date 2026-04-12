-- ============================================
-- AI 配置表
-- 存储平台AI API配置，供所有分身调用
-- ============================================

-- 创建AI配置表
CREATE TABLE IF NOT EXISTS ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL DEFAULT 'kimi', -- AI提供商: kimi, openai, azure等
  api_key TEXT NOT NULL, -- API密钥（加密存储）
  api_url TEXT, -- 自定义API地址
  model VARCHAR(100) DEFAULT 'kimi-latest', -- 默认模型
  max_tokens INTEGER DEFAULT 2048, -- 最大token数
  temperature DECIMAL(3,2) DEFAULT 0.7, -- 温度参数
  is_active BOOLEAN DEFAULT true, -- 是否启用
  usage_limit INTEGER DEFAULT 1000000, -- 月度使用上限（token数）
  usage_current INTEGER DEFAULT 0, -- 当前已使用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_ai_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_configs_updated_at ON ai_configs;
CREATE TRIGGER update_ai_configs_updated_at
  BEFORE UPDATE ON ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_configs_updated_at();

-- 启用RLS
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;

-- 管理员可以读写
CREATE POLICY "Admin full access on ai_configs"
  ON ai_configs
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 插入默认配置（可选）
-- INSERT INTO ai_configs (provider, api_key, api_url, model) 
-- VALUES ('kimi', 'your-api-key', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', 'kimi-latest');
