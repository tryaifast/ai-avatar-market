// 临时调试API - 验证支付宝沙箱密钥配对和参数
// ⚠️ 用完即删

import 'server-only';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

export async function GET() {
  try {
    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
    const isSandbox = process.env.ALIPAY_SANDBOX === 'true';
    const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-avatar-market.vercel.app';

    if (!appId || !privateKey || !alipayPublicKey) {
      return NextResponse.json({ error: '配置不完整', hasAppId: !!appId, hasPrivateKey: !!privateKey, hasAlipayPublicKey: !!alipayPublicKey });
    }

    const rawPrivateKey = privateKey.replace(/\s/g, '');
    const rawAlipayPublicKey = alipayPublicKey.replace(/\s/g, '');

    // 1. 检查私钥-公钥是否配对
    // 用私钥签名一段数据，然后用公钥验签
    const testContent = 'test-key-pair-verification';
    const formattedPrivateKey = formatPEM(privateKey, 'PRIVATE KEY');

    let signResult = '';
    let signError = null;
    try {
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update(testContent, 'utf8');
      signResult = signObj.sign(formattedPrivateKey, 'base64');
    } catch (err: any) {
      signError = err.message;
    }

    // 用应用公钥验签（注意：这是应用公钥，不是支付宝公钥）
    // 如果密钥配对，用应用公钥应该能验签通过
    // 但我们只有支付宝公钥，不是应用公钥！
    // 支付宝公钥是支付宝自己的私钥对应的公钥，用于验证支付宝的签名
    // 应用公钥是我们上传给支付宝的，用于支付宝验证我们的签名
    
    const formattedAlipayPublicKey = formatPEM(alipayPublicKey, 'PUBLIC KEY');
    let alipayPubKeyVerifyResult = false;
    try {
      const verifyObj = crypto.createVerify('RSA-SHA256');
      verifyObj.update(testContent, 'utf8');
      alipayPubKeyVerifyResult = verifyObj.verify(formattedAlipayPublicKey, signResult, 'base64');
    } catch (err: any) {
      // ignore
    }

    // 2. 构建真实支付请求参数（和 createPagePayUrl 一样）
    const bizContentObj: Record<string, any> = {
      out_trade_no: 'TEST' + Date.now(),
      total_amount: '0.01',
      subject: '测试订单',
      product_code: 'FAST_INSTANT_TRADE_PAY',
    };
    const bizContent = JSON.stringify(bizContentObj);

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
      notify_url: `${host}/api/membership/notify`,
      return_url: `${host}/creator/membership`,
      biz_content: bizContent,
    };

    // 构建签名字符串
    const sortedKeys = Object.keys(systemParams)
      .filter(key => key !== 'sign' && key !== 'sign_type' && systemParams[key] !== '')
      .sort();
    const signContent = sortedKeys.map(key => `${key}=${systemParams[key]}`).join('&');

    let signature = '';
    try {
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update(signContent, 'utf8');
      signature = signObj.sign(formattedPrivateKey, 'base64');
    } catch (err: any) {
      signError = err.message;
    }

    systemParams.sign = signature;

    // 构建URL
    const gateway = isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do';

    const qs = Object.keys(systemParams)
      .map(key => `${key}=${encodeURIComponent(systemParams[key])}`)
      .join('&');

    const payUrl = `${gateway}?${qs}`;

    // 3. 直接 curl 支付宝看返回
    let alipayTestResult = null;
    try {
      const resp = await fetch(payUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const body = await resp.text();
      alipayTestResult = {
        status: resp.status,
        statusText: resp.statusText,
        bodyLength: body.length,
        bodyPreview: body.substring(0, 800),
      };
    } catch (err: any) {
      alipayTestResult = { error: err.message };
    }

    // 4. 用支付宝公钥验签（模拟支付宝验证我们的签名）
    // 支付宝用的是应用公钥（不是支付宝公钥）来验证我们的签名
    // 所以 alipayPublicKey 不能用来验证我们的签名
    // 除非 alipayPublicKey 实际上存的是应用公钥（很多开发者会搞混）

    return NextResponse.json({
      config: {
        appId,
        isSandbox,
        gateway,
        privateKeyLength: rawPrivateKey.length,
        privateKeyFirst10: rawPrivateKey.substring(0, 10),
        privateKeyLast10: rawPrivateKey.substring(rawPrivateKey.length - 10),
        alipayPublicKeyLength: rawAlipayPublicKey.length,
        alipayPublicKeyFirst10: rawAlipayPublicKey.substring(0, 10),
      },
      signTest: {
        canSign: !signError,
        signError,
        signatureLength: signResult.length,
        alipayPubKeyCanVerifyOurSign: alipayPubKeyVerifyResult,
        note: '如果alipayPubKeyCanVerifyOurSign=true，说明ALIPAY_PUBLIC_KEY实际存的是应用公钥（错误）',
      },
      signContentPreview: signContent.substring(0, 400),
      payUrlPreview: payUrl.substring(0, 300),
      alipayTestResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
