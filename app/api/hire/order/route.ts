// ============================================
// 雇佣订单 API
// POST /api/hire/order - 创建雇佣订单，返回支付链接
// GET /api/hire/order - 查询我的雇佣订单
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { createPayment, generateOrderId, isAlipayConfigured } from '@/lib/payment';

// 平台服务费比例
const PLATFORM_FEE_RATE = 0.10; // 10%

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

    const { avatarId, planType, hours, duration, requirements } = body;

    // 参数验证
    if (!avatarId) {
      return NextResponse.json({ error: '缺少分身ID' }, { status: 400 });
    }
    if (!planType || !['hourly', 'fixed', 'token'].includes(planType)) {
      return NextResponse.json({ error: '无效的雇佣方式' }, { status: 400 });
    }
    if (planType === 'hourly' && (!hours || hours < 1)) {
      return NextResponse.json({ error: '请选择有效的小时数' }, { status: 400 });
    }

    // 查询分身信息
    const avatar = await DB.Avatar.getById(avatarId);
    if (!avatar) {
      return NextResponse.json({ error: '分身不存在' }, { status: 404 });
    }
    if (avatar.status !== 'active') {
      return NextResponse.json({ error: '该分身暂不可雇佣' }, { status: 400 });
    }

    // 不能雇佣自己的分身
    if (avatar.creatorId === auth.userId) {
      return NextResponse.json({ error: '不能雇佣自己创建的分身' }, { status: 400 });
    }

    // 计算金额
    let baseAmount = 0; // 基础金额（分）
    let subject = '';
    let taskPricingType = planType;
    let taskPrice = 0;
    let taskTokenBudget = 1000000;

    const avatarHourlyPrice = (avatar as any).hourlyPrice || 20000;    // 分
    const avatarFixedPrice = (avatar as any).fixedPrice || 500000;    // 分
    const avatarTokenPrice = (avatar as any).tokenPrice || 500000;    // 分/百万tokens

    if (planType === 'hourly') {
      baseAmount = avatarHourlyPrice * (hours || 1);
      taskPrice = baseAmount;
      subject = `雇佣${avatar.name}-按小时(${hours || 1}小时)`;
    } else if (planType === 'fixed') {
      baseAmount = avatarFixedPrice;
      taskPrice = baseAmount;
      subject = `雇佣${avatar.name}-按项目`;
    } else if (planType === 'token') {
      // token 计费：预收1百万token的费用
      baseAmount = avatarTokenPrice;  // 每百万token的价格（分）
      taskPrice = avatarTokenPrice;
      taskTokenBudget = 1000000;
      subject = `雇佣${avatar.name}-按Token(1百万Tokens)`;
    }

    const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
    const totalAmount = baseAmount + platformFee; // 总金额 = 基础 + 平台费
    const creatorEarnings = baseAmount; // 创作者收入 = 基础金额

    // 金额转元（用于支付宝）
    const totalAmountYuan = (totalAmount / 100).toFixed(2);

    // 生成订单号（HIRE前缀）
    const orderNo = generateOrderId('HIRE');

    // 创建待支付订单
    const insertData: any = {
      order_no: orderNo,
      client_id: auth.userId,
      avatar_id: avatarId,
      creator_id: avatar.creatorId,
      plan_type: planType,
      hours: planType === 'hourly' ? (hours || 1) : null,
      duration: planType === 'fixed' ? (duration || '1周') : null,
      requirements: requirements || '',
      amount: totalAmount,
      platform_fee: platformFee,
      creator_earnings: creatorEarnings,
      status: 'pending',
      payment_method: 'alipay',
    };

    console.log('[hire/order] Creating order:', JSON.stringify({
      ...insertData,
      client_id: insertData.client_id?.substring(0, 8) + '...',
    }));

    const { data: order, error: orderError } = await (DB.db.from('hire_orders') as any)
      .insert(insertData)
      .select()
      .single();

    if (orderError) {
      console.error('[hire/order] Create order error:', orderError.message, orderError.code, orderError.details);
      return NextResponse.json({ error: '创建订单失败: ' + (orderError.message || '未知错误') }, { status: 500 });
    }

    console.log('[hire/order] Order created, id:', order?.id, 'orderNo:', orderNo);

    // 获取站点域名用于回调
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    // 通过支付抽象层创建支付链接
    const payResult = await createPayment({
      orderId: orderNo,
      amount: totalAmountYuan,
      subject,
      notifyUrl: `${host}/api/hire/notify`,
      // ⚠️ return_url 不能包含 & 查询参数！
      // 支付宝跳转回来后，前端通过 out_trade_no 参数轮询支付结果
      returnUrl: `${host}/client/hire/${avatarId}/confirm`,
      provider: 'alipay',
    });

    if (!payResult.success) {
      console.warn('[hire/order] Payment creation failed:', payResult.message);
      // 支付创建失败，仍然返回订单信息
      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          orderNo,
          planType,
          amount: totalAmount,
          amountYuan: totalAmountYuan,
          platformFee,
          creatorEarnings,
          status: 'pending',
        },
        payUrl: null,
        alipayReady: isAlipayConfigured(),
        message: payResult.message || '支付创建失败，请稍后重试',
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNo,
        planType,
        amount: totalAmount,
        amountYuan: totalAmountYuan,
        platformFee,
        creatorEarnings,
        status: 'pending',
      },
      payUrl: payResult.payUrl,
      sandbox: payResult.sandbox,
    });
  } catch (error: any) {
    console.error('[hire/order] Error:', error);
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

    // 查询当前用户作为客户的雇佣订单
    const { data: orders, error } = await (DB.db.from('hire_orders') as any)
      .select('*')
      .eq('client_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[hire/order] Get orders error:', error);
      return NextResponse.json({ error: '查询订单失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error: any) {
    console.error('[hire/order] Get error:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
