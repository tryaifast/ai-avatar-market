'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useAuthHydrated, authFetch } from '@/lib/store';
import Link from 'next/link';

// 创作者中心消息页面 - 显示管理员广播和系统通知
export default function CreatorMessagesPage() {
  const user = useAuthStore((s) => s.user);
  const { isHydrated, isAuthenticated } = useAuthHydrated();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // 获取消息列表
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchMessages();
      fetchFeedbacks();
    } else if (isHydrated && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isHydrated, isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const res = await authFetch('/api/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await authFetch('/api/feedbacks');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const res = await authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('确定删除这条消息？')) return;
    try {
      const res = await authFetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!feedbackContent.trim() || feedbackContent.trim().length < 5) {
      setSubmitError('反馈内容至少5个字');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/feedbacks', {
        method: 'POST',
        body: JSON.stringify({ type: feedbackType, content: feedbackContent.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFeedbackContent('');
        setFeedbackType('general');
        fetchFeedbacks();
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
    const labels: Record<string, { text: string; color: string }> = {
      system: { text: '系统', color: 'bg-gray-100 text-gray-700' },
      admin_broadcast: { text: '公告', color: 'bg-purple-100 text-purple-700' },
      reply: { text: '回复', color: 'bg-blue-100 text-blue-700' },
    };
    return labels[type] || { text: type, color: 'bg-gray-100 text-gray-700' };
  };

  const getFeedbackTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: '一般反馈',
      bug: 'Bug反馈',
      feature: '功能建议',
      complaint: '投诉建议',
    };
    return labels[type] || type;
  };

  const getFeedbackStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      pending: { text: '待处理', color: 'bg-yellow-100 text-yellow-700' },
      replied: { text: '已回复', color: 'bg-blue-100 text-blue-700' },
      resolved: { text: '已解决', color: 'bg-green-100 text-green-700' },
      closed: { text: '已关闭', color: 'bg-gray-100 text-gray-700' },
    };
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">消息与反馈</h1>

      {/* 消息区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">我的消息</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">未读：{unreadCount}</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-blue-600 hover:underline text-sm">
                全部已读
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="bg-white rounded-lg shadow divide-y">
            {messages.map((msg) => {
              const type = getTypeLabel(msg.type);
              return (
                <div key={msg.id} className={`p-4 hover:bg-gray-50 ${!msg.is_read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${type.color}`}>{type.text}</span>
                        {!msg.is_read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                        <span className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <h3 className="font-medium mb-1">{msg.title || '系统消息'}</h3>
                      <p className="text-gray-700 text-sm">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!msg.is_read && (
                        <button onClick={() => markAsRead(msg.id)} className="text-blue-600 hover:underline text-sm whitespace-nowrap">
                          标记已读
                        </button>
                      )}
                      <button onClick={() => deleteMessage(msg.id)} className="text-red-600 hover:underline text-sm whitespace-nowrap">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">暂无消息</p>
        )}
      </div>

      {/* 意见反馈区域 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">意见反馈</h2>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">反馈类型</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">一般反馈</option>
                <option value="bug">Bug反馈</option>
                <option value="feature">功能建议</option>
                <option value="complaint">投诉建议</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">反馈内容</label>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="请详细描述您的问题或建议..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {submitError && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{submitError}</div>}
            {submitSuccess && <div className="p-3 bg-green-50 text-green-600 rounded text-sm">提交成功！我们会尽快处理。</div>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交反馈'}
            </button>
          </form>
        </div>

        {/* 历史反馈 */}
        {feedbacks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">我的反馈记录</h3>
            <div className="space-y-4">
              {feedbacks.map((fb) => {
                const status = getFeedbackStatusLabel(fb.status);
                return (
                  <div key={fb.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{new Date(fb.created_at).toLocaleString()}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{getFeedbackTypeLabel(fb.type)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>{status.text}</span>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-3">{fb.content}</p>
                    {fb.admin_reply && (
                      <div className="bg-blue-50 rounded p-3 mt-2">
                        <p className="text-sm text-blue-800 font-medium mb-1">管理员回复：</p>
                        <p className="text-blue-700">{fb.admin_reply}</p>
                        <p className="text-xs text-blue-500 mt-1">{fb.replied_at && new Date(fb.replied_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
