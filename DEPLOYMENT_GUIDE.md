# AI Avatar Market - 部署指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Git

## 1. 本地开发环境配置

### 1.1 克隆项目并安装依赖

```bash
cd D:\ai-avatar-market
npm install
```

### 1.2 配置环境变量

1. 复制环境变量模板：
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local`，填入你的配置：
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kimi API Configuration
KIMI_API_KEY=your-kimi-api-key
KIMI_API_URL=https://api.moonshot.cn/v1
```

### 1.3 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 2. Supabase 配置步骤

### 2.1 创建项目

1. 访问 https://app.supabase.com
2. 点击 "New Project"
3. 项目名称：`ai-avatar-market`
4. 数据库密码：设置一个强密码（保存好！）
5. 地区选择：Singapore（离中国最近）
6. 等待创建完成

### 2.2 运行数据库脚本

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 的全部内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行

### 2.3 获取 API 密钥

1. 点击左侧菜单 "Project Settings" → "API"
2. 复制以下信息到 `.env.local`：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Kimi API 配置

### 3.1 获取 API Key

1. 访问 https://platform.moonshot.cn
2. 注册/登录账号
3. 进入 "API Key 管理"
4. 创建新的 API Key
5. 复制到 `.env.local` 的 `KIMI_API_KEY`

### 3.2 额度检查

- 新用户有免费额度
- 在控制台查看剩余额度
- 费用：约 ¥0.012/1K tokens

---

## 4. Vercel 部署

### 4.1 准备部署

```bash
# 确保代码已提交到 Git
git add .
git commit -m "Add Supabase backend and Kimi AI integration"
```

### 4.2 Vercel 部署步骤

1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（在 Vercel Dashboard → Settings → Environment Variables）：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | https://your-project.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your-anon-key |
| `SUPABASE_SERVICE_ROLE_KEY` | your-service-role-key |
| `KIMI_API_KEY` | your-kimi-api-key |
| `KIMI_API_URL` | https://api.moonshot.cn/v1 |

5. 点击 "Deploy"

### 4.3 配置 Vercel 环境变量

部署完成后，确保所有环境变量都已设置：

```bash
# 使用 Vercel CLI（可选）
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add KIMI_API_KEY
```

---

## 5. 功能验证清单

部署完成后，请验证以下功能：

### 5.1 基础功能
- [ ] 注册新用户
- [ ] 登录/登出
- [ ] 查看个人资料
- [ ] 编辑个人资料（昵称、头像）

### 5.2 分身功能
- [ ] 浏览市场（显示激活的分身）
- [ ] 搜索分身
- [ ] 查看分身详情
- [ ] 创建新分身（创作者）
- [ ] 编辑分身信息
- [ ] 上架/下架分身

### 5.3 任务功能
- [ ] 雇佣分身创建任务
- [ ] 与AI对话（真实Kimi回复）
- [ ] 查看任务列表
- [ ] 查看任务详情
- [ ] 任务状态流转

### 5.4 创作者入驻
- [ ] 提交入驻申请
- [ ] 管理员审核申请
- [ ] 审核通过后角色变更

### 5.5 管理后台
- [ ] 查看仪表盘数据
- [ ] 用户管理
- [ ] 分身管理
- [ ] 审核管理
- [ ] 订单管理

---

## 6. 数据存储位置

| 数据类型 | 存储位置 | 说明 |
|---------|---------|------|
| **用户信息** | Supabase PostgreSQL | 用户表 |
| **分身数据** | Supabase PostgreSQL | 分身表 |
| **任务数据** | Supabase PostgreSQL | 任务表 |
| **消息记录** | Supabase PostgreSQL | 消息表 |
| **AI对话** | Kimi API + 消息表 | 实时调用+持久化 |
| **头像图片** | Supabase Storage (可选) | 或使用 Base64 |
| **登录状态** | localStorage + Zustand | 前端状态管理 |

---

## 7. 费用说明

### Supabase 免费额度
- 数据库：500MB
- 带宽：2GB/月
- API 请求：无限（ fair use ）
- 身份验证：无限 MAU

### Kimi API 费用
- 按 token 计费
- 约 ¥0.012/1K tokens
- 轻度使用每月约 ¥10-50

### Vercel 免费额度
- 带宽：100GB/月
- 构建：6000分钟/月
- Serverless Functions：100GB-hours/月

---

## 8. 故障排查

### 问题1：Supabase 连接失败
- 检查环境变量是否正确
- 确认 Supabase 项目是否运行
- 检查网络访问权限

### 问题2：Kimi API 调用失败
- 检查 API Key 是否有效
- 检查额度是否充足
- 查看 Vercel 函数日志

### 问题3：页面显示 500 错误
- 查看 Vercel Dashboard → Logs
- 检查数据库连接
- 检查 API 路由是否正确

---

## 9. 迁移到国内云（可选）

后续如需迁移到国内云服务：

### 数据库
- **阿里云 RDS PostgreSQL**
- **腾讯云 TDSQL PostgreSQL**

### 文件存储
- **阿里云 OSS**
- **腾讯云 COS**（需要配置）

### AI服务
- **百度文心一言**
- **阿里通义千问**
- **腾讯混元**

### 部署
- **阿里云 ECS/Serverless**
- **腾讯云云开发**

---

## 10. 技术支持

如有问题，请检查：
1. Vercel 部署日志
2. Supabase Dashboard 日志
3. 浏览器开发者工具 Console
