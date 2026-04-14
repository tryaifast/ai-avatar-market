// ============================================
// 支付宝异步通知回调 API
// POST /api/membership/notify - 支付宝服务器回调
//
// 支付宝会在支付成功后向此URL发送POST请求
// 必须验签后才能处理业务逻辑
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyNotifySign } from '@/lib/alipay';

export async function POST(req: NextRequest) {
  try {
    // 获取支付宝POST过来的所有参数
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('Alipay notify received:', JSON.stringify(params));

    // 验签
    const signVerified = await verifyNotifySign(params);
    if (!signVerified) {
      console.error('Alipay notify sign verification failed');
      return new NextResponse('fail', { status: 400 });
    }

    // 获取交易状态
    const tradeStatus = params.trade_status;
    const outTradeNo = params.out_trade_no; // 我们的订单号
    const tradeNo = params.trade_no; // 支付宝交易号
    const totalAmount = params.total_amount; // 实际支付金额（元）

    // 只处理支付成功的通知
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      console.log('Trade status not success:', tradeStatus);
      return new NextResponse('success', { status: 200 });
    }

    // 查询订单（支付宝的 out_trade_no 对应我们的 order_no）
    const { data: order, error: orderError } = await (DB.db.from('membership_orders') as any)
      .select('*')
      .eq('order_no', outTradeNo)
      .single();

    if (orderError || !order) {
      console.error('Order not found by order_no:', outTradeNo, orderError);
      return new NextResponse('fail', { status: 404 });
    }

    // 已经处理过的订单不重复处理
    if (order.status === 'paid') {
      console.log('Order already paid:', outTradeNo);
      return new NextResponse('success', { status: 200 });
    }

    // 验证金额（将元转为分对比）
    const paidAmountFen = Math.round(parseFloat(totalAmount) * 100);
    if (paidAmountFen !== order.amount) {
      console.error('Amount mismatch:', paidAmountFen, 'vs', order.amount);
      return new NextResponse('fail', { status: 400 });
    }

    // 更新订单状态为已支付（用 UUID id 定位）
    const { error: updateOrderError } = await (DB.db.from('membership_orders') as any)
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        trade_no: tradeNo,
        payment_method: 'alipay',
      })
      .eq('id', order.id);

    if (updateOrderError) {
      console.error('Update order error:', updateOrderError);
      return new NextResponse('fail', { status: 500 });
    }

    // 升级用户会员状态
    const updates: any = {
      membershipType: order.type,
    };
    if (order.type === 'yearly') {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      updates.membershipExpiresAt = expiresAt.toISOString();
    } else if (order.type === 'lifetime') {
      updates.membershipExpiresAt = null; // 终身不过期
    }

    const updatedUser = await DB.User.update(order.user_id, updates);
    if (!updatedUser) {
      console.error('Update user membership error for user:', order.user_id);
      return new NextResponse('fail', { status: 500 });
    }

    console.log('Membership upgraded successfully:', order.user_id, order.type);

    // 返回 success 给支付宝，表示通知处理成功
    return new NextResponse('success', { status: 200 });
  } catch (error: any) {
    console.error('Alipay notify error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}
