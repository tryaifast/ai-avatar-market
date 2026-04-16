# Phase 28: 开发计划

> 基于 Superpowers Writing Plans 规范
> 任务粒度: 2-5 分钟
> 无 TBD/TODO/占位符

---

## Phase 28.1: 数据库迁移

### 任务 1.1: 执行 SQL 迁移
**文件**: `supabase/migrations/phase28_pricing_and_billing.sql`
**命令**: 在 Supabase SQL Editor 执行
**验证**: `\d avatars` 确认 hourly_price/fixed_price 字段存在

---

## Phase 28.2: 后端 API

### 任务 2.1: 扩展创建分身 API
**文件**: `app/api/avatars/route.ts`
**修改**:
```typescript
// POST handler 解析新增字段
const { hourlyPrice, fixedPrice, tokenPrice } = body;
const data: any = {
  // ... 原有字段
  hourly_price: Math.round(hourlyPrice * 100),
  fixed_price: Math.round(fixedPrice * 100),
  token_price: Math.round(tokenPrice * 100),
};
```
**验证**: POST /api/avatars 带 pricing 字段，返回 200

### 任务 2.2: 修改 Kimi Chat 工具
**文件**: `lib/ai/kimi.ts`（新建或修改）
**完整代码**:
```typescript
import { KIMI_API_KEY, KIMI_API_URL } from '@/lib/constants';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export async function chatWithKimi(
  messages: ChatMessage[],
  model: string = 'kimi-turbo'
): Promise<ChatResponse> {
  const response = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

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

// API 成本计算（分）
export function calculateApiCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const PRICING: Record<string, { input: number; output: number }> = {
    'kimi-turbo': { input: 0.000012, output: 0.000012 },
    'kimi-pro': { input: 0.000024, output: 0.000024 },
  };

  const rate = PRICING[model] || PRICING['kimi-turbo'];
  const cost = inputTokens * rate.input + outputTokens * rate.output;
  return Math.ceil(cost * 100); // 转为分
}
```
**验证**: 单元测试通过（input 1000/output 500 tokens → cost ≈ 1-2 分）

### 任务 2.3: 修改 Chat API
**文件**: `app/api/chat/route.ts`
**修改步骤**:
1. 调用 `chatWithKimi` 获取内容和 usage
2. 计算 `apiCost = calculateApiCost(model, usage.inputTokens, usage.outputTokens)`
3. 保存 message 到 task_messages 表（带 token 统计）
4. 更新 task.token_usage 和 task.api_cost
5. 返回 `{ response, usage, apiCost }`

**验证**: POST /api/chat 后检查 DB，token_usage 和 api_cost 已更新

### 任务 2.4: 修改雇佣订单 API
**文件**: `app/api/hire/order/route.ts`
**修改**:
```typescript
// 查询 avatar 时获取定价
const avatar = await DB.Avatar.getById(avatarId);
const pricingType = plan; // 'hourly' | 'fixed' | 'token'

let price = 0;
let tokenBudget = 1000000;

if (pricingType === 'hourly') {
  price = avatar.hourly_price * hours;
} else if (pricingType === 'fixed') {
  price = avatar.fixed_price;
} else if (pricingType === 'token') {
  price = avatar.token_price;  // 每百万 token 价格
  tokenBudget = 1000000;       // 默认预算 100 万 token
}

// 创建 task 时写入
const taskData = {
  // ... 原有字段
  pricing_type: pricingType,
  price: price,
  token_budget: tokenBudget,
  token_usage: 0,
  api_cost: 0,
  creator_earnings: 0,
};
```
**验证**: 创建雇佣订单后，task 表的 price/pricing_type 正确

