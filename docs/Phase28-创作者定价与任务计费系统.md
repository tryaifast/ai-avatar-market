# Phase 28: 创作者定价与任务计费系统

> 技术方案文档 - 方案2: 精确计费（推荐）
> 日期: 2026-04-16
> 商业模式: 平台抽成 10%，创作者自主定价，按实际 API 消耗结算

---

## 1. 业务目标

### 1.1 核心目标
- 创作者可自主设置服务定价（按小时 / 按项目固定价）
- 平台精确追踪每次 AI 对话的 token 消耗
- 任务完成后自动结算创作者收益（定价 × 90% - API 成本）
- 创作者后台实时查看收益明细

### 1.2 关键指标
| 指标 | 目标 |
|------|------|
| 定价配置完成率 | 100%（创建分身必须设置） |
| Token 统计准确率 | >99% |
| 结算延迟 | <1秒（任务完成时自动计算） |
| 创作者收益透明度 | 实时可查 |

---

## 2. 技术架构

### 2.1 数据模型变更

#### 2.1.1 avatars 表（新增定价字段）
```sql
-- 新增字段
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS hourly_price INTEGER DEFAULT 200;      -- 分/小时
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS fixed_price INTEGER DEFAULT 5000;      -- 分/项目
ALTER TABLE avatars ADD COLUMN IF NOT EXISTS token_price INTEGER DEFAULT 500000;    -- 分/百万tokens (默认¥5000/百万token)

-- 验证约束
ALTER TABLE avatars ADD CONSTRAINT chk_hourly_price_positive CHECK (hourly_price > 0);
ALTER TABLE avatars ADD CONSTRAINT chk_fixed_price_positive CHECK (fixed_price > 0);
ALTER TABLE avatars ADD CONSTRAINT chk_token_price_positive CHECK (token_price > 0);
```

#### 2.1.2 tasks 表（新增计费字段）
```sql
-- 新增字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0;       -- 累计 tokens
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0;          -- 实际 API 成本（分）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS creator_earnings INTEGER DEFAULT 0;  -- 创作者最终收益（分）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'hourly';  -- hourly | fixed | token
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;             -- 定价金额（分）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS token_budget INTEGER DEFAULT 1000000; -- token预算（默认100万）

-- 验证约束
ALTER TABLE tasks ADD CONSTRAINT chk_pricing_type CHECK (pricing_type IN ('hourly', 'fixed', 'token'));
```

#### 2.1.3 task_messages 表（新增 token 统计）
```sql
-- 新增字段
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0;
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0;
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0;
ALTER TABLE task_messages ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0;  -- 分
```

### 2.2 API 变更

#### 2.2.1 POST /api/avatars（创建分身）
**新增参数**:
```typescript
{
  name: string;
  description: string;
  // ... 原有字段
  hourlyPrice: number;  // 元/小时，转换成分存储
  fixedPrice: number;   // 元/项目，转换成分存储
  tokenPrice: number;   // 元/百万tokens，转换成分存储
}
```

#### 2.2.2 POST /api/chat（AI 对话）
**响应新增**:
```typescript
{
  success: true,
  response: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    apiCost: number;  // 分
  }
}
```

**副作用**: 自动更新 task.token_usage, task.api_cost

#### 2.2.3 POST /api/hire/order（雇佣订单）
**修改**: 从 avatar 读取定价，写入 task.price

**token 计费模式特殊处理**:
```typescript
if (pricingType === 'token') {
  // token 模式：不预收全款，设置预算上限
  taskData.pricing_type = 'token';
  taskData.price = avatar.token_price;  // 每百万 token 价格
  taskData.token_budget = 1000000;      // 默认预算 100 万 token
}
```

#### 2.2.4 PUT /api/tasks/[id]/complete（任务完成）
**新增**: 计算并更新 creator_earnings
```typescript
creatorEarnings = Math.floor(task.price * 0.9) - task.api_cost
```

#### 2.2.5 GET /api/creator/earnings（收益看板）
**新增 API**:
```typescript
{
  totalEarnings: number;      // 累计收益
  pendingEarnings: number;    // 待结算
  availableBalance: number;   // 可提现
  monthlyStats: {
    month: string;
    earnings: number;
    tasks: number;
  }[];
}
```

