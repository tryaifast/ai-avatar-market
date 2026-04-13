-- Phase 18: 设置页增强 + 会员系统 + 入驻申请详情
-- 执行位置: Supabase SQL Editor

-- 1. 用户表添加 phone 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. 入驻申请表添加 experiences / resume_url / portfolio_url 字段
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]';
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
