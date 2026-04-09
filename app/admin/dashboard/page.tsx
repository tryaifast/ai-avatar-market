'use client';

import Link from 'next/link';
import { useState } from 'react';

// 管理端仪表盘
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('7d');
  
  // Mock 统计数据
  const stats = {
    totalUsers: 1248,
    newUsersToday: 23,
    totalAvatars: 356,
    pendingReviews: 12,
    totalRevenue: 158600,
    todayRevenue: 5600,
  };
  
  // Mock 近期活动
  const recentActivities = [
    { id: 1, type: 'user', action: '新用户注册', detail: '用户 李明 完成注册', time: '10分钟前' },
    { id: 2, type: 'review', action: '入驻申请', detail: '王芳 提交了入驻申请', time: '30分钟前' },
    { id: 3, type: 'order', action: '新订单', detail: '订单 #20250408001 已支付', time: '1小时前' },
    { id: 4, type: 'avatar', action: '分身审核', detail: '张明的AI分身已通过审核', time: '2小时前' },
    { id: 5, type: 'complaint', action: '投诉处理', detail: '用户反馈已处理完毕', time: '3小时前' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">管理员</span>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
              <span>📊</span>
              <span>数据仪表盘</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <span>👥</span>
              <span>用户管理</span>
            </Link>
            <Link href="/admin/avatars" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <span>🤖</span>
              <span>分身管理</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <span>📦</span>
              <span>订单管理</span>
            </Link>
            <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <span>✅</span>
              <span>审核管理</span>
              <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.pendingReviews}</span>
            </Link>
          </nav>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 p-6">
          {/* 时间筛选 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">数据概览</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input w-auto"
            >
              <option value="24h">最近24小时</option>
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
            </select>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="stat-card">
              <p className="stat-card-title">总用户数</p>
              <p className="stat-card-value">{stats.totalUsers.toLocaleString()}</p>
              <p className="stat-card-change stat-card-change-up">+{stats.newUsersToday} 今日新增</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">AI分身数量</p>
              <p className="stat-card-value">{stats.totalAvatars}</p>
              <p className="stat-card-change">待审核: {stats.pendingReviews}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">平台总收入</p>
              <p className="stat-card-value">¥{stats.totalRevenue.toLocaleString()}</p>
              <p className="stat-card-change stat-card-change-up">+¥{stats.todayRevenue} 今日</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 近期活动 */}
            <div className="card lg:col-span-2">
              <h3 className="font-semibold mb-4">近期活动</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'review' ? 'bg-yellow-100' :
                      activity.type === 'order' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'user' ? '👤' :
                       activity.type === 'review' ? '📝' :
                       activity.type === 'order' ? '💰' :
                       activity.type === 'avatar' ? '🤖' : '📋'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.detail}</p>
                    </div>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="card">
              <h3 className="font-semibold mb-4">快捷操作</h3>
              <div className="space-y-3">
                <Link href="/admin/reviews">
                  <button className="btn w-full justify-start">
                    ✅ 处理入驻申请 ({stats.pendingReviews})
                  </button>
                </Link>
                <Link href="/admin/orders">
                  <button className="btn w-full justify-start">
                    📦 查看订单列表
                  </button>
                </Link>
                <Link href="/admin/users">
                  <button className="btn w-full justify-start">
                    👥 管理用户
                  </button>
                </Link>
                <Link href="/admin/avatars">
                  <button className="btn w-full justify-start">
                    🤖 管理AI分身
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
