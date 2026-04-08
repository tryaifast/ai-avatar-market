'use client';

import { useState } from 'react';
import Link from 'next/link';

// 审核管理页面
export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Mock 审核数据
  const reviews = [
    { 
      id: 1, 
      applicant: '王芳', 
      title: '资深UI设计师',
      type: '入驻申请',
      status: 'pending',
      submitDate: '2026-04-08',
      documents: ['简历.pdf', '作品集.zip'],
    },
    { 
      id: 2, 
      applicant: '李明', 
      title: '前端开发工程师',
      type: '入驻申请',
      status: 'approved',
      submitDate: '2026-04-07',
      documents: ['简历.pdf'],
    },
    { 
      id: 3, 
      applicant: '张伟', 
      title: '产品经理',
      type: '分身审核',
      status: 'rejected',
      submitDate: '2026-04-06',
      rejectReason: '资料不完整，缺少工作经历证明',
    },
    { 
      id: 4, 
      applicant: '刘洋', 
      title: '数据分析师',
      type: '入驻申请',
      status: 'pending',
      submitDate: '2026-04-08',
      documents: ['简历.pdf', '证书.jpg'],
    },
  ];
  
  const filteredReviews = reviews.filter(r => 
    filter === 'all' || r.status === filter
  );
  
  const handleApprove = () => {
    alert('已通过审核！');
    setSelectedReview(null);
  };
  
  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    alert('已拒绝申请');
    setSelectedReview(null);
    setRejectReason('');
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
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="font-medium">{review.applicant}</td>
                    <td>{review.title}</td>
                    <td>{review.type}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.status === 'pending' ? '待审核' :
                         review.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </td>
                    <td>{review.submitDate}</td>
                    <td>
                      {review.status === 'pending' && (
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
                    <p className="font-medium">{selectedReview.applicant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">职业</p>
                    <p className="font-medium">{selectedReview.title}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">申请材料</p>
                  <div className="flex gap-2">
                    {selectedReview.documents?.map((doc: string, idx: number) => (
                      <button
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                      >
                        📄 {doc}
                      </button>
                    ))}
                  </div>
                </div>
                
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
