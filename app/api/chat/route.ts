// ============================================
// AI Chat API Route
// 处理与Kimi AI的对话请求
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { chatWithKimi, generateAvatarSystemPrompt } from '@/lib/ai/kimi';
import { DB } from '@/lib/db/supabase';

export async function POST(req: NextRequest) {
  try {
    const { taskId, content, history = [] } = await req.json();

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

    // 生成系统提示词
    const systemPrompt = generateAvatarSystemPrompt(avatar);

    // 构建消息历史
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role === 'client' ? 'user' : msg.role === 'ai' ? 'assistant' : 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content },
    ];

    // 调用Kimi API
    const aiResponse = await chatWithKimi({ messages });

    // 保存用户消息
    await DB.Message.create({
      taskId,
      role: 'client',
      content,
      attachments: [],
    });

    // 保存AI回复
    const aiMessage = await DB.Message.create({
      taskId,
      role: 'ai',
      content: aiResponse,
      attachments: [],
    });

    return NextResponse.json({
      success: true,
      message: aiMessage,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
