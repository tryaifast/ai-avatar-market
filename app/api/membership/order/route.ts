// ============================================
// 会员购买 API
// POST /api/membership/order - 创建会员订单并升级（暂模拟支付）
// GET /api/membership/order - 查询我的订单
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';

// 会员价格配置（单位：分）
const MEMBERSHIP_PRICES: Record<string, number> = {
  yearly: 990,    // 9.9元/年
  lifetime: 9900, // 99元终身
};

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await req.json();
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

    const amount = MEMBERSHIP_PRICES[type];

    // 创建订单记录
    const { data: order, error: orderError } = await (DB.db.from('membership_orders') as any)
      .insert({
        user_id: auth.userId,
        type,
        amount,
        status: 'paid', // 模拟支付直接成功
        payment_method: 'simulated', // 模拟支付
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Create order error:', orderError);
      // 如果membership_orders表不存在，仍然继续升级会员
    }

    // 更新用户会员状态
    const updates: any = {
      membershipType: type,
    };
    if (type === 'yearly') {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      updates.membershipExpiresAt = expiresAt.toISOString();
    } else if (type === 'lifetime') {
      updates.membershipExpiresAt = undefined; // 终身不过期
    }

    const updatedUser = await DB.User.update(auth.userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: '更新会员状态失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '会员开通成功',
      user: updatedUser,
      orderId: order?.id,
    });
  } catch (error: any) {
    console.error('Membership order error:', error);
    return NextResponse.json(
      { error: error.message || '开通失败' },
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
