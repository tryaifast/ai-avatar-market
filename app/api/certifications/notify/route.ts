// app/api/certifications/notify/route.ts
// 支付宝异步通知 - 认证订单支付完成

import { NextRequest, NextResponse } from 'next/server';
import { verifyAndParseNotify } from '@/lib/payment';
import { createServiceClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // 1. 获取支付宝通知参数
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    console.log('[certification/notify] Received notify:', params.out_trade_no);

    // 2. 验签
    const notifyResult = await verifyAndParseNotify(params);
    if (!notifyResult.verified) {
      console.error('[certification/notify] Signature verification failed');
      return new NextResponse('fail', { status: 400 });
    }

    const { outTradeNo, tradeNo, tradeStatus, totalAmount } = notifyResult;

    // 3. 只处理支付成功
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      console.log('[certification/notify] Trade not success:', tradeStatus);
      return new NextResponse('success', { status: 200 });
    }

    // 4. 查询认证订单
    const supabase = createServiceClient();
    const { data: cert, error: certError } = await (supabase
      .from('avatar_certifications') as any)
      .select('id, avatar_id, amount, status')
      .eq('order_no', outTradeNo)
      .single();

    if (certError || !cert) {
      console.error('[certification/notify] Certification order not found:', outTradeNo);
      return new NextResponse('fail', { status: 400 });
    }

    // 5. 检查是否已处理
    if (cert.status !== 'pending') {
      console.log('[certification/notify] Already processed:', cert.status);
      return new NextResponse('success', { status: 200 });
    }

    // 6. 验证金额（分）
    const expectedAmount = cert.amount;
    const actualAmount = Math.round(parseFloat(totalAmount) * 100);
    if (actualAmount !== expectedAmount) {
      console.error(`[certification/notify] Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      return new NextResponse('fail', { status: 400 });
    }

    // 7. 更新订单状态为 paid
    await (supabase
      .from('avatar_certifications') as any)
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', cert.id);

    // 8. 更新分身状态
    await (supabase
      .from('avatars') as any)
      .update({
        certification_status: 'pending',
      })
      .eq('id', cert.avatar_id);

    console.log('[certification/notify] Success:', outTradeNo, '-> paid');

    // 9. 触发证书生成（异步）
    // 实际证书生成由状态页轮询或定时任务触发
    // 这里简单标记为 processing，实际生成在状态查询时触发
    await (supabase
      .from('avatar_certifications') as any)
      .update({
        status: 'processing',
      })
      .eq('id', cert.id);

    return new NextResponse('success', { status: 200 });

  } catch (error: any) {
    console.error('[certification/notify] Error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}
