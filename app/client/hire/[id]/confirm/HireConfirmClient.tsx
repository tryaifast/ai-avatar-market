'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAvatarStore, authFetch, useAuthStore } from '@/lib/store';

// 雇佣确认页面 - 真实支付流程
export default function HireConfirmClient({ avatarId }: { avatarId: string }) {
  const { currentAvatar, fetchAvatarById, isLoading } = useAvatarStore();
  const token = useAuthStore((s) => s.token);
  const [plan, setPlan] = useState<'hourly' | 'fixed'>('hourly');
  const [hours, setHours] = useState(2);
  const [duration, setDuration] = useState('1周');
  const [requirements, setRequirements] = useState('');

  // 支付状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payResult, setPayResult] = useState<'idle' | 'paying' | 'success' | 'failed'>('idle');
  const [orderNo, setOrderNo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchAvatarById(avatarId);
  }, [avatarId, fetchAvatarById]);

  // 支付宝跳转回来后，URL 带有 out_trade_no 参数
  // 开始轮询支付结果
  useEffect(() => {
    const outTradeNo = searchParams.get('out_trade_no');
    if (outTradeNo && token) {
      setOrderNo(outTradeNo);
      setPayResult('paying');
      pollPayResult(outTradeNo);
    }
  }, [searchParams, token]);

  // 轮询支付结果
  const pollPayResult = useCallback(async (no: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 最多轮询30次，约30秒

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPayResult('failed');
        setErrorMsg('支付结果查询超时，请稍后在订单列表中查看');
        return;
      }

      attempts++;
      try {
        const res = await authFetch(`/api/hire/pay-result?orderNo=${no}`);
        const data = await res.json();

        if (data.success && data.order.status === 'paid') {
          setPayResult('success');
          return;
        }
      } catch (err) {
        console.error('Poll pay result error:', err);
      }

      // 1秒后重试
      setTimeout(poll, 1000);
    };

    poll();
  }, []);

  // 确认并支付
  const handleConfirmAndPay = async () => {
    if (!token) {
      setErrorMsg('请先登录');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await authFetch('/api/hire/order', {
        method: 'POST',
        body: JSON.stringify({
          avatarId,
          planType: plan,
          hours: plan === 'hourly' ? hours : undefined,
          duration: plan === 'fixed' ? duration : undefined,
          requirements,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || '创建订单失败');
        setIsSubmitting(false);
        return;
      }

      // 保存订单号
      setOrderNo(data.order.orderNo);

      if (data.payUrl) {
        // 跳转到支付宝支付页面
        window.location.href = data.payUrl;
      } else {
        // 支付链接生成失败
        setErrorMsg(data.message || '支付链接生成失败，请稍后重试');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Confirm and pay error:', err);
      setErrorMsg('网络错误，请稍后重试');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentAvatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">未找到该分身信息</p>
          <Link href="/client/market" className="text-blue-600 hover:underline mt-2 inline-block">
            返回市场
          </Link>
        </div>
      </div>
    );
  }

  // 支付成功页面
  if (payResult === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">支付成功！</h1>
          <p className="text-gray-600 mb-2">
            您的雇佣订单已确认，AI分身将尽快开始为您服务
          </p>
          <p className="text-sm text-gray-500 mb-6">
            订单号：{orderNo}
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

  // 支付轮询中
  if (payResult === 'paying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold mb-2">确认支付中...</h1>
          <p className="text-gray-600 mb-6">
            正在查询支付结果，请稍候
          </p>
          <button
            onClick={() => {
              setPayResult('idle');
              setErrorMsg('');
            }}
            className="btn w-full"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const avatar = currentAvatar;
  const hourlyPrice = (avatar as any).pricePerHour || (avatar as any).pricing?.perTask?.min || 200;
  const fixedPrice = (avatar as any).pricePerTask || (avatar as any).pricing?.subscription?.monthly || 5000;
  const baseAmount = plan === 'hourly' ? hourlyPrice * hours : fixedPrice;
  const platformFee = Math.round(baseAmount * 0.1);
  const totalAmount = baseAmount + platformFee;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/client/hire/${avatarId}`} className="text-gray-500 hover:text-gray-700">
          ← 返回
        </Link>
        <h1 className="text-lg font-semibold">确认雇佣</h1>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：雇佣信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 专家信息 */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">专家信息</h2>
              <div className="flex items-center gap-4">
                <div className="avatar avatar-lg">{avatar.avatar || '🤖'}</div>
                <div>
                  <h3 className="font-semibold">{avatar.name}</h3>
                  <p className="text-sm text-gray-600">{avatar.description}</p>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-yellow-500">★</span>
                    <span>{(avatar as any).rating || (avatar as any).stats?.rating || '-'}</span>
                    <span className="text-gray-400">·</span>
                    <span>{(avatar as any).stats?.completedTasks || (avatar as any).hireCount || 0} 个完成项目</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 雇佣方式 */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">选择雇佣方式</h2>
              
              <div className="space-y-3">
                {/* 按小时 */}
                <label className={`p-4 rounded-lg border-2 cursor-pointer block transition-colors ${
                  plan === 'hourly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        checked={plan === 'hourly'}
                        onChange={() => setPlan('hourly')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium">按小时雇佣</p>
                        <p className="text-sm text-gray-500">适合短期咨询、答疑</p>
                      </div>
                    </div>
                    <span className="font-semibold">¥{hourlyPrice}/小时</span>
                  </div>
                </label>
                
                {/* 按项目 */}
                <label className={`p-4 rounded-lg border-2 cursor-pointer block transition-colors ${
                  plan === 'fixed' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        checked={plan === 'fixed'}
                        onChange={() => setPlan('fixed')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-medium">按项目雇佣</p>
                        <p className="text-sm text-gray-500">适合完整项目交付</p>
                      </div>
                    </div>
                    <span className="font-semibold">¥{fixedPrice} 起</span>
                  </div>
                </label>
              </div>
            </div>
            
            {/* 雇佣详情 */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">雇佣详情</h2>
              
              {plan === 'hourly' ? (
                <div className="form-group">
                  <label className="form-label">预计时长（小时）</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHours(Math.max(1, hours - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                      className="input w-24 text-center"
                    />
                    <button
                      onClick={() => setHours(hours + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">项目周期</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="input"
                  >
                    <option>1周</option>
                    <option>2周</option>
                    <option>1个月</option>
                    <option>2个月</option>
                    <option>3个月</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">项目需求描述</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="请详细描述您的项目需求、期望交付物、时间节点等..."
                />
              </div>
            </div>
          </div>
          
          {/* 右侧：订单摘要 */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold mb-4">订单摘要</h3>
              
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{plan === 'hourly' ? '单价' : '项目报价'}</span>
                  <span>¥{plan === 'hourly' ? `${hourlyPrice}/小时` : fixedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{plan === 'hourly' ? '时长' : '周期'}</span>
                  <span>{plan === 'hourly' ? `${hours} 小时` : duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">基础金额</span>
                  <span>¥{baseAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平台服务费 (10%)</span>
                  <span>¥{platformFee}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">总计</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ¥{totalAmount}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {errorMsg}
                </div>
              )}
              
              <button
                onClick={handleConfirmAndPay}
                disabled={isSubmitting}
                className="btn btn-primary w-full mb-3"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    创建订单中...
                  </span>
                ) : (
                  '确认并支付'
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                点击确认即表示同意平台服务协议
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
