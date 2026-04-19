'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Crown, Check, X, ChevronLeft, Sparkles, Shield, 
  Loader2, CheckCircle, ArrowRight, Star, ExternalLink, Clock, ShieldCheck
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';
import { MEMBERSHIP_LABELS, AVATAR_LIMITS, MEMBERSHIP_PRICES, MEMBERSHIP_FEATURES } from '@/lib/constants';

export default function MembershipPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const searchParams = useSearchParams();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ id: string; type: string; amountYuan: string } | null>(null);
  const [polling, setPolling] = useState(false);

  // 页面加载时刷新用户信息（确保会员状态最新，如管理后台刚修改过）
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await authFetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // 静默失败，不影响页面使用
        console.error('Failed to refresh user info:', err);
      }
    };
    refreshUser();
  }, []);

  const membershipType = (user as any)?.membershipType || 'free';

  // 处理支付宝支付结果回调
  useEffect(() => {
    // 支付宝同步跳转时，return_url 会附加 out_trade_no 等参数
    // 不使用 passback_params（会导致支付宝沙箱验签失败 invalid-signature）
    const outTradeNo = searchParams.get('out_trade_no');
    
    if (outTradeNo) {
      // 有 out_trade_no，通过订单号轮询支付结果
      setMessage({ type: 'info', text: '正在确认支付结果...' });
      setPolling(true);
      pollPayResultByOrderNo(outTradeNo);
    } else if (searchParams.toString()) {
      // 有其他参数（可能是支付宝跳转回来但没带 out_trade_no）
      // 直接刷新用户信息确认会员状态
      setMessage({ type: 'info', text: '正在确认支付结果...' });
      setPolling(true);
      refreshUserAfterPay();
    }
  }, [searchParams]);

  // 支付后刷新用户信息（备用方案）
  const refreshUserAfterPay = useCallback(async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        const newType = (data.user as any)?.membershipType || 'free';
        if (newType !== 'free') {
          setMessage({ type: 'success', text: '会员开通成功！感谢您的支持' });
        }
      }
    } catch (err) {
      console.error('Refresh user after pay error:', err);
    }
    setPolling(false);
  }, [setUser]);

  // 通过 out_trade_no 轮询支付结果
  const pollPayResultByOrderNo = useCallback(async (orderNo: string, maxRetries = 10) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // 用 out_trade_no 查询订单状态
        const res = await authFetch(`/api/membership/pay-result?orderNo=${orderNo}`);
        const data = await res.json();
        
        if (data.success && data.order?.status === 'paid') {
          // 支付成功，更新本地用户状态
          if (data.user) {
            const updatedUser = { ...user, ...data.user } as any;
            setUser(updatedUser);
          }
          setMessage({ type: 'success', text: '会员开通成功！感谢您的支持' });
          setPendingOrder(null);
          setPolling(false);
          return;
        }
      } catch (err) {
        console.error('Poll pay result error:', err);
      }
      
      // 等待2秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setMessage({ type: 'error', text: '支付结果确认超时，如已支付请稍后刷新页面查看' });
    setPolling(false);
  }, [user, setUser]);

  const handlePurchase = async (type: 'yearly' | 'lifetime') => {
    if (!user) return;
    setPurchasing(type);
    setMessage(null);

    try {
      const res = await authFetch('/api/membership/order', {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      const data = await res.json();

      if (data.success && data.payUrl) {
        // 有支付链接，跳转到支付宝
        setPendingOrder({
          id: data.order.id,
          type: data.order.type,
          amountYuan: data.order.amountYuan,
        });
        
        // 跳转到支付宝支付页面
        window.location.href = data.payUrl;
        return;
      }

      if (data.success && !data.payUrl) {
        // 支付宝未配置或签名失败
        if (data.alipayReady === false) {
          // 支付宝环境变量未配置
          setMessage({ 
            type: 'error', 
            text: '支付功能暂未开通，请联系客服完成支付' 
          });
        } else {
          // 支付宝已配置但签名失败
          setMessage({ 
            type: 'error', 
            text: data.message || '支付链接生成失败，请稍后重试' 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || '创建订单失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '创建订单失败' });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator/settings" className="text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">会员中心</h1>
      </div>

      {/* 提示消息 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' :
          message.type === 'info' ? 'bg-blue-50 text-blue-700' :
          'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : 
           message.type === 'info' ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> :
           <X className="w-4 h-4 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 支付中提示 */}
      {polling && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">正在确认支付结果...</p>
            <p className="text-xs text-yellow-600">请稍候，系统正在验证您的支付信息</p>
          </div>
        </div>
      )}

      {/* 当前状态 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full -mb-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {membershipType !== 'free' ? (
              <Crown className="w-10 h-10 text-yellow-300" />
            ) : (
              <Shield className="w-10 h-10 text-blue-200" />
            )}
            <div>
              <h2 className="text-2xl font-bold">{MEMBERSHIP_LABELS[membershipType]}</h2>
              <p className="text-blue-100">
                可创建 {AVATAR_LIMITS[membershipType]} 个AI分身
              </p>
              {(user as any)?.membershipExpiresAt && membershipType === 'yearly' && (
                <p className="text-blue-200 text-xs mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  到期时间：{new Date((user as any).membershipExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 会员套餐 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择套餐</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 年费会员 */}
        <div className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
          membershipType === 'yearly' ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
        }`}>
          {membershipType === 'yearly' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              当前套餐
            </div>
          )}
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-7 h-7 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">年费会员</h4>
            <div className="mt-2">
              <span className="text-3xl font-bold text-blue-600">¥9.9</span>
              <span className="text-gray-500 text-sm">/年</span>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              可创建10个AI分身
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              优先审核通道
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              年费会员专属标识
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              在线客服支持
            </li>
          </ul>
          {membershipType === 'free' ? (
            <button
              onClick={() => handlePurchase('yearly')}
              disabled={purchasing !== null || polling}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {purchasing === 'yearly' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 创建订单中...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> 立即开通</>
              )}
            </button>
          ) : membershipType === 'yearly' ? (
            <div className="text-center text-sm text-gray-500 py-2">当前套餐</div>
          ) : null}
        </div>

        {/* 终身会员 */}
        <div className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
          membershipType === 'lifetime' ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-purple-300'
        }`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            最超值
          </div>
          {membershipType === 'lifetime' && (
            <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              已开通
            </div>
          )}
          <div className="text-center mb-4">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="w-7 h-7 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">终身会员</h4>
            <div className="mt-2">
              <span className="text-3xl font-bold text-purple-600">¥99</span>
              <span className="text-gray-500 text-sm">/永久</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">一次购买，终身享用</p>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
              可创建10个AI分身
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
              最高优先审核
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
              终身会员专属标识
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
              1对1专属客服
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
              永不过期
            </li>
          </ul>
          {membershipType === 'free' || membershipType === 'yearly' ? (
            <button
              onClick={() => handlePurchase('lifetime')}
              disabled={purchasing !== null || polling}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {purchasing === 'lifetime' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 创建订单中...</>
              ) : (
                <><Crown className="w-4 h-4" /> 升级终身会员</>
              )}
            </button>
          ) : (
            <div className="text-center text-sm text-gray-500 py-2">已开通</div>
          )}
        </div>
      </div>

      {/* 知识产权认证服务 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-8 -mt-8" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  AI分身知识产权认证
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded leading-none">NEW</span>
                </h3>
                <p className="text-sm text-gray-600">确认分身知识产权归属，保护创作者权益</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">¥999</div>
              <div className="text-xs text-gray-500">/每个分身</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">知识产权证书</p>
                <p className="text-xs text-gray-500">PDF电子证书，确认分身归属</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">区块链存证</p>
                <p className="text-xs text-gray-500">不可篡改的链上存证记录</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">已认证标识</p>
                <p className="text-xs text-gray-500">分身展示专属认证徽章</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/creator/certifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              了解详情
            </Link>
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
              🔒 政府公证服务即将开通
            </span>
          </div>
        </div>
      </div>

      {/* 权益对比表 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">权益对比</h3>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">权益</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">免费用户</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-blue-600">年费会员</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-purple-600">终身会员</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MEMBERSHIP_FEATURES.map((feature, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-6 py-3 text-sm text-gray-700">{feature.name}</td>
                <td className="px-6 py-3 text-sm text-gray-500 text-center">{feature.free}</td>
                <td className="px-6 py-3 text-sm text-gray-700 text-center">{feature.yearly}</td>
                <td className="px-6 py-3 text-sm text-gray-700 text-center">{feature.lifetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">常见问题</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 text-sm">购买后可以退款吗？</h4>
            <p className="text-sm text-gray-500 mt-1">会员开通后不支持退款，请在购买前确认需求。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">年费会员到期后会怎样？</h4>
            <p className="text-sm text-gray-500 mt-1">到期后自动降级为免费用户，已有的分身不会被删除，但无法创建新分身。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">从年费升级到终身，费用如何计算？</h4>
            <p className="text-sm text-gray-500 mt-1">升级终身会员需支付全额费用，当前年费会员剩余时间不折算。</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">支付方式是什么？</h4>
            <p className="text-sm text-gray-500 mt-1">目前支持支付宝支付，点击开通后将跳转到支付宝完成付款。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
