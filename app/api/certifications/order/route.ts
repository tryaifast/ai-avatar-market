// app/api/certifications/order/route.ts
// 创建知识产权认证订单

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/client';
import { createPayment, generateOrderId } from '@/lib/payment';

// POST /api/certifications/order
// 创建认证订单并返回支付链接
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. 解析请求体
    const body = await request.json();
    const { avatarId } = body;

    if (!avatarId) {
      return NextResponse.json({ error: 'Missing avatarId' }, { status: 400 });
    }

    // 3. 检查分身是否存在且属于当前用户
    const supabase = createServiceClient();
    const { data: avatar, error: avatarError } = await (supabase
      .from('avatars') as any)
      .select('id, name, certification_status, certification_id')
      .eq('id', avatarId)
      .eq('creator_id', userId)
      .single();

    if (avatarError || !avatar) {
      return NextResponse.json({ error: 'Avatar not found or not authorized' }, { status: 404 });
    }

    // 4. 检查是否已认证或认证中
    if (avatar.certification_status === 'certified') {
      return NextResponse.json({ error: 'Avatar already certified' }, { status: 400 });
    }

    if (avatar.certification_status === 'pending') {
      // 查询现有订单
      const { data: existingCert } = await (supabase
        .from('avatar_certifications') as any)
        .select('id, order_no, status')
        .eq('avatar_id', avatarId)
        .eq('creator_id', userId)
        .in('status', ['pending', 'paid', 'processing'])
        .single();

      if (existingCert) {
        return NextResponse.json({
          error: 'Certification in progress',
          certificationId: existingCert.id,
          orderNo: existingCert.order_no,
          status: existingCert.status,
        }, { status: 400 });
      }
    }

    // 5. 生成订单号
    const orderNo = generateOrderId('CERT'); // CERT_20260418_xxx

    // 6. 创建认证记录（pending 状态）
    const { data: certification, error: certError } = await (supabase
      .from('avatar_certifications') as any)
      .insert({
        avatar_id: avatarId,
        creator_id: userId,
        order_no: orderNo,
        amount: 99900, // 999元
        status: 'pending',
      })
      .select()
      .single();

    if (certError) {
      console.error('[certification/order] Failed to create record:', certError);
      return NextResponse.json({ error: 'Failed to create certification record' }, { status: 500 });
    }

    // 7. 更新分身状态为 pending
    await (supabase
      .from('avatars') as any)
      .update({
        certification_status: 'pending',
        certification_id: certification.id,
      })
      .eq('id', avatarId);

    // 8. 构建回调 URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const notifyUrl = `${baseUrl}/api/certifications/notify`;
    const returnUrl = `${baseUrl}/creator/certification/status/${certification.id}`;

    // 9. 创建支付宝支付
    const paymentResult = await createPayment({
      orderId: orderNo,
      amount: '999.00',
      subject: `AI分身知识产权认证 - ${avatar.name || '未命名分身'}`,
      notifyUrl,
      returnUrl,
      provider: 'alipay',
    });

    if (!paymentResult.success) {
      console.error('[certification/order] Payment creation failed:', paymentResult.message);
      return NextResponse.json({
        error: 'Payment creation failed',
        message: paymentResult.message,
      }, { status: 500 });
    }

    // 10. 返回支付链接
    return NextResponse.json({
      success: true,
      certificationId: certification.id,
      orderNo,
      payUrl: paymentResult.payUrl,
      sandbox: paymentResult.sandbox,
    });

  } catch (error: any) {
    console.error('[certification/order] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
