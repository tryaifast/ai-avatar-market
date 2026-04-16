# AI分身市场 - GSD开发计划

**文档版本**: v1.0  
**创建日期**: 2026-04-16  
**作者**: AI Assistant  
**状态**: 规划中

---

## 当前状态

**项目**: AI Avatar Market (AI分身市场)  
**已完成**: 基础架构、用户系统、分身管理、任务系统、AI对话  
**进行中**: AI大模型托管方案实施  
**目标**: 实现平台托管大模型 + 计费系统

---

## Phase 1: Plan（规划）- 预计2天

### 1.1 需求分析

**现状**
- 已实现Kimi API调用 (`lib/ai/kimi.ts`)
- 已实现流式对话 (`streamChatWithKimi`)
- 已实现系统提示词生成 (`generateAvatarSystemPrompt`)
- 已实现对话API路由 (`app/api/chat/route.ts`)

**缺失**
- 计费系统（Token统计、费用计算）
- 余额系统（用户充值、扣费）
- 多模型支持（仅Kimi，需扩展）
- 智能等级配置（创作者选择模型等级）

### 1.2 技术方案

**方案选择**: 平台托管大模型（方案A）

**技术栈**
- 大模型: 阿里云百炼 Kimi API
- 计费: 按Token消耗计费
- 数据库: Supabase (PostgreSQL)
- 后端: Next.js API Routes

### 1.3 数据库设计

**新增表**
1. `user_balances` - 用户余额
2. `api_calls` - API调用记录
3. `model_configs` - 模型配置
4. `billing_records` - 计费记录

**修改表**
1. `avatars` - 添加 `intelligence_level` 字段
2. `tasks` - 添加 `ai_cost_cents` 字段

### 1.4 API设计

**新增API**
- `GET /api/billing/balance` - 查询余额
- `POST /api/billing/recharge` - 充值（模拟）
- `GET /api/billing/records` - 查询计费记录
- `GET /api/models` - 获取模型配置

**修改API**
- `POST /api/chat` - 添加计费逻辑
- `POST /api/tasks/create` - 添加预估费用

### 1.5 定价策略

| 智能等级 | 模型 | 输入价格/1K | 输出价格/1K | 平台加价 |
|----------|------|-------------|-------------|----------|
| 标准版 | kimi-k2-5 | ¥0.012 | ¥0.012 | 20% |
| 专业版 | kimi-k2-5-32k | ¥0.024 | ¥0.024 | 20% |
| 旗舰版 | kimi-k2-5-128k | ¥0.060 | ¥0.060 | 20% |

---

## Phase 2: Do（实施）- 预计5天

### 2.1 数据库迁移（Day 1）

**任务**
- [ ] 创建 `user_balances` 表
- [ ] 创建 `api_calls` 表
- [ ] 创建 `model_configs` 表
- [ ] 创建 `billing_records` 表
- [ ] 修改 `avatars` 表
- [ ] 修改 `tasks` 表
- [ ] 创建数据库迁移脚本

**代码位置**
- `supabase/migrations/20260416_add_billing.sql`

### 2.2 计费系统核心（Day 2）

**任务**
- [ ] 创建 `lib/billing/index.ts`
- [ ] 实现 `calculateAPICost()` 函数
- [ ] 实现 `chargeUser()` 函数
- [ ] 实现 `checkBalance()` 函数
- [ ] 实现 `estimateCost()` 函数
- [ ] 创建 `lib/db/billing.ts` 数据层

**代码位置**
- `lib/billing/index.ts`
- `lib/db/billing.ts`

### 2.3 修改聊天API（Day 3）

**任务**
- [ ] 修改 `app/api/chat/route.ts`
- [ ] 添加余额检查
- [ ] 添加Token统计
- [ ] 添加计费逻辑
- [ ] 添加API调用记录
- [ ] 处理余额不足错误

**代码位置**
- `app/api/chat/route.ts`（修改）

### 2.4 创作者端配置（Day 4）

**任务**
- [ ] 修改分身创建表单
- [ ] 添加智能等级选择
- [ ] 显示预估成本
- [ ] 修改分身编辑页面
- [ ] 添加模型配置管理（管理员）

**代码位置**
- `app/creator/avatar/create/page.tsx`（修改）
- `app/creator/avatar/[id]/edit/page.tsx`（修改）
- `app/admin/models/page.tsx`（新增）

### 2.5 用户端显示（Day 5）

**任务**
- [ ] 添加余额显示（导航栏）
- [ ] 添加充值页面（模拟）
- [ ] 雇佣页面显示预估费用
- [ ] 任务页面显示实际费用
- [ ] 添加计费记录查询

