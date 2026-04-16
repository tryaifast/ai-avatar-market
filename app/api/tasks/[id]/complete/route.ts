// ============================================
// 任务完成 API
// PUT /api/tasks/[id]/complete - 完成任务并计算创作者收益
//
// 计算公式:
// - hourly/fixed: creatorEarnings = price * 90% - apiCost
// - token: creatorEarnings = ceil(tokenUsage/1000000) * price * 90% - apiCost
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { calculateCreatorEarnings } from '@/lib/ai/kimi';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 获取任务详情
    const { data: task, error: taskError } = await (DB.db as any)
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    // 只有客户或创作者可以完成任务
    if (task.client_id !== auth.userId && task.creator_id !== auth.userId) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    // 已完成的任务不重复处理
    if (task.status === 'completed') {
      return NextResponse.json({ error: '任务已完成' }, { status: 400 });
    }

    // 计算创作者收益
    const creatorEarnings = calculateCreatorEarnings({
      pricing_type: task.pricing_type || 'hourly',
      price: task.price || 0,
      token_usage: task.token_usage || 0,
      api_cost: task.api_cost || 0,
    });

    // 更新任务
    const { error: updateError } = await (DB.db as any)
      .from('tasks')
      .update({
        status: 'completed',
        creator_earnings: creatorEarnings,
        completed_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('[tasks/complete] Update error:', updateError);
      return NextResponse.json({ error: '完成任务失败' }, { status: 500 });
    }

    // 通知创作者
    try {
      await (DB.db as any).from('notifications').insert({
        user_id: task.creator_id,
        type: 'task_completed',
        title: '任务已完成',
        content: `任务「${task.title}」已完成，收益 ¥${(creatorEarnings / 100).toFixed(2)} 已到账`,
        read: false,
        data: { taskId: task.id, creatorEarnings },
      });
    } catch (notifyErr: any) {
      console.warn('[tasks/complete] Notification failed (non-critical):', notifyErr.message);
    }

    console.log('[tasks/complete] Task completed:', params.id, 'earnings:', creatorEarnings);

    return NextResponse.json({
      success: true,
      creatorEarnings,
      breakdown: {
        pricingType: task.pricing_type,
        price: task.price,
        tokenUsage: task.token_usage,
        apiCost: task.api_cost,
        platformFee: task.pricing_type === 'token'
          ? Math.floor(Math.ceil(task.token_usage / 1000000) * task.price * 0.1)
          : Math.floor(task.price * 0.1),
      },
    });
  } catch (error: any) {
    console.error('[tasks/complete] Error:', error);
    return NextResponse.json(
      { error: error.message || '完成任务失败' },
      { status: 500 }
    );
  }
}
