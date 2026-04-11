# 留言反馈系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 实现用户留言反馈系统 + 管理后台消息推送功能

**Architecture:** 
1. 新增 `feedbacks` 表存储用户留言
2. 新增 `admin_messages` 表存储管理员推送消息
3. 新增 `user_messages` 表存储用户收到的消息（支持已读/未读）
4. 用户端：留言表单 + 消息收件箱
5. 管理后台：查看所有留言 + 回复/删除 + 推送消息给指定/全部用户

**Tech Stack:** Next.js API Routes + Supabase + Zustand Store

---

## Task 1: 数据库表设计 (2分钟)

**File:** `supabase/feedback_schema.sql`

**Code:**
```sql
-- 用户留言反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  user_name TEXT,
  type TEXT DEFAULT 'general', -- general, bug, feature, complaint
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, replied, resolved, closed
  admin_reply TEXT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 管理员推送消息表
CREATE TABLE IF NOT EXISTS admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT DEFAULT 'all', -- all, specific_users
  target_users UUID[], -- 当 target_type='specific_users' 时使用
  sent_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户消息收件箱表
CREATE TABLE IF NOT EXISTS user_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT DEFAULT 'system', -- system, admin_broadcast, reply
  title TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_feedback_id UUID REFERENCES feedbacks(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_user_messages_user_id ON user_messages(user_id);
CREATE INDEX idx_user_messages_is_read ON user_messages(is_read);
```

**Verification:** 在 Supabase SQL Editor 执行，确认表创建成功

---

## Task 2: 用户留言 API (3分钟)

**File:** `app/api/feedbacks/route.ts`

**Code:** 创建 POST 提交留言 + GET 获取自己的留言列表

---

## Task 3: 管理后台留言管理 API (3分钟)

**File:** `app/api/admin/feedbacks/route.ts`

**Code:** GET 获取所有留言列表（支持筛选状态）+ POST 回复留言

---

## Task 4: 管理员消息推送 API (3分钟)

**File:** `app/api/admin/messages/route.ts`

**Code:** POST 推送消息给指定用户或全部用户

---

## Task 5: 用户消息收件箱 API (2分钟)

**File:** `app/api/messages/route.ts`

**Code:** GET 获取自己的消息列表 + POST 标记已读

---

## Task 6: 用户端留言页面 (3分钟)

**File:** `app/client/feedback/page.tsx`

**Code:** 留言表单 + 历史留言列表

---

## Task 7: 用户端消息收件箱 (3分钟)

**File:** `app/client/messages/page.tsx`

**Code:** 消息列表 + 已读/未读标记

---

## Task 8: 管理后台留言管理页面 (4分钟)

**File:** `app/admin/feedbacks/page.tsx`

**Code:** 留言列表 + 状态筛选 + 回复功能 + 删除功能

---

## Task 9: 管理后台消息推送页面 (4分钟)

**File:** `app/admin/messages/page.tsx`

**Code:** 消息编辑表单 + 选择目标用户（全部/指定）+ 发送历史

---

## Task 10: Header 添加消息提醒 (2分钟)

**File:** `components/layout/Header.tsx`

**Code:** 显示未读消息数量红点

---

## Verification Steps

1. 用户提交留言 → 数据库出现记录
2. 管理后台能看到留言 → 可以回复
3. 用户收到回复 → 消息收件箱显示
4. 管理员推送消息 → 所有/指定用户收到
5. Header 显示未读消息数

---

**Estimated Total Time:** 29 minutes
