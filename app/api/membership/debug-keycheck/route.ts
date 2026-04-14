// 临时调试API - 验证私钥与支付宝沙箱公钥是否匹配
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
    const privateKeyRaw = process.env.ALIPAY_PRIVATE_KEY;
    const alipayPublicKeyRaw = process.env.ALIPAY_PUBLIC_KEY;

    if (!privateKeyRaw || !alipayPublicKeyRaw) {
      return NextResponse.json({ error: '密钥未配置' });
    }

    const privateKeyPEM = formatPEM(privateKeyRaw, 'PRIVATE KEY');
    const alipayPublicKeyPEM = formatPEM(alipayPublicKeyRaw, 'PUBLIC KEY');

    // 1. 从私钥推导出应用公钥
    let derivedPublicKey = '';
    let derivedPublicKeyBase64 = '';
    try {
      const keyObj = crypto.createPrivateKey(privateKeyPEM);
      const pubKeyObj = crypto.createPublicKey(keyObj);
      derivedPublicKey = pubKeyObj.export({ type: 'spki', format: 'pem' }).toString();
      // 提取纯 base64
      derivedPublicKeyBase64 = derivedPublicKey
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s+/g, '');
    } catch (err: any) {
      return NextResponse.json({ error: '私钥格式错误: ' + err.message });
    }

    // 2. 从 ALIPAY_PUBLIC_KEY 提取纯 base64
    const alipayPublicKeyBase64 = alipayPublicKeyRaw.replace(/\s+/g, '');

    // 3. 用推导出的应用公钥签名+验证
    const testData = 'test_sign_content_123';
    const signObj = crypto.createSign('RSA-SHA256');
    signObj.update(testData, 'utf8');
    const signature = signObj.sign(privateKeyPEM, 'base64');

    const verifyObj = crypto.createVerify('RSA-SHA256');
    verifyObj.update(testData, 'utf8');
    const selfVerify = verifyObj.verify(derivedPublicKey, signature, 'base64');

    // 4. 用 ALIPAY_PUBLIC_KEY 验证我们的签名（不应该能验证，因为那是支付宝的公钥）
    const alipayVerifyObj = crypto.createVerify('RSA-SHA256');
    alipayVerifyObj.update(testData, 'utf8');
    let alipayPubKeyCanVerify = false;
    try {
      alipayPubKeyCanVerify = alipayVerifyObj.verify(alipayPublicKeyPEM, signature, 'base64');
    } catch { /* expected to fail */ }

    return NextResponse.json({
      appId,
      // 推导出的应用公钥（应与支付宝沙箱上配置的应用公钥一致）
      derivedPublicKeyBase64_first60: derivedPublicKeyBase64.substring(0, 60),
      derivedPublicKeyBase64_last40: derivedPublicKeyBase64.substring(derivedPublicKeyBase64.length - 40),
      derivedPublicKeyBase64_length: derivedPublicKeyBase64.length,
      // ALIPAY_PUBLIC_KEY（支付宝的公钥，不是应用公钥）
      alipayPublicKeyBase64_first60: alipayPublicKeyBase64.substring(0, 60),
      alipayPublicKeyBase64_length: alipayPublicKeyBase64.length,
      // 关键对比：推导公钥 vs 环境变量中的支付宝公钥
      keysMatch: derivedPublicKeyBase64 === alipayPublicKeyBase64,
      // 自我验证
      selfSignVerify: selfVerify,
      alipayPubKeyCanVerifyOurSign: alipayPubKeyCanVerify,
      // 结论
      conclusion: derivedPublicKeyBase64 === alipayPublicKeyBase64
        ? '⚠️ ALIPAY_PUBLIC_KEY 和应用公钥相同！ALIPAY_PUBLIC_KEY 应该是支付宝的公钥，不是应用公钥'
        : '密钥对不同，这是正确的。问题在于：ALIPAY_PRIVATE_KEY 对应的应用公钥，必须和支付宝沙箱上配置的应用公钥一致。请到沙箱控制台对比。',
      // 完整推导公钥（用于与沙箱控制台对比）
      fullDerivedPublicKey: derivedPublicKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
