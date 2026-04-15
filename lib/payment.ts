// ============================================
// 支付抽象层 - 统一支付接口
// 当前实现：支付宝
// 后续扩展：聚合支付平台（只需新增 provider）
//
// 设计原则：
// - 所有支付请求通过 createPayment() 统一入口
// - notify 回调通过 verifyAndParseNotify() 统一验签
// - 新增支付平台只需实现 PaymentProvider 接口
// ============================================

import 'server-only';
import {
  createPagePayUrl,
  verifyNotifySign,
  generateOrderId,
  isAlipayConfigured,
  isAlipaySandbox,
} from './alipay';

// ========== 支付请求参数 ==========

export interface PaymentRequest {
  orderId: string;        // 内部订单号（HIRE/MEM 格式）
  amount: string;         // 金额（元，如 "200.00"）
  subject: string;        // 商品描述
  notifyUrl: string;      // 异步回调URL
  returnUrl: string;      // 同步跳转URL
  provider?: 'alipay';   // 支付提供商，后续可加 'aggregate' 等
}

// ========== 支付结果 ==========

export interface PaymentResult {
  success: boolean;
  payUrl: string | null;
  provider: string;
  sandbox?: boolean;
  message?: string;
}

// ========== 异步通知解析结果 ==========

export interface NotifyResult {
  verified: boolean;
  outTradeNo: string;     // 我们的订单号
  tradeNo: string;        // 第三方交易号
  totalAmount: string;    // 实际支付金额（元）
  tradeStatus: string;    // 交易状态
  provider: string;       // 支付提供商
}

// ========== 支付创建 ==========

/**
 * 创建支付链接
 * 根据 provider 参数选择支付渠道，默认 alipay
 * 后续新增聚合支付平台时，只需在此函数中加 case 分支
 */
export async function createPayment(params: PaymentRequest): Promise<PaymentResult> {
  const provider = params.provider || 'alipay';

  switch (provider) {
    case 'alipay': {
      const configured = isAlipayConfigured();
      const sandbox = isAlipaySandbox();

      if (!configured) {
        return {
          success: false,
          payUrl: null,
          provider: 'alipay',
          message: '支付宝配置不完整',
        };
      }

      try {
        const payUrl = await createPagePayUrl({
          orderId: params.orderId,
          amount: params.amount,
          subject: params.subject,
          notifyUrl: params.notifyUrl,
          returnUrl: params.returnUrl,
        });

        if (!payUrl) {
          return {
            success: false,
            payUrl: null,
            provider: 'alipay',
            message: '支付宝签名失败',
          };
        }

        return {
          success: true,
          payUrl,
          provider: 'alipay',
          sandbox,
        };
      } catch (error: any) {
        console.error('[payment] createPayment error:', error.message);
        return {
          success: false,
          payUrl: null,
          provider: 'alipay',
          message: `支付创建失败: ${error.message}`,
        };
      }
    }

    // 后续扩展：聚合支付平台
    // case 'aggregate': {
    //   const result = await createAggregatePayment(params);
    //   return result;
    // }

    default:
      return {
        success: false,
        payUrl: null,
        provider,
        message: `不支持的支付方式: ${provider}`,
      };
  }
}

// ========== 异步通知验签与解析 ==========

/**
 * 验证并解析异步通知
 * 根据通知参数判断来自哪个支付平台，调用对应的验签逻辑
 */
export async function verifyAndParseNotify(
  params: Record<string, string>,
  provider?: string
): Promise<NotifyResult> {
  // 自动检测：支付宝通知包含 trade_status 字段
  const detectedProvider = provider || (params.trade_status ? 'alipay' : 'unknown');

  switch (detectedProvider) {
    case 'alipay': {
      const verified = await verifyNotifySign(params);
      return {
        verified,
        outTradeNo: params.out_trade_no || '',
        tradeNo: params.trade_no || '',
        totalAmount: params.total_amount || '',
        tradeStatus: params.trade_status || '',
        provider: 'alipay',
      };
    }

    // 后续扩展：聚合支付通知
    // case 'aggregate': {
    //   const result = await verifyAggregateNotify(params);
    //   return result;
    // }

    default:
      return {
        verified: false,
        outTradeNo: '',
        tradeNo: '',
        totalAmount: '',
        tradeStatus: '',
        provider: detectedProvider,
      };
  }
}

// ========== 导出工具函数 ==========

export { generateOrderId, isAlipayConfigured, isAlipaySandbox };