### 任务 2.5: 新建任务完成 API
**文件**: `app/api/tasks/[id]/complete/route.ts`
**完整代码**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// 计算创作者收益
function calculateCreatorEarnings(task: any): number {
  // token 计费模式：按实际 token 消耗 × 单价（不足百万按百万算）
  if (task.pricing_type === 'token') {
    const millions = Math.ceil(task.token_usage / 1000000);
    const grossRevenue = millions * task.price;
    const platformFee = Math.floor(grossRevenue * 0.1);
    const netEarnings = grossRevenue - platformFee - task.api_cost;
    return Math.max(0, netEarnings);
  }
  
  // hourly / fixed 模式
  const platformFee = Math.floor(task.price * 0.1);
  const grossEarnings = task.price - platformFee;
  const netEarnings = grossEarnings - task.api_cost;
  return Math.max(0, netEarnings);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const task = await DB.Task.getById(params.id);
    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    // 只有客户或创作者可以完成任务
    if (task.clientId !== auth.userId && task.creatorId !== auth.userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    // 计算创作者收益
    const creatorEarnings = calculateCreatorEarnings(task);

    // 更新任务
    const { error } = await DB.db
      .from('tasks')
      .update({
        status: 'completed',
        creator_earnings: creatorEarnings,
        completed_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    // 通知创作者
    await DB.db.from('notifications').insert({
      user_id: task.creatorId,
      type: 'task_completed',
      title: '任务已完成',
      content: `任务「${task.title}」已完成，收益 ¥${(creatorEarnings / 100).toFixed(2)} 已到账`,
      read: false,
    });

    return NextResponse.json({
      success: true,
      creatorEarnings,
    });
  } catch (error: any) {
    console.error('[tasks/complete] Error:', error);
    return NextResponse.json(
      { error: error.message || '完成任务失败' },
      { status: 500 }
    );
  }
}
```
**验证**: PUT /api/tasks/[id]/complete 返回 creatorEarnings 正确

### 任务 2.6: 新建收益看板 API
**文件**: `app/api/creator/earnings/route.ts`
**完整代码**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取所有已完成的任务
    const { data: tasks, error } = await DB.db
      .from('tasks')
      .select('*')
      .eq('creator_id', auth.userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // 计算统计数据
    const totalEarnings = tasks?.reduce((sum, t) => sum + (t.creator_earnings || 0), 0) || 0;
    const pendingTasks = tasks?.filter(t => t.payment_status === 'held') || [];
    const pendingEarnings = pendingTasks.reduce((sum, t) => sum + (t.creator_earnings || 0), 0);
    const availableBalance = totalEarnings - pendingEarnings; // 简化逻辑，实际需关联提现表

    // 月度统计（最近6个月）
    const monthlyStats: Record<string, { earnings: number; tasks: number }> = {};
    tasks?.forEach((t) => {
      const month = t.completed_at?.substring(0, 7) || 'unknown';
      if (!monthlyStats[month]) {
        monthlyStats[month] = { earnings: 0, tasks: 0 };
      }
      monthlyStats[month].earnings += t.creator_earnings || 0;
      monthlyStats[month].tasks += 1;
    });

    const monthlyStatsArray = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        earnings: stats.earnings,
        tasks: stats.tasks,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      totalEarnings,
      pendingEarnings,
      availableBalance,
      monthlyStats: monthlyStatsArray,
    });
  } catch (error: any) {
    console.error('[creator/earnings] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取收益数据失败' },
      { status: 500 }
    );
  }
}
```
**验证**: GET /api/creator/earnings 返回正确数据结构

---

## Phase 28.3: 前端页面

### 任务 3.1: 修改创建分身页
**文件**: `app/creator/avatar/create/page.tsx`
**新增表单字段**:
```typescript
const [hourlyPrice, setHourlyPrice] = useState(200);
const [fixedPrice, setFixedPrice] = useState(5000);
const [tokenPrice, setTokenPrice] = useState(5000);

// 在表单中添加
<div className="form-group">
  <label className="form-label">按小时定价（元/小时）</label>
  <input
    type="number"
    value={hourlyPrice}
    onChange={(e) => setHourlyPrice(Math.max(50, parseInt(e.target.value) || 0))}
    className="input"
    min={50}
  />
  <p className="text-sm text-gray-500 mt-1">适合咨询类服务，建议：¥200-500/小时</p>
</div>

<div className="form-group">
  <label className="form-label">按项目定价（元起）</label>
  <input
    type="number"
    value={fixedPrice}
    onChange={(e) => setFixedPrice(Math.max(500, parseInt(e.target.value) || 0))}
    className="input"
    min={500}
  />
  <p className="text-sm text-gray-500 mt-1">适合交付类服务，建议：¥3000-10000/项目</p>
</div>

<div className="form-group">
  <label className="form-label">按 Token 定价（元/百万Tokens）</label>
  <input
    type="number"
    value={tokenPrice}
    onChange={(e) => setTokenPrice(Math.max(1000, parseInt(e.target.value) || 0))}
    className="input"
    min={1000}
  />
  <p className="text-sm text-gray-500 mt-1">适合 AI 重度使用场景，不足百万按百万计费，建议：¥3000-8000/百万Tokens</p>
</div>

// 提交时
const res = await authFetch('/api/avatars', {
  method: 'POST',
  body: JSON.stringify({
    // ... 原有字段
    hourlyPrice,
    fixedPrice,
    tokenPrice,
  }),
});
```
**验证**: 创建分身时填写定价，提交后 DB 正确存储

### 任务 3.2: 修改分身设置页
**文件**: `app/creator/avatars/[id]/settings/page.tsx`
**新增定价编辑**:
```typescript
// 在表单中添加定价编辑区块（类似创建页）
// 加载时从 avatar.hourly_price/fixed_price 读取
// 保存时 PUT /api/avatars/[id] 更新定价
```
**验证**: 修改定价后刷新页面，显示新值

### 任务 3.3: 新建收益看板页
**文件**: `app/creator/earnings/page.tsx`
**完整代码结构**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function EarningsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const res = await authFetch('/api/creator/earnings');
    const data = await res.json();
    if (data.success) {
      setStats(data);
    }
    setIsLoading(false);
  };

  if (isLoading) return <div>加载中...</div>;
  if (!stats) return <div>暂无数据</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">收益中心</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">累计收益</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">待结算</p>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(stats.pendingEarnings)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">可提现</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.availableBalance)}
          </p>
        </div>
      </div>

      {/* 月度统计图表 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">月度收益</h2>
        {/* 简单柱状图或表格 */}
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">月份</th>
              <th className="text-right py-2">任务数</th>
              <th className="text-right py-2">收益</th>
            </tr>
          </thead>
          <tbody>
            {stats.monthlyStats?.map((m: any) => (
              <tr key={m.month} className="border-b">
                <td className="py-2">{m.month}</td>
                <td className="text-right py-2">{m.tasks}</td>
                <td className="text-right py-2 font-medium">
                  {formatCurrency(m.earnings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```
**验证**: 页面显示正确收益数据

### 任务 3.4: 新增收益菜单
**文件**: `app/creator/layout.tsx`
**修改侧边栏**:
```typescript
{
  name: '收益中心',
  href: '/creator/earnings',
  icon: DollarSign,
}
```
**验证**: 侧边栏显示「收益中心」，点击跳转正确

---

## Phase 28.4: 人机协同 MVP

### 任务 4.1: 新建待审核任务 API
**文件**: `app/api/creator/tasks/review/route.ts`
**完整代码**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取需要人工审核的任务
    const { data: tasks, error } = await DB.db
      .from('tasks')
      .select(`
        *,
        client:client_id(name),
        avatar:avatar_id(name)
      `)
      .eq('creator_id', auth.userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
    });
  } catch (error: any) {
    console.error('[creator/tasks/review] Error:', error);
    return NextResponse.json(
      { error: error.message || '获取失败' },
      { status: 500 }
    );
  }
}
```
**验证**: GET /api/creator/tasks/review 返回待审核任务

### 任务 4.2: 新建待审核任务页面
**文件**: `app/creator/tasks/review/page.tsx`
**功能**:
- 列表展示待审核任务（客户、AI回复、审核按钮）
- 点击任务查看对话历史
- 提供「直接发送」「编辑后发送」「转人工」三个按钮
**验证**: 能查看任务并操作

---

## Phase 28.5: 验证与部署

### 任务 5.1: 构建验证
**命令**: `npm run build`
**预期**: 无 TypeScript 错误，无构建失败

### 任务 5.2: 端到端测试
**测试场景**:
1. 创建分身（带定价）→ 验证 DB 字段
2. 雇佣分身 → 验证 task.price 正确
3. 发送 AI 消息 → 验证 token_usage/api_cost 更新
4. 完成任务 → 验证 creator_earnings 计算正确
5. 查看收益看板 → 验证数据一致

### 任务 5.3: 部署
**命令**:
```bash
git add -A
git commit -m "feat: Phase 28 创作者定价与任务计费系统"
git push origin master
```
**验证**: Vercel 部署成功，线上功能正常

---

## 文件清单汇总

### 修改文件
- `supabase/migrations/phase28_pricing_and_billing.sql`
- `app/api/avatars/route.ts`
- `lib/ai/kimi.ts`（新建或修改）
- `app/api/chat/route.ts`
- `app/api/hire/order/route.ts`
- `app/creator/avatar/create/page.tsx`
- `app/creator/avatars/[id]/settings/page.tsx`
- `app/creator/layout.tsx`

### 新建文件
- `app/api/tasks/[id]/complete/route.ts`
- `app/api/creator/earnings/route.ts`
- `app/api/creator/tasks/review/route.ts`
- `app/creator/earnings/page.tsx`
- `app/creator/tasks/review/page.tsx`

### 预计工时
- 数据库迁移: 10 分钟
- 后端 API: 2-3 小时
- 前端页面: 2-3 小时
- 测试部署: 1 小时
- **总计**: 6-8 小时

---

**确认后开始执行？** 还是调整优先级？