---

## 3. 计费公式

### 3.1 API 成本计算
```typescript
// 基于 Kimi 定价（阿里云百炼）
const PRICING = {
  'kimi-turbo': { input: 0.000012, output: 0.000012 },  // ¥/token
  'kimi-pro': { input: 0.000024, output: 0.000024 },
};

function calculateApiCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = PRICING[model];
  const cost = (inputTokens * rate.input + outputTokens * rate.output);
  return Math.ceil(cost * 100);  // 转换成分
}
```

### 3.2 创作者收益计算
```typescript
function calculateCreatorEarnings(task: Task): number {
  // token 计费模式：按实际 token 消耗 × 单价
  if (task.pricing_type === 'token') {
    const millions = Math.ceil(task.token_usage / 1000000);  // 不足百万按百万算
    const grossRevenue = millions * task.price;              // 收入
    const platformFee = Math.floor(grossRevenue * 0.1);      // 10% 抽成
    const netEarnings = grossRevenue - platformFee - task.api_cost;
    return Math.max(0, netEarnings);
  }
  
  // hourly / fixed 模式
  const platformFee = Math.floor(task.price * 0.1);  // 10% 抽成
  const grossEarnings = task.price - platformFee;     // 90% 到手
  const netEarnings = grossEarnings - task.api_cost;  // 扣 API 成本
  return Math.max(0, netEarnings);                    // 不能为负
}
```

### 3.3 定价建议算法
```typescript
function suggestPricing(avatarStats: AvatarStats): { hourly: number; fixed: number; token: number } {
  const avgMarketHourly = 200;      // 元/小时
  const avgMarketFixed = 3000;      // 元/项目
  const avgMarketToken = 5000;      // 元/百万tokens
  
  // 基于评分和完成量调整
  const ratingMultiplier = (avatarStats.rating || 4) / 4;
  const experienceMultiplier = Math.min(1 + (avatarStats.completedTasks || 0) * 0.05, 2);
  
  return {
    hourly: Math.round(avgMarketHourly * ratingMultiplier * experienceMultiplier),
    fixed: Math.round(avgMarketFixed * ratingMultiplier * experienceMultiplier),
    token: Math.round(avgMarketToken * ratingMultiplier * experienceMultiplier),
  };
}
```

---

## 4. 人机协同 MVP

### 4.1 创作者后台「待处理」列表
```typescript
// GET /api/creator/tasks?status=needs_review
{
  tasks: {
    id: string;
    title: string;
    clientName: string;
    aiResponse: string;       // AI 生成的回复
    needsHumanReview: boolean; // 是否需要人工介入
    reviewReason: string;     // 原因：敏感内容/质量不足/客户要求
    createdAt: string;
  }[];
}
```

### 4.2 人工介入流程
1. 创作者后台收到「需审核」通知
2. 查看 AI 生成的回复
3. 选择：
   - ✅ 直接发送（无需修改）
   - ✏️ 编辑后发送（修改内容）
   - 🔄 转人工处理（暂停 AI，由创作者亲自回复）

### 4.3 计费规则
- AI 自动处理阶段：按 token 计费
- 人工介入阶段：**暂停 token 计费**，创作者按小时收费

---

## 5. 页面清单

### 5.1 修改页面

| 页面 | 修改内容 |
|------|---------|
| `/creator/avatar/create` | 新增定价设置表单（小时价/固定价） |
| `/creator/avatars/[id]/settings` | 新增定价修改功能 |
| `/api/chat` | 新增 token 统计和成本计算 |
| `/api/hire/order` | 从 avatar 读取定价，创建 task 时写入 price |
| `/api/tasks/[id]/process` | 任务完成时触发结算计算 |

### 5.2 新建页面

| 页面 | 功能 |
|------|------|
| `/creator/earnings` | 收益看板（总收益/待结算/可提现/月度统计） |
| `/creator/tasks/review` | 待审核任务列表（人机协同入口） |
| `/api/creator/earnings` | 收益数据 API |
| `/api/creator/tasks/review` | 待审核任务 API |

---

## 6. 技术实现要点

