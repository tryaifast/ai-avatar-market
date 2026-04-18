'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/store';
import Link from 'next/link';

export default function CertificationApplyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const avatarId = searchParams.get('avatarId');

  const [avatar, setAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!avatarId) {
      setError('缺少分身ID');
      setLoading(false);
      return;
    }
    fetchAvatar();
  }, [avatarId]);

  const fetchAvatar = async () => {
    try {
      const res = await authFetch(`/api/avatars/${avatarId}`);
      const data = await res.json();
      if (data.success && data.avatar) {
        // 检查是否已认证
        if (data.avatar.certification_status === 'certified') {
          router.push(`/creator/avatars/${avatarId}`);
          return;
        }
        if (data.avatar.certification_status === 'pending' && data.avatar.certification_id) {
          router.push(`/creator/certification/status/${data.avatar.certification_id}`);
          return;
        }
        setAvatar(data.avatar);
      } else {
        setError('分身不存在');
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!agreed) {
      setError('请同意知识产权确认协议');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await authFetch('/api/certifications/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId }),
      });

      const data = await res.json();

      if (data.success && data.payUrl) {
        // 跳转到支付宝
        window.location.href = data.payUrl;
      } else if (data.certificationId) {
        // 已存在订单，跳转状态页
        router.push(`/creator/certification/status/${data.certificationId}`);
      } else {
        setError(data.error || data.message || '创建订单失败');
      }
    } catch (err) {
      setError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !avatar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/creator/avatars" className="text-blue-600 hover:underline">
            返回分身列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/creator/avatars/${avatarId}`} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">申请知识产权认证</h1>
        </div>

        {/* 认证介绍 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h2 className="text-lg font-semibold">AI分身知识产权认证</h2>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            通过本平台认证，您的AI分身将获得完整的知识产权保护，包括人格设定、知识库、
            交互内容的著作权确认。经区块链存证后，具有法律效力。
          </p>
        </div>

        {/* 分身信息 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">认证对象</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {(avatar?.name || '?')[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{avatar?.name || '未命名分身'}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{avatar?.description || '暂无描述'}</p>
            </div>
          </div>
        </div>

        {/* 服务内容 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">服务内容</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">知识产权确认</p>
                <p className="text-sm text-gray-500">确认分身的完整知识产权归属于创作者</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">区块链存证</p>
                <p className="text-sm text-gray-500">蚂蚁链存证，永久可查，不可篡改</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">电子证书</p>
                <p className="text-sm text-gray-500">生成PDF证书，可下载保存</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-50">
              <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">政府公证（即将开通）</p>
                <p className="text-sm text-gray-400">对接公证处，进一步增强法律效力</p>
              </div>
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">认证费用</span>
            <span className="text-3xl font-bold text-gray-900">¥999</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">一次性费用，终身有效</p>
        </div>

        {/* 协议 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">知识产权确认协议</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-48 overflow-y-auto mb-4">
            <p className="mb-2">1. 本认证确认您（创作者）对申请的AI分身拥有完整的知识产权。</p>
            <p className="mb-2">2. 知识产权包括但不限于：分身的名称、形象、人格设定、知识库内容、交互模式、训练数据等。</p>
            <p className="mb-2">3. 您授权本平台对分身进行展示、推广和商业化运营，收益按平台规则分配。</p>
            <p className="mb-2">4. 认证后，您可随时下架分身，但已完成的交易和授权继续有效。</p>
            <p className="mb-2">5. 本平台仅作为技术服务平台，不承担因知识产权纠纷产生的法律责任。</p>
            <p>6. 区块链存证信息永久保存，作为权属证明的辅助证据。</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              我已阅读并同意《知识产权确认协议》
            </span>
          </label>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !agreed}
          className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              处理中...
            </>
          ) : (
            <>立即支付 ¥999</>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          支付后跳转到支付宝完成付款
        </p>
      </div>
    </div>
  );
}
