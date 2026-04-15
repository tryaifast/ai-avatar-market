// 临时端到端测试API - 验证去掉passback_params后签名是否通过
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
    .filter(key => key !== 'sign' && params[key] !== '')
    .sort();
  return sortedKeys.map(key => `${key}=${params[key]}`).join('&');
}

function sign(content: string, privateKey: string): string {
  const formattedKey = formatPEM(privateKey, 'PRIVATE KEY');
  const signObj = crypto.createSign('RSA-SHA256');
  signObj.update(content, 'utf8');
  return signObj.sign(formattedKey, 'base64');
}

export async function GET(req: NextRequest) {
  try {
    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const isSandbox = process.env.ALIPAY_SANDBOX === 'true';
    const gateway = isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do';

    if (!appId || !privateKey) {
      return NextResponse.json({ error: 'Missing config' });
    }

    // 和 alipay.ts 完全一致的逻辑，不带 passback_params
    const bizContent = JSON.stringify({
      out_trade_no: `E2E${Date.now()}`,
      total_amount: '0.01',
      subject: '端到端测试订单',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const systemParams: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp,
      version: '1.0',
      notify_url: 'https://ai-avatar-market.vercel.app/api/membership/notify',
      return_url: 'https://ai-avatar-market.vercel.app/creator/membership',
      biz_content: bizContent,
    };

    const signContent = buildSignContent(systemParams);
    const signStr = sign(signContent, privateKey);
    systemParams.sign = signStr;

    const qs = Object.keys(systemParams)
      .map(key => `${key}=${encodeURIComponent(systemParams[key])}`)
      .join('&');
    const fullUrl = `${gateway}?${qs}`;

    // 直接 fetch 支付宝
    const resp = await fetch(fullUrl, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    let body = '';
    let isSignError = false;
    try {
      body = await resp.text();
      isSignError = body.includes('invalid-signature') || body.includes('验签出错');
    } catch {}

    // 也测试下不带 sign_type 的签名
    const systemParams2: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      timestamp,
      version: '1.0',
      notify_url: 'https://ai-avatar-market.vercel.app/api/membership/notify',
      return_url: 'https://ai-avatar-market.vercel.app/creator/membership',
      biz_content: bizContent,
    };

    const signContent2 = buildSignContent(systemParams2);
    const signStr2 = sign(signContent2, privateKey);
    systemParams2.sign = signStr2;

    const qs2 = Object.keys(systemParams2)
      .map(key => `${key}=${encodeURIComponent(systemParams2[key])}`)
      .join('&');
    const fullUrl2 = `${gateway}?${qs2}`;

    const resp2 = await fetch(fullUrl2, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    let body2 = '';
    let isSignError2 = false;
    try {
      body2 = await resp2.text();
      isSignError2 = body2.includes('invalid-signature') || body2.includes('验签出错');
    } catch {}

    return NextResponse.json({
      test1_with_sign_type: {
        status: resp.status,
        isSignError,
        bodyPreview: body.substring(0, 200),
        signContentPreview: signContent.substring(0, 150),
      },
      test2_without_sign_type: {
        status: resp2.status,
        isSignError: isSignError2,
        bodyPreview: body2.substring(0, 200),
        signContentPreview: signContent2.substring(0, 150),
      },
      bizContent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
