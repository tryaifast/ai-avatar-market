# AI分身市场 - AI大模型托管方案 PRD

**文档版本**: v1.0  
**创建日期**: 2026-04-16  
**作者**: AI Assistant  
**状态**: 规划中

---

## 一、需求背景

### 1.1 当前问题
AI分身被雇佣后，需要与雇佣者协作完成实际生产力交付。这要求：
- AI大模型 + 个人技能和知识库融合 + 真人背后管理结果
- 才能达到真实的生产力交付标准

### 1.2 核心决策
**AI大模型应该放在哪里？**
- 方案A：平台托管（推荐）
- 方案B：用户自备API

---

## 二、方案对比分析

### 2.1 方案A：平台托管大模型（推荐）

**架构流程**
```
用户 → 你的站点 → 你的大模型API → 返回结果
```

**优点**
| 维度 | 说明 |
|------|------|
| 体验统一 | 所有分身使用相同质量的AI，保证输出标准 |
| 成本控制 | 批量采购API，成本更低 |
| 技术可控 | 统一优化、升级模型，修复问题 |
| 商业模式 | 按调用量收费，平台抽成清晰 |
| 数据沉淀 | 对话数据留在平台，用于优化分身 |

**缺点**
- 需要承担API成本（可向用户收费转嫁）

**成本转嫁方式**
```
用户付费 = 分身租赁费 + AI调用费（按token计费）
平台收入 = 分身租赁抽成 + AI调用差价
```

---

### 2.2 方案B：用户自备大模型API

**架构流程**
```
用户 → 你的站点 → 中转 → 用户自己的API Key → 大模型
```

**缺点**
| 维度 | 说明 |
|------|------|
| 体验不可控 | 不同用户AI质量差异大 |
| 安全隐患 | 用户API Key在你的服务器，有泄露风险 |
| 商业模式弱 | 只是信息中转，难以收费 |
| 技术复杂 | 需要支持多种模型接口，兼容性问题多 |
| 无法优化 | 无法基于对话数据改进分身 |

---

## 三、决策结论

**选择方案A：平台托管大模型**

**核心原因**
- 用户体验一致性（⭐⭐⭐⭐⭐）
- 商业模式清晰（⭐⭐⭐⭐⭐）
- 技术可控性高（⭐⭐⭐⭐⭐）
- 长期数据价值（⭐⭐⭐⭐⭐）

---

## 四、详细设计方案

### 4.1 分层定价模型

| 层级 | 模型 | 适用场景 | 成本 |
|------|------|----------|------|
| 基础版 | kimi-k2-5 | 简单问答、日常任务 | 低 |
| 专业版 | kimi-k2-5 (高参数) | 复杂分析、专业任务 | 中 |
| 旗舰版 | GPT-4 / Claude-3 | 高难度任务、创意工作 | 高 |

### 4.2 计费模式

**创作者侧**
- 创作者创建分身时选择"智能等级"
- 平台根据等级预估单次调用成本

**用户侧**
- 雇佣时显示预估AI调用成本
- 实际按token消耗计费

**平台侧**
- 批量采购API获取折扣
- 向用户收取略高于成本的价格
- 差价作为平台收入

### 4.3 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户端                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   雇佣分身   │    │   开始对话   │    │   提交任务   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     平台服务层                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   身份验证   │    │   计费系统   │    │   任务管理   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                          │                              │
│  ┌───────────────────────▼─────────────────────────────┐│
│  │              AI对话服务 (Next.js API)                ││
│  │  ┌───────────────────────────────────────────────┐  ││
│  │  │  1. 获取分身配置 (人格/知识库/技能)            │  ││
│  │  │  2. 生成系统提示词                             │  ││
│  │  │  3. 构建对话历史                               │  ││
│  │  │  4. 调用大模型API (Kimi/阿里云百炼)            │  ││
│  │  │  5. 保存对话记录                               │  ││
│  │  │  6. 计费统计                                   │  ││
│  │  └───────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    外部服务层                            │
│  ┌─────────────────────────────────────────────────────┐│
│  │              阿里云百炼 / Kimi API                   ││
│  │  - 统一调用接口                                     ││
│  │  - 流式响应支持                                     ││
│  │  - Token计费                                        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 4.4 核心流程

**流程1：用户与AI分身对话**
```
1. 用户发送消息
2. 平台验证用户权限和余额
3. 获取分身配置（人格/知识库/技能）
4. 生成系统提示词
5. 构建完整对话历史
6. 调用大模型API
7. 流式返回AI回复
8. 保存对话记录
9. 统计Token消耗并计费
```

**流程2：AI自动完成任务**
```
1. 用户提交任务描述
2. 平台创建任务记录
3. AI分身自动处理（异步）
4. 生成任务结果
5. 创作者审核（人机协同）
6. 交付给用户
7. 结算费用
```

---

## 五、当前代码适配分析

### 5.1 已有基础（✅ 已完成）

根据代码读取，项目已实现：

| 模块 | 状态 | 说明 |
|------|------|------|
| Kimi API集成 | ✅ | `lib/ai/kimi.ts` 已实现完整API调用 |
| 流式对话 | ✅ | `streamChatWithKimi` 支持实时显示 |
| 系统提示词生成 | ✅ | `generateAvatarSystemPrompt` 已集成人格/知识库 |
| 对话API路由 | ✅ | `app/api/chat/route.ts` 已处理消息存储 |
| 任务自动处理 | ✅ | `processAITask` 已实现自动完成 |

