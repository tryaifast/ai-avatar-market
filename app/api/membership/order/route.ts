// ============================================
// 会员购买 API（支付宝支付版）
// POST /api/membership/order - 创建会员订单，返回支付宝支付链接
// GET /api/membership/order - 查询我的订单
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { createPagePayUrl, MEMBERSHIP_AMOUNT, MEMBERSHIP_NAMES, generateOrderId, isAlipayConfigured, isAlipaySandbox } from '@/lib/alipay';
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
    const orderNo = generateOrderId(); // MEM... 格式的订单号，用于支付宝 out_trade_no

    // 先检查支付宝配置状态
    const alipayReady = isAlipayConfigured();
    const sandbox = isAlipaySandbox();
    console.log('[membership/order] Alipay status:', { alipayReady, sandbox });

    // 创建待支付订单
    // id 列为 UUID 类型，由数据库 gen_random_uuid() 自动生成
    // order_no 存储 MEM 格式字符串，用于支付宝 out_trade_no
    const insertData: any = {
      order_no: orderNo,
      user_id: auth.userId,
      type,
      amount,
      status: 'pending',
      payment_method: 'alipay',
    };

    console.log('[membership/order] Creating order:', JSON.stringify({ ...insertData, user_id: insertData.user_id?.substring(0, 8) + '...' }));

    const { data: order, error: orderError } = await (DB.db.from('membership_orders') as any)
      .insert(insertData)
      .select()
      .single();

    if (orderError) {
      console.error('[membership/order] Create order error:', orderError.message, orderError.code, orderError.details);
      return NextResponse.json({ error: '创建订单失败: ' + (orderError.message || '未知错误') }, { status: 500 });
    }

    console.log('[membership/order] Order created successfully, id:', order?.id, 'orderNo:', orderNo);

    // 用数据库生成的 UUID 作为内部 id，用 order_no 作为支付宝订单号
    const orderId = order.id; // UUID

    // 获取站点域名用于回调
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    // 如果支付宝未配置，直接返回订单信息 + 提示
    if (!alipayReady) {
      console.warn('[membership/order] Alipay not configured, returning order without payUrl');
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNo,
          type,
          amount,
          amountYuan,
          status: 'pending',
        },
        payUrl: null,
        alipayReady: false,
        message: '支付功能暂未开通，请联系客服完成支付',
      });
    }

    // 获取支付宝支付链接（out_trade_no 使用 order_no）
    let payUrl: string | null = null;
    try {
      payUrl = await createPagePayUrl({
        orderId: orderNo,
        amount: amountYuan,
        subject: MEMBERSHIP_NAMES[type],
        notifyUrl: `${host}/api/membership/notify`,
        returnUrl: `${host}/creator/membership?payResult=success&orderId=${orderId}`,
      });
      console.log('[membership/order] payUrl generated:', payUrl ? 'SUCCESS' : 'NULL');
    } catch (error: any) {
      console.error('[membership/order] Create pay URL error:', error.message || error);
      // 支付宝签名失败，仍然返回订单信息
    }

    if (!payUrl) {
      // 支付宝签名失败
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNo,
          type,
          amount,
          amountYuan,
          status: 'pending',
        },
        payUrl: null,
        alipayReady: true,
        message: '支付宝签名失败，请稍后重试或联系客服',
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNo,
        type,
        amount,
        amountYuan,
        status: 'pending',
      },
      payUrl,
      sandbox,
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
