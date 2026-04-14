// ============================================
// 支付宝签名调试 API（仅用于排查问题，排查完毕后删除）
// GET /api/membership/debug-alipay
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  // 临时调试接口，排查完毕后删除
  // 通过 query 参数 ?debug=1 访问

  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  const isSandbox = process.env.ALIPAY_SANDBOX === 'true';

  // Step 1: 检查配置
  const configStatus = {
    hasAppId: !!appId,
    appIdLength: appId?.length || 0,
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey?.length || 0,
    privateKeyFirst20: privateKey?.substring(0, 20) || 'N/A',
    privateKeyHasBegin: privateKey?.includes('-----BEGIN') || false,
    privateKeyHasEnd: privateKey?.includes('-----END') || false,
    privateKeyHasNewlines: privateKey?.includes('\n') || false,
    privateKeyHasSlashN: privateKey?.includes('\\n') || false,
    hasAlipayPublicKey: !!alipayPublicKey,
    alipayPublicKeyLength: alipayPublicKey?.length || 0,
    alipayPublicKeyFirst20: alipayPublicKey?.substring(0, 20) || 'N/A',
    alipayPublicKeyHasBegin: alipayPublicKey?.includes('-----BEGIN') || false,
    isSandbox,
  };

  // Step 2: formatPEM 测试
  function formatPEM(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
    if (key.includes('-----BEGIN')) {
      return key;
    }
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

  let formatPEMResult: any = {};
  let signResult: any = {};

  if (privateKey) {
    const formatted = formatPEM(privateKey, 'PRIVATE KEY');
    formatPEMResult = {
      formattedLength: formatted.length,
      formattedFirst80: formatted.substring(0, 80),
      formattedHasBegin: formatted.includes('-----BEGIN PRIVATE KEY-----'),
      formattedHasEnd: formatted.includes('-----END PRIVATE KEY-----'),
      formattedLineCount: formatted.split('\n').length,
      formattedLast80: formatted.substring(formatted.length - 80),
    };

    // Step 3: 签名测试
    const testContent = 'app_id=9021000158653306&biz_content=test&charset=utf-8&method=alipay.trade.page.pay&sign_type=RSA2&timestamp=2026-04-14 12:00:00&version=1.0';
    
    try {
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update(testContent, 'utf8');
      const signature = signObj.sign(formatted, 'base64');
      signResult = {
        success: true,
        signatureLength: signature.length,
        signatureFirst40: signature.substring(0, 40),
      };
    } catch (err: any) {
      signResult = {
        success: false,
        error: err.message,
        errorCode: err.code,
        errorName: err.name,
      };
    }
  }

  // Step 4: 尝试不同密钥格式
  let altSignResults: any[] = [];
  if (privateKey) {
    const rawKey = privateKey.replace(/\s+/g, '');
    
    // 尝试1: 直接用原始 key（可能已有 PEM 头）
    try {
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update('test', 'utf8');
      const sig = signObj.sign(privateKey, 'base64');
      altSignResults.push({ method: 'raw-key-as-is', success: true, sigLen: sig.length });
    } catch (err: any) {
      altSignResults.push({ method: 'raw-key-as-is', success: false, error: err.message });
    }

    // 尝试2: 替换 \\n 为真实换行
    if (privateKey.includes('\\n')) {
      try {
        const keyWithRealNewlines = privateKey.replace(/\\n/g, '\n');
        const signObj = crypto.createSign('RSA-SHA256');
        signObj.update('test', 'utf8');
        const sig = signObj.sign(keyWithRealNewlines, 'base64');
        altSignResults.push({ method: 'replace-slash-n', success: true, sigLen: sig.length });
      } catch (err: any) {
        altSignResults.push({ method: 'replace-slash-n', success: false, error: err.message });
      }
    }

    // 尝试3: 纯 base64 + 手动 PEM 格式化
    try {
      const pemKey = `-----BEGIN PRIVATE KEY-----\n${rawKey.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update('test', 'utf8');
      const sig = signObj.sign(pemKey, 'base64');
      altSignResults.push({ method: 'manual-pem-64chars', success: true, sigLen: sig.length });
    } catch (err: any) {
      altSignResults.push({ method: 'manual-pem-64chars', success: false, error: err.message });
    }

    // 尝试4: PKCS1 格式 (RSA PRIVATE KEY)
    try {
      const pkcs1Key = `-----BEGIN RSA PRIVATE KEY-----\n${rawKey.match(/.{1,64}/g)?.join('\n')}\n-----END RSA PRIVATE KEY-----`;
      const signObj = crypto.createSign('RSA-SHA256');
      signObj.update('test', 'utf8');
      const sig = signObj.sign(pkcs1Key, 'base64');
      altSignResults.push({ method: 'pkcs1-format', success: true, sigLen: sig.length });
    } catch (err: any) {
      altSignResults.push({ method: 'pkcs1-format', success: false, error: err.message });
    }
  }

  return NextResponse.json({
    configStatus,
    formatPEMResult,
    signResult,
    altSignResults,
    nodeVersion: process.version,
  });
}
