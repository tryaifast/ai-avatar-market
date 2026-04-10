# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 https://app.supabase.com
2. 点击 "New Project"
3. 填写项目名称：ai-avatar-market
4. 选择地区：建议选择 Singapore (离中国最近)
5. 等待项目创建完成（约2分钟）

## 2. 运行数据库脚本

1. 进入项目的 SQL Editor
2. 复制 `supabase/schema.sql` 的全部内容
3. 粘贴到 SQL Editor 中
4. 点击 "Run" 执行

## 3. 获取 API 密钥

1. 点击左侧菜单 "Project Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: `SUPABASE_SERVICE_ROLE_KEY`

## 4. 配置身份验证

1. 点击 "Authentication" → "Providers"
2. 确保 Email 提供商已启用
3. 可选：配置邮件模板（中文）

## 5. 配置 Storage（可选，用于文件上传）

1. 点击 "Storage" → "New Bucket"
2. 创建 bucket：`avatars`（用于头像）
3. 创建 bucket：`deliverables`（用于交付物）
4. 设置权限为 public

## 6. 本地环境变量

1. 复制 `.env.local.example` 为 `.env.local`
2. 填入你的 Supabase 配置

```bash
cp .env.local.example .env.local
```

## 7. 验证连接

启动项目后，访问任意页面，检查控制台是否有 Supabase 连接错误。
