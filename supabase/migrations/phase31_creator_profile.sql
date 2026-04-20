-- ============================================
-- Phase 31: 创作者主页数据完善
-- ============================================
-- 执行位置: Supabase SQL Editor

-- 1. users 表添加创作者简历相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]';

-- 2. 将已有的 creator_applications 审核通过的数据同步到 users 表
-- 只同步 bio 为空的或 profession 为空的用户
UPDATE users u
SET 
  bio = COALESCE(u.bio, ca.bio),
  profession = ca.profession,
  company = ca.company,
  experience_years = ca.experience_years,
  experiences = ca.experiences,
  resume_url = ca.resume_url,
  identity = CASE 
    WHEN u.identity = '{}' OR u.identity IS NULL THEN ca.skills
    ELSE u.identity
  END
FROM creator_applications ca
WHERE ca.user_id = u.id 
  AND ca.status = 'approved'
  AND (u.profession IS NULL OR u.profession = '');
