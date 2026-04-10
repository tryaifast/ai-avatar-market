// ============================================
// Single Task API Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';

// GET /api/tasks/:id - 获取单个任务
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await DB.Task.getById(params.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // 获取任务相关消息
    const messages = await DB.Message.getByTask(params.id);

    return NextResponse.json({
      success: true,
      task: { ...task, messages },
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/:id - 更新任务
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const task = await DB.Task.update(params.id, data);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
