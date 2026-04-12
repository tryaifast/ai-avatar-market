'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/store';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const statusLabels: Record<string, string> = {
  pending: '待审核',
  reviewing: '审核中',
  approved: '已通过',
  active: '已上架',
  rejected: '已拒绝',
  inactive: '已下架',
  paused: '已暂停',
  banned: '已封禁',
  draft: '草稿',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-700',
  paused: 'bg-orange-100 text-orange-700',
  banned: 'bg-red-200 text-red-800',
  draft: 'bg-gray-100 text-gray-600',
};

function AdminReviewsContent() {
  const [activeTab, setActiveTab] = useState<'avatars' | 'applications'>('applications');
  const [avatars, setAvatars] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 详情弹窗
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailType, setDetailType] = useState<'avatar' | 'application'>('application');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'avatars') {
        const res = await adminFetch('/api/admin/avatars');
        const data = await res.json();
        if (data.success) {
          setAvatars(data.avatars || []);
        }
      } else {
        const res = await adminFetch('/api/admin/applications');
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingAvatars = avatars.filter(a => a.status === 'pending' || a.status === 'reviewing');
  const otherAvatars = avatars.filter(a => a.status !== 'pending' && a.status !== 'reviewing');
  const displayAvatars = [...pendingAvatars, ...otherAvatars];

  const pendingApplications = applications.filter(a => a.status === 'pending' || a.status === 'reviewing');
  const otherApplications = applications.filter(a => a.status !== 'pending' && a.status !== 'reviewing');
  const displayApplications = [...pendingApplications, ...otherApplications];

  const handleAvatarAction = async (avatarId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      const res = await adminFetch(`/api/admin/avatars/${avatarId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action, rejectReason: reason || '' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setSelectedItem(null);
        setRejectReason('');
        fetchData();
        if (showDetailModal) setShowDetailModal(false);
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const handleApplicationAction = async (appId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      const res = await adminFetch(`/api/admin/applications/${appId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action, reviewNotes: reason || '' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setSelectedItem(null);
        setRejectReason('');
        fetchData();
        if (showDetailModal) setShowDetailModal(false);
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update application:', error);
    }
  };

  const openDetail = (item: any, type: 'avatar' | 'application') => {
    setDetailItem(item);
    setDetailType(type);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">← 返回</Link>
            <h1 className="text-xl font-bold">审核管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Tab 切换 */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'avatars'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            分身审核 {pendingAvatars.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingAvatars.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-4 font-medium ${
              activeTab === 'applications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            入驻申请 {pendingApplications.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingApplications.length}</span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : activeTab === 'avatars' ? (
          /* 分身审核列表 */
          <div className="card">
            {displayAvatars.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>分身名称</th>
                      <th>描述</th>
                      <th>状态</th>
                      <th>创建日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAvatars.map((avatar) => (
                      <tr key={avatar.id}>
                        <td className="font-medium">{avatar.name || '-'}</td>
                        <td className="max-w-xs truncate">{avatar.description || '-'}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[avatar.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[avatar.status] || avatar.status}
                          </span>
                        </td>
                        <td>{avatar.createdAt ? new Date(avatar.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(avatar, 'avatar')}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              详情
                            </button>
                            {(avatar.status === 'pending' || avatar.status === 'reviewing') && (
                              <>
                                <button
                                  onClick={() => handleAvatarAction(avatar.id, 'approved')}
                                  className="text-green-600 hover:underline text-sm"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItem(avatar);
                                    setShowRejectModal(true);
                                  }}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无分身审核数据</p>
            )}
          </div>
        ) : (
          /* 入驻申请列表 */
          <div className="card">
            {displayApplications.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>申请人</th>
                      <th>职业</th>
                      <th>状态</th>
                      <th>提交日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="font-medium">{app.real_name || app.userName || app.name || '-'}</td>
                        <td>{app.profession || '-'}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[app.status] || app.status}
                          </span>
                        </td>
                        <td>{app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(app, 'application')}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              详情
                            </button>
                            {(app.status === 'pending' || app.status === 'reviewing') && (
                              <>
                                <button
                                  onClick={() => handleApplicationAction(app.id, 'approved')}
                                  className="text-green-600 hover:underline text-sm"
                                >
                                  通过
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedItem(app);
                                    setShowRejectModal(true);
                                  }}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  拒绝
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无入驻申请数据</p>
            )}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {detailType === 'avatar' ? '分身详情' : '入驻申请详情'}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {detailType === 'avatar' ? (
              /* 分身详情 */
              <div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                  <div><span className="text-gray-500">名称：</span><span className="font-medium">{detailItem.name || '-'}</span></div>
                  <div><span className="text-gray-500">状态：</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[detailItem.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[detailItem.status] || detailItem.status}
                    </span>
                  </div>
                  <div><span className="text-gray-500">创建者ID：</span><span className="font-medium text-xs">{detailItem.creatorId || detailItem.creator_id || '-'}</span></div>
                  <div><span className="text-gray-500">创建时间：</span><span className="font-medium">{detailItem.createdAt || detailItem.created_at ? new Date(detailItem.createdAt || detailItem.created_at).toLocaleString() : '-'}</span></div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-500 text-sm">描述：</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{detailItem.description || '无描述'}</p>
                </div>

                {detailItem.personality && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">人格配置：</span>
                    <div className="mt-1 bg-gray-50 p-3 rounded text-sm space-y-1">
                      {detailItem.personality.mbti && <p>MBTI: {detailItem.personality.mbti}</p>}
                      {detailItem.personality.communicationStyle && <p>沟通风格: {detailItem.personality.communicationStyle}</p>}
                      {detailItem.personality.expertise?.length > 0 && <p>专长: {detailItem.personality.expertise.join(', ')}</p>}
                    </div>
                  </div>
                )}

                {detailItem.pricing && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">定价：</span>
                    <div className="mt-1 bg-gray-50 p-3 rounded text-sm">
                      <p>类型: {detailItem.pricing.type === 'per_task' ? '按次计费' : '订阅制'}</p>
                      {detailItem.pricing.perTask && (
                        <p>价格范围: ¥{detailItem.pricing.perTask.min} - ¥{detailItem.pricing.perTask.max}</p>
                      )}
                    </div>
                  </div>
                )}

                {detailItem.scope && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">工作范围：</span>
                    <div className="mt-1 bg-gray-50 p-3 rounded text-sm space-y-1">
                      {detailItem.scope.canDo?.length > 0 && <p>✅ 能做: {detailItem.scope.canDo.join(', ')}</p>}
                      {detailItem.scope.cannotDo?.length > 0 && <p>❌ 不做: {detailItem.scope.cannotDo.join(', ')}</p>}
                      {detailItem.scope.responseTime && <p>⏱ 响应: {detailItem.scope.responseTime}</p>}
                    </div>
                  </div>
                )}

                {(detailItem.status === 'pending' || detailItem.status === 'reviewing') && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleAvatarAction(detailItem.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      审核通过
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(detailItem);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      审核拒绝
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 入驻申请详情 */
              <div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                  <div><span className="text-gray-500">真实姓名：</span><span className="font-medium">{detailItem.real_name || '-'}</span></div>
                  <div><span className="text-gray-500">职业：</span><span className="font-medium">{detailItem.profession || '-'}</span></div>
                  <div><span className="text-gray-500">邮箱：</span><span className="font-medium">{detailItem.email || '-'}</span></div>
                  <div><span className="text-gray-500">电话：</span><span className="font-medium">{detailItem.phone || '-'}</span></div>
                  <div><span className="text-gray-500">从业年限：</span><span className="font-medium">{detailItem.experience_years || '-'}年</span></div>
                  <div><span className="text-gray-500">状态：</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[detailItem.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[detailItem.status] || detailItem.status}
                    </span>
                  </div>
                  <div><span className="text-gray-500">提交时间：</span><span className="font-medium">{detailItem.created_at ? new Date(detailItem.created_at).toLocaleString() : '-'}</span></div>
                  {detailItem.reviewed_at && (
                    <div><span className="text-gray-500">审核时间：</span><span className="font-medium">{new Date(detailItem.reviewed_at).toLocaleString()}</span></div>
                  )}
                </div>

                {detailItem.bio && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">个人简介：</span>
                    <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{detailItem.bio}</p>
                  </div>
                )}

                {detailItem.skills?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">技能：</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {detailItem.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {detailItem.portfolio_urls?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">作品集链接：</span>
                    <div className="mt-1 space-y-1">
                      {detailItem.portfolio_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 text-sm hover:underline truncate">{url}</a>
                      ))}
                    </div>
                  </div>
                )}

                {detailItem.review_notes && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">审核备注：</span>
                    <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{detailItem.review_notes}</p>
                  </div>
                )}

                {(detailItem.status === 'pending' || detailItem.status === 'reviewing') && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleApplicationAction(detailItem.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      审核通过
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(detailItem);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      审核拒绝
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 拒绝弹窗 */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                拒绝{detailType === 'avatar' || activeTab === 'avatars' ? '分身' : '入驻申请'}
              </h3>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="mb-4">
              <p className="mb-2 font-medium">{selectedItem.name || selectedItem.real_name}</p>
              <p className="text-sm text-gray-500 mb-4">{selectedItem.description || selectedItem.profession}</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">拒绝原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg p-3 min-h-[100px]"
                placeholder="请填写拒绝原因..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    alert('请填写拒绝原因');
                    return;
                  }
                  if (detailType === 'avatar' || activeTab === 'avatars') {
                    handleAvatarAction(selectedItem.id, 'rejected', rejectReason);
                  } else {
                    handleApplicationAction(selectedItem.id, 'rejected', rejectReason);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <AdminProtectedRoute>
      <AdminReviewsContent />
    </AdminProtectedRoute>
  );
}
