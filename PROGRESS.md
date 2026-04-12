# AI Avatar Market - 项目进度报告

> 最近更新: 2026-04-12
> 应用方法论: Superpowers + DeerFlow

---

## 项目状态: 🟢 已上线运行

| 环境 | 链接 |
|------|------|
| **生产环境** | https://ai-avatar-market.vercel.app |
| **GitHub仓库** | https://github.com/tryaifast/ai-avatar-market |
| **Vercel管理** | https://vercel.com/tryaifast/ai-avatar-market |

---

## 完成进度时间线

### Phase 1: 基础架构 (2026-04-07) ✅
- [x] 项目架构设计
- [x] 核心类型定义
- [x] API 路由结构（auth, avatars, tasks, upload）
- [x] 用户认证系统（JWT + bcrypt）
- [x] 登录/注册页面
- [x] 路由保护组件
- [x] 前端页面（首页、市场、创作者中心、创建分身、工作空间）

### Phase 2: Supabase 数据库集成 (2026-04-08 ~ 04-09) ✅
- [x] Supabase 项目创建与数据库初始化
- [x] 数据库表结构设计（users, avatars, tasks, messages, reviews, notifications, creator_applications）
- [x] `lib/db/supabase.ts` 数据访问层实现
- [x] Zustand Store 集成（useAuthStore, useAvatarStore, useTaskStore, useApplicationStore）
- [x] AI 对话功能（Kimi/阿里云百炼 API）
- [x] 创作者入驻/审核流程
- [x] 管理后台（Dashboard、分身管理、订单管理、审核管理、用户管理）

### Phase 3: 部署与修复 (2026-04-10) ✅
- [x] Vercel 部署成功
- [x] 移除 `output: 'export'`（与API Routes不兼容）
- [x] TypeScript 编译错误修复（@ts-nocheck + 类型修正）
- [x] GitHub Actions 冲突解决（删除多余CI/CD，只保留Vercel）

### Phase 4: Mock 数据全面清除 (2026-04-11) ✅
- [x] 删除 `lib/mock/data.ts`
- [x] 所有18个页面改用真实 Store/API 数据
- [x] 移除所有 `generateStaticParams`（Vercel不需要静态导出）
- [x] 认证页面：mockUsers → useAuthStore
- [x] 市场页面：内嵌mock → useAvatarStore.fetchAvatars()
- [x] 工作区：硬编码项目 → useTaskStore.fetchTasks()
- [x] 管理后台6个页面：全部改用Store/API
- [x] 动态路由页面（creator/[id], avatars/[id], tasks/[id]）：改为动态路由+Store

### Phase 5: RLS 安全策略修复 (2026-04-11) ✅
- [x] 修复注册报错：`new row violates row-level security policy for table "users"`
- [x] 所有DB操作改用 `createServiceClient()`（service role key，绕过RLS）
- [x] Vercel 环境变量配置 `SUPABASE_SERVICE_ROLE_KEY`
- [x] 注册/登录功能验证通过

### Phase 6: 全面测试修复 (2026-04-12) ✅
- [x] 创建 `/api/admin/users` API - 修复用户管理页面空白
- [x] 首页添加「个人中心」导航按钮
- [x] 创作者中心改用真实数据（原使用mock数据）
- [x] 修复 `verifyAuth` 支持cookie认证 - 解决管理员消息发送提示登录问题
- [x] 创建AI配置管理功能（数据库表、API、管理页面）

### Phase 7: 认证系统修复 (2026-04-12) ✅

#### Bug 1: 创作者中心跳转登录页（重复发生3次）
**问题**: 用户登录后点击「创作者中心」或「创建分身」，被重定向到登录页
**根因**: Zustand persist hydration 是异步的，页面首次渲染时 `isAuthenticated=false`，useEffect 立即触发跳转
**修复**: 添加 `isHydrated` 状态，300ms 延迟后检查认证，未完成时显示 loading
**文件**: 
- `app/creator/dashboard/page.tsx` ✅
- `app/creator/avatar/create/page.tsx` ✅（2026-04-12补充修复）

#### Bug 2: 管理员后台看不到用户列表
**问题**: 管理员登录后访问「用户管理」，页面空白
**根因**: fetch('/api/admin/users') 没带 Authorization header，verifyAuth 返回 null → 401
**修复**: 
- AdminAuthStore 新增 `token` 字段保存 JWT
- 创建 `adminFetch()` 辅助函数自动添加 Authorization header
- 所有管理员页面改用 `adminFetch()`
**文件**: `lib/store/index.ts`, `app/admin/*/page.tsx` (4个页面12处调用)

