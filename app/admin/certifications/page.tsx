'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Download, Search } from 'lucide-react';
import { adminFetch } from '@/lib/store';
import Link from 'next/link';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface Certification {
  id: string;
  order_no: string;
  certificate_no: string | null;
  status: string;
  amount: number;
  paid_at: string | null;
  created_at: string;
  creator_id: string;
  blockchain_hash: string | null;
  avatar: {
    id: string;
    name: string;
  };
  creator: {
    name: string;
    email: string;
  };
}

function CertificationsContent() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/certifications');
      const data = await res.json();
      if (data.success) {
        setCerts(data.certifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCerts = certs.filter(
    (cert) =>
      cert.order_no.toLowerCase().includes(filter.toLowerCase()) ||
      cert.certificate_no?.toLowerCase().includes(filter.toLowerCase()) ||
      cert.avatar?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      cert.creator?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      certified: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const totalAmount = certs
    .filter((c) => c.status === 'certified')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">← 返回</Link>
            <h1 className="text-xl font-bold">认证管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* 统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-500">认证总数</p>
            <p className="text-2xl font-bold">{certs.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-500">已认证</p>
            <p className="text-2xl font-bold text-green-600">
              {certs.filter((c) => c.status === 'certified').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-500">认证收入</p>
            <p className="text-2xl font-bold text-blue-600">¥{(totalAmount / 100).toFixed(2)}</p>
          </div>
        </div>

        {/* 搜索 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索订单号、证书号、分身名称、创作者..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">暂无认证记录</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">证书编号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分身</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">创作者</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{cert.certificate_no || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/creator/avatars/${cert.avatar?.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {cert.avatar?.name || '-'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{cert.creator?.name || '-'}</p>
                      <p className="text-xs text-gray-500">{cert.creator?.email}</p>
                    </td>
                    <td className="px-4 py-3">¥{(cert.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(cert.status)}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {cert.paid_at
                        ? new Date(cert.paid_at).toLocaleDateString('zh-CN')
                        : new Date(cert.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      {cert.status === 'certified' && cert.certificate_no && (
                        <>
                          <a
                            href={`/api/certifications/${cert.id}/download`}
                            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            下载
                          </a>
                          {cert.blockchain_hash && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]">
                              {cert.blockchain_hash.slice(0, 20)}...
                            </p>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCertificationsPage() {
  return (
    <AdminProtectedRoute>
      <CertificationsContent />
    </AdminProtectedRoute>
  );
}
