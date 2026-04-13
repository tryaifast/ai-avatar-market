// ============================================
// 会员购买 API（支付宝支付版）
// POST /api/membership/order - 创建会员订单，返回支付宝支付链接
// GET /api/membership/order - 查询我的订单
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { createPagePayUrl, MEMBERSHIP_AMOUNT, MEMBERSHIP_NAMES, generateOrderId } from '@/lib/alipay';
import { MEMBERSHIP_PRICES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
    }
    const { type } = body;

    if (!type || !['yearly', 'lifetime'].includes(type)) {
      return NextResponse.json({ error: '无效的会员类型' }, { status: 400 });
    }

    const user = await DB.User.getById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const currentType = (user as any).membershipType || 'free';

    // 已经是终身会员不能再升级
    if (currentType === 'lifetime') {
      return NextResponse.json({ error: '您已经是终身会员，无需升级' }, { status: 400 });
    }

    // 已经是年费会员再买年费无意义
    if (currentType === 'yearly' && type === 'yearly') {
      return NextResponse.json({ error: '您已经是年费会员' }, { status: 400 });
    }

    const amount = MEMBERSHIP_PRICES[type as keyof typeof MEMBERSHIP_PRICES]; // 单位：分
    const amountYuan = MEMBERSHIP_AMOUNT[type]; // 单位：元
    const orderId = generateOrderId();

    // 创建待支付订单
    const { data: order, error: orderError } = await (DB.db.from('membership_orders') as any)
      .insert({
        id: orderId,
        user_id: auth.userId,
        type,
        amount,
        status: 'pending',
        payment_method: 'alipay',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      return NextResponse.json({ error: '创建订单失败: ' + (orderError.message || '未知错误') }, { status: 500 });
    }

    // 获取站点域名用于回调
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    // 获取支付宝支付链接
    let payUrl: string | null = null;
    try {
      payUrl = await createPagePayUrl({
        orderId,
        amount: amountYuan,
        subject: MEMBERSHIP_NAMES[type],
        notifyUrl: `${host}/api/membership/notify`,
        returnUrl: `${host}/creator/membership?payResult=success&orderId=${orderId}`,
      });
    } catch (error) {
      console.error('Create pay URL error:', error);
      // 支付宝签名失败，仍然返回订单信息
    }

    if (!payUrl) {
      // 支付宝未配置或调用失败，返回订单信息
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          type,
          amount,
          amountYuan,
          status: 'pending',
        },
        payUrl: null,
        message: '支付功能暂未开通，请联系客服完成支付',
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        type,
        amount,
        amountYuan,
        status: 'pending',
      },
      payUrl,
    });
  } catch (error: any) {
    console.error('Membership order error:', error);
    return NextResponse.json(
      { error: error.message || '创建订单失败' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data: orders, error } = await (DB.db.from('membership_orders') as any)
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      return NextResponse.json({ error: '查询订单失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
