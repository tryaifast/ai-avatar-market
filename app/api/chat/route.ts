// ============================================
// AI Chat API Route
// 处理与Kimi AI的对话请求
// 支持 token 统计和成本追踪
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { chatWithKimiAndUsage, generateAvatarSystemPrompt, calculateApiCost } from '@/lib/ai/kimi';
import { DB } from '@/lib/db/supabase';
import { EmbeddingService } from '@/lib/knowledge/embedding';
import { KnowledgeRetrievalService } from '@/lib/knowledge/retrieval';

export async function POST(req: NextRequest) {
  try {
    const { taskId, content, history = [], model = 'kimi-k2-5' } = await req.json();

    if (!taskId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 获取任务信息
    const task = await DB.Task.getById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // 获取AI分身信息
    const avatar = await DB.Avatar.getById(task.avatarId);
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }

    // 生成系统提示词（基础）
    let systemPrompt = generateAvatarSystemPrompt(avatar);

    // 🔍 RAG: 检索与用户问题相关的知识库内容
    let knowledgeContext = '';
    try {
      const embeddingService = EmbeddingService.getInstance();
      const queryEmbedding = await embeddingService.getEmbedding(content);
      const retrievalService = new KnowledgeRetrievalService();
      const matches = await retrievalService.search(task.avatarId, queryEmbedding, {
        matchCount: 5,
        similarityThreshold: 0.6,
      });

      if (matches.length > 0) {
        knowledgeContext = '\n\n## 你的专属知识库\n\n以下是和你相关的知识库资料，请基于这些资料回答用户的问题：\n\n' +
          matches.map((m: any, i: number) =>
            `### 资料片段 ${i + 1}（来源: ${m.content_type}, 相似度: ${(m.similarity * 100).toFixed(0)}%）\n${m.content}`
          ).join('\n\n---\n\n') +
          '\n\n---\n**请优先参考以上知识库资料回答问题。如果知识库资料不足以回答问题，可以用你的通用知识补充，但要明确标注。**';
      }
    } catch (ragErr: any) {
      // RAG 失败不影响主流程，仅记录警告
      console.warn('[chat/RAG] Knowledge retrieval failed (non-critical):', ragErr.message);
    }

    // 将知识库上下文附加到系统提示词
    if (knowledgeContext) {
      systemPrompt += knowledgeContext;
    }

    // 构建消息历史
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role === 'client' ? 'user' : msg.role === 'ai' ? 'assistant' : 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content },
    ];

    // 调用Kimi API（带 usage 统计）
    const aiResult = await chatWithKimiAndUsage({ messages, model });

    // 计算 API 成本（分）
    const apiCost = calculateApiCost(model, aiResult.usage.inputTokens, aiResult.usage.outputTokens);

    // 保存用户消息
    await DB.Message.create({
      taskId,
      role: 'client',
      content,
      attachments: [],
    });

    // 保存AI回复（带 token 统计）
    const aiMessage = await DB.Message.create({
      taskId,
      role: 'ai',
      content: aiResult.content,
      attachments: [],
    });

    // 更新 messages 的 token 统计
    try {
      const { data: lastMsg } = await (DB.db as any)
        .from('messages')
        .select('id')
        .eq('task_id', taskId)
        .eq('role', 'ai')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (lastMsg) {
        await (DB.db as any)
          .from('messages')
          .update({
            input_tokens: aiResult.usage.inputTokens,
            output_tokens: aiResult.usage.outputTokens,
            total_tokens: aiResult.usage.totalTokens,
            api_cost: apiCost,
          })
          .eq('id', lastMsg.id);
      }
    } catch (msgErr: any) {
      console.warn('[chat] Update message token stats failed (non-critical):', msgErr.message);
    }

    // 更新 task 的累计 token 和成本
    try {
      const { data: taskData } = await (DB.db as any)
        .from('tasks')
        .select('token_usage, api_cost')
        .eq('id', taskId)
        .single();

      if (taskData) {
        await (DB.db as any)
          .from('tasks')
          .update({
            token_usage: (taskData.token_usage || 0) + aiResult.usage.totalTokens,
            api_cost: (taskData.api_cost || 0) + apiCost,
          })
          .eq('id', taskId);
      }
    } catch (taskErr: any) {
      console.warn('[chat] Update task token stats failed (non-critical):', taskErr.message);
    }

    return NextResponse.json({
      success: true,
      message: aiMessage,
      usage: {
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        totalTokens: aiResult.usage.totalTokens,
        apiCost,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
