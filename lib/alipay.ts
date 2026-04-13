// ============================================
// 支付宝支付工具（纯 Node.js 实现，无需第三方SDK）
// 使用 crypto 模块做 RSA2 签名，手动构建支付请求
// ============================================

import crypto from 'crypto';

// ========== 配置 ==========

function getConfig() {
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  const isSandbox = process.env.ALIPAY_SANDBOX === 'true';

  return {
    appId,
    privateKey,
    alipayPublicKey,
    gateway: isSandbox
      ? 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
      : 'https://openapi.alipay.com/gateway.do',
    signType: 'RSA2',
    charset: 'utf-8',
    isConfigured: !!(appId && privateKey && alipayPublicKey),
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

// ========== RSA2 签名 ==========

function sign(content: string, privateKey: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(content, 'utf8');
  
  // 格式化私钥
  let formattedKey = privateKey;
  if (!formattedKey.includes('-----')) {
    formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
  }
  
  return sign.sign(formattedKey, 'base64');
}

// ========== RSA2 验签 ==========

function verify(content: string, signStr: string, publicKey: string): boolean {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(content, 'utf8');
  
  // 格式化公钥
  let formattedKey = publicKey;
  if (!formattedKey.includes('-----')) {
    formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
  }
  
  return verify.verify(formattedKey, signStr, 'base64');
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
    console.warn('支付宝配置不完整，支付功能不可用');
    return null;
  }

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
  const signStr = sign(signContent, config.privateKey!);
  systemParams.sign = signStr;

  // 构建URL
  const qs = Object.keys(systemParams)
    .map(key => `${key}=${encodeURIComponent(systemParams[key])}`)
    .join('&');

  return `${config.gateway}?${qs}`;
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
