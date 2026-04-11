'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTaskStore, useAuthStore } from '@/lib/store';

// 订单管理页面
export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // 获取所有任务（管理视角）
    if (user?.id) {
      fetchTasks(user.id, 'creator');
    }
  }, [user?.id, fetchTasks]);

  const filteredOrders = tasks.filter((t: any) => {
    const matchesSearch = t.id?.includes(search) || t.title?.includes(search);
    const matchesFilter = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      ai_working: 'bg-purple-100 text-purple-700',
      ai_completed: 'bg-indigo-100 text-indigo-700',
      human_reviewing: 'bg-blue-100 text-blue-700',
      delivered: 'bg-teal-100 text-teal-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: '待处理',
      ai_working: 'AI工作中',
      ai_completed: 'AI完成',
      human_reviewing: '真人审核中',
      delivered: '已交付',
      completed: '已完成',
      cancelled: '已取消',
    };
    return { style: styles[status] || 'bg-gray-100 text-gray-700', label: labels[status] || status };
  };

  const statusCounts = {
    total: tasks.length,
    pending: tasks.filter((t: any) => t.status === 'pending').length,
    inProgress: tasks.filter((t: any) => ['ai_working', 'ai_completed', 'human_reviewing'].includes(t.status)).length,
    totalAmount: tasks.reduce((sum: number, t: any) => sum + (t.price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">订单管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">总订单数</p>
            <p className="text-2xl font-bold">{statusCounts.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">进行中</p>
            <p className="text-2xl font-bold text-purple-600">{statusCounts.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">待处理</p>
            <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">订单总额</p>
            <p className="text-2xl font-bold text-green-600">¥{(statusCounts.totalAmount / 100).toLocaleString()}</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索订单号或任务名..."
            className="input max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="ai_working">AI工作中</option>
            <option value="delivered">已交付</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        {/* 订单列表 */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>订单号</th>
                    <th>任务名</th>
                    <th>类型</th>
                    <th>金额</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => {
                    const status = getStatusBadge(order.status);
                    return (
                      <tr key={order.id}>
                        <td className="font-mono text-sm">{order.id?.substring(0, 12)}...</td>
                        <td>{order.title || '-'}</td>
                        <td>{order.type || '-'}</td>
                        <td className="font-medium">¥{(order.price || 0) / 100}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${status.style}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {order.timeline?.createdAt ? new Date(order.timeline.createdAt).toLocaleString() : '-'}
                        </td>
                        <td>
                          <button className="text-blue-600 hover:underline text-sm">
                            详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无订单数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
