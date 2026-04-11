// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 支付页面 - 客户端组件
export default function PaymentPage() {
  const searchParams = useSearchParams();
  const avatarId = searchParams.get('avatar');
  const plan = searchParams.get('plan');
  const amount = parseInt(searchParams.get('amount') || '0');
  
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handlePayment = async () => {
    setIsProcessing(true);
    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">支付成功！</h1>
          <p className="text-gray-600 mb-6">
            您的订单已确认，AI分身将尽快开始为您服务
          </p>
          <div className="space-y-3">
            <Link href="/client/workspace">
              <button className="btn btn-primary w-full">
                进入项目工作区
              </button>
            </Link>
            <Link href="/client/market">
              <button className="btn w-full">
                返回市场
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold">确认支付</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 订单信息 */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-4">订单信息</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">服务类型</span>
              <span>{plan === 'hourly' ? '按小时雇佣' : '按项目雇佣'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI分身</span>
              <span>张明 - 资深产品经理</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">订单编号</span>
              <span className="font-mono">ORD{Date.now()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-medium">应付总额</span>
              <span className="text-2xl font-bold text-blue-600">¥{amount}</span>
            </div>
          </div>
        </div>
        
        {/* 支付方式 */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-4">选择支付方式</h2>
          
          <div className="space-y-3">
            <label className={`p-4 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-colors ${
              paymentMethod === 'alipay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'alipay'}
                onChange={() => setPaymentMethod('alipay')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-2xl">🔵</span>
              <div className="flex-1">
                <p className="font-medium">支付宝</p>
                <p className="text-sm text-gray-500">推荐使用</p>
              </div>
            </label>
            
            <label className={`p-4 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-colors ${
              paymentMethod === 'wechat' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'wechat'}
                onChange={() => setPaymentMethod('wechat')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-2xl">🟢</span>
              <div className="flex-1">
                <p className="font-medium">微信支付</p>
                <p className="text-sm text-gray-500">快捷支付</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* 支付按钮 */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="btn btn-primary w-full py-4 text-lg"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              支付处理中...
            </span>
          ) : (
            `确认支付 ¥${amount}`
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          支付即表示同意《平台服务协议》和《支付服务协议》
        </p>
      </div>
    </div>
  );
}
