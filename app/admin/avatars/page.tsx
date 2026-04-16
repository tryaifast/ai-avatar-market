'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/store';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// 分身管理页面内容
function AdminAvatarsContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'reviewing' | 'paused' | 'rejected' | 'banned' | 'draft'>('all');
  const [avatars, setAvatars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 操作反馈
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 详情弹窗
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAvatar, setDetailAvatar] = useState<any>(null);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/avatars');
      const data = await res.json();
      if (data.success) {
        setAvatars(data.avatars || []);
      }
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showActionMsg = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const statusLabel: Record<string, string> = {
      active: '上架', paused: '下架', banned: '封禁', unbanned: '解封',
    };
    const confirmed = window.confirm(`确定要${statusLabel[newStatus] || '修改状态为' + newStatus}该分身吗？`);
    if (!confirmed) return;

    try {
      const res = await adminFetch(`/api/admin/avatars/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showActionMsg('success', `${statusLabel[newStatus] || '状态修改'}成功！`);
        fetchAvatars();
        if (showDetailModal && detailAvatar?.id === id) {
          setDetailAvatar(data.avatar);
        }
      } else {
        showActionMsg('error', data.error || '操作失败');
      }
    } catch (error) {
      showActionMsg('error', '操作网络错误');
    }
  };

  const openDetail = (avatar: any) => {
    setDetailAvatar(avatar);
    setShowDetailModal(true);
  };

  const filteredAvatars = avatars.filter((a: any) => {
    const matchesSearch = a.name?.includes(search) || (a as any).creatorName?.includes(search);
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    total: avatars.length,
    active: avatars.filter((a: any) => a.status === 'active').length,
    reviewing: avatars.filter((a: any) => a.status === 'reviewing').length,
    paused: avatars.filter((a: any) => a.status === 'paused').length,
    other: avatars.filter((a: any) => !['active', 'reviewing', 'paused'].includes(a.status)).length,
  };

  const statusLabels: Record<string, string> = {
    active: '已上线',
    reviewing: '待审核',
    paused: '已暂停',
    rejected: '未通过',
    banned: '已封禁',
    draft: '草稿',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    reviewing: 'bg-yellow-100 text-yellow-700',
    paused: 'bg-orange-100 text-orange-700',
    rejected: 'bg-red-100 text-red-700',
    banned: 'bg-red-200 text-red-800',
    draft: 'bg-gray-100 text-gray-600',
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
        {/* 操作反馈 */}
        {actionMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* 统计 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
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
            <p className="stat-card-title">已暂停</p>
            <p className="stat-card-value">{statusCounts.paused}</p>
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
            <option value="draft">草稿</option>
            <option value="paused">已暂停</option>
            <option value="rejected">未通过</option>
            <option value="banned">已封禁</option>
          </select>
          <span className="text-sm text-gray-500">共 {filteredAvatars.length} 个分身</span>
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
                    <th>描述</th>
                    <th>状态</th>
                    <th>被雇佣</th>
                    <th>评分</th>
                    <th>创建日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvatars.map((avatar: any) => (
                    <tr key={avatar.id}>
                      <td className="font-medium">{avatar.name}</td>
                      <td className="max-w-xs truncate">{avatar.description || '-'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[avatar.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[avatar.status] || avatar.status}
                        </span>
                      </td>
                      <td>{avatar.stats?.hiredCount || 0} 次</td>
                      <td>{(avatar.stats?.rating || 0) > 0 ? `${avatar.stats.rating} ★` : '-'}</td>
                      <td>{avatar.createdAt ? new Date(avatar.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(avatar)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            详情
                          </button>
                          {avatar.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'paused')}
                              className="text-orange-600 hover:underline text-sm"
                            >
                              下架
                            </button>
                          )}
                          {avatar.status === 'paused' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'active')}
                              className="text-green-600 hover:underline text-sm"
                            >
                              恢复上架
                            </button>
                          )}
                          {avatar.status === 'banned' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'active')}
                              className="text-green-600 hover:underline text-sm"
                            >
                              解封
                            </button>
                          )}
                          {avatar.status === 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'active')}
                              className="text-green-600 hover:underline text-sm"
                            >
                              上架
                            </button>
                          )}
                          {avatar.status !== 'banned' && avatar.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(avatar.id, 'banned')}
                              className="text-red-600 hover:underline text-sm"
                            >
                              封禁
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

      {/* 分身详情弹窗 */}
      {showDetailModal && detailAvatar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">分身详情</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div><span className="text-gray-500">名称：</span><span className="font-medium">{detailAvatar.name || '-'}</span></div>
              <div><span className="text-gray-500">状态：</span>
                <span className={`px-2 py-0.5 rounded text-xs ${statusColors[detailAvatar.status] || 'bg-gray-100 text-gray-700'}`}>
                  {statusLabels[detailAvatar.status] || detailAvatar.status}
                </span>
              </div>
              <div><span className="text-gray-500">创建者ID：</span><span className="font-medium text-xs">{detailAvatar.creatorId || detailAvatar.creator_id || '-'}</span></div>
              <div><span className="text-gray-500">创建时间：</span><span className="font-medium">{detailAvatar.createdAt || detailAvatar.created_at ? new Date(detailAvatar.createdAt || detailAvatar.created_at).toLocaleString() : '-'}</span></div>
              <div><span className="text-gray-500">雇佣次数：</span><span className="font-medium">{detailAvatar.stats?.hiredCount || 0}</span></div>
              <div><span className="text-gray-500">评分：</span><span className="font-medium">{(detailAvatar.stats?.rating || 0) > 0 ? detailAvatar.stats.rating : '-'}</span></div>
            </div>

            <div className="mb-4">
              <span className="text-gray-500 text-sm">描述：</span>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{detailAvatar.description || '无描述'}</p>
            </div>

            {detailAvatar.personality && (
              <div className="mb-4">
                <span className="text-gray-500 text-sm">人格配置：</span>
                <div className="mt-1 bg-gray-50 p-3 rounded text-sm space-y-1">
                  {detailAvatar.personality.mbti && <p>MBTI: {detailAvatar.personality.mbti}</p>}
                  {detailAvatar.personality.communicationStyle && <p>沟通风格: {detailAvatar.personality.communicationStyle}</p>}
                  {detailAvatar.personality.expertise?.length > 0 && <p>专长: {detailAvatar.personality.expertise.join(', ')}</p>}
                </div>
              </div>
            )}

            {detailAvatar.pricing && (
              <div className="mb-4">
                <span className="text-gray-500 text-sm">定价：</span>
                <div className="mt-1 bg-gray-50 p-3 rounded text-sm">
                  <p>类型: {detailAvatar.pricing.type === 'per_task' ? '按次计费' : '订阅制'}</p>
                  {detailAvatar.pricing.perTask && (
                    <p>价格范围: ¥{detailAvatar.pricing.perTask.min || 0} - ¥{detailAvatar.pricing.perTask.max || 0}</p>
                  )}
                </div>
              </div>
            )}

            {detailAvatar.scope && (
              <div className="mb-4">
                <span className="text-gray-500 text-sm">工作范围：</span>
                <div className="mt-1 bg-gray-50 p-3 rounded text-sm space-y-1">
                  {detailAvatar.scope.canDo?.length > 0 && <p>✅ 能做: {detailAvatar.scope.canDo.join(', ')}</p>}
                  {detailAvatar.scope.cannotDo?.length > 0 && <p>❌ 不做: {detailAvatar.scope.cannotDo.join(', ')}</p>}
                  {detailAvatar.scope.responseTime && <p>⏱ 响应: {detailAvatar.scope.responseTime}</p>}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {detailAvatar.status === 'active' && (
                <button
                  onClick={() => { handleStatusChange(detailAvatar.id, 'paused'); setShowDetailModal(false); }}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                >
                  下架
                </button>
              )}
              {detailAvatar.status === 'paused' && (
                <button
                  onClick={() => { handleStatusChange(detailAvatar.id, 'active'); setShowDetailModal(false); }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  恢复上架
                </button>
              )}
              {detailAvatar.status === 'banned' && (
                <button
                  onClick={() => { handleStatusChange(detailAvatar.id, 'active'); setShowDetailModal(false); }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  解封
                </button>
              )}
              {detailAvatar.status === 'rejected' && (
                <button
                  onClick={() => { handleStatusChange(detailAvatar.id, 'active'); setShowDetailModal(false); }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  上架
                </button>
              )}
              {detailAvatar.status !== 'banned' && detailAvatar.status !== 'rejected' && (
                <button
                  onClick={() => { handleStatusChange(detailAvatar.id, 'banned'); setShowDetailModal(false); }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  封禁
                </button>
              )}
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAvatarsPage() {
  return (
    <AdminProtectedRoute>
      <AdminAvatarsContent />
    </AdminProtectedRoute>
  );
}
