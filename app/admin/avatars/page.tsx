'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAvatarStore } from '@/lib/store';

// 分身管理页面
export default function AdminAvatarsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'reviewing' | 'paused' | 'banned'>('all');
  const { avatars, fetchAvatars, isLoading } = useAvatarStore();

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const filteredAvatars = avatars.filter((a: any) => {
    const matchesSearch = a.name?.includes(search) || (a as any).creatorName?.includes(search);
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    total: avatars.length,
    active: avatars.filter((a: any) => a.status === 'active').length,
    reviewing: avatars.filter((a: any) => a.status === 'reviewing').length,
    other: avatars.filter((a: any) => !['active', 'reviewing'].includes(a.status)).length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { updateAvatar } = useAvatarStore.getState();
    await updateAvatar(id, { status: newStatus });
    fetchAvatars();
  };

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
            <p className="stat-card-value">{statusCounts.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">已上线</p>
            <p className="stat-card-value">{statusCounts.active}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">待审核</p>
            <p className="stat-card-value">{statusCounts.reviewing}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-title">其他</p>
            <p className="stat-card-value">{statusCounts.other}</p>
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
            <option value="reviewing">待审核</option>
            <option value="paused">已暂停</option>
            <option value="banned">已封禁</option>
          </select>
        </div>

        {/* 分身列表 */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredAvatars.length > 0 ? (
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
                  {filteredAvatars.map((avatar: any) => (
                    <tr key={avatar.id}>
                      <td className="font-medium">{avatar.name}</td>
                      <td>{avatar.creatorName || '-'}</td>
                      <td>{(avatar as any).category || avatar.personality?.expertise?.[0] || '-'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          avatar.status === 'active' ? 'bg-green-100 text-green-700' :
                          avatar.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                          avatar.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {avatar.status === 'active' ? '已上线' :
                           avatar.status === 'reviewing' ? '待审核' :
                           avatar.status === 'paused' ? '已暂停' :
                           avatar.status === 'banned' ? '已封禁' :
                           avatar.status === 'draft' ? '草稿' : avatar.status}
                        </span>
                      </td>
                      <td>{avatar.stats?.hiredCount || (avatar as any).hireCount || 0} 次</td>
                      <td>{(avatar.stats?.rating || (avatar as any).rating || 0) > 0 ? `${avatar.stats?.rating || (avatar as any).rating} ★` : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            查看
                          </button>
                          {avatar.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'paused')}
                              className="text-orange-600 hover:underline text-sm"
                            >
                              下架
                            </button>
                          )}
                          {(avatar.status === 'paused' || avatar.status === 'banned') && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'active')}
                              className="text-green-600 hover:underline text-sm"
                            >
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
          ) : (
            <p className="text-gray-500 text-center py-8">暂无分身数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
