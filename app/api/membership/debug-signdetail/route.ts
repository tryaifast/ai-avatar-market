// 终极对比：带 vs 不带 passback_params
import 'server-only';
import { NextResponse } from 'next/server';
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
    .filter(key => key !== 'sign' && params[key] !== '')
    .sort();
  return sortedKeys.map(key => `${key}=${params[key]}`).join('&');
}

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function testAlipayUrl(url: string, label: string) {
  try {
    // 跟随重定向，获取最终页面
    const resp = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'Accept': 'text/html' } });
    const body = await resp.text();
    const hasSignError = body.includes('invalid-signature') || body.includes('验签出错');
    const hasLoginPage = body.includes('login') || body.includes('登录') || body.includes('扫码') || body.includes('qrcode');
    return {
      label,
      status: resp.status,
      bodyLength: body.length,
      hasSignError,
      hasLoginPage,
      bodyPreview: body.substring(0, 300),
    };
  } catch (err: any) {
    return { label, error: err.message };
  }
}

export async function GET() {
  try {
    const appId = process.env.ALIPAY_APP_ID || '';
    const privateKeyRaw = process.env.ALIPAY_PRIVATE_KEY || '';
    const isSandbox = process.env.ALIPAY_SANDBOX === 'true';
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    if (!appId || !privateKeyRaw) {
      return NextResponse.json({ error: '配置不完整' });
    }

    const privateKeyPEM = formatPEM(privateKeyRaw, 'PRIVATE KEY');
    const gateway = isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do';
    const ts = formatDate(new Date());

    function buildPayUrl(bizContent: object): string {
      const params: Record<string, string> = {
        app_id: appId,
        method: 'alipay.trade.page.pay',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: ts,
        version: '1.0',
        notify_url: `${host}/api/membership/notify`,
        return_url: `${host}/creator/membership`,
        biz_content: JSON.stringify(bizContent),
      };
      const signContent = buildSignContent(params);
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update(signContent, 'utf8');
      const signature = signObj.sign(privateKeyPEM, 'base64');
      params.sign = signature;
      return `${gateway}?${Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')}`;
    }

    // 测试1：不带 passback_params
    const url1 = buildPayUrl({
      out_trade_no: 'NO_PBF_' + Date.now(),
      total_amount: '0.01',
      subject: '测试-无passback',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    // 测试2：带 passback_params
    const url2 = buildPayUrl({
      out_trade_no: 'WITH_PBF_' + Date.now(),
      total_amount: '0.01',
      subject: '测试-有passback',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      passback_params: '277c624f-f691-4fdb-81d4-5f3ef9dab911',
    });

    // 测试3：带 passback_params + encodeURIComponent
    const url3 = buildPayUrl({
      out_trade_no: 'ENC_PBF_' + Date.now(),
      total_amount: '0.01',
      subject: '测试-编码passback',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      passback_params: encodeURIComponent('277c624f-f691-4fdb-81d4-5f3ef9dab911'),
    });

    const [r1, r2, r3] = await Promise.all([
      testAlipayUrl(url1, '1_无passback'),
      testAlipayUrl(url2, '2_有passback'),
      testAlipayUrl(url3, '3_编码passback'),
    ]);

    return NextResponse.json({
      test1_noPassback: r1,
      test2_withPassback: r2,
      test3_encodedPassback: r3,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
