'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApplicationStore, useAuthStore } from '@/lib/store';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// 审核管理页面内容
function AdminReviewsContent() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { applications, fetchApplications, reviewApplication, isLoading } = useApplicationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredReviews = applications.filter((app: any) =>
    filter === 'all' || app.status === filter
  );

  const handleApprove = async () => {
    if (!selectedReview || !user?.id) return;
    await reviewApplication(selectedReview.id, 'approved', '', user.id);
    setSelectedReview(null);
    fetchApplications();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    if (!selectedReview || !user?.id) return;
    await reviewApplication(selectedReview.id, 'rejected', rejectReason, user.id);
    setSelectedReview(null);
    setRejectReason('');
    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">审核管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 筛选器 */}
        <div className="flex items-center gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? '全部' :
               f === 'pending' ? '待审核' :
               f === 'approved' ? '已通过' : '已拒绝'}
            </button>
          ))}
        </div>

        {/* 审核列表 */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>申请人</th>
                    <th>职业</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>提交日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review: any) => (
                    <tr key={review.id}>
                      <td className="font-medium">{review.userName || review.name || '-'}</td>
                      <td>{review.profession || '-'}</td>
                      <td>入驻申请</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {review.status === 'pending' ? '待审核' :
                           review.status === 'approved' ? '已通过' :
                           review.status === 'reviewing' ? '审核中' : '已拒绝'}
                        </span>
                      </td>
                      <td>{review.submittedAt || review.createdAt ? new Date(review.submittedAt || review.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        {(review.status === 'pending' || review.status === 'reviewing') && (
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            审核
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无审核数据</p>
          )}
        </div>
      </div>

      {/* 审核弹窗 */}
      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">审核入驻申请</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">申请人</p>
                    <p className="font-medium">{selectedReview.userName || selectedReview.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">职业</p>
                    <p className="font-medium">{selectedReview.profession || '-'}</p>
                  </div>
                </div>

                {selectedReview.skills && selectedReview.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">技能标签</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedReview.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReview.bio && (
                  <div>
                    <p className="text-sm text-gray-500">个人简介</p>
                    <p className="text-sm">{selectedReview.bio}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">拒绝原因（如拒绝）</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="请输入拒绝原因..."
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedReview(null)}
                className="btn"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="btn btn-secondary"
              >
                拒绝
              </button>
              <button
                onClick={handleApprove}
                className="btn btn-primary"
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 导出带权限保护的页面
export default function AdminReviewsPage() {
  return (
    <AdminProtectedRoute>
      <AdminReviewsContent />
    </AdminProtectedRoute>
  );
}
