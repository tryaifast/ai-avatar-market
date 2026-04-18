'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, ShieldCheck, Loader2, Download, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { authFetch } from '@/lib/store';
import Link from 'next/link';

interface Certification {
  id: string;
  order_no: string;
  status: 'pending' | 'paid' | 'processing' | 'certified' | 'failed';
  certificate_no: string | null;
  certificate_url: string | null;
  blockchain_hash: string | null;
  blockchain_explorer_url: string | null;
  notary_status: 'pending' | 'submitted' | 'processing' | 'completed' | 'na';
  paid_at: string | null;
  certificate_generated_at: string | null;
  blockchain_tx_time: string | null;
  avatar: {
    id: string;
    name: string;
    description: string;
  };
}

export default function CertificationStatusPage() {
  const params = useParams();
  const router = useRouter();
  const certificationId = params.id as string;

  const [cert, setCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertification();
    // 轮询更新状态
    const interval = setInterval(fetchCertification, 5000);
    return () => clearInterval(interval);
  }, [certificationId]);

  const fetchCertification = async () => {
    try {
      const res = await authFetch(`/api/certifications/${certificationId}`);
      const data = await res.json();
      if (data.success && data.certification) {
        setCert(data.certification);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      const res = await authFetch(`/api/certifications/${certificationId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI分身知识产权认证证书_${cert.certificate_no}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await res.json();
        setError(data.error || '下载失败');
      }
    } catch (err) {
      setError('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (!cert) return 'pending';
    const statusMap: Record<string, number> = {
      pending: 0,
      paid: 1,
      processing: 2,
      certified: 4,
      failed: -1,
    };
    const currentStep = statusMap[cert.status] || 0;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const steps = [
    { id: 1, title: '支付完成', desc: '认证费用已支付' },
    { id: 2, title: '证书生成', desc: 'PDF证书制作中' },
    { id: 3, title: '区块链存证', desc: '蚂蚁链存证上链' },
    { id: 4, title: '认证完成', desc: '已获知识产权认证' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || '认证不存在'}</p>
          <Link href="/creator/avatars" className="text-blue-600 hover:underline">
            返回分身列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {cert.status === 'certified' ? (
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {cert.status === 'certified' ? '认证完成' : '认证处理中'}
          </h1>
          <p className="text-gray-500">
            {cert.status === 'certified'
              ? '您的AI分身已获得知识产权认证'
              : '正在为您生成分身认证证书'}
          </p>
        </div>

        {/* 进度条 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      status === 'completed'
                        ? 'bg-green-500 text-white'
                        : status === 'current'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {status === 'completed' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-center">{step.title}</p>
                  <p className="text-xs text-gray-400 text-center">{step.desc}</p>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute h-1 w-full top-5 left-1/2 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: '100%', transform: 'translateX(50%)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 当前状态提示 */}
          {cert.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">等待支付完成，请完成支付宝付款</p>
            </div>
          )}
          {cert.status === 'paid' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-700">支付成功，正在生成证书...</p>
            </div>
          )}
          {cert.status === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-700">证书生成中，即将完成区块链存证...</p>
            </div>
          )}
          {cert.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">认证失败，请联系客服</p>
            </div>
          )}
        </div>

        {/* 证书信息 */}
        {cert.status === 'certified' && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              证书信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">证书编号</span>
                <span className="font-mono text-gray-900">{cert.certificate_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">认证对象</span>
                <span className="text-gray-900">{cert.avatar?.name || '未命名分身'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">认证时间</span>
                <span className="text-gray-900">
                  {cert.certificate_generated_at
                    ? new Date(cert.certificate_generated_at).toLocaleString('zh-CN')
                    : '-'}
                </span>
              </div>
            </div>

            {/* 区块链信息 */}
            {cert.blockchain_hash && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">区块链存证</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">存证哈希</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{cert.blockchain_hash}</p>
                </div>
                {cert.blockchain_explorer_url && (
                  <a
                    href={cert.blockchain_explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    在区块链浏览器查看
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full mt-6 bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  下载中...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  下载证书 PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* 公证信息（预留） */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 opacity-70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">政府公证</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              即将开通
            </span>
          </div>
          <p className="text-sm text-gray-500">
            目前正在与公证处对接中，开通后将为您提供更强法律效力的公证服务。
            已认证的创作者可优先申请。
          </p>
        </div>

        {/* 返回 */}
        <Link
          href={`/creator/avatars/${cert.avatar?.id}`}
          className="block text-center text-gray-500 hover:text-gray-700"
        >
          ← 返回分身详情
        </Link>
      </div>
    </div>
  );
}
