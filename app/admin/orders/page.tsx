// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';

// 订单管理页面
export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'inProgress' | 'completed' | 'cancelled'>('all');
  
  // Mock 订单数据
  const orders = [
    { 
      id: 'ORD-20250408001', 
      avatarName: '产品经理·Lisa', 
      clientName: '张华',
      creatorName: '李莎',
      type: 'per_task',
      amount: 5000, 
      status: 'completed',
      createdAt: '2026-04-08 10:30',
      paidAt: '2026-04-08 10:35'
    },
    { 
      id: 'ORD-20250408002', 
      avatarName: '代码审查助手·小明', 
      clientName: '王强',
      creatorName: '张明',
      type: 'hourly',
      amount: 2400, 
      status: 'inProgress',
      createdAt: '2026-04-08 14:20',
      paidAt: '2026-04-08 14:25'
    },
    { 
      id: 'ORD-20250408003', 
      avatarName: '法律顾问·正义', 
      clientName: '刘总',
      creatorName: '刘正',
      type: 'per_task',
      amount: 8000, 
      status: 'pending',
      createdAt: '2026-04-08 16:45',
    },
    { 
      id: 'ORD-20250407001', 
      avatarName: 'UI设计·Pixel', 
      clientName: '陈经理',
      creatorName: '赵艺',
      type: 'per_task',
      amount: 6000, 
      status: 'completed',
      createdAt: '2026-04-07 09:15',
      paidAt: '2026-04-07 09:20'
    },
    { 
      id: 'ORD-20250407002', 
      avatarName: '文案策划·阿文', 
      clientName: '李总',
      creatorName: '王文',
      type: 'subscription',
      amount: 29900, 
      status: 'cancelled',
      createdAt: '2026-04-07 11:00',
      paidAt: '2026-04-07 11:05'
    },
  ];
  
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.includes(search) || o.avatarName.includes(search) || o.clientName.includes(search);
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      inProgress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: '待支付',
      paid: '已支付',
      inProgress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return { style: styles[status], label: labels[status] };
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
            <p className="text-2xl font-bold">1,248</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">今日订单</p>
            <p className="text-2xl font-bold">23</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">待处理</p>
            <p className="text-2xl font-bold text-orange-600">8</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">订单总额</p>
            <p className="text-2xl font-bold text-green-600">¥158,600</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索订单号、分身或用户..."
            className="input max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="inProgress">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        {/* 订单列表 */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>AI分身</th>
                  <th>需求方</th>
                  <th>创作者</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = getStatusBadge(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-sm">{order.id}</td>
                      <td>{order.avatarName}</td>
                      <td>{order.clientName}</td>
                      <td>{order.creatorName}</td>
                      <td className="font-medium">¥{order.amount.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">{order.createdAt}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            详情
                          </button>
                          {order.status === 'pending' && (
                            <button className="text-red-600 hover:underline text-sm">
                              取消
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
