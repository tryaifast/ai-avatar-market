'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, Clock, Download, ChevronRight } from 'lucide-react';
import { authFetch } from '@/lib/store';
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
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      // 查询用户的所有认证申请
      const supabase = (await import('@/lib/supabase/client')).createServiceClient();
      const { data, error } = await (supabase
        .from('avatar_certifications') as any)
        .select(`
          *,
          avatar:avatar_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCerts(data || []);
    } catch (err) {
      setError('加载失败');
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
      <div className="min-h-screen bg-gray-50 p-8">
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">我的知识产权认证</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {certs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无认证记录</h3>
            <p className="text-gray-500 mb-6">为您的AI分身申请知识产权认证，保护您的创作成果</p>
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
