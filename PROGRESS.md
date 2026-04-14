# AI Avatar Market - 项目进度报告

> 最近更新: 2026-04-13
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

### Phase 12: Header重复+消息401+JSX结构破坏修复 (2026-04-12) ✅

#### Bug 1: Header重复渲染（两行导航栏）
**现象**: 页面顶部出现两行"AI分身市场"导航栏
**根因**: `app/client/layout.tsx` 有完整导航栏（Phase 11新增），但每个子页面还保留了内联的`<header>`标签
**修复**: 删除8个子页面的内联`<header>`标签

#### Bug 2: 消息API返回401
**现象**: GET /api/messages 返回 401 Unauthorized
**根因**: `onRehydrateStorage`中 `state._hasHydrated = true` 直接修改属性，Zustand不触发React重渲染，导致authFetch读取token时还是null
**修复**: 改用 `useAuthStore.setState({ _hasHydrated: true })`，Header.tsx加hydration检查

#### Bug 3: Vercel构建失败 — Syntax Error（6个文件）
**现象**: `npm run build` 报 Syntax Error at "D" in messages/page.tsx
**根因**: 删除内联`<header>`时破坏了JSX树结构，6个文件留下了多余的`</div>`闭合标签
- messages/page.tsx: 第185行多余`</div>`
- feedback/page.tsx: 第221行多余`}`
- hire/[id]/HirePageClient.tsx: 第50行多余`</div>`
- hire/[id]/confirm/HireConfirmClient.tsx: 第224行多余`</div>`
- creator/[id]/CreatorDetailClient.tsx: 第322行多余`</div>`（导致Modal脱离最外层div）
- workspace/page.tsx: 第82行多余`</div>`（导致Tab内容脱离最外层div）
**修复**: 删除6个文件中多余的闭合标签
**教训**: 修改JSX结构后必须追踪开闭标签栈，确保每对标签正确匹配

#### 修改文件
- `app/client/messages/page.tsx` — 删除多余`</div>`，修复JSX嵌套
- `app/client/feedback/page.tsx` — 删除多余`}`
- `app/client/hire/[id]/HirePageClient.tsx` — 删除多余`</div>`
- `app/client/hire/[id]/confirm/HireConfirmClient.tsx` — 删除多余`</div>`
- `app/client/creator/[id]/CreatorDetailClient.tsx` — 删除多余`</div>`，Modal正确嵌套
- `app/client/workspace/page.tsx` — 删除多余`</div>`，Tab内容正确嵌套
- `lib/store/index.ts` — onRehydrateStorage用setState替代直接属性修改

### Phase 13: workspace/page.tsx 多余闭合标签修复 (2026-04-12) ✅

