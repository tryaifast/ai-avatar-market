// ============================================
// 雇佣订单支付结果查询 API
// GET /api/hire/pay-result?orderNo=xxx - 前端轮询支付结果
// orderNo: HIRE格式订单号（支付宝 out_trade_no）
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderNo = searchParams.get('orderNo');

    if (!orderNo) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
    }

    // 通过 order_no (HIRE格式) 查询 — 支付宝回调时使用
    const { data: order, error } = await (DB.db.from('hire_orders') as any)
      .select('*')
      .eq('order_no', orderNo)
      .eq('client_id', auth.userId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 如果订单已支付，同时返回关联的任务信息
    let task = null;
    if (order.status === 'paid' && order.task_id) {
      const taskData = await DB.Task.getById(order.task_id);
      task = taskData;
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNo: order.order_no,
        planType: order.plan_type,
        amount: order.amount,
        platformFee: order.platform_fee,
        creatorEarnings: order.creator_earnings,
        status: order.status,
        tradeNo: order.trade_no,
        paidAt: order.paid_at,
        taskId: order.task_id,
        createdAt: order.created_at,
      },
      task: task ? {
        id: task.id,
        title: task.title,
        status: task.status,
      } : null,
    });
  } catch (error: any) {
    console.error('[hire/pay-result] Error:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
