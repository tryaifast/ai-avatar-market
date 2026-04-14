// 临时调试API - 详细签名对比
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function formatPEM(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
  if (key.includes('-----BEGIN')) return key;
  const rawKey = key.replace(/\s+/g, '');
  const lines: string[] = [];
  for (let i = 0; i < rawKey.length; i += 64) {
    lines.push(rawKey.substring(i, i + 64));
  }
  const base64Body = lines.join('\n');
  if (type === 'PRIVATE KEY') {
    const isPKCS1 = rawKey.startsWith('MIIEow') || rawKey.startsWith('MIIEp') || rawKey.startsWith('MIIEq');
    const pemType = isPKCS1 ? 'RSA PRIVATE KEY' : 'PRIVATE KEY';
    return `-----BEGIN ${pemType}-----\n${base64Body}\n-----END ${pemType}-----`;
  }
  return `-----BEGIN ${type}-----\n${base64Body}\n-----END ${type}-----`;
}

function buildSignContent(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type' && params[key] !== '')
    .sort();
  return sortedKeys.map(key => `${key}=${params[key]}`).join('&');
}

export async function GET(req: NextRequest) {
  try {
    const alipaySignContent = req.nextUrl.searchParams.get('alipay');
    
    const appId = process.env.ALIPAY_APP_ID || '9021000158653306';
    const privateKeyRaw = process.env.ALIPAY_PRIVATE_KEY || '';
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    // 重建和实际支付相同的参数
    const bizContentObj = {
      out_trade_no: 'MEM202604141023165552',
      total_amount: '99.00',
      subject: 'AI分身市场-终身会员',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      passback_params: 'df15bb46-cf26-4f26-8efa-f025926d423b',
    };

    const systemParams: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: '2026-04-14 10:23:16',
      version: '1.0',
      notify_url: `${host}/api/membership/notify`,
      return_url: `${host}/creator/membership`,
      biz_content: JSON.stringify(bizContentObj),
    };

    const signContent = buildSignContent(systemParams);
    const privateKeyPEM = formatPEM(privateKeyRaw, 'PRIVATE KEY');

    // 生成签名
    const signObj = crypto.createSign('RSA-SHA256');
    signObj.update(signContent, 'utf8');
    const signature = signObj.sign(privateKeyPEM, 'base64');

    // URL编码后的签名
    const signatureUrlEncoded = encodeURIComponent(signature);

    return NextResponse.json({
      // 我们的签名内容
      ourSignContent: signContent,
      ourSignContentLength: signContent.length,
      
      // 支付宝提供的验签字符串（用户传入）
      alipaySignContent: alipaySignContent || '未提供，请在URL中添加 ?alipay=xxx',
      alipaySignContentLength: alipaySignContent?.length || 0,
      
      // 对比
      contentMatch: alipaySignContent === signContent,
      
      // 我们的签名
      ourSignature: signature,
      ourSignatureUrlEncoded: signatureUrlEncoded,
      
      // 关键参数检查
      params: {
        app_id: systemParams.app_id,
        method: systemParams.method,
        charset: systemParams.charset,
        timestamp: systemParams.timestamp,
        version: systemParams.version,
        notify_url: systemParams.notify_url,
        return_url: systemParams.return_url,
        biz_content: systemParams.biz_content,
      },
      
      // 构建完整URL（用于测试）
      fullUrl: `https://openapi-sandbox.dl.alipaydev.com/gateway.do?${Object.entries({
        ...systemParams,
        sign: signature,
      }).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
