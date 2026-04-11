'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 用户管理页面 - 从API获取真实用户数据
export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'creator' | 'client'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'ban' ? 'banned' : 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name?.includes(search) || u.email?.includes(search);
    const matchesFilter = filter === 'all' || u.role === filter;
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
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>加入日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'creator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'creator' ? '创作者' : user.role === 'client' ? '需求方' : user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.onboardingStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          user.onboardingStatus === 'pending' || user.onboardingStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.onboardingStatus === 'approved' ? '正常' :
                           user.onboardingStatus === 'pending' || user.onboardingStatus === 'submitted' ? '审核中' :
                           user.onboardingStatus === 'rejected' ? '已拒绝' : user.onboardingStatus || '正常'}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            查看
                          </button>
                          {user.onboardingStatus !== 'banned' && (
                            <button
                              onClick={() => handleBan(user.id, 'ban')}
                              className="text-red-600 hover:underline text-sm"
                            >
                              封禁
                            </button>
                          )}
                          {user.onboardingStatus === 'banned' && (
                            <button
                              onClick={() => handleBan(user.id, 'unban')}
                              className="text-green-600 hover:underline text-sm"
                            >
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
          ) : (
            <p className="text-gray-500 text-center py-8">暂无用户数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
