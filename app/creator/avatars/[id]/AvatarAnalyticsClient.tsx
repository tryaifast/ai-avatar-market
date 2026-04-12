'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, Eye, Users, DollarSign, Star, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { date: '04-02', views: 120, hires: 2 },
  { date: '04-03', views: 180, hires: 3 },
  { date: '04-04', views: 150, hires: 1 },
  { date: '04-05', views: 220, hires: 4 },
  { date: '04-06', views: 280, hires: 5 },
  { date: '04-07', views: 320, hires: 6 },
  { date: '04-08', views: 280, hires: 4 },
];

const recentHires = [
  { id: 'H-001', client: '李四', type: '按时雇佣', amount: 600, date: '2024-04-01', status: '进行中' },
  { id: 'H-002', client: '王五', type: '按次雇佣', amount: 500, date: '2024-03-28', status: '已完成' },
  { id: 'H-003', client: '赵六', type: '按时雇佣', amount: 800, date: '2024-03-25', status: '已完成' },
];

export function AvatarAnalyticsClient({ avatar }: { avatar: any }) {
  if (!avatar) {
    return <div>分身不存在</div>;
  }

  // 安全取值：avatar 从 API 返回的结构是 AvatarDB.toAvatar() 的格式
  // 所有数值字段必须用 Number() 包裹 + 默认值，防止 undefined.toLocaleString() 报错
  const stats = avatar.stats || {};
  const views = Number(stats.hiredCount || 0);
  const hireCount = Number(stats.completedTasks || 0);
  const earnings = Number(stats.totalWorkTime || 0);
  const rating = Number(stats.rating || 0);
  const expertise = avatar.personality?.expertise || [];
  const category = expertise[0] || '通用';

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
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="stat-card-title">雇佣次数</p>
          <p className="stat-card-value">{views.toLocaleString()}</p>
          <p className="stat-card-change stat-card-change-up">较上周</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">完成任务</p>
          <p className="stat-card-value">{hireCount}</p>
          <p className="stat-card-change stat-card-change-up">较上周</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">评分</p>
          <p className="stat-card-value">{rating > 0 ? rating.toFixed(1) : '-'}</p>
          <p className="stat-card-change stat-card-change-up">较上周</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-title">状态</p>
          <p className="stat-card-value">
            {avatar.status === 'active' ? '已上架' : 
             avatar.status === 'pending' ? '审核中' : 
             avatar.status === 'reviewing' ? '审核中' : 
             avatar.status === 'draft' ? '草稿' : 
             avatar.status === 'paused' ? '已暂停' : avatar.status || '-'}
          </p>
          <p className="stat-card-change stat-card-change-up">当前</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">近7天趋势</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" name="浏览量" />
              <Line type="monotone" dataKey="hires" stroke="#10B981" name="雇佣数" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Hires */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近雇佣记录</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>雇佣ID</th>
                <th>雇佣方</th>
                <th>类型</th>
                <th>金额</th>
                <th>日期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {recentHires.map((hire) => (
                <tr key={hire.id}>
                  <td className="font-medium">{hire.id}</td>
                  <td>{hire.client}</td>
                  <td>{hire.type}</td>
                  <td className="font-medium">¥{hire.amount}</td>
                  <td>{hire.date}</td>
                  <td>
                    <span className={`badge-${hire.status === '进行中' ? 'blue' : 'green'}`}>
                      {hire.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
