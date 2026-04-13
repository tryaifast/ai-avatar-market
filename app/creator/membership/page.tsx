'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Crown, Check, X, ChevronLeft, Sparkles, Shield, 
  Loader2, CheckCircle, ArrowRight, Star
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';
import { MEMBERSHIP_LABELS, AVATAR_LIMITS, MEMBERSHIP_PRICES, MEMBERSHIP_FEATURES } from '@/lib/constants';

export default function MembershipPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const membershipType = (user as any)?.membershipType || 'free';

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

      if (data.success) {
        // 更新本地用户状态
        const updatedUser = { ...user, membershipType: type } as any;
        if (type === 'yearly') {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          updatedUser.membershipExpiresAt = expiresAt.toISOString();
        }
        setUser(updatedUser);
        setMessage({ type: 'success', text: '会员开通成功！' });
      } else {
        setMessage({ type: 'error', text: data.error || '开通失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '开通失败' });
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
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
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
              disabled={purchasing !== null}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {purchasing === 'yearly' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 开通中...</>
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
              disabled={purchasing !== null}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {purchasing === 'lifetime' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 开通中...</>
              ) : (
                <><Crown className="w-4 h-4" /> 升级终身会员</>
              )}
            </button>
          ) : (
            <div className="text-center text-sm text-gray-500 py-2">已开通</div>
          )}
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
        </div>
      </div>
    </div>
  );
}
