// 终极调试API - 端到端签名验证测试
// 用和 alipay.ts 完全相同的逻辑签名，然后直接请求支付宝看返回
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
  // 和 alipay.ts 完全相同的逻辑
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
    const alipayPublicKeyRaw = process.env.ALIPAY_PUBLIC_KEY || '';
    const isSandbox = process.env.ALIPAY_SANDBOX === 'true';
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    if (!appId || !privateKeyRaw) {
      return NextResponse.json({ error: '配置不完整' });
    }

    // 1. 从私钥推导应用公钥
    const privateKeyPEM = formatPEM(privateKeyRaw, 'PRIVATE KEY');
    let derivedPublicKeyBase64 = '';
    try {
      const keyObj = crypto.createPrivateKey(privateKeyPEM);
      const pubKeyObj = crypto.createPublicKey(keyObj);
      const derivedPubPEM = pubKeyObj.export({ type: 'spki', format: 'pem' }).toString();
      derivedPublicKeyBase64 = derivedPubPEM.replace(/-----BEGIN PUBLIC KEY-----/, '').replace(/-----END PUBLIC KEY-----/, '').replace(/\s+/g, '');
    } catch (err: any) {
      return NextResponse.json({ error: '私钥格式错误: ' + err.message });
    }

    // 2. 构建签名（和 alipay.ts 完全一样的逻辑）
    const bizContentObj = {
      out_trade_no: 'DEBUG' + Date.now(),
      total_amount: '0.01',
      subject: '调试测试订单',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    };

    const systemParams: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: formatDate(new Date()),
      version: '1.0',
      notify_url: `${host}/api/membership/notify`,
      return_url: `${host}/creator/membership`,
      biz_content: JSON.stringify(bizContentObj),
    };

    const signContent = buildSignContent(systemParams);
    const signObj = crypto.createSign('RSA-SHA256');
    signObj.update(signContent, 'utf8');
    const signature = signObj.sign(privateKeyPEM, 'base64');

    // 3. 构建完整支付URL
    systemParams.sign = signature;
    const gateway = isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do';

    const qs = Object.keys(systemParams)
      .map(key => `${key}=${encodeURIComponent(systemParams[key])}`)
      .join('&');
    const payUrl = `${gateway}?${qs}`;

    // 4. 直接请求支付宝
    let alipayResult: any = null;
    try {
      const resp = await fetch(payUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'Accept': 'text/html' },
      });
      const body = await resp.text();
      alipayResult = {
        status: resp.status,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 500),
        isAlipaySignError: body.includes('invalid-signature') || body.includes('验签出错'),
      };
    } catch (err: any) {
      alipayResult = { fetchError: err.message };
    }

    // 5. 用推导出的应用公钥自验签
    const derivedPubPEM2 = formatPEM(derivedPublicKeyBase64, 'PUBLIC KEY');
    const verifyObj = crypto.createVerify('RSA-SHA256');
    verifyObj.update(signContent, 'utf8');
    const selfVerify = verifyObj.verify(derivedPubPEM2, signature, 'base64');

    // 6. 用支付宝公钥验签（不应该能验签，因为不是同一对密钥）
    const alipayPublicKeyPEM = formatPEM(alipayPublicKeyRaw, 'PUBLIC KEY');
    const verifyObj2 = crypto.createVerify('RSA-SHA256');
    verifyObj2.update(signContent, 'utf8');
    let alipayCanVerify = false;
    try {
      alipayCanVerify = verifyObj2.verify(alipayPublicKeyPEM, signature, 'base64');
    } catch {}

    return NextResponse.json({
      step1_sign: {
        signContentLength: signContent.length,
        signatureLength: signature.length,
        signContentPreview: signContent.substring(0, 200),
      },
      step2_selfVerify: {
        selfVerifyWithDerivedPub: selfVerify,
        alipayPubCanVerifyOurSign: alipayCanVerify,
      },
      step3_alipayResponse: alipayResult,
      step4_keys: {
        privateKeyFirst10: privateKeyRaw.replace(/\s/g, '').substring(0, 10),
        alipayPublicKeyFirst10: alipayPublicKeyRaw.replace(/\s/g, '').substring(0, 10),
        derivedAppPublicKeyFirst60: derivedPublicKeyBase64.substring(0, 60),
        keysAreSamePair: derivedPublicKeyBase64 === alipayPublicKeyRaw.replace(/\s/g, ''),
      },
      // 推导出的完整应用公钥（必须和沙箱控制台配置的一致）
      derivedAppPublicKeyFull: derivedPublicKeyBase64,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
