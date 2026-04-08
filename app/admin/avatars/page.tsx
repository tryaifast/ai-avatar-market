'use client';

import { useState } from 'react';
import Link from 'next/link';

// 分身管理页面
export default function AdminAvatarsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  
  // Mock 分身数据
  const avatars = [
    { id: 1, name: '张明 - 产品经理', creator: '张明', category: '产品', status: 'active', createdAt: '2026-01-20', hired: 45, rating: 4.9 },
    { id: 2, name: '王芳 - UI设计师', creator: '王芳', category: '设计', status: 'pending', createdAt: '2026-04-08', hired: 0, rating: 0 },
    { id: 3, name: '李明 - 前端开发', creator: '李明', category: '开发', status: 'active', createdAt: '2026-02-15', hired: 28, rating: 4.7 },
    { id: 4, name: '刘洋 - 数据分析师', creator: '刘洋', category: '数据', status: 'suspended', createdAt: '2026-03-01', hired: 12, rating: 4.5 },
  ];
  
  const filteredAvatars = avatars.filter(a => {
    const matchesSearch = a.name.includes(search) || a.creator.includes(search);
    const matchesFilter = filter === 'all' || a.status === filter;
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
            <h1 className="text-xl font-bold">分身管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 统计 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <p className="stat-card-title">总分身数</p>
            <p className="stat-card-value">356</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">已上线</p>
            <p className="stat-card-value">298</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">待审核</p>
            <p className="stat-card-value">12</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">已下架</p>
            <p className="stat-card-value">46</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索分身或创作者..."
            className="input max-w-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            <option value="active">已上线</option>
            <option value="pending">待审核</option>
            <option value="suspended">已下架</option>
          </select>
        </div>

        {/* 分身列表 */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>分身名称</th>
                  <th>创作者</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>被雇佣</th>
                  <th>评分</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAvatars.map((avatar) => (
                  <tr key={avatar.id}>
                    <td className="font-medium">{avatar.name}</td>
                    <td>{avatar.creator}</td>
                    <td>{avatar.category}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        avatar.status === 'active' ? 'bg-green-100 text-green-700' :
                        avatar.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {avatar.status === 'active' ? '已上线' :
                         avatar.status === 'pending' ? '待审核' : '已下架'}
                      </span>
                    </td>
                    <td>{avatar.hired} 次</td>
                    <td>{avatar.rating > 0 ? `${avatar.rating} ★` : '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:underline text-sm">
                          查看
                        </button>
                        {avatar.status === 'active' && (
                          <button className="text-orange-600 hover:underline text-sm">
                            下架
                          </button>
                        )}
                        {avatar.status === 'suspended' && (
                          <button className="text-green-600 hover:underline text-sm">
                            上架
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