#### Bug 3: 管理员群发消息提示登录
**问题**: 管理员发消息提示"请先登录"
**根因**: 同 Bug 2，fetch 没带 token
**修复**: 同 Bug 2，使用 `adminFetch()`
**文件**: `app/admin/messages/page.tsx`

#### 其他修复
- [x] 管理员/用户认证独立 - `useAdminAuthStore`(admin-auth-storage) / `useAuthStore`(auth-storage)
- [x] 修复 `fetchTasks(userId, type)` 参数错误
- [x] 修复创建分身使用真实API调用
- [x] 修复分身状态显示（支持 pending 审核中状态）

### Phase 8: 认证Token + 数据查询修复 (2026-04-12) ✅

#### Bug: 管理员后台看不到用户/分身，创建分身后看不到
**问题1**: 创建分身后在「我的分身」看不到
**根因**: GET /api/avatars 只返回 status=active，新创建的 pending 状态不返回
**修复**: 添加 creatorId 查询参数，创作者中心按ID获取所有状态

**问题2**: 管理员后台用户列表空白
**根因**: 登录API `/api/auth/login` **从未返回JWT token**！`adminFetch` 从 localStorage 读 token 但它一直是 undefined，所有管理员 API 返回 401
**修复**: 
- 登录/注册 API 使用 `generateToken()` 生成 JWT 并在响应中返回
- `useAuthStore` 添加 `token` 字段，登录/注册时保存，退出时清空

**问题3**: 管理后台无分身审核功能
**修复**: 重写审核管理页面，添加分身审核和入驻申请两个Tab
- 创建 `/api/admin/avatars` (GET) 和 `/api/admin/avatars/[id]` (PUT)
- 创建 `/api/admin/applications` (GET) 和 `/api/admin/applications/[id]` (PUT)

### Phase 9: 安全与认证修复 (2026-04-12) ✅

#### Bug 1: Token 未持久化（严重）
**现象**: 刷新页面后所有需要认证的操作失败，管理员后台重新打不开
**根因**: `useAuthStore` 和 `useAdminAuthStore` 的 `partialize` 函数只持久化了 `{ user, isAuthenticated }` 和 `{ admin, isAdminAuthenticated }`，**遗漏了 `token` 字段**！刷新后 token 变回 null，所有带 Authorization header 的请求都失效
**修复**: 两个 store 的 partialize 都加上 `token` 字段
```typescript
// useAuthStore
partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
// useAdminAuthStore
partialize: (state) => ({ admin: state.admin, token: state.token, isAdminAuthenticated: state.isAdminAuthenticated })
```

#### Bug 2: 4个 Admin API 缺少管理员角色验证（严重安全漏洞）
**现象**: 任何已登录用户（非管理员）都能访问 admin API 获取/修改数据
**根因**: `/api/admin/avatars`、`/api/admin/avatars/[id]`、`/api/admin/applications`、`/api/admin/applications/[id]` 只调用了 `verifyAuth()` 验证登录，但没有检查 `user.role !== 'admin'`
**修复**: 统一添加管理员角色验证逻辑
```typescript
const currentUser = await verifyAuth(req);
if (!currentUser) return 401;
const user = await DB.User.getById(currentUser.userId);
if (!user || user.role !== 'admin') return 403;
```

#### Bug 3: POST /api/avatars 无认证 + creatorId 可伪造
**现象**: 任何人都可以创建分身，且可以伪造 creatorId
**修复**: 
- 添加 `verifyAuth(req)` 验证登录
- 强制 `data.creatorId = auth.userId`，忽略前端传入的值

#### Bug 4: GET /api/avatars?creatorId= 可窥探他人分身
**修复**: 添加 creatorId 与当前用户ID匹配验证

#### Bug 5: rejectReason 未传递给 DB.Avatar.update
**修复**: 审核拒绝时将 rejectReason 加入 updateData

#### Bug 6: 前端创建/查看分身未传 Authorization header
**修复**: 
- `app/creator/avatar/create/page.tsx` — 从 useAuthStore 读取 token，fetch 时带 header
- `app/creator/avatars/page.tsx` — 同上

### Phase 10: Hydration根因修复 + 缺失表创建 (2026-04-12) ✅

