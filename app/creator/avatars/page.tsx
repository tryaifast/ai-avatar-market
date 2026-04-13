'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, Bot, Clock, CheckCircle, XCircle, Eye, Settings,
  TrendingUp, Users, ArrowLeft, Sparkles, Shield, Crown
} from 'lucide-react';
import { useAvatarStore, useAuthStore, useApplicationStore, authFetch } from '@/lib/store';
import { AVATAR_LIMITS } from '@/lib/constants';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: {
    label: '已上架',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  reviewing: {
    label: '审核中',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-700',
    icon: Bot,
  },
  paused: {
    label: '已暂停',
    color: 'bg-orange-100 text-orange-700',
    icon: Clock,
  },
  rejected: {
    label: '未通过',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  banned: {
    label: '已封禁',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

// 认证保护由 Creator Layout 的 ProtectedRoute 统一处理
export default function MyAvatarsPage() {
  const { avatars, isLoading, setAvatars } = useAvatarStore();
  const user = useAuthStore((s) => s.user);
  const { myApplication, fetchMyApplication } = useApplicationStore();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [avatarLimitReached, setAvatarLimitReached] = useState(false);

  // 检查入驻状态 + 分身数量
  useEffect(() => {
    if (user?.id) {
      fetchMyApplication(user.id).finally(() => setOnboardingChecked(true));
      fetchMyAvatars();
    }
  }, [user?.id]);

  // 未入驻或审核未通过，显示入驻提示
  const isApproved = myApplication?.status === 'approved';

  const fetchMyAvatars = async () => {
    try {
      const res = await authFetch(`/api/avatars?creatorId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setAvatars(data.avatars || []);
        // 检查分身数量限制
        const membershipType = (user as any)?.membershipType || 'free';
        const limit = AVATAR_LIMITS[membershipType] || 1;
        setAvatarLimitReached((data.avatars || []).length >= limit);
      }
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
    }
  };

  const myAvatars = avatars;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">我的分身</h1>
            </div>
            <Link
              href={isApproved && !avatarLimitReached ? "/creator/avatar/create" : "#"}
              className={`btn-primary ${(!isApproved || avatarLimitReached) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => { if (!isApproved || avatarLimitReached) e.preventDefault(); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建新分身
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">总分身</p>
                    <p className="text-xl font-bold text-gray-900">{myAvatars.length}</p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已上架</p>
                    <p className="text-xl font-bold text-gray-900">
                      {myAvatars.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">累计收益</p>
                    <p className="text-xl font-bold text-gray-900">
                      ¥{(myAvatars.reduce((sum, a) => sum + (a.stats?.completedTasks || 0), 0) * 50).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">总任务数</p>
                    <p className="text-xl font-bold text-gray-900">
                      {myAvatars.reduce((sum, a) => sum + (a.stats?.completedTasks || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 会员升级提示 */}
            {avatarLimitReached && (user as any)?.membershipType === 'free' && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">免费用户只能创建1个分身</p>
                    <p className="text-sm text-gray-500">升级会员可创建最多10个分身 · 年费¥9.9 / 终身¥99</p>
                  </div>
                </div>
                <Link
                  href="/creator/membership"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  升级会员
                </Link>
              </div>
            )}

            {/* Avatars List */}
            {myAvatars.length > 0 ? (
              <div className="space-y-4">
                {myAvatars.map((avatar) => {
                  const status = statusConfig[avatar.status as keyof typeof statusConfig] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={avatar.id} className="card p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <Bot className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{avatar.name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{avatar.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>浏览: {avatar.stats?.hiredCount || 0}</span>
                              <span>·</span>
                              <span>创建: {avatar.createdAt?.split('T')[0] || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/creator/avatars/${avatar.id}`}
                            className="btn-secondary btn-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Link>
                          <Link
                            href={`/creator/avatars/${avatar.id}/settings`}
                            className="btn-secondary btn-sm"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            设置
                          </Link>
                        </div>
                      </div>
                      
                      {avatar.status === 'active' && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">完成任务</p>
                            <p className="text-lg font-semibold text-gray-900">{avatar.stats?.completedTasks || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">评分</p>
                            <p className="text-lg font-semibold text-yellow-600">{avatar.stats?.rating?.toFixed(1) || 0}★</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">雇佣次数</p>
                            <p className="text-lg font-semibold text-gray-900">{avatar.stats?.hiredCount || 0}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有创建分身</h3>
                {!isApproved ? (
                  <>
                    <p className="text-gray-600 mb-6">你需要先完成入驻审核，才能创建AI分身</p>
                    <Link href="/creator/onboarding" className="btn-primary inline-flex">
                      <Shield className="w-4 h-4 mr-2" />
                      申请入驻
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6">创建你的第一个AI分身，开始接单赚钱</p>
                    <Link href="/creator/avatar/create" className="btn-primary inline-flex">
                      <Sparkles className="w-4 h-4 mr-2" />
                      立即创建
                    </Link>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