### 6.1 Token 统计实现
```typescript
// lib/ai/kimi.ts
export async function chatWithKimi(messages: Message[], model: string = 'kimi-turbo') {
  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KIMI_API_KEY}` },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });
  
  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}
```

### 6.2 成本实时更新
```typescript
// 每次对话后
await DB.Task.updateTokenUsage(taskId, {
  tokenUsage: totalTokens,
  apiCost: calculateApiCost(model, inputTokens, outputTokens),
});
```

### 6.3 结算触发点
```typescript
// 任务完成时（客户确认交付或自动完成）
async function completeTask(taskId: string) {
  const task = await DB.Task.getById(taskId);
  const earnings = calculateCreatorEarnings(task);
  
  await DB.Task.update(taskId, {
    status: 'completed',
    creatorEarnings: earnings,
    completedAt: new Date().toISOString(),
  });
  
  // 通知创作者
  await DB.Notification.create({
    userId: task.creatorId,
    type: 'task_completed',
    title: '任务已完成',
    content: `任务「${task.title}」已完成，收益 ¥${earnings/100} 已到账`,
  });
}
```

---

## 7. 数据库迁移脚本

```sql
-- Phase 28: 创作者定价与任务计费系统
-- 执行位置: Supabase SQL Editor

-- 1. avatars 表新增定价字段
ALTER TABLE avatars 
  ADD COLUMN IF NOT EXISTS hourly_price INTEGER DEFAULT 200 CHECK (hourly_price > 0),
  ADD COLUMN IF NOT EXISTS fixed_price INTEGER DEFAULT 5000 CHECK (fixed_price > 0),
  ADD COLUMN IF NOT EXISTS token_price INTEGER DEFAULT 500000 CHECK (token_price > 0);  -- 分/百万tokens

-- 2. tasks 表新增计费字段
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_earnings INTEGER DEFAULT 0,
  ALTER COLUMN pricing_type TYPE TEXT,
  ADD CONSTRAINT chk_pricing_type CHECK (pricing_type IN ('hourly', 'fixed', 'token')),
  ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_budget INTEGER DEFAULT 1000000;  -- token预算上限

-- 3. task_messages 表新增 token 统计
ALTER TABLE task_messages 
  ADD COLUMN IF NOT EXISTS input_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_cost INTEGER DEFAULT 0;

-- 4. 为已有数据设置默认值
UPDATE avatars SET hourly_price = 200 WHERE hourly_price IS NULL;
UPDATE avatars SET fixed_price = 5000 WHERE fixed_price IS NULL;
UPDATE avatars SET token_price = 500000 WHERE token_price IS NULL;
UPDATE tasks SET pricing_type = 'hourly' WHERE pricing_type IS NULL OR pricing_type NOT IN ('hourly', 'fixed', 'token');
UPDATE tasks SET token_budget = 1000000 WHERE token_budget IS NULL;
```

---

## 8. 验收标准

### 8.1 功能验收
- [ ] 创建分身时必须设置 hourlyPrice 和 fixedPrice
- [ ] AI 对话后 task.token_usage 和 task.api_cost 正确更新
- [ ] 任务完成时 creator_earnings 自动计算
- [ ] 创作者收益看板显示正确数据

### 8.2 性能验收
- [ ] Token 统计不增加对话延迟（<50ms）
- [ ] 收益看板加载 <1s

### 8.3 安全验收
- [ ] 只有任务 creator 能查看收益详情
- [ ] API 成本计算防止负数/溢出

---

## 9. 后续迭代计划

### Phase 29: 提现系统
- 创作者申请提现
- 平台审核 + 支付宝/微信转账
- 提现记录和手续费

### Phase 30: 人机协同增强
- AI 自动判断「需人工审核」阈值
- 创作者设置「自动通过/需审核」规则
- 实时协作编辑界面

---

## 10. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Kimi API 涨价 | 成本上升 | 定价建议算法动态调整 |
| Token 统计不准 | 结算纠纷 | 预留误差缓冲（±5%） |
| 创作者收益为负 | 体验差 | 设置最低收益保障（¥10） |

---

**下一步**: 确认此 PRD 后，进入 Writing Plans 阶段，输出详细开发计划。
