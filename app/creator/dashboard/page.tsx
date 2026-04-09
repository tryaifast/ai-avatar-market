'use client';

import Link from 'next/link';
import { 
  TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight,
  Plus, Star, DollarSign, ArrowLeft
} from 'lucide-react';

// 模拟数据
const dashboardData = {
  today: { earnings: 2580, tasks: 3, newHires: 2 },
  thisWeek: { earnings: 15680, tasks: 12, workTime: 180 },
  thisMonth: { earnings: 52340, tasks: 38 },
  pendingReviews: 2,
  activeTasks: 5,
  topAvatars: [
    { avatarId: '1', name: '代码审查助手·小明', earnings: 28900, tasks: 18 },
    { avatarId: '2', name: '产品顾问·Pro', earnings: 15600, tasks: 12 },
    { avatarId: '3', name: '文案策划·阿文', earnings: 7840, tasks: 8 },
  ],
};

const pendingTasks = [
  {
    id: 'task_1',
    title: 'React项目代码审查',
    client: '张三',
    avatar: '代码审查助手·小明',
    status: 'ai_completed',
    aiCompletedAt: '2026-03-29T18:30:00',
    price: 1500,
  },
  {
    id: 'task_2',
    title: '产品需求文档撰写',
    client: '李四',
    avatar: '产品顾问·Pro',
    status: 'human_reviewing',
    aiCompletedAt: '2026-03-29T17:00:00',
    price: 3000,
  },
];

const recentTasks = [
  {
    id: 'task_3',
    title: 'Landing Page文案优化',
    client: '王五',
    avatar: '文案策划·阿文',
    status: 'completed',
    completedAt: '2026-03-28T15:30:00',
    price: 800,
    rating: 5,
  },
  {
    id: 'task_4',
    title: '数据库查询优化建议',
    client: '赵六',
    avatar: '代码审查助手·小明',
    status: 'completed',
    completedAt: '2026-03-28T10:00:00',
    price: 1200,
    rating: 5,
  },
];

const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

const taskStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  ai_completed: { label: '待审核', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  human_reviewing: { label: '审核中', color: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function CreatorDashboard() {
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
            href="/creator/avatars"
            className="btn-secondary"
          >
            我的分身
          </Link>
          <Link
            href="/creator/avatar/create"
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建新分身
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">今日收益</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(dashboardData.today.earnings)}
          </div>
          <div className="text-sm text-green-600 mt-1">
            +{dashboardData.today.tasks} 个任务
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">本周收益</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(dashboardData.thisWeek.earnings)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {dashboardData.thisWeek.tasks} 个任务
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">待审核</span>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {dashboardData.pendingReviews}
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
            {dashboardData.activeTasks}
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
            {pendingTasks.map((task) => {
              const StatusIcon = taskStatusMap[task.status].icon;
              return (
                <div key={task.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${taskStatusMap[task.status].color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>客户: {task.client}</span>
                        <span>·</span>
                        <span>分身: {task.avatar}</span>
                        <span>·</span>
                        <span>AI完成于 {new Date(task.aiCompletedAt).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{formatPrice(task.price)}</span>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">表现最佳的分身</h2>
          <div className="card divide-y">
            {dashboardData.topAvatars.map((avatar, index) => (
              <div key={avatar.avatarId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{avatar.name}</h3>
                    <div className="text-sm text-gray-500">{avatar.tasks} 个任务</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{formatPrice(avatar.earnings)}</div>
                  <div className="text-xs text-gray-500">累计收益</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近完成的任务</h2>
          <div className="card divide-y">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <span className="font-semibold text-gray-900">{formatPrice(task.price)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>客户: {task.client}</span>
                  <span>·</span>
                  <span>{new Date(task.completedAt).toLocaleDateString('zh-CN')}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{task.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
