'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore, useAvatarStore, useApplicationStore } from '@/lib/store';

// 管理端仪表盘
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('7d');
  const { user, logout } = useAuthStore();
  const { avatars, fetchAvatars } = useAvatarStore();
  const { applications, fetchApplications } = useApplicationStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAvatars: 0,
    pendingReviews: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    fetchAvatars();
    fetchApplications('pending');
  }, [fetchAvatars, fetchApplications]);

  useEffect(() => {
    setStats({
      totalUsers: 0, // 需要从API获取
      totalAvatars: avatars.length,
      pendingReviews: applications.length,
      totalRevenue: 0,
      todayRevenue: 0,
    });
  }, [avatars.length, applications.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name || '管理员'}</span>
            <button
              onClick={() => {
                logout();
                window.location.href = '/admin/login';
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
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
              {stats.pendingReviews > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{stats.pendingReviews}</span>
              )}
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
            </div>
            <div className="stat-card">
              <p className="stat-card-title">AI分身数量</p>
              <p className="stat-card-value">{stats.totalAvatars}</p>
              <p className="stat-card-change">待审核: {stats.pendingReviews}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-title">平台总收入</p>
              <p className="stat-card-value">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 近期活动 - 从申请数据生成 */}
            <div className="card lg:col-span-2">
              <h3 className="font-semibold mb-4">近期活动</h3>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100">
                        📝
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">入驻申请</p>
                        <p className="text-sm text-gray-600">{(app as any).userName || (app as any).name || '用户'} 提交了入驻申请</p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {(app as any).submittedAt || (app as any).createdAt ? new Date((app as any).submittedAt || (app as any).createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暂无近期活动</p>
              )}
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
