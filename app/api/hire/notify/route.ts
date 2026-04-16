// ============================================
// 雇佣订单支付通知回调 API
// POST /api/hire/notify - 支付宝异步通知回调
//
// 核心逻辑：
// 1. 验证支付宝签名
// 2. 更新 hire_orders 状态为 paid
// 3. 自动创建 tasks 记录（status=pending, payment_status=held）
// 4. 关联 hire_orders.task_id
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAndParseNotify } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    // 获取支付宝POST过来的所有参数
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('[hire/notify] Received:', JSON.stringify(params));

    // 通过支付抽象层验签
    const notifyResult = await verifyAndParseNotify(params);

    if (!notifyResult.verified) {
      console.error('[hire/notify] Sign verification failed');
      return new NextResponse('fail', { status: 400 });
    }

    // 只处理支付成功的通知
    if (notifyResult.tradeStatus !== 'TRADE_SUCCESS' && notifyResult.tradeStatus !== 'TRADE_FINISHED') {
      console.log('[hire/notify] Trade status not success:', notifyResult.tradeStatus);
      return new NextResponse('success', { status: 200 });
    }

    const { outTradeNo, tradeNo, totalAmount } = notifyResult;

    // 查询雇佣订单（通过 order_no）
    const { data: order, error: orderError } = await (DB.db.from('hire_orders') as any)
      .select('*')
      .eq('order_no', outTradeNo)
      .single();

    if (orderError || !order) {
      console.error('[hire/notify] Order not found:', outTradeNo, orderError);
      return new NextResponse('fail', { status: 404 });
    }

    // 已经处理过的订单不重复处理
    if (order.status === 'paid') {
      console.log('[hire/notify] Order already paid:', outTradeNo);
      return new NextResponse('success', { status: 200 });
    }

    // 验证金额（将元转为分对比）
    const paidAmountFen = Math.round(parseFloat(totalAmount) * 100);
    if (paidAmountFen !== order.amount) {
      console.error('[hire/notify] Amount mismatch:', paidAmountFen, 'vs', order.amount);
      return new NextResponse('fail', { status: 400 });
    }

    // ===== 核心事务：更新订单 + 创建任务 =====

    // 1. 创建任务记录
    const avatar = await DB.Avatar.getById(order.avatar_id);
    const avatarName = avatar?.name || 'AI分身';

    let taskTitle = '';
    let taskDesc = order.requirements || '';

    if (order.plan_type === 'hourly') {
      taskTitle = `${avatarName} - 按小时服务 (${order.hours}小时)`;
    } else if (order.plan_type === 'token') {
      taskTitle = `${avatarName} - 按Token服务 (1百万Tokens)`;
    } else {
      taskTitle = `${avatarName} - 项目交付 (${order.duration || '待定'})`;
    }

    const taskData: any = {
      avatar_id: order.avatar_id,
      creator_id: order.creator_id,
      client_id: order.client_id,
      title: taskTitle,
      description: taskDesc,
      type: order.plan_type,
      price: order.creator_earnings, // 创作者收入（分）
      pricing_type: order.plan_type, // hourly / fixed / token
      token_usage: 0,
      api_cost: 0,
      creator_earnings: 0,
      token_budget: order.plan_type === 'token' ? 1000000 : null,
      status: 'pending',
      // 支付相关字段
      payment_status: 'held',       // 资金托管中
      payment_platform_fee: order.platform_fee,
      payment_creator_earnings: order.creator_earnings,
    };

    console.log('[hire/notify] Creating task:', JSON.stringify({
      ...taskData,
      client_id: taskData.client_id?.substring(0, 8) + '...',
    }));

    const { data: task, error: taskError } = await (DB.db.from('tasks') as any)
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error('[hire/notify] Create task error:', taskError.message, taskError.code);
      // 任务创建失败，仍然更新订单状态，但标记 task_id 为 null
      // 后续可以手动创建关联
    }

    // 2. 更新雇佣订单状态为已支付
    const updateData: any = {
      status: 'paid',
      paid_at: new Date().toISOString(),
      trade_no: tradeNo,
      payment_method: notifyResult.provider,
    };

    if (task) {
      updateData.task_id = task.id;
    }

    const { error: updateOrderError } = await (DB.db.from('hire_orders') as any)
      .update(updateData)
      .eq('id', order.id);

    if (updateOrderError) {
      console.error('[hire/notify] Update order error:', updateOrderError);
      return new NextResponse('fail', { status: 500 });
    }

    // 3. 通知创作者有新任务
    if (task) {
      try {
        await (DB.db.from('notifications') as any).insert({
          user_id: order.creator_id,
          type: 'new_task',
          title: '新的雇佣订单',
          content: `您有一个新的雇佣订单，客户已支付 ¥${(order.amount / 100).toFixed(2)}`,
          read: false,
          data: { taskId: task.id, hireOrderId: order.id },
        });
      } catch (notifyErr: any) {
        console.warn('[hire/notify] Notification create failed (non-critical):', notifyErr.message);
      }
    }

    console.log('[hire/notify] Order paid successfully:', outTradeNo, 'taskId:', task?.id);

    // 返回 success 给支付宝，表示通知处理成功
    return new NextResponse('success', { status: 200 });
  } catch (error: any) {
    console.error('[hire/notify] Error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}
