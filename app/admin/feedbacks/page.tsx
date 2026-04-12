'use client';

import { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store';
import Link from 'next/link';

// 管理后台留言管理页面
export default function AdminFeedbacksPage() {
  const admin = useAdminAuthStore((s) => s.admin);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取留言列表
  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? '/api/admin/feedbacks' 
        : `/api/admin/feedbacks?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: replyingTo.id,
          reply: replyContent.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReplyingTo(null);
        setReplyContent('');
        fetchFeedbacks();
        alert('回复成功');
      } else {
        alert(data.error || '回复失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条留言？')) return;

    try {
      const res = await fetch(`/api/admin/feedbacks?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: '一般反馈',
      bug: 'Bug反馈',
      feature: '功能建议',
      complaint: '投诉建议',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      pending: { text: '待处理', color: 'bg-yellow-100 text-yellow-700' },
      replied: { text: '已回复', color: 'bg-blue-100 text-blue-700' },
      resolved: { text: '已解决', color: 'bg-green-100 text-green-700' },
      closed: { text: '已关闭', color: 'bg-gray-100 text-gray-700' },
    };
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">留言管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="replied">已回复</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
        </div>

        {/* 留言列表 */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((fb) => {
                const status = getStatusLabel(fb.status);
                return (
                  <div key={fb.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{fb.user_name}</span>
                          <span className="text-sm text-gray-500">{fb.user_email}</span>
                          <span className="text-sm text-gray-400">
                            {new Date(fb.created_at).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                            {getTypeLabel(fb.type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-gray-800 mb-3">{fb.content}</p>
                        
                        {fb.admin_reply && (
                          <div className="bg-blue-50 rounded p-3 mt-2">
                            <p className="text-sm text-blue-800 font-medium mb-1">管理员回复：</p>
                            <p className="text-blue-700">{fb.admin_reply}</p>
                            <p className="text-xs text-blue-500 mt-1">
                              {fb.replied_at && new Date(fb.replied_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {fb.status === 'pending' && (
                          <button
                            onClick={() => setReplyingTo(fb)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            回复
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无留言</p>
          )}
        </div>
      </div>

      {/* 回复弹窗 */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">回复留言</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">用户留言：</p>
              <p className="text-gray-800 bg-gray-50 p-2 rounded">{replyingTo.content}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                回复内容
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="请输入回复内容..."
                rows={4}
                className="input w-full"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? '提交中...' : '发送回复'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
