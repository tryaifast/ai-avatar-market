'use client';

import Link from 'next/link';
import { ArrowLeft, Star, Shield, ShieldCheck, Settings, BookOpen } from 'lucide-react';

interface AvatarAnalyticsClientProps {
  avatar: any;
}

export function AvatarAnalyticsClient({ avatar }: AvatarAnalyticsClientProps) {
  if (!avatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">分身不存在</p>
      </div>
    );
  }

  // 安全取值：所有数值字段必须用 Number() 包裹 + 默认值
  const stats = avatar.stats || {};
  const hireCount = Number(stats.hiredCount || 0);
  const completedTasks = Number(stats.completedTasks || 0);
  const rating = Number(stats.rating || 0);
  const expertise = avatar.personality?.expertise || [];
  const category = expertise[0] || '通用';

  const statusLabel: Record<string, string> = {
    active: '已上架',
    pending: '待审核',
    reviewing: '审核中',
    draft: '草稿',
    paused: '已暂停',
    rejected: '未通过',
    banned: '已封禁',
  };

  const certStatusLabel: Record<string, { label: string; color: string }> = {
    none: { label: '未认证', color: 'bg-gray-100 text-gray-600' },
    pending: { label: '认证中', color: 'bg-yellow-100 text-yellow-700' },
    certified: { label: '已认证', color: 'bg-green-100 text-green-700' },
    expired: { label: '已过期', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator/avatars" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">分身数据分析</h1>
      </div>

      {/* Avatar Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{(avatar.name || '?')[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{avatar.name || '未命名'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="badge-blue">{category}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {rating > 0 ? rating.toFixed(1) : '暂无'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                avatar.status === 'active' ? 'bg-green-100 text-green-700' :
                avatar.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                avatar.status === 'banned' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {statusLabel[avatar.status] || avatar.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 认证状态 & 操作 */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatar.certification_status === 'certified' ? (
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">已认证</span>
              </div>
            ) : avatar.certification_status === 'pending' ? (
              <div className="flex items-center gap-2 text-yellow-600">
                <Shield className="w-6 h-6" />
                <span className="font-semibold">认证中</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-6 h-6" />
                <span>未认证</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {avatar.certification_status === 'certified'
                ? '知识产权已确认，受平台保护'
                : avatar.certification_status === 'pending'
                ? '正在处理中'
                : '申请认证，确认知识产权归属'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {avatar.certification_status === 'certified' && avatar.certification_id && (
              <Link
                href={`/creator/certification/status/${avatar.certification_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                查看证书
              </Link>
            )}
            {avatar.certification_status === 'pending' && avatar.certification_id && (
              <Link
                href={`/creator/certification/status/${avatar.certification_id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                查看进度
              </Link>
            )}
            {avatar.certification_status === 'none' && (
              <Link
                href={`/creator/certification/apply?avatarId=${avatar.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                申请认证 ¥999
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="stat-card-title">雇佣次数</p>
          <p className="stat-card-value">{hireCount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">完成任务</p>
          <p className="stat-card-value">{completedTasks}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">评分</p>
          <p className="stat-card-value">{rating > 0 ? rating.toFixed(1) : '-'}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">状态</p>
          <p className="stat-card-value">{statusLabel[avatar.status] || avatar.status || '-'}</p>
        </div>
      </div>

      {/* 工作范围 */}
      {avatar.scope && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">工作范围</h3>
          <div className="space-y-3">
            {avatar.scope.canDo?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">能做什么</p>
                <div className="flex flex-wrap gap-1">
                  {avatar.scope.canDo.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">{item}</span>
                  ))}
                </div>
              </div>
            )}
            {avatar.scope.cannotDo?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">不能做什么</p>
                <div className="flex flex-wrap gap-1">
                  {avatar.scope.cannotDo.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">{item}</span>
                  ))}
                </div>
              </div>
            )}
            {avatar.scope.responseTime && (
              <div>
                <p className="text-sm text-gray-500">响应时间：{avatar.scope.responseTime}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 定价信息 */}
      {avatar.pricing && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">定价</h3>
          <div className="text-sm space-y-2">
            <p>类型：{avatar.pricing.type === 'per_task' ? '按次计费' : '订阅制'}</p>
            {avatar.pricing.perTask && (
              <p>价格范围：¥{avatar.pricing.perTask.min || 0} - ¥{avatar.pricing.perTask.max || 0}</p>
            )}
            {avatar.pricing.subscription && (
              <p>月费：¥{avatar.pricing.subscription.monthly || 0} / 年费：¥{avatar.pricing.subscription.yearly || 0}</p>
            )}
          </div>
        </div>
      )}

      {/* 最近雇佣记录 - 空状态 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近雇佣记录</h3>
        {hireCount > 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">暂无详细雇佣记录</p>
            <p className="text-sm text-gray-400 mt-1">共 {hireCount} 次雇佣</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">还没有被雇佣过</p>
            <p className="text-sm text-gray-400 mt-1">分身上线后，雇佣记录将在这里展示</p>
          </div>
        )}
      </div>
    </div>
  );
}
