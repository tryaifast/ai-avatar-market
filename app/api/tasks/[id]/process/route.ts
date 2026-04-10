// ============================================
// AI Task Processing API Route
// 触发AI自动处理任务
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { processAITask } from '@/lib/ai/kimi';
import { DB } from '@/lib/db/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

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

    // 更新任务状态为AI工作中
    await DB.Task.update(taskId, {
      status: 'ai_working',
    });

    // 获取历史消息
    const messages = await DB.Message.getByTask(taskId);

    // 调用AI处理任务
    const { response, deliverables } = await processAITask(
      avatar,
      task.description,
      messages
    );

    // 保存AI回复
    await DB.Message.create({
      taskId,
      role: 'ai',
      content: response,
      attachments: [],
    });

    // 更新任务状态为AI完成
    await DB.Task.update(taskId, {
      status: 'ai_completed',
    });

    return NextResponse.json({
      success: true,
      message: 'AI processing completed',
      deliverables,
    });
  } catch (error: any) {
    console.error('Task processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
