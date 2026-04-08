'use client';

import { useState } from 'react';
import Link from 'next/link';

// 用户管理页面
export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'creator' | 'client'>('all');
  
  // Mock 用户数据
  const users = [
    { id: 1, name: '李明', email: 'liming@example.com', type: 'creator', status: 'active', joinDate: '2026-01-15', avatars: 2 },
    { id: 2, name: '王芳', email: 'wangfang@example.com', type: 'creator', status: 'pending', joinDate: '2026-04-08', avatars: 0 },
    { id: 3, name: '张华', email: 'zhanghua@example.com', type: 'client', status: 'active', joinDate: '2026-02-20', orders: 5 },
    { id: 4, name: '刘洋', email: 'liuyang@example.com', type: 'creator', status: 'banned', joinDate: '2026-03-01', avatars: 1 },
    { id: 5, name: '陈静', email: 'chenjing@example.com', type: 'client', status: 'active', joinDate: '2026-03-15', orders: 12 },
  ];
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.includes(search) || u.email.includes(search);
    const matchesFilter = filter === 'all' || u.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">用户管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="input max-w-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部用户</option>
            <option value="creator">创作者</option>
            <option value="client">需求方</option>
          </select>
        </div>

        {/* 用户列表 */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>类型</th>
                  <th>状态</th>
                  <th>加入日期</th>
                  <th>分身/订单</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.type === 'creator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.type === 'creator' ? '创作者' : '需求方'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? '正常' :
                         user.status === 'pending' ? '审核中' : '已封禁'}
                      </span>
                    </td>
                    <td>{user.joinDate}</td>
                    <td>
                      {user.type === 'creator' ? `${user.avatars} 个分身` : `${user.orders} 笔订单`}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:underline text-sm">
                          查看
                        </button>
                        {user.status === 'active' && (
                          <button className="text-red-600 hover:underline text-sm">
                            封禁
                          </button>
                        )}
                        {user.status === 'banned' && (
                          <button className="text-green-600 hover:underline text-sm">
                            解封
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
