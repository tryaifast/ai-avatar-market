-- 添加 onboarding_status 字段到 users 表
-- 创作者入驻审核状态：null(未申请) -> submitted(已提交) -> approved/rejected

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT NULL;

-- 添加 comment 说明
COMMENT ON COLUMN users.onboarding_status IS '创作者入驻审核状态: null=未申请, submitted=已提交, approved=已通过, rejected=已拒绝';