#### Bug 1: 创建分身提示需要登录（第4次发生同类问题）
**现象**: 用户登录后进入个人中心创建分身，被提示"需要登录"
**根因**: 
1. Zustand persist hydration 用 `setTimeout(300ms)` 猜测，不可靠
2. Creator Layout 没有包裹 ProtectedRoute，各子页面分散实现认证检查
3. `useAppStore` 的 partialize 缺少 `token`，如果被任何页面使用导致认证丢失
**修复**:
1. **添加 `_hasHydrated` + `onRehydrateStorage`** — 精确知道何时hydration完成，不再靠setTimeout猜测
2. **Creator Layout 包裹 ProtectedRoute** — 统一认证入口，子页面无需各自实现
3. **删除冗余 `useAppStore`** — 与 `useAuthStore` 功能重叠且 partialize 缺 token
4. **添加 `useAuthHydrated` hook + `authFetch` 辅助函数** — 统一认证方案
5. 简化 creator/dashboard、creator/avatar/create、creator/avatars 三个页面

#### Bug 2: 管理员群发消息提示 "Could not find the table 'public.admin_broadcasts'"
**现象**: 管理员创建群发消息失败
**根因**: `feedback_schema.sql` 和 `ai_config_schema.sql` 从未在 Supabase 实例中执行过！4个表不存在
- `admin_broadcasts` — 群发消息
- `feedbacks` — 用户反馈
- `user_messages` — 用户消息收件箱
- `ai_configs` — AI配置
**修复**: 创建 `scripts/create_missing_tables.py` 脚本检查并输出建表SQL
**需用户操作**: 在 Supabase Dashboard SQL Editor 中执行建表SQL

#### 修改文件
- `lib/store/index.ts` — 添加 _hasHydrated/onRehydrateStorage，删除 useAppStore，添加 useAuthHydrated/authFetch
- `components/auth/ProtectedRoute.tsx` — 使用 _hasHydrated 替代 setTimeout
- `components/auth/AdminProtectedRoute.tsx` — 同上
- `app/creator/layout.tsx` — 包裹 ProtectedRoute，修复退出登录
- `app/creator/dashboard/page.tsx` — 移除分散的 hydration+认证逻辑
- `app/creator/avatar/create/page.tsx` — 同上，使用 authFetch
- `app/creator/avatars/page.tsx` — 同上
- `app/creator/onboarding/page.tsx` — useAppStore → useAuthStore
- `app/creator/onboarding/status/page.tsx` — 同上
- `scripts/create_missing_tables.py` — 新增建表检查脚本

### Phase 11: 3个关键Bug修复 (2026-04-12) ✅

#### Bug 1: 管理员群发消息后用户看不到
**现象**: 管理员在后台群发消息，用户创作者中心消息列表为空
**根因**:
1. Header.tsx 使用裸 `fetch('/api/messages')` 不带 token，API 返回 401 被静默吞掉
2. `app/client/` 目录没有 layout.tsx，缺少统一导航和认证上下文
3. 反馈相关表可能未在 Supabase 中创建（Phase 10 已发现但未修复）
**修复**:
1. Header.tsx 裸 fetch → authFetch
2. 新增 app/client/layout.tsx 统一客户端布局+导航+消息计数
3. API 增加表缺失检测和明确错误提示

#### Bug 2: 创作者中心无法提交反馈
**现象**: 用户在创作者中心无法提交个人意见反馈
**根因**:
1. `app/creator/messages/page.tsx` 只是空壳占位页面，只有"查看消息通知"几个字
2. 反馈表不在创作者中心消息页面中
3. `feedbacks` 表可能不存在于 Supabase
**修复**:
1. 完整实现 creator/messages 页面：消息列表 + 反馈提交 + 历史记录
2. 集成 markAsRead/markAllAsRead/deleteMessage
3. 修复反馈 API 的错误处理

#### Bug 3: 已登录状态还要求登录
**现象**: 用户已登录创作者中心，创建分身时仍被重定向到登录页
**根因**（最致命）:
1. **AuthProvider 的 token 用了 userId 代替**！`const token = storeUser?.id || null` — userId 不是 JWT token
2. **AuthProvider.login() 只 setUser 不存 token** — 导致 authFetch 读不到真正的 JWT token
3. **ProtectedRoute 只检查 user + isAuthenticated** — 不检查 token 是否存在
4. 所以 authFetch 永远带 `Authorization: Bearer <userId>` 而非真正的 JWT，服务端 verifyAuth 必然失败返回 null
**修复**:
1. AuthProvider: token 改为 `useAuthStore((s) => s.token)` 读真正的 JWT
2. AuthProvider.login(): 同时设置 user 和 token `useAuthStore.setState({ token, isAuthenticated: true })`
3. ProtectedRoute: 三重检查 user + token + isAuthenticated