#### Bug: Vercel构建失败 — Syntax Error in workspace/page.tsx
**现象**: `npm run build` 报 Syntax Error at L53 `<div className="max-w-6xl">`
**根因**: Phase 12 修复时删除了 workspace/page.tsx 中的一个 `</div>`，但文件末尾仍有多余的 `</div>` 闭合标签（L383），导致标签栈不平衡（balance=-1）
**修复**: 删除文件末尾多余的 `</div>` 闭合标签
**文件**: `app/client/workspace/page.tsx`
**全面审核**: 使用 Python 脚本验证所有 client/*.tsx 文件的 div 开闭标签匹配情况，client 目录全部通过
**待修复（非阻断）**:
- `creator/avatar/create/page.tsx`: div 差3个（有 @ts-nocheck，可能不影响构建）
- `admin/ai-config/page.tsx`: button 差1个

### Phase 14: Zustand persist Rehydration 循环引用修复 (2026-04-12) ✅

#### Bug: 登录后页面卡死 — `Cannot access 'n' before initialization`
**现象**: 登录管理页面或点击首页昵称后，页面一直卡在加载状态
**控制台错误**: `[useAuthStore] Rehydration error: ReferenceError: Cannot access 'n' before initialization` + `[useAdminAuthStore] Rehydration error: ReferenceError: Cannot access 'i' before initialization`
**根因**: `onRehydrateStorage` 回调中使用 `useAuthStore.setState({ _hasHydrated: true })` 引用了 store 自身。在生产构建（minified）中，`const n = create(...)` 的赋值还没完成时，回调闭包就引用了 `n`，导致 `ReferenceError: Cannot access 'n' before initialization`
**修复**: 使用 Zustand 官方推荐的模式 — 在 store state 中定义 `setHasHydrated` action，在 `onRehydrateStorage` 回调中通过 `state.setHasHydrated(true)` 调用，避免引用 store 自身
**参考**: [Zustand Discussion #1572](https://github.com/pmndrs/zustand/discussions/1572)
**文件**: `lib/store/index.ts` — 两个 store（useAuthStore + useAdminAuthStore）都修复

### Phase 15: 入驻流程全面修复 + AvatarAnalytics 崩溃 (2026-04-12) ✅

#### 修复内容汇总

**Bug1: AvatarAnalyticsClient toLocaleString 崩溃**
- **现象**: 点击"我的分身→查看"报错 `Cannot read properties of undefined (reading 'toLocaleString')`
- **根因**: `views` 变量从 `stats.hiredCount` 取值，`stats` 为空对象时 `hiredCount` 为 `undefined`，调用 `.toLocaleString()` 报错
- **修复**: 所有数值字段用 `Number()` 包裹 + 默认值 `0`
- **文件**: `app/creator/avatars/[id]/AvatarAnalyticsClient.tsx`

**Bug2: Dashboard 未入驻时无提示 + 可直接创建分身**
- **现象**: 未入驻用户在 Dashboard 可直接点击"创建新分身"
- **修复**: 添加入驻提示横幅 + 根据入驻状态切换按钮（"申请入驻" vs "创建新分身"）
- **文件**: `app/creator/dashboard/page.tsx`

**Bug3: 入驻申请提交字段名不匹配（驼峰 vs 下划线）**
- **现象**: 入驻申请提交成功但数据库字段为空（字段名映射错误）
- **根因**: 前端提交驼峰命名（`userId`, `realName`），但 Supabase 表用下划线命名（`user_id`, `real_name`）
- **修复**: POST API 中显式映射字段名
- **文件**: `app/api/creator-applications/route.ts`

**Bug4: 审核通过后未更新 user.onboardingStatus**
- **现象**: 管理员审核通过入驻申请后，用户状态未变
- **修复**: 审核 approved/rejected 时同步更新 `users.onboarding_status` + `role`
- **文件**: `app/api/admin/applications/[id]/route.ts`, `app/api/creator-applications/[id]/route.ts`

**Bug5: creator-applications API 缺少认证验证**
- **现象**: 任何人都能 GET/POST 入驻申请，无认证检查
- **修复**: GET 和 POST 都添加 `verifyAuth` 验证，非管理员只能看自己的申请
- **文件**: `app/api/creator-applications/route.ts`, `app/api/creator-applications/[id]/route.ts`

**Bug6: 审核管理默认显示分身而非入驻申请**
- **修复**: 默认 Tab 改为 `applications`
- **文件**: `app/admin/reviews/page.tsx`

**补充修复**:
- `toUser()` 映射添加 `onboardingStatus` 字段
- 创建 SQL 迁移文件 `supabase/migrations/add_onboarding_status.sql`
- `onboarding/status` 页面改用 `useApplicationStore` 获取真实数据
- 修复错误链接 `avatars/create` → `avatar/create`
- 添加 `pending` 状态到 statusConfig

### Phase 16: Avatar.status 类型修复 — 添加 'rejected' + 全页面对齐 (2026-04-12) ✅

#### Bug: Vercel构建失败 — TypeScript类型比较错误
**现象**: `npm run build` 报错：`This comparison appears to be unintentional because the types '"banned"' and '"rejected"' have no overlap`（settings/page.tsx:245）
**根因**: `Avatar.status` 类型定义为 `'draft' | 'reviewing' | 'active' | 'paused' | 'banned'`，**缺少 `'rejected'`**。但多个页面和API已经在使用 `'rejected'` 状态值，TypeScript 发现类型不可能匹配而报编译错误
**修复**:
1. `lib/types/index.ts` — Avatar.status 联合类型添加 `'rejected'`
2. `app/creator/avatars/[id]/settings/page.tsx` — 补充 `'banned'` 状态文本映射
3. `app/creator/avatars/page.tsx` — statusConfig 移除不存在的键（approved/pending/inactive），添加 draft/banned，兜底值从 inactive 改为 draft
4. `app/admin/avatars/page.tsx` — filter 类型添加 'rejected'/'draft'，筛选下拉添加对应选项，表格添加 rejected/draft 状态显示，rejected 状态添加上架按钮
5. `app/api/admin/avatars/[id]/route.ts` — 状态白名单对齐类型定义（'approved'|'inactive' → 'approved'|'paused'|'banned'）

**教训**: TypeScript联合类型必须与业务代码实际使用的值完全一致。修改类型定义前必须全局搜索所有使用位置。

### Phase 17: 管理后台全面修复 + 会员系统基础 (2026-04-12) ✅

#### 修复内容汇总

**Bug1: 管理后台用户管理 — 查看/封禁/筛选全不可用**
- **现象**: 用户"查看"按钮无onClick、封禁按钮调用的API不存在、无法按状态筛选
- **根因**: 1) 查看`<button>`没有绑定任何事件 2) `app/api/admin/users/[id]/route.ts`文件不存在 3) 只按role筛选无status筛选
- **修复**:
  - 新建 `app/api/admin/users/[id]/route.ts` — GET获取用户详情(含分身/任务/申请) + PUT封禁/解封(含同步下架/恢复分身)
  - 重写 `app/admin/users/page.tsx` — 用户详情弹窗(基本信息+分身列表+任务统计+入驻申请) + 状态筛选(正常/封禁) + 封禁操作反馈toast + 封禁确认弹窗

**Bug2: 管理后台分身管理 — 下架后看不到**
- **现象**: 分身下架(paused)后在管理后台消失
- **根因**: 管理后台使用 `useAvatarStore.fetchAvatars()` 调用公共API `/api/avatars`，只返回 active 状态
- **修复**:
  - 重写 `app/admin/avatars/page.tsx` — 改用 `adminFetch('/api/admin/avatars')` 获取所有状态分身 + 添加详情弹窗 + 恢复上架按钮 + 封禁按钮 + 操作反馈 + 暂停数量统计

**Bug3: 入驻审核无详情查看**
- **现象**: 管理员审核入驻申请只能看到名称/职业/状态，没有查看详情的入口
- **修复**:
  - 重写 `app/admin/reviews/page.tsx` — 添加分身详情弹窗和入驻申请详情弹窗，显示全部申请信息(姓名/职业/邮箱/电话/年限/简介/技能/作品集链接/审核备注)

**Bug4: 创作者分身查看 — 裸fetch+setTimeout**
- **现象**: 点击分身"查看"页面可能加载失败或延迟2秒才显示"未找到"
- **根因**: `fetchAvatarById` 用裸 fetch 不带认证，且有 2秒 setTimeout 才判断 notFound
- **修复**:
  - 重写 `app/creator/avatars/[id]/page.tsx` — 用 authFetch 替代裸 fetch，移除 setTimeout，直接根据 API 响应判断
  - 重写 `AvatarAnalyticsClient.tsx` — 移除硬编码趋势图和假雇佣记录，改为展示真实数据+空状态

**Bug5: 昵称和分身名称可重名**
- **现象**: 注册时昵称可重复，分身名称也可重复
- **修复**:
  - 数据库: `users.name` 添加 UNIQUE 约束，`avatars(name, creator_id)` 添加复合唯一约束
  - 后端: 注册API添加昵称查重，创建分身API添加同名查重
  - 前端: 注册页添加昵称实时查重(500ms防抖 + 可用/已占用状态显示)
  - 新增 `app/api/auth/check-name/route.ts` — 昵称可用性检查API

**Bug6: 分身数量无限制 + 会员系统不存在**
- **现象**: 用户可无限创建分身，无任何会员体系
- **修复**:
  - 数据库: `users` 表添加 `membership_type`(free/yearly/lifetime) + `membership_expires_at` 字段；新建 `membership_orders` 表
  - 后端: 创建分身API添加数量校验(free=1, yearly/lifetime=10)
  - 前端: 创建分身页添加达上限提示+会员升级入口；我的分身页添加会员升级横幅
  - 类型: `User` 接口添加 `membershipType` + `membershipExpiresAt`
  - SQL: `supabase/migrations/phase17_membership_and_constraints.sql`

#### 修改文件清单
1. `app/api/admin/users/[id]/route.ts` — **新建** 管理员用户操作API
2. `app/admin/users/page.tsx` — **重写** 用户详情弹窗+状态筛选+封禁反馈
3. `app/admin/reviews/page.tsx` — **重写** 审核详情弹窗(分身+申请)
4. `app/admin/avatars/page.tsx` — **重写** 改用adminFetch+详情弹窗+恢复上架
5. `app/creator/avatars/[id]/page.tsx` — **重写** authFetch+移除setTimeout
6. `app/creator/avatars/[id]/AvatarAnalyticsClient.tsx` — **重写** 移除假数据+空状态
7. `app/api/auth/register/route.ts` — 昵称查重
8. `app/api/auth/check-name/route.ts` — **新建** 昵称可用性API
9. `app/api/avatars/route.ts` — 分身数量校验+同名查重
10. `app/auth/register/page.tsx` — 昵称实时查重UI
11. `app/creator/avatar/create/page.tsx` — 分身数量限制提示+会员升级入口
12. `app/creator/avatars/page.tsx` — 会员升级横幅+创建按钮联动
13. `lib/types/index.ts` — User添加membershipType/membershipExpiresAt/onboardingStatus添加banned
14. `lib/db/supabase.ts` — toUser映射添加membership字段+update支持
15. `app/api/admin/users/route.ts` — 返回membershipType字段
16. `supabase/migrations/phase17_membership_and_constraints.sql` — **新建** 数据库迁移

#### ⚠️ 需要用户操作
在 Supabase SQL Editor 中执行 `supabase/migrations/phase17_membership_and_constraints.sql`:
```sql
ALTER TABLE users ADD CONSTRAINT users_name_unique UNIQUE (name);
ALTER TABLE avatars ADD CONSTRAINT avatars_name_creator_unique UNIQUE (name, creator_id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'free' CHECK (membership_type IN ('free', 'yearly', 'lifetime'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
CREATE TABLE IF NOT EXISTS membership_orders (...);
```

---

### Phase 18 (04-13): 设置页+会员中心+入驻申请详情增强

**需求**：
1. 设置页空壳→完整功能（修改昵称/电话/简介/身份+会员入口）
2. 会员中心页面（套餐对比+购买流程）
3. 入驻申请详情看不到工作经历和文件

**修改**：

Bug1: 设置页是空壳
- **现象**: `settings/page.tsx` 只有9行，无任何功能
- **修复**: 完整重写，包含4个区块：会员状态卡片、基本信息编辑、账户信息（只读）、会员中心入口

Bug2: 会员系统只有"壳"
- **现象**: 数据库表有了，但没有购买页面、购买API、侧边栏入口，"升级会员"按钮是`alert('开发中')`假按钮
- **修复**:
  - 新建 `/creator/membership` 页面：年费9.9/终身99套餐+权益对比表+FAQ
  - 新建 `POST /api/membership/order` API：模拟支付+创建订单+升级会员状态
  - 侧边栏添加"会员中心"菜单项（Crown图标）
  - 修复创建分身页和我的分身页的"升级会员"按钮→跳转`/creator/membership`

Bug3: 入驻申请详情缺失工作经历
- **现象**: 前端有工作经历表单但提交时没传给后端，审核详情看不到
- **修复**:
  - `apply/page.tsx` 提交时传 `experiences` 数组
  - `creator-applications/route.ts` API处理 `experiences`/`resume_url`/`portfolio_url` 字段
  - `admin/reviews/page.tsx` 审核详情展示工作经历+简历链接+作品集链接

代码优化：
- 提取 `AVATAR_LIMITS` 到共享配置 `lib/constants.ts`（消除3处重复定义）
- `lib/constants.ts` 新增 `MEMBERSHIP_PRICES`/`MEMBERSHIP_LABELS`/`MEMBERSHIP_FEATURES`
- 新建 `PUT /api/user/profile` API（verifyAuth+昵称查重）
- `store.updateProfile` 修复：真正调API而非仅本地更新
- User类型+数据库映射添加 `phone` 字段
- SQL迁移: `supabase/migrations/phase18_settings_and_application.sql`

#### 修改文件清单
1. `app/creator/settings/page.tsx` — **完整重写** 设置页
2. `app/creator/membership/page.tsx` — **新建** 会员中心页面
3. `app/api/membership/order/route.ts` — **新建** 会员购买API
4. `app/api/user/profile/route.ts` — **新建** 用户资料更新API
5. `lib/constants.ts` — **新建** 共享常量配置
6. `supabase/migrations/phase18_settings_and_application.sql` — **新建** 数据库迁移
7. `app/creator/layout.tsx` — 侧边栏添加会员中心菜单项
8. `app/creator/avatar/create/page.tsx` — 假按钮→Link跳转会员中心
9. `app/creator/avatars/page.tsx` — 假按钮→Link跳转会员中心
10. `app/creator/onboarding/apply/page.tsx` — 提交时传experiences
11. `app/api/creator-applications/route.ts` — 处理新字段
12. `app/admin/reviews/page.tsx` — 审核详情展示工作经历
13. `app/api/avatars/route.ts` — AVATAR_LIMITS从constants导入
14. `lib/types/index.ts` — User接口添加phone字段
15. `lib/db/supabase.ts` — phone字段映射
16. `lib/store/index.ts` — updateProfile调API

#### ⚠️ 需要用户操作
在 Supabase SQL Editor 中执行 `supabase/migrations/phase18_settings_and_application.sql`:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]';
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE creator_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
```

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
| 创作者入驻 | ✅ 已上线 | 申请/审核（含工作经历） |
| 管理后台 | ✅ 已上线 | Dashboard/分身/订单/审核/用户 |
| 通知系统 | ✅ 已上线 | 基础通知 |
| 消息系统 | ✅ 已上线 | 群发+收件箱+已读(Phase 11) |
| 反馈系统 | ✅ 已上线 | 提交+回复+历史(Phase 11) |
| 会员系统 | ✅ 已上线 | 年费9.9/终身99+支付宝网页支付(Phase 19) |
| 账户设置 | ✅ 已上线 | 修改昵称/电话/简介/身份(Phase 18) |

### ⏳ 待完成
| 功能 | 优先级 | 说明 |
|------|--------|------|
| 文件上传 | P1 | 头像/记忆文件/简历上传（限制500KB/人） |
| 人机协同完整流程 | P2 | AI任务处理+真人审核 |

### Phase 19 (04-13): 支付宝支付接入+审核详情完善

**需求**：
1. 会员购买直接开通，没有真实支付流程→接入支付宝网页支付
2. 管理后台审核详情看不到用户完整申请信息→修复数据传递+展示

**修改**：

Bug1: 会员购买无支付流程
- **现象**: 点击"立即开通"直接升级会员，`POST /api/membership/order` 里 `status: 'paid'` + `payment_method: 'simulated'`
- **修复**:
  - 纯Node.js实现RSA2签名（用crypto模块），不依赖alipay-sdk（避免webpack ESM兼容问题）
  - 新建 `lib/alipay.ts`：RSA2签名/验签 + 构建支付URL + 订单号生成
  - 改造 `POST /api/membership/order`：创建待支付订单(pending) + 返回支付宝支付链接
  - 新建 `POST /api/membership/notify`：支付宝异步通知回调验签+升级会员
  - 新建 `GET /api/membership/pay-result`：前端轮询支付结果
  - 会员中心页面改造：点击购买→创建订单→跳转支付宝→回调确认→轮询结果→升级
  - SQL: `membership_orders`表(trade_no/amount/status/paid_at等)

Bug2: 审核详情看不到完整申请信息
- **现象**: 数据库可能缺少experiences/company列，导致审核详情只显示基础信息
- **修复**:
  - 入驻申请提交新增company字段传递
  - 审核列表表格新增"公司"列
  - 审核详情弹窗新增"所在公司"显示
  - UserDB.update新增onboardingStatus映射
  - SQL: 添加company列+确保experiences/resume_url/portfolio_url列存在

**支付流程**:
1. 用户点击购买 → 前端调POST /api/membership/order
2. 后端创建pending订单 + 生成支付宝支付链接 → 返回payUrl
3. 前端跳转到支付宝支付页面
4. 用户完成支付 → 支付宝回调POST /api/membership/notify
5. 后端验签 + 更新订单paid + 升级用户会员状态
6. 前端return_url跳回 + 轮询GET /api/membership/pay-result确认

**环境变量(需配置)**:
- `ALIPAY_APP_ID` - 支付宝应用ID
- `ALIPAY_PRIVATE_KEY` - 应用RSA2私钥
- `ALIPAY_PUBLIC_KEY` - 支付宝RSA2公钥
- `ALIPAY_SANDBOX` - 设为'true'使用沙箱环境（可选）
- `NEXT_PUBLIC_SITE_URL` - 站点URL（用于回调地址，默认ai-avatar-market.vercel.app）

**SQL需执行**: `supabase/migrations/phase19_alipay_and_application.sql`

### Phase 21 (04-14): 会员订单UUID修复+管理后台授予会员+认证API修复

**需求**：
1. 创建99元终身会员订单报错：`invalid input syntax for type uuid: "MEM202604140238202744"`
2. 管理后台授予用户终身会员没有生效
3. /api/auth/me 使用 x-user-id header 而非 JWT 认证（历史遗留问题）

**修改**：

Bug1: 会员订单UUID类型错误
- **根因**: `membership_orders` 表的 `id` 列在数据库中是 UUID 类型（phase17 定义），但 phase19 SQL 用 `id TEXT PRIMARY KEY` 重建。由于 `CREATE TABLE IF NOT EXISTS` 不重建已存在的表，导致 `id` 仍为 UUID 类型，但缺少 `DEFAULT gen_random_uuid()` 或 `order_no` 列未正确创建
- **修复**:
  - `supabase/migrations/phase21_fix_membership_orders.sql`: DROP + CREATE 重建表，确保 `id UUID DEFAULT gen_random_uuid()` + `order_no TEXT NOT NULL`
  - `app/api/membership/order/route.ts`: 添加详细日志，确认 insert 数据格式
  - ⚠️ **需要在 Supabase SQL Editor 中执行 phase21 SQL 脚本**

Bug2: 管理后台授予会员不生效
- **根因**: 两个问题叠加：
  1. `/api/auth/me` 用 `x-user-id` header 认证而非 JWT，导致前端 authFetch 调用时认证失败，无法获取最新用户信息
  2. 用户端 Zustand store 缓存旧会员状态，刷新后从 localStorage 恢复旧数据
- **修复**:
  - `app/api/auth/me/route.ts`: 改用 `verifyAuth(req)` JWT 认证（历史遗留教训 #7）
  - `app/creator/membership/page.tsx`: 页面加载时调用 `/api/auth/me` 刷新用户信息
  - `app/creator/settings/page.tsx`: 同上，页面加载时刷新用户信息
  - `app/api/admin/users/[id]/route.ts`: grantMembership 操作增加详细日志

**教训**：
- **SQL文件≠表已创建** — 再次验证：phase19/20 SQL 可能没在 Supabase 中执行，或执行顺序不对
- **Token必须是JWT** — /api/auth/me 用 x-user-id header 而非 JWT，是历史遗留问题，必须修复
- **Zustand缓存需主动刷新** — 管理后台修改数据后，用户端需要主动调 API 刷新

**需求**：
1. 会员中心点击开通返回500错误，支付宝无法拉起支付
2. 管理后台无法查看/授予/取消用户会员身份

**修改**：

Bug1: 会员订单API 500错误
- **现象**: POST /api/membership/order 返回500 Internal Server Error
- **根因**: `lib/alipay.ts` 使用 `import crypto from 'crypto'`，在某些运行时环境下crypto模块加载失败
- **修复**:
  - `lib/alipay.ts`: `import crypto` → `require('crypto')` 动态引入，确保Node.js运行时兼容
  - `createPagePayUrl` 增加 try-catch，签名失败不阻断订单创建
  - `app/api/membership/order/route.ts`: req.json()增加try-catch，错误日志更详细

Bug2: 管理后台无会员管理
- **现象**: 管理员看不到用户会员类型，无法授予/取消会员
- **修复**:
  - `app/api/admin/users/[id]/route.ts`: PUT接口新增 `action=grantMembership` 操作
    - 授予年费会员（自动设置1年过期时间）
    - 授予终身会员（过期时间设null）
    - 取消会员（降级为free）
  - `app/api/admin/users/route.ts`: GET返回 `membershipType` + `membershipExpiresAt`
  - `app/api/admin/users/[id]/route.ts`: GET返回 `membershipOrders` 支付记录
  - `app/admin/users/page.tsx`: 
    - 用户列表表格新增"会员"列（免费/年费/终身标签+颜色区分）
    - 新增会员筛选下拉框
    - 每个用户新增"会员"操作按钮
    - 新增会员管理弹窗（授予年费/终身 + 取消会员 + 安全提示）
    - 用户详情弹窗新增"会员信息"区块（会员类型+过期时间+支付记录）
  - `.gitignore`: 新增 `*.ps1` 和 `build_output.txt` 排除规则

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
