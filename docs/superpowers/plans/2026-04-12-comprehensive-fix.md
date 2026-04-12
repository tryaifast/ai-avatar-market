# AI Avatar Market 全面修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 修复用户测试发现的所有7个问题
**Architecture:** 后端API补充 + 前端页面数据替换 + 导航优化 + 管理员配置功能
**Tech Stack:** Next.js + TypeScript + Supabase + Zustand

---

## 问题清单与修复方案

### 问题1: 用户管理看不到任何用户信息
**原因**: `/api/admin/users` API 不存在，页面调用返回404
**修复**: 创建 `app/api/admin/users/route.ts` 获取所有用户

### 问题2: 首页缺少个人中心按钮
**原因**: 首页导航只有"浏览市场"，缺少"个人中心"入口
**修复**: 在 `app/landing/page.tsx` 的"浏览市场"前添加"个人中心"按钮，根据角色跳转

### 问题3: 反馈表单找不到，体验差
**原因**: `/client/feedback` 是独立页面，入口太深
**修复**: 
- 在创作者中心 `/creator/dashboard` 添加"反馈与建议"快捷入口
- 在个人中心 `/client/workspace` 添加反馈入口
- 在 Header 全局导航添加反馈入口

### 问题4: 管理员发送消息提示"请先登录"
**原因**: `verifyAuth(req)` 从请求中提取 token 的方式有问题
**修复**: 检查 `lib/auth.ts` 的 `verifyAuth` 函数，确保正确解析 JWT

### 问题5: 创作者中心全是测试数据
**原因**: `/creator/dashboard/page.tsx` 使用硬编码的 mock 数据
**修复**: 
- 替换为真实数据获取（从 useTaskStore, useAvatarStore）
- 创建 API `/api/creator/dashboard` 获取创作者统计数据

### 问题6: 缺少AI API配置后台
**原因**: 没有管理员配置AI模型的界面
**修复**: 
- 创建数据库表 `ai_configs` 存储API配置
- 创建管理页面 `/admin/ai-config`
- 创建API `/api/admin/ai-config`

### 问题7: 创建分身后跳转问题
**原因**: 创建分身后跳转逻辑不正确
**修复**: 检查 `/creator/avatar/create` 页面的提交逻辑，确保创建后显示"审核中"状态

---

## 任务分解

### Task 1: 创建 /api/admin/users API (2分钟)
**文件**: `app/api/admin/users/route.ts`
**验证**: 访问 `/api/admin/users` 返回用户列表

### Task 2: 修复首页导航，添加个人中心 (2分钟)
**文件**: `app/landing/page.tsx`
**验证**: 首页显示"个人中心"按钮，点击正确跳转

### Task 3: 添加全局反馈入口 (3分钟)
**文件**: 
- `components/layout/Header.tsx` (添加反馈链接)
- `app/creator/dashboard/page.tsx` (添加反馈卡片)
**验证**: 多处可见反馈入口

### Task 4: 修复 verifyAuth 函数 (2分钟)
**文件**: `lib/auth.ts`
**验证**: 管理员消息发送不再提示登录

### Task 5: 创作者中心改用真实数据 (5分钟)
**文件**: 
- `app/creator/dashboard/page.tsx` (重写数据获取)
- `app/api/creator/dashboard/route.ts` (新建API)
**验证**: 创作者中心显示真实数据

### Task 6: 创建AI配置管理功能 (5分钟)
**文件**:
- `supabase/ai_config_schema.sql` (数据库表)
- `app/api/admin/ai-config/route.ts` (API)
- `app/admin/ai-config/page.tsx` (管理页面)
- `app/admin/dashboard/page.tsx` (添加侧边栏入口)
**验证**: 管理员可配置AI API

### Task 7: 修复创建分身跳转 (2分钟)
**文件**: `app/creator/avatar/create/page.tsx`
**验证**: 创建后正确显示审核状态

---

## 测试验证清单

- [ ] 用户管理页面显示真实用户列表
- [ ] 首页有个人中心按钮
- [ ] 多处可见反馈入口
- [ ] 管理员可发送消息给所有用户
- [ ] 创作者中心显示真实数据（不是测试数据）
- [ ] 管理员可配置AI API
- [ ] 创建分身后显示审核中状态
