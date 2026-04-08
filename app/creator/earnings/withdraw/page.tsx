'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, AlertCircle, CheckCircle, Banknote } from 'lucide-react';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('alipay');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const balance = 15800;
  const minWithdraw = 100;

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">提现申请已提交</h2>
          <p className="text-gray-600 mb-6">预计1-3个工作日到账</p>
          <Link href="/creator/earnings" className="btn-primary">
            返回收益中心
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator/earnings" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">申请提现</h1>
      </div>

      <div className="max-w-2xl">
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <p className="text-blue-100 mb-1">可提现余额</p>
          <p className="text-4xl font-bold">¥{balance.toLocaleString()}</p>
        </div>

        <div className="card p-6">
          <div className="form-group">
            <label className="form-label">提现金额</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                type="number"
                className="input pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="请输入提现金额"
                min={minWithdraw}
                max={balance}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">最低提现 ¥{minWithdraw}</p>
              <button onClick={() => setAmount(balance.toString())} className="text-sm text-blue-600">
                全部提现
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">提现方式</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMethod('alipay')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  method === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium">支付宝</p>
              </button>
              <button
                onClick={() => setMethod('bank')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  method === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium">银行卡</p>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{method === 'alipay' ? '支付宝账号' : '银行卡号'}</label>
            <input
              type="text"
              className="input"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={method === 'alipay' ? '请输入支付宝账号' : '请输入银行卡号'}
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">提现说明</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>最低提现金额为 ¥100</li>
                  <li>工作日提交的申请将在1-3个工作日到账</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || Number(amount) < minWithdraw || Number(amount) > balance || !account || loading}
            className="w-full btn-primary btn-lg"
          >
            {loading ? '处理中...' : '确认提现'}
          </button>
        </div>
      </div>
    </div>
  );
}
