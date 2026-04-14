// ============================================
// 支付宝支付工具（纯 Node.js 实现，无需第三方SDK）
// 使用 crypto 模块做 RSA2 签名，手动构建支付请求
//
// 重要：此文件只能在服务端使用（API Routes / Server Components）
// 使用 import crypto 是安全的，因为 Next.js API Routes 运行在 Node.js 环境
// ============================================

import 'server-only';
import crypto from 'crypto';

// ========== 配置 ==========

function getConfig() {
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  const isSandbox = process.env.ALIPAY_SANDBOX === 'true';

  const isConfigured = !!(appId && privateKey && alipayPublicKey);

  // 详细日志：便于排查配置问题
  if (!isConfigured) {
    console.warn('[alipay] 配置不完整:', {
      hasAppId: !!appId,
      hasPrivateKey: !!privateKey,
      hasAlipayPublicKey: !!alipayPublicKey,
      isSandbox,
    });
  } else {
    console.log('[alipay] 配置完整, appId:', appId, 'sandbox:', isSandbox);
  }

  return {
    appId,
    privateKey,
    alipayPublicKey,
    gateway: isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do',
    signType: 'RSA2',
    charset: 'utf-8',
    isConfigured,
    isSandbox,
  };
}

// ========== 会员价格配置（单位：元） ==========

export const MEMBERSHIP_AMOUNT: Record<string, string> = {
  yearly: '9.90',
  lifetime: '99.00',
};

export const MEMBERSHIP_NAMES: Record<string, string> = {
  yearly: 'AI分身市场-年费会员',
  lifetime: 'AI分身市场-终身会员',
};

// ========== 订单号生成 ==========

export function generateOrderId(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MEM${timestamp}${random}`;
}

// ========== PEM 密钥格式化 ==========

/**
 * 自动检测密钥格式并格式化为标准 PEM
 * 
 * 支付宝沙箱密钥通常是 PKCS#1 格式（以 MIIEow 开头），
 * 需要用 "RSA PRIVATE KEY" 头；而 PKCS#8 格式（以 MIIJQ 开头）
 * 用 "PRIVATE KEY" 头。
 * 
 * 公钥统一使用 "PUBLIC KEY" 头（PKCS#8 格式）。
 */
function formatPEM(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
  // 如果已经有 PEM 头尾，直接返回
  if (key.includes('-----BEGIN')) {
    return key;
  }

  // 去掉所有空白字符，得到纯 base64
  const rawKey = key.replace(/\s+/g, '');

  // 按64字符换行（PEM标准格式）
  const lines: string[] = [];
  for (let i = 0; i < rawKey.length; i += 64) {
    lines.push(rawKey.substring(i, i + 64));
  }
  const base64Body = lines.join('\n');

  // 自动检测私钥格式：PKCS#1 vs PKCS#8
  if (type === 'PRIVATE KEY') {
    // PKCS#1 RSA 私钥的 ASN.1 头字节 SEQUENCE 标识，
    // base64 编码后通常以 "MIIEow" 或 "MIIEp" 开头
    // PKCS#8 私钥通常以 "MIIJQ" 或 "MIIKQ" 开头
    const isPKCS1 = rawKey.startsWith('MIIEow') || rawKey.startsWith('MIIEp') || rawKey.startsWith('MIIEq');
    const pemType = isPKCS1 ? 'RSA PRIVATE KEY' : 'PRIVATE KEY';
    console.log('[alipay] formatPEM: detected', isPKCS1 ? 'PKCS#1' : 'PKCS#8', 'private key format, first10:', rawKey.substring(0, 10));
    return `-----BEGIN ${pemType}-----\n${base64Body}\n-----END ${pemType}-----`;
  }

  return `-----BEGIN ${type}-----\n${base64Body}\n-----END ${type}-----`;
}

// ========== RSA2 签名 ==========

function sign(content: string, privateKey: string): string {
  const formattedKey = formatPEM(privateKey, 'PRIVATE KEY');
  console.log('[alipay] sign() key length:', formattedKey.length, 'has headers:', formattedKey.includes('-----BEGIN'));

  const signObj = crypto.createSign('RSA-SHA256');
  signObj.update(content, 'utf8');

  try {
    const result = signObj.sign(formattedKey, 'base64');
    console.log('[alipay] sign() success, signature length:', result.length);
    return result;
  } catch (err: any) {
    console.error('[alipay] sign() FAILED:', err.message);
    throw err;
  }
}

// ========== RSA2 验签 ==========

function verify(content: string, signStr: string, publicKey: string): boolean {
  try {
    const formattedKey = formatPEM(publicKey, 'PUBLIC KEY');
    const verifyObj = crypto.createVerify('RSA-SHA256');
    verifyObj.update(content, 'utf8');

    return verifyObj.verify(formattedKey, signStr, 'base64');
  } catch (err: any) {
    console.error('[alipay] verify() error:', err.message);
    return false;
  }
}

// ========== 构建待签名字符串 ==========

function buildSignContent(params: Record<string, string>): string {
  // 按key排序，排除sign和sign_type，拼接为 key=value&key=value
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type' && params[key] !== '')
    .sort();

  return sortedKeys.map(key => `${key}=${params[key]}`).join('&');
}

// ========== 创建支付页面URL ==========

export async function createPagePayUrl(params: {
  orderId: string;
  amount: string;
  subject: string;
  notifyUrl: string;
  returnUrl: string;
}): Promise<string | null> {
  const config = getConfig();
  if (!config.isConfigured) {
    console.warn('[alipay] 支付宝配置不完整，无法生成支付链接');
    return null;
  }

  try {
    // 构建请求参数
    const bizContent = JSON.stringify({
      out_trade_no: params.orderId,
      total_amount: params.amount,
      subject: params.subject,
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    const systemParams: Record<string, string> = {
      app_id: config.appId!,
      method: 'alipay.trade.page.pay',
      charset: config.charset,
      sign_type: config.signType,
      timestamp: formatDate(new Date()),
      version: '1.0',
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
      biz_content: bizContent,
    };

    // 签名
    const signContent = buildSignContent(systemParams);
    console.log('[alipay] Signing content length:', signContent.length);

    const signStr = sign(signContent, config.privateKey!);
    systemParams.sign = signStr;

    // 构建URL
    const qs = Object.keys(systemParams)
      .map(key => `${key}=${encodeURIComponent(systemParams[key])}`)
      .join('&');

    const payUrl = `${config.gateway}?${qs}`;
    console.log('[alipay] Pay URL generated successfully, length:', payUrl.length);
    return payUrl;
  } catch (error: any) {
    console.error('[alipay] Create pay URL error:', error.message || error);
    console.error('[alipay] Error stack:', error.stack);
    return null;
  }
}

// ========== 验证异步通知签名 ==========

export async function verifyNotifySign(params: Record<string, string>): Promise<boolean> {
  const config = getConfig();
  if (!config.isConfigured) return false;

  const signStr = params.sign;
  if (!signStr) return false;

  const signContent = buildSignContent(params);
  return verify(signContent, signStr, config.alipayPublicKey!);
}

// ========== 格式化日期为支付宝要求的格式 ==========

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// ========== 检查支付宝是否已配置（供前端API调用判断） ==========

export function isAlipayConfigured(): boolean {
  return getConfig().isConfigured;
}

export function isAlipaySandbox(): boolean {
  return getConfig().isSandbox;
}
