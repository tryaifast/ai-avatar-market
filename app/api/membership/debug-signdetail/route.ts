// 终极调试API - 带 passback_params 的完整端到端测试
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

    // 测试1：不带 passback_params（之前测试返回302）
    const bizContent1 = {
      out_trade_no: 'TEST1' + Date.now(),
      total_amount: '0.01',
      subject: '测试订单-无passback',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    };

    const params1: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: formatDate(new Date()),
      version: '1.0',
      notify_url: `${host}/api/membership/notify`,
      return_url: `${host}/creator/membership`,
      biz_content: JSON.stringify(bizContent1),
    };

    const signContent1 = buildSignContent(params1);
    const signObj1 = crypto.createSign('RSA-SHA256');
    signObj1.update(signContent1, 'utf8');
    const signature1 = signObj1.sign(privateKeyPEM, 'base64');
    params1.sign = signature1;

    const qs1 = Object.keys(params1).map(k => `${k}=${encodeURIComponent(params1[k])}`).join('&');
    const payUrl1 = `${gateway}?${qs1}`;

    // 测试2：带 passback_params（和实际支付一样）
    const bizContent2 = {
      out_trade_no: 'TEST2' + Date.now(),
      total_amount: '99.00',
      subject: 'AI分身市场-终身会员',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      passback_params: '277c624f-f691-4fdb-81d4-5f3ef9dab911',
    };

    const params2: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: formatDate(new Date()),
      version: '1.0',
      notify_url: `${host}/api/membership/notify`,
      return_url: `${host}/creator/membership`,
      biz_content: JSON.stringify(bizContent2),
    };

    const signContent2 = buildSignContent(params2);
    const signObj2 = crypto.createSign('RSA-SHA256');
    signObj2.update(signContent2, 'utf8');
    const signature2 = signObj2.sign(privateKeyPEM, 'base64');
    params2.sign = signature2;

    const qs2 = Object.keys(params2).map(k => `${k}=${encodeURIComponent(params2[k])}`).join('&');
    const payUrl2 = `${gateway}?${qs2}`;

    // 请求支付宝（跟随重定向，获取最终页面内容）
    async function testAlipayUrl(url: string, label: string) {
      try {
        // 先试不跟随重定向
        const resp1 = await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'Accept': 'text/html' } });
        const status1 = resp1.status;
        const location1 = resp1.headers.get('location') || '';
        
        // 再跟随重定向
        const resp2 = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'Accept': 'text/html' } });
        const body2 = await resp2.text();
        const hasSignError = body2.includes('invalid-signature') || body2.includes('验签出错');
        const hasLoginPage = body2.includes('login') || body2.includes('登录') || body2.includes('扫码');
        
        return {
          label,
          initialStatus: status1,
          redirectLocation: location1.substring(0, 200),
          finalStatus: resp2.status,
          finalBodyLength: body2.length,
          hasSignError,
          hasLoginPage,
          bodyPreview: body2.substring(0, 300),
        };
      } catch (err: any) {
        return { label, error: err.message };
      }
    }

    const result1 = await testAlipayUrl(payUrl1, '不带passback_params');
    const result2 = await testAlipayUrl(payUrl2, '带passback_params');

    return NextResponse.json({
      test1_noPassback: result1,
      test2_withPassback: result2,
      signContent1_preview: signContent1.substring(0, 200),
      signContent2_preview: signContent2.substring(0, 200),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
