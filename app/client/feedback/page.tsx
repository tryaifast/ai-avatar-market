'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useAuthHydrated, authFetch } from '@/lib/store';
import Link from 'next/link';

// 用户留言反馈页面
export default function FeedbackPage() {
  const user = useAuthStore((s) => s.user);
  const { isHydrated, isAuthenticated } = useAuthHydrated();
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取历史留言 - 等待hydration完成后再fetch
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchFeedbacks();
    } else if (isHydrated && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isHydrated, isAuthenticated]);

  const fetchFeedbacks = async () => {
    try {
      const res = await authFetch('/api/feedbacks');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!content.trim() || content.trim().length < 5) {
      setSubmitError('留言内容至少5个字');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authFetch('/api/feedbacks', {
        method: 'POST',
        body: JSON.stringify({ type, content: content.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        setContent('');
        setType('general');
        fetchFeedbacks(); // 刷新列表
      } else {
        setSubmitError(data.error || '提交失败');
      }
    } catch (error) {
      setSubmitError('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">意见反馈</h1>
        <Link href="/client/messages" className="text-blue-600 hover:underline text-sm">
          我的消息
        </Link>
      </div>
        {!isAuthenticated && isHydrated ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">请先登录后再提交反馈</p>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              去登录
            </Link>
          </div>
        ) : (
        <>
        {/* 留言表单 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">提交反馈</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                反馈类型
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input w-full"
              >
                <option value="general">一般反馈</option>
                <option value="bug">Bug反馈</option>
                <option value="feature">功能建议</option>
                <option value="complaint">投诉建议</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                反馈内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请详细描述您的问题或建议..."
                rows={5}
                className="input w-full"
                required
              />
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-green-50 text-green-600 rounded text-sm">
                提交成功！我们会尽快处理您的反馈。
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? '提交中...' : '提交反馈'}
            </button>
          </form>
        </div>

        {/* 历史留言 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">我的反馈记录</h2>

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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(fb.created_at).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                          {getTypeLabel(fb.type)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
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
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无反馈记录</p>
          )}
        </div>
        </>
        )}
    </div>
  );
}
