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
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-700',
};

function AdminReviewsContent() {
  const [activeTab, setActiveTab] = useState<'avatars' | 'applications'>('avatars');
  const [avatars, setAvatars] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

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
        setSelectedItem(null);
        setRejectReason('');
        fetchData();
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
        setSelectedItem(null);
        setRejectReason('');
        fetchData();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Failed to update application:', error);
    }
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
                          {(avatar.status === 'pending' || avatar.status === 'reviewing') && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAvatarAction(avatar.id, 'approved')}
                                className="text-green-600 hover:underline text-sm"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => setSelectedItem(avatar)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                拒绝
                              </button>
                            </div>
                          )}
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
                        <td className="font-medium">{app.userName || app.name || '-'}</td>
                        <td>{app.profession || '-'}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[app.status] || app.status}
                          </span>
                        </td>
                        <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          {(app.status === 'pending' || app.status === 'reviewing') && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApplicationAction(app.id, 'approved')}
                                className="text-green-600 hover:underline text-sm"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => setSelectedItem(app)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                拒绝
                              </button>
                            </div>
                          )}
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

      {/* 拒绝弹窗 */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => { setSelectedItem(null); setRejectReason(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">
                拒绝{activeTab === 'avatars' ? '分身' : '入驻申请'}
              </h3>
              <button onClick={() => { setSelectedItem(null); setRejectReason(''); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="modal-body">
              <p className="mb-2 font-medium">{selectedItem.name}</p>
              <p className="text-sm text-gray-500 mb-4">{selectedItem.description || selectedItem.profession}</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">拒绝原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg p-3 min-h-[100px]"
                placeholder="请填写拒绝原因..."
              />
            </div>
            <div className="modal-footer">
              <button
                onClick={() => { setSelectedItem(null); setRejectReason(''); }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    alert('请填写拒绝原因');
                    return;
                  }
                  if (activeTab === 'avatars') {
                    handleAvatarAction(selectedItem.id, 'rejected', rejectReason);
                  } else {
                    handleApplicationAction(selectedItem.id, 'rejected', rejectReason);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
