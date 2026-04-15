// ============================================
// 支付结果查询 API
// GET /api/membership/pay-result?orderId=xxx&orderNo=xxx - 前端轮询支付结果
// orderId: UUID 内部ID / orderNo: MEM格式订单号（支付宝 out_trade_no）
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
    const orderId = searchParams.get('orderId');
    const orderNo = searchParams.get('orderNo');

    if (!orderId && !orderNo) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
    }

    // 查询订单
    let order: any = null;

    if (orderNo) {
      // 优先用 order_no (MEM格式) 查询 — 支付宝回调时使用
      const { data: orderByNo, error: errByNo } = await (DB.db.from('membership_orders') as any)
        .select('*')
        .eq('order_no', orderNo)
        .eq('user_id', auth.userId)
        .single();
      order = orderByNo;
    } else if (orderId) {
      // 用 id (UUID) 查询
      const { data: orderById, error: errById } = await (DB.db.from('membership_orders') as any)
        .select('*')
        .eq('id', orderId)
        .eq('user_id', auth.userId)
        .single();
      order = orderById;
    }

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 如果订单已支付，同时返回最新的用户信息
    let user = null;
    if (order.status === 'paid') {
      user = await DB.User.getById(auth.userId);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        type: order.type,
        amount: order.amount,
        status: order.status,
        paidAt: order.paid_at,
        tradeNo: order.trade_no,
        createdAt: order.created_at,
      },
      user: user ? {
        membershipType: (user as any).membershipType || 'free',
        membershipExpiresAt: (user as any).membershipExpiresAt,
      } : null,
    });
  } catch (error: any) {
    console.error('Pay result query error:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
