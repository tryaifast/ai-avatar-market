'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight,
  Plus, Star, DollarSign, ArrowLeft, MessageSquare, Shield
} from 'lucide-react';
import { useAuthStore, useAvatarStore, useTaskStore, useApplicationStore } from '@/lib/store';

// 创作者中心 - 使用真实数据
// 认证保护由 Creator Layout 的 ProtectedRoute 统一处理
export default function CreatorDashboard() {
  const user = useAuthStore((s) => s.user);
  
  const avatars = useAvatarStore((s) => s.avatars);
  const fetchAvatars = useAvatarStore((s) => s.fetchAvatars);
  
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  const { myApplication, fetchMyApplication } = useApplicationStore();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    pendingReviews: 0,
    activeTasks: 0,
    totalTasks: 0,
  });

  // 加载数据（认证由Layout保障，无需再检查）
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (user) {
        await Promise.all([
          fetchAvatars(),
          fetchTasks(user.id, 'creator'),
          fetchMyApplication(user.id).finally(() => setOnboardingChecked(true)),
        ]);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [user, fetchAvatars, fetchTasks, fetchMyApplication]);

  const isApproved = myApplication?.status === 'approved';

  // 计算统计数据
  useEffect(() => {
    if (!tasks) return;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let pendingReviews = 0;
    let activeTasks = 0;
    
    tasks.forEach((task: any) => {
      const taskDate = new Date(task.createdAt || task.created_at);
      const price = task.price || 0;
      
      // 计算收益
      if (task.status === 'completed' || task.status === 'paid') {
        if (taskDate >= today) todayEarnings += price;
        if (taskDate >= weekAgo) weekEarnings += price;
        if (taskDate >= monthAgo) monthEarnings += price;
      }
      
      // 统计任务状态
      if (task.status === 'ai_completed' || task.status === 'human_reviewing') {
        pendingReviews++;
      }
      if (task.status === 'in_progress' || task.status === 'ai_working') {
        activeTasks++;
      }
    });
    
    setStats({
      todayEarnings,
      weekEarnings,
      monthEarnings,
      pendingReviews,
      activeTasks,
      totalTasks: tasks.length,
    });
  }, [tasks]);

  // 获取待审核任务
  const pendingTasks = tasks?.filter((t: any) => 
    t.status === 'ai_completed' || t.status === 'human_reviewing'
  ).slice(0, 5) || [];
  
  // 获取最近完成的任务
  const recentTasks = tasks?.filter((t: any) => 
    t.status === 'completed' || t.status === 'paid'
  ).slice(0, 5) || [];
  
  // 获取表现最佳的分身
  const topAvatars = avatars
    ?.filter((a: any) => a.creatorId === user?.id)
    ?.sort((a: any, b: any) => (b.earnings || 0) - (a.earnings || 0))
    ?.slice(0, 3) || [];

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

  const taskStatusMap: Record<string, { label: string; color: string; icon: any }> = {
    ai_completed: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    human_reviewing: { label: '审核中', color: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    paid: { label: '已支付', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">创作者中心</h1>
            <p className="text-gray-600 mt-1">管理你的AI分身，查看收益和任务</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/client/feedback"
            className="btn-secondary flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            反馈建议
          </Link>
          <Link
            href="/creator/avatars"
            className="btn-secondary"
          >
            我的分身
          </Link>
          {isApproved ? (
            <Link
              href="/creator/avatar/create"
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建新分身
            </Link>
          ) : (
            <Link
              href="/creator/onboarding"
              className="btn-primary"
            >
              <Shield className="w-4 h-4 mr-2" />
              申请入驻
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      ) : (
        <>
          {/* 未入驻提示横幅 */}
          {onboardingChecked && !isApproved && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">
                    {myApplication?.status === 'pending' ? '入驻申请审核中' : '你还未完成入驻审核'}
                  </p>
                  <p className="text-sm text-amber-600">
                    {myApplication?.status === 'pending' 
                      ? '审核通常需要1-3个工作日，请耐心等待' 
                      : '需要先完成入驻审核，才能创建AI分身和接单'}
                  </p>
                </div>
              </div>
              {myApplication?.status !== 'pending' && (
                <Link href="/creator/onboarding" className="btn-primary text-sm">
                  去申请入驻
                </Link>
              )}
              {myApplication?.status === 'pending' && (
                <Link href="/creator/onboarding/status" className="btn-secondary text-sm">
                  查看进度
                </Link>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">今日收益</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.todayEarnings)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                实时更新
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">本周收益</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.weekEarnings)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                近7天
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">待审核</span>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.pendingReviews}
              </div>
              <div className="text-sm text-yellow-600 mt-1">
                需要你的确认
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">进行中</span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeTasks}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                AI正在工作
              </div>
            </div>
          </div>

          {/* Pending Reviews */}
          {pendingTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                待审核任务
                <span className="badge-yellow">{pendingTasks.length}</span>
              </h2>
              <div className="space-y-4">
                {pendingTasks.map((task: any) => {
                  const statusConfig = taskStatusMap[task.status] || taskStatusMap.ai_completed;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={task.id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>客户: {task.clientName || task.client?.name || '未知'}</span>
                            <span>·</span>
                            <span>分身: {task.avatarName || task.avatar?.name || '未知'}</span>
                            {task.aiCompletedAt && (
                              <>
                                <span>·</span>
                                <span>AI完成于 {new Date(task.aiCompletedAt).toLocaleString('zh-CN')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">{formatPrice(task.price || 0)}</span>
                        <Link
                          href={`/creator/tasks/${task.id}`}
                          className="btn-primary text-sm"
                        >
                          去审核
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Avatars */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">我的分身</h2>
              {topAvatars.length > 0 ? (
                <div className="card divide-y">
                  {topAvatars.map((avatar: any, index: number) => (
                    <div key={avatar.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{avatar.name}</h3>
                          <div className="text-sm text-gray-500">
                            {avatar.status === 'approved' ? '已上架' : 
                             avatar.status === 'pending' ? '审核中' : '已下架'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatPrice(avatar.earnings || 0)}</div>
                        <div className="text-xs text-gray-500">累计收益</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-gray-500 mb-4">还没有创建分身</p>
                  <Link href="/creator/avatar/create" className="btn-primary">
                    创建第一个分身
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Tasks */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">最近完成的任务</h2>
              {recentTasks.length > 0 ? (
                <div className="card divide-y">
                  {recentTasks.map((task: any) => (
                    <div key={task.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span className="font-semibold text-gray-900">{formatPrice(task.price || 0)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>客户: {task.clientName || task.client?.name || '未知'}</span>
                        <span>·</span>
                        <span>{new Date(task.completedAt || task.updated_at).toLocaleDateString('zh-CN')}</span>
                        {task.rating && (
                          <>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span>{task.rating}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-gray-500">暂无已完成任务</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