### 5.2 需要新增（⏳ 待开发）

| 模块 | 优先级 | 说明 |
|------|--------|------|
| 计费系统 | P0 | Token消耗统计、费用计算、余额检查 |
| 多模型支持 | P1 | 支持GPT-4、Claude等高端模型 |
| 智能等级配置 | P1 | 创作者选择分身智能等级 |
| 成本监控 | P2 | 实时API成本监控、告警 |
| 对话优化 | P2 | 基于历史数据的提示词优化 |

---

## 六、GSD开发计划

### Phase 1: Plan（规划）

**任务清单**
- [ ] 1.1 确定计费模型和定价策略
- [ ] 1.2 设计数据库表结构（计费记录、余额、模型配置）
- [ ] 1.3 设计API接口（计费查询、余额充值）
- [ ] 1.4 评估阿里云百炼 vs Kimi官方API成本

**交付物**
- 计费系统设计文档
- 数据库Schema
- API接口文档

---

### Phase 2: Do（实施）

**任务清单**
- [ ] 2.1 创建计费系统数据库表
- [ ] 2.2 实现Token消耗统计
- [ ] 2.3 实现余额检查和扣费逻辑
- [ ] 2.4 添加智能等级配置（创作者端）
- [ ] 2.5 添加费用显示（用户端）
- [ ] 2.6 集成阿里云百炼API（备用）

**交付物**
- 计费系统代码
- 测试用例
- 更新后的API路由

---

### Phase 3: Check（验证）

**任务清单**
- [ ] 3.1 测试Token统计准确性
- [ ] 3.2 测试计费逻辑
- [ ] 3.3 测试余额不足场景
- [ ] 3.4 测试多模型切换
- [ ] 3.5 成本核算验证

**交付物**
- 测试报告
- Bug修复记录

---

### Phase 4: Act（优化）

**任务清单**
- [ ] 4.1 优化提示词生成（降低成本）
- [ ] 4.2 添加对话缓存（重复问题复用）
- [ ] 4.3 监控和告警系统
- [ ] 4.4 创作者收益报表优化

**交付物**
- 优化报告
- 监控仪表盘

---

## 七、技术实现细节

### 7.1 数据库表设计

```sql
-- 用户余额表
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  balance_cents INTEGER DEFAULT 0, -- 余额（分）
  total_spent_cents INTEGER DEFAULT 0, -- 累计消费
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API调用记录表
CREATE TABLE api_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  avatar_id UUID REFERENCES avatars(id),
  model_name VARCHAR(50), -- 使用的模型
  prompt_tokens INTEGER, -- 输入token数
  completion_tokens INTEGER, -- 输出token数
  total_tokens INTEGER, -- 总token数
  cost_cents INTEGER, -- 成本（分）
  created_at TIMESTAMP DEFAULT NOW()
);

-- 模型配置表
CREATE TABLE model_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50), -- 模型名称
  provider VARCHAR(50), -- 提供商（kimi/openai）
  model_id VARCHAR(100), -- 模型ID
  input_price_per_1k DECIMAL(10,6), -- 每1k token输入价格
  output_price_per_1k DECIMAL(10,6), -- 每1k token输出价格
  is_active BOOLEAN DEFAULT true
);

-- 分身智能等级配置
ALTER TABLE avatars ADD COLUMN intelligence_level VARCHAR(20) DEFAULT 'standard';
-- standard: 标准版, professional: 专业版, premium: 旗舰版
```

### 7.2 API计费逻辑

```typescript
// lib/billing/index.ts

export async function calculateAPICost(
  model: string,
  promptTokens: number,
  completionTokens: number
): Promise<number> {
  const config = await DB.ModelConfig.getByName(model);
  
  const inputCost = (promptTokens / 1000) * config.input_price_per_1k;
  const outputCost = (completionTokens / 1000) * config.output_price_per_1k;
  
  // 转换为分（整数）
  return Math.ceil((inputCost + outputCost) * 100);
}

export async function chargeUser(
  userId: string,
  costCents: number
): Promise<boolean> {
  const balance = await DB.UserBalance.getByUserId(userId);
  
  if (balance.balance_cents < costCents) {
    throw new Error('余额不足');
  }
  
  await DB.UserBalance.deduct(userId, costCents);
  return true;
}
```

### 7.3 修改现有代码

**修改1: 聊天API添加计费**
```typescript
// app/api/chat/route.ts

export async function POST(req: NextRequest) {
  // ... 原有代码 ...
  
  // 调用Kimi API前检查余额
  const estimatedCost = await estimateCost(messages);
  await checkBalance(task.clientId, estimatedCost);
  
  // 调用Kimi API
  const aiResponse = await chatWithKimi({ messages });
  
  // 获取实际Token消耗
  const usage = await getTokenUsage();
  
  // 计算实际费用
  const actualCost = await calculateAPICost(
    'kimi-k2-5',
    usage.prompt_tokens,
    usage.completion_tokens
  );
  
  // 扣费
  await chargeUser(task.clientId, actualCost);
  
  // 记录API调用
  await DB.APICall.create({
    userId: task.clientId,
    taskId,
    avatarId: task.avatarId,
    model