**代码位置**
- `components/layout/Navbar.tsx`（修改）
- `app/client/balance/page.tsx`（新增）
- `app/client/hire/[id]/page.tsx`（修改）
- `app/client/tasks/page.tsx`（修改）

---

## Phase 3: Check（验证）- 预计2天

### 3.1 功能测试

**测试用例**
- [ ] TC1: 正常对话流程，余额充足
- [ ] TC2: 余额不足，对话被拒绝
- [ ] TC3: Token统计准确性验证
- [ ] TC4: 费用计算准确性验证
- [ ] TC5: 流式对话计费正确性
- [ ] TC6: 多模型切换功能
- [ ] TC7: 智能等级配置生效
- [ ] TC8: 计费记录查询正确

### 3.2 性能测试

**测试项**
- [ ] PT1: 并发对话性能
- [ ] PT2: 计费系统响应时间
- [ ] PT3: 数据库查询性能
- [ ] PT4: API限流测试

### 3.3 成本测试

**测试项**
- [ ] CT1: 实际Token消耗 vs 预估
- [ ] CT2: 平台成本核算
- [ ] CT3: 定价策略验证

### 3.4 Bug修复

**记录并修复测试中发现的问题**

---

## Phase 4: Act（优化）- 预计3天

### 4.1 提示词优化

**目标**: 降低Token消耗，提高输出质量

**任务**
- [ ] 分析高频对话，优化系统提示词
- [ ] 添加对话缓存（重复问题复用）
- [ ] 优化上下文长度控制

### 4.2 监控告警

**任务**
- [ ] 添加API调用监控
- [ ] 添加成本监控
- [ ] 添加余额不足告警
- [ ] 创建监控仪表盘

**代码位置**
- `app/admin/monitoring/page.tsx`

### 4.3 创作者报表优化

**任务**
- [ ] 添加AI调用统计
- [ ] 添加成本明细
- [ ] 添加收益分析
- [ ] 优化收益报表

**代码位置**
- `app/creator/dashboard/page.tsx`（修改）
- `app/creator/earnings/page.tsx`（修改）

### 4.4 文档更新

**任务**
- [ ] 更新README.md
- [ ] 更新API文档
- [ ] 创建计费系统说明
- [ ] 更新部署文档

---

## 任务分配

| 阶段 | 任务 | 负责人 | 预计时间 | 优先级 |
|------|------|--------|----------|--------|
| Plan | 数据库设计 | AI Assistant | 1天 | P0 |
| Plan | API设计 | AI Assistant | 1天 | P0 |
| Do | 数据库迁移 | AI Assistant | 1天 | P0 |
| Do | 计费系统核心 | AI Assistant | 1天 | P0 |
| Do | 修改聊天API | AI Assistant | 1天 | P0 |
| Do | 创作者端配置 | AI Assistant | 1天 | P1 |
| Do | 用户端显示 | AI Assistant | 1天 | P1 |
| Check | 功能测试 | AI Assistant | 1天 | P0 |
| Check | 性能测试 | AI Assistant | 1天 | P1 |
| Act | 提示词优化 | AI Assistant | 1天 | P2 |
| Act | 监控告警 | AI Assistant | 1天 | P2 |
| Act | 报表优化 | AI Assistant | 1天 | P2 |

**总预计时间**: 12天

---

## 风险评估

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| API成本超支 | 中 | 高 | 设置成本上限告警，优化提示词 |
| Token统计不准确 | 低 | 高 | 多轮测试验证，与Kimi账单对比 |
| 余额系统并发问题 | 中 | 中 | 使用数据库事务，乐观锁 |
| 用户不接受计费 | 中 | 高 | 提供免费试用额度，透明定价 |

---

## 成功标准

**功能标准**
- [ ] 用户余额系统正常运行
- [ ] Token统计准确率达到99%以上
- [ ] 计费逻辑无错误
- [ ] 多模型切换正常

**业务标准**
- [ ] 平台API成本可控
- [ ] 创作者收益提升20%
- [ ] 用户满意度>80%

**技术标准**
- [ ] API响应时间<500ms
- [ ] 系统可用性>99%
- [ ] 无P0级Bug

---

## 附录

### A. 参考文档
- PRD-AI大模型托管方案.md
- 阿里云百炼API文档
- Kimi API文档

### B. 相关代码
- lib/ai/kimi.ts - Kimi API集成
- app/api/chat/route.ts - 聊天API
- lib/db/supabase.ts - 数据库操作

### C. 测试账号
- 测试用户: test@example.com
- 测试创作者: creator@example.com
- 测试余额: ¥100.00

---

**最后更新**: 2026-04-16  
**下次评审**: Phase 2完成后