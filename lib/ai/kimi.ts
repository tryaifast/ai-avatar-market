// ============================================
// Kimi API (Moonshot AI / 阿里云百炼) Integration
// 实现真实的AI对话功能
// 支持：Kimi官方API 和 阿里云百炼API (OpenAI兼容模式)
// ============================================

import { Message } from '../types';

const KIMI_API_URL = process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1';
const KIMI_API_KEY = process.env.KIMI_API_KEY;

export interface ChatCompletionOptions {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// 发送消息到Kimi API
// 支持Kimi官方API和阿里云百炼API (OpenAI兼容模式)
// 返回: AI回复内容 + token使用量
// ============================================
export async function chatWithKimi(options: ChatCompletionOptions): Promise<string> {
  if (!KIMI_API_KEY) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-k2-5',
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// ============================================
// 带Usage的对话接口（用于计费统计）
// ============================================
export interface ChatWithUsageResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export async function chatWithKimiAndUsage(options: ChatCompletionOptions): Promise<ChatWithUsageResult> {
  if (!KIMI_API_KEY) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-k2-5',
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data: ChatCompletionResponse = await response.json();

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

// ============================================
// API 成本计算（分）
// 基于 Kimi 定价（阿里云百炼）
// ============================================
export function calculateApiCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // 定价：¥/1K tokens，转为 分/token
  const PRICING: Record<string, { input: number; output: number }> = {
    'kimi-turbo': { input: 0.000012, output: 0.000012 },  // ¥0.012/1K
    'kimi-pro': { input: 0.000024, output: 0.000024 },    // ¥0.024/1K
    'kimi-k2-5': { input: 0.000012, output: 0.000012 },   // 同 turbo
  };

  const rate = PRICING[model] || PRICING['kimi-k2-5'];
  const cost = inputTokens * rate.input + outputTokens * rate.output;
  return Math.ceil(cost * 100); // 转为分
}

// ============================================
// 创作者收益计算
// 三种模式: hourly / fixed / token
// ============================================
export function calculateCreatorEarnings(task: {
  pricing_type: string;
  price: number;
  token_usage: number;
  api_cost: number;
}): number {
  // token 计费模式：不足百万按百万算
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

// ============================================
// 流式对话（用于实时显示AI回复）
// ============================================
export async function* streamChatWithKimi(options: ChatCompletionOptions): AsyncGenerator<string, void, unknown> {
  if (!KIMI_API_KEY) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-k2-5',
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================
// 为AI分身生成系统提示词
// ============================================
export function generateAvatarSystemPrompt(avatar: {
  name: string;
  description: string;
  personality: {
    mbti?: string;
    communicationStyle: string;
    proactivity: number;
    expertise: string[];
  };
  memoryFiles?: {
    soul?: string;
    memory?: string;
  };
  scope?: {
    canDo: string[];
    cannotDo: string[];
  };
}): string {
  const styleMap: Record<string, string> = {
    professional: '专业、正式',
    friendly: '友好、亲切',
    humorous: '幽默、风趣',
    concise: '简洁、直接',
    detailed: '详细、全面',
  };

  let prompt = `你是"${avatar.name}"，${avatar.description}\n\n`;

  // 人格特征
  prompt += `【人格特征】\n`;
  if (avatar.personality.mbti) {
    prompt += `- MBTI类型：${avatar.personality.mbti}\n`;
  }
  prompt += `- 沟通风格：${styleMap[avatar.personality.communicationStyle] || avatar.personality.communicationStyle}\n`;
  prompt += `- 主动性：${avatar.personality.proactivity}/10\n`;
  prompt += `- 专业领域：${avatar.personality.expertise.join('、')}\n\n`;

  // 工作范围
  if (avatar.scope) {
    prompt += `【工作范围】\n`;
    prompt += `- 可以协助：${avatar.scope.canDo.join('、')}\n`;
    prompt += `- 无法协助：${avatar.scope.cannotDo.join('、')}\n\n`;
  }

  // 记忆文件
  if (avatar.memoryFiles?.soul) {
    prompt += `【核心设定】\n${avatar.memoryFiles.soul}\n\n`;
  }
  if (avatar.memoryFiles?.memory) {
    prompt += `【背景记忆】\n${avatar.memoryFiles.memory}\n\n`;
  }

  prompt += `请始终保持这个角色设定，以第一人称回复用户。`;

  return prompt;
}

// ============================================
// AI任务处理：自动完成用户任务
// ============================================
export async function processAITask(
  avatar: any,
  taskDescription: string,
  history: Message[] = []
): Promise<{ response: string; deliverables: any[] }> {
  // 构建对话历史
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: generateAvatarSystemPrompt(avatar) },
  ];

  // 添加历史消息
  for (const msg of history) {
    if (msg.role === 'client') {
      messages.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'ai') {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }

  // 添加当前任务
  messages.push({
    role: 'user',
    content: `请完成以下任务：\n\n${taskDescription}\n\n请直接给出你的回答或交付物。`,
  });

  // 调用Kimi API
  const response = await chatWithKimi({
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  // 生成交付物
  const deliverables = [{
    id: `deliverable_${Date.now()}`,
    taskId: '', // 会在外部填充
    type: 'text' as const,
    content: response,
    description: 'AI自动生成的任务回复',
    createdAt: new Date().toISOString(),
    createdBy: 'ai' as const,
  }];

  return { response, deliverables };
}

// ============================================
// API路由处理器（用于Next.js API Routes）
// ============================================
export async function handleChatRequest(req: Request): Promise<Response> {
  try {
    const { messages, avatar, taskId } = await req.json();

    // 构建系统提示词
    const systemPrompt = avatar ? generateAvatarSystemPrompt(avatar) : '你是一个有用的AI助手。';

    // 调用Kimi API
    const response = await chatWithKimi({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    return Response.json({
      success: true,
      message: {
        id: `msg_${Date.now()}`,
        taskId,
        role: 'ai',
        content: response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
