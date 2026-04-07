# AI Avatar Market 完成计划

> 使用 Superpowers 和 DeerFlow 方法论
> 目标：将当前 60-70% 完成度的演示项目转化为可运行的 MVP

## 核心原则

### 从 Superpowers 学习
1. **TDD (Test-Driven Development)** - 先写测试，再写代码
2. **YAGNI (You Aren't Gonna Need It)** - 只实现当前需要的功能
3. **DRY (Don't Repeat Yourself)** - 避免重复代码
4. **小步提交** - 每个任务 2-5 分钟，频繁提交

### 从 DeerFlow 学习
1. **技能驱动 (Skills)** - 将功能封装为可复用技能
2. **子代理协作** - 复杂任务分解给子代理
3. **上下文管理** - 保持上下文清晰，避免污染
4. **人机协同** - AI 做 80%，人做 20%

---

## 当前状态评估

### ✅ 已完成 (约 70%)
- [x] 项目架构设计 (Next.js + TypeScript + Tailwind)
- [x] 核心类型定义 (User, Avatar, Task, Message 等)
- [x] 数据层实现 (JSON 文件存储)
- [x] 前端页面 (首页、市场、创作者中心、创建分身、工作空间)
- [x] 演示版本 (dist/index.html)

### ❌ 未完成 (约 30% - 关键功能)
- [ ] 用户认证系统 (登录/注册)
- [ ] 真实 AI 集成 (对话功能)
- [ ] 支付系统 (微信支付)
- [ ] 文件上传 (头像/记忆文件)
- [ ] API 路由实现
- [ ] 组件完善

---

## 实施计划

### Phase 1: 基础架构完善 (优先级: 🔴 高)

#### Task 1: 创建 API 路由结构
**文件:**
- 创建: `app/api/auth/route.ts`
- 创建: `app/api/avatars/route.ts`
- 创建: `app/api/tasks/route.ts`
- 创建: `app/api/upload/route.ts`

**步骤:**
- [ ] 创建 Next.js API 路由基础结构
- [ ] 实现请求验证中间件
- [ ] 添加错误处理
- [ ] 提交

#### Task 2: 实现用户认证 API
**文件:**
- 修改: `app/api/auth/route.ts`
- 修改: `lib/db/index.ts` (添加密码字段)
- 创建: `lib/auth.ts`

**步骤:**
- [ ] 实现注册 API (POST /api/auth/register)
- [ ] 实现登录 API (POST /api/auth/login)
- [ ] 实现 JWT token 生成/验证
- [ ] 添加密码加密 (bcrypt)
- [ ] 提交

#### Task 3: 创建登录/注册页面
**文件:**
- 创建: `app/auth/login/page.tsx`
- 创建: `app/auth/register/page.tsx`
- 创建: `components/auth/LoginForm.tsx`
- 创建: `components/auth/RegisterForm.tsx`

**步骤:**
- [ ] 创建登录表单 UI
- [ ] 创建注册表单 UI
- [ ] 实现表单验证
- [ ] 集成 API 调用
- [ ] 提交

#### Task 4: 添加路由保护
**文件:**
- 修改: `app/layout.tsx`
- 创建: `components/auth/ProtectedRoute.tsx`
- 创建: `lib/hooks/useAuth.ts`

**步骤:**
- [ ] 创建认证上下文
- [ ] 实现受保护路由组件
- [ ] 在需要认证的页面添加保护
- [ ] 提交

---

### Phase 2: AI 对话功能 (优先级: 🔴 高)

#### Task 5: 集成 OpenClaw/AI 服务
**文件:**
- 创建: `lib/ai/openclaw.ts`
- 创建: `app/api/chat/route.ts`
- 修改: `app/client/workspace/page.tsx`

**步骤:**
- [ ] 创建 AI 服务适配器
- [ ] 实现聊天 API (POST /api/chat)
- [ ] 集成到工作空间页面
- [ ] 实现消息流式响应
- [ ] 提交

#### Task 6: 实现人机协同工作流
**文件:**
- 修改: `lib/types/index.ts` (完善工作流类型)
- 修改: `app/api/tasks/route.ts`
- 创建: `app/creator/review/page.tsx`

**步骤:**
- [ ] 实现 AI 任务处理逻辑
- [ ] 实现真人审核通知
- [ ] 创建审核页面 UI
- [ ] 实现审核通过/拒绝流程
- [ ] 提交

---

### Phase 3: 文件上传 (优先级: 🟡 中)

#### Task 7: 实现头像上传
**文件:**
- 创建: `app/api/upload/avatar/route.ts`
- 修改: `app/creator/avatar/create/page.tsx`
- 创建: `components/upload/AvatarUploader.tsx`

**步骤:**
- [ ] 创建文件上传 API
- [ ] 实现本地文件存储
- [ ] 创建头像上传组件
- [ ] 集成到创建分身流程
- [ ] 提交

#### Task 8: 实现记忆文件上传
**文件:**
- 创建: `app/api/upload/memory/route.ts`
- 修改: `components/avatar/MemoryFilesUpload.tsx`

**步骤:**
- [ ] 创建记忆文件上传 API
- [ ] 支持 .md 文件上传
- [ ] 集成到创建分身流程
- [ ] 提交

---

### Phase 4: 支付系统 (优先级: 🟡 中)

#### Task 9: 集成微信支付
**文件:**
- 创建: `lib/payment/wechat.ts`
- 创建: `app/api/payment/route.ts`
- 创建: `app/api/payment/callback/route.ts`

**步骤:**
- [ ] 实现微信支付统一下单
- [ ] 实现支付回调处理
- [ ] 创建支付页面
- [ ] 集成到雇佣流程
- [ ] 提交

---

### Phase 5: 组件完善 (优先级: 🟢 低)

#### Task 10: 完善 UI 组件
**文件:**
- 创建: `components/ui/Button.tsx`
- 创建: `components/ui/Input.tsx`
- 创建: `components/ui/Card.tsx`
- 创建: `components/ui/Modal.tsx`

**步骤:**
- [ ] 创建基础 Button 组件
- [ ] 创建 Input 组件
- [ ] 创建 Card 组件
- [ ] 创建 Modal 组件
- [ ] 提交

#### Task 11: 完善头像组件
**文件:**
- 创建: `components/avatar/AvatarCard.tsx`
- 创建: `components/avatar/AvatarList.tsx`
- 创建: `components/avatar/AvatarDetail.tsx`

**步骤:**
- [ ] 创建头像卡片组件
- [ ] 创建头像列表组件
- [ ] 创建头像详情组件
- [ ] 提交

#### Task 12: 完善聊天组件
**文件:**
- 创建: `components/chat/ChatWindow.tsx`
- 创建: `components/chat/MessageList.tsx`
- 创建: `components/chat/MessageInput.tsx`

**步骤:**
- [ ] 创建聊天窗口组件
- [ ] 创建消息列表组件
- [ ] 创建消息输入组件
- [ ] 提交

---

## 技术规范

### 代码规范
- TypeScript 严格模式
- 函数式组件 + Hooks
- 异步操作使用 async/await
- 错误处理使用 try/catch

### 提交规范
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具调整
```

### 文件命名
- 组件: PascalCase (e.g., `AvatarCard.tsx`)
- 工具函数: camelCase (e.g., `useAuth.ts`)
- API 路由: route.ts
- 样式: 同组件名 + `.module.css`

---

## 测试策略

### 单元测试
- 使用 Jest + React Testing Library
- 每个组件至少一个快照测试
- 关键逻辑单元测试覆盖

### 集成测试
- API 路由测试
- 用户流程端到端测试

---

## 完成标准

### MVP 完成 checklist
- [ ] 用户可以注册/登录
- [ ] 创作者可以创建分身
- [ ] 使用者可以浏览和雇佣分身
- [ ] 可以进行 AI 对话
- [ ] 创作者可以审核任务
- [ ] 支付流程可以完成

### 质量指标
- [ ] 所有 TypeScript 类型检查通过
- [ ] 构建无错误
- [ ] 核心功能手动测试通过

---

## 风险与应对

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| AI 集成复杂 | 中 | 高 | 使用模拟数据先完成 UI |
| 微信支付审核 | 中 | 高 | 先用模拟支付流程 |
| 时间不足 | 高 | 中 | 优先完成 Phase 1-2 |

---

## 下一步行动

1. **立即开始** Task 1: 创建 API 路由结构
2. **并行进行** Task 10: 完善基础 UI 组件
3. **每日检查** 进度，必要时调整优先级

---

*计划创建时间: 2026-04-07*
*预计完成时间: 待定*