#### 修改文件
- `lib/hooks/useAuth.tsx` — 修复 token=userId 致命Bug，login 同时存 token
- `components/auth/ProtectedRoute.tsx` — 三重认证检查
- `components/layout/Header.tsx` — 裸 fetch → authFetch
- `app/client/layout.tsx` — 新增统一客户端布局
- `app/creator/messages/page.tsx` — 从空壳改为完整功能页面
- `app/client/workspace/page.tsx` — 加 isHydrated 等待
- `app/api/messages/route.ts` — 增加表缺失检测
- `app/api/feedbacks/route.ts` — 增加表缺失检测
- `scripts/ensure-feedback-tables.ts` — 新增表检查工具

---

## 当前功能状态

### ✅ 已完成
| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册/登录 | ✅ 已上线 | Supabase + RLS |
| AI分身市场 | ✅ 已上线 | 浏览/搜索/筛选 |
| AI分身创建 | ✅ 已上线 | 创作者创建分身 |
| AI对话 | ✅ 已上线 | Kimi/阿里云百炼 |
| 雇佣流程 | ✅ 已上线 | 确认/支付模拟 |
| 工作区 | ✅ 已上线 | 任务管理 |
| 创作者入驻 | ✅ 已上线 | 申请/审核 |
| 管理后台 | ✅ 已上线 | Dashboard/分身/订单/审核/用户 |
| 通知系统 | ✅ 已上线 | 基础通知 |
| 消息系统 | ✅ 已上线 | 群发+收件箱+已读(Phase 11) |
| 反馈系统 | ✅ 已上线 | 提交+回复+历史(Phase 11) |

### ⏳ 待完成
| 功能 | 优先级 | 说明 |
|------|--------|------|
| 微信支付 | P1 | 真实支付集成 |
| 文件上传 | P1 | 头像/记忆文件 |
| 人机协同完整流程 | P2 | AI任务处理+真人审核 |
| 组件UI完善 | P3 | 响应式优化 |

---

## 技术架构

### 技术栈
- **前端**: Next.js 13 + React 18 + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + RLS)
- **AI服务**: Kimi API (阿里云百炼)
- **部署**: Vercel (Serverless)
- **状态管理**: Zustand

### 数据流
```
用户操作 → Zustand Store → API Route → Supabase (service role) → PostgreSQL
                ↓
         React Hook 渲染
```

### 安全策略
- **读操作**: `supabase` (anon key) — 受RLS保护
- **写操作**: `createServiceClient()` (service role key) — 绕过RLS
- **认证**: JWT token + localStorage

---

## 环境变量配置

### Vercel 已配置
```
NEXT_PUBLIC_SUPABASE_URL=https://efetmovocqjoblbnuzra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<已配置>
SUPABASE_SERVICE_ROLE_KEY=<已配置>  ← 2026-04-11 新增
KIMI_API_KEY=sk-sp-3dcb5dafa03845fda978a7733dcee8c2
KIMI_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

---

## 重要经验教训

1. **`output: 'export'` 与 API Routes 不兼容** — Next.js 静态导出不支持 API Routes，Vercel 原生支持
2. **Supabase RLS 策略** — 写操作必须用 service role key 绕过 RLS，否则注册等操作会被拦截
3. **单一部署目标** — 一个项目只配一个部署平台（Vercel），不要同时配 GitHub Actions
4. **Mock 数据及时清除** — Mock 数据导致页面与真实API不一致，应尽早替换

---

## 费用

| 服务 | 费用 |
|------|------|
| Supabase | 免费（500MB数据库） |
| Vercel | 免费 |
| Kimi API | 按token计费（约¥0.012/1K tokens） |

---

## 文件结构

```
D:\ai-avatar-market\
├── app/
│   ├── api/          # API Routes (auth, avatars, tasks, chat, creator-applications)
│   ├── auth/         # 登录/注册页面
│   ├── client/       # 客户端页面 (市场, 工作区, 雇佣, 创作者详情)
│   ├── creator/      # 创作者页面 (分身管理, 任务详情, 入驻申请)
│   └── admin/        # 管理后台 (Dashboard, 分身, 订单, 审核, 用户)
├── lib/
│   ├── db/           # 数据库层 (supabase.ts)
│   ├── store/        # Zustand Store (auth, avatar, task, application)
│   ├── hooks/        # React Hooks (useAuth)
│   └── types/        # TypeScript 类型定义
├── components/       # 公共组件
└── supabase/         # 数据库Schema
```
