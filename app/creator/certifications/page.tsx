'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, Clock, ChevronRight, Lock } from 'lucide-react';
import { authFetch, useAuthStore } from '@/lib/store';
import Link from 'next/link';

interface Certification {
  id: string;
  order_no: string;
  status: 'pending' | 'paid' | 'processing' | 'certified' | 'failed';
  certificate_no: string | null;
  certificate_url: string | null;
  amount: number;
  paid_at: string | null;
  created_at: string;
  avatar: {
    id: string;
    name: string;
  };
}

export default function CertificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchCertifications();
  }, [user]);

  const fetchCertifications = async () => {
    try {
      const res = await authFetch('/api/certifications/list');
      const data = await res.json();
      if (data.success) {
        setCerts(data.certifications || []);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      paid: { label: '处理中', color: 'bg-blue-100 text-blue-700', icon: Clock },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-700', icon: Clock },
      certified: { label: '已认证', color: 'bg-green-100 text-green-700', icon: ShieldCheck },
      failed: { label: '失败', color: 'bg-red-100 text-red-700', icon: Shield },
    };
    const config = map[status] || map.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">我的认证</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">知识产权认证</h1>
        <p className="text-gray-500 mb-8">为你的AI分身申请知识产权认证，确认归属、区块链存证、专属标识</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 服务介绍卡片 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI分身知识产权认证服务</h3>
              <p className="text-sm text-gray-500">¥999 / 每个分身 · 一次认证，永久有效</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-700">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">分身上传</p>
                <p className="text-xs text-gray-500">提交分身信息</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-700">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">知识产权确认</p>
                <p className="text-xs text-gray-500">生成证书+区块链存证</p>
              </div>
            </div>
            <div className="flex items-start gap-2 relative">
              <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-3 h-3 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">政府公证</p>
                <p className="text-xs text-gray-400">开发中，敬请期待</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-700">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">认证标识</p>
                <p className="text-xs text-gray-500">展示已认证徽章</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
            <Lock className="w-3.5 h-3.5" />
            <span>政府公证服务正在开发中，敬请期待。当前认证包含知识产权证书和区块链存证，同样具有法律效力。</span>
          </div>
        </div>

        {/* 愿景与使命 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">让AI负责智能，让价值归属于人</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>当无数AI大厂用着我们的技能和经验训练AI，反过来淘汰我们，我们的思想是生产资料，但生产资料产生的价值却不归属于我们。</p>
                <p>对分身进行公证，就是为了让我们的思想、智慧、技能为我们自己服务，让价值归属于我们自己。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 认证记录列表 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">我的认证记录</h3>

        {certs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无认证记录</h3>
            <p className="text-gray-500 mb-6">为你的AI分身申请知识产权认证，保护创作成果</p>
            <Link
              href="/creator/avatars"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              去选择分身认证
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {(cert.avatar?.name || '?')[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.avatar?.name || '未命名分身'}</h3>
                      <p className="text-sm text-gray-500">
                        订单号：{cert.order_no} · 金额：¥{(cert.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(cert.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(cert.status)}
                    <Link
                      href={`/creator/certification/status/${cert.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      查看详情
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
