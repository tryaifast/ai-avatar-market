-- ============================================
-- Phase 30: Avatar Intellectual Property Certification
-- 分身知识产权认证服务
-- ============================================

-- 1. 认证记录表
CREATE TABLE IF NOT EXISTS avatar_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    avatar_id UUID NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id),
    
    -- 支付信息
    order_no TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL DEFAULT 99900, -- 999元（分）
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'processing', 'certified', 'failed')),
    paid_at TIMESTAMPTZ,
    
    -- 证书信息
    certificate_no TEXT UNIQUE,
    certificate_url TEXT,
    certificate_generated_at TIMESTAMPTZ,
    
    -- 区块链存证
    blockchain_hash TEXT,
    blockchain_explorer_url TEXT,
    blockchain_tx_time TIMESTAMPTZ,
    
    -- 公证信息（预留）
    notary_status TEXT DEFAULT 'pending' 
        CHECK (notary_status IN ('pending', 'submitted', 'processing', 'completed', 'na')),
    notary_certificate_no TEXT,
    notary_completed_at TIMESTAMPTZ,
    
    -- 元数据
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_avatar_certifications_avatar ON avatar_certifications(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_certifications_creator ON avatar_certifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_avatar_certifications_status ON avatar_certifications(status);
CREATE INDEX IF NOT EXISTS idx_avatar_certifications_order_no ON avatar_certifications(order_no);

-- 3. 证书编号生成函数
CREATE OR REPLACE FUNCTION generate_certificate_no()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_seq_num INTEGER;
    v_cert_no TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');
    
    -- 获取当年最大序号
    SELECT COALESCE(
        MAX(
            NULLIF(
                (regexp_matches(certificate_no, '^CERT-' || v_year || '-(\d+)$'))[1],
                ''
            )::INTEGER,
            0
        ),
        0
    ) + 1
    INTO v_seq_num
    FROM avatar_certifications
    WHERE certificate_no ~ ('^CERT-' || v_year || '-\d+$')
    AND created_at >= DATE_TRUNC('year', NOW());
    
    v_cert_no := 'CERT-' || v_year || '-' || LPAD(v_seq_num::TEXT, 6, '0');
    RETURN v_cert_no;
END;
$$ LANGUAGE plpgsql;

-- 4. RLS 策略
ALTER TABLE avatar_certifications ENABLE ROW LEVEL SECURITY;

-- 创作者只能看自己的
DO $$ BEGIN
  CREATE POLICY "Creator can view own certifications" ON avatar_certifications
    FOR SELECT USING (creator_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy already exists, skipping';
END $$;

-- 5. avatars 表添加认证状态字段
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS certification_status TEXT DEFAULT 'none'
    CHECK (certification_status IN ('none', 'pending', 'certified', 'expired'));

ALTER TABLE avatars ADD COLUMN IF NOT EXISTS certification_id UUID REFERENCES avatar_certifications(id);

-- 6. 更新触发器（自动更新 updated_at）
CREATE OR REPLACE FUNCTION update_avatar_certifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_avatar_certifications_updated_at
    BEFORE UPDATE ON avatar_certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_avatar_certifications_updated_at();
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Trigger already exists, skipping';
END $$;

COMMENT ON TABLE avatar_certifications IS 'AI分身知识产权认证记录表';
COMMENT ON COLUMN avatar_certifications.status IS '认证状态: pending=待支付, paid=已支付, processing=处理中, certified=已认证, failed=失败';
COMMENT ON COLUMN avatar_certifications.notary_status IS '公证状态: pending=待公证, submitted=已提交, processing=公证中, completed=已完成, na=暂不需要';
