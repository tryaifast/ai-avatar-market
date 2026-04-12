'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useAuthHydrated, authFetch } from '@/lib/store';
import Link from 'next/link';

// 用户消息收件箱页面
export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const { isHydrated, isAuthenticated } = useAuthHydrated();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取消息列表 - 等待hydration完成后再fetch
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      fetchMessages();
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

  const markAsRead = async (messageId: string) => {
    try {
      const res = await authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ messageId }),
      });

      if (res.ok) {
        fetchMessages(); // 刷新列表
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      system: { text: '系统', color: 'bg-gray-100 text-gray-700' },
      admin_broadcast: { text: '公告', color: 'bg-purple-100 text-purple-700' },
      reply: { text: '回复', color: 'bg-blue-100 text-blue-700' },
    };
    return labels[type] || { text: type, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/landing" className="text-gray-500 hover:text-gray-700">
              ← 返回首页
            </Link>
            <h1 className="text-xl font-bold">我的消息</h1>
          </div>
          <Link href="/client/feedback" className="text-blue-600 hover:underline text-sm">
            意见反馈
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">未读消息：</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {unreadCount}
            </span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:underline text-sm"
            >
              全部已读
            </button>
          )}
        </div>

        {/* 消息列表 */}
        <div className="bg-white rounded-lg shadow">
          {!isAuthenticated && isHydrated ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">请先登录查看消息</p>
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                去登录
              </Link>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : messages.length > 0 ? (
            <div className="divide-y">
              {messages.map((msg) => {
                const type = getTypeLabel(msg.type);
                return (
                  <div
                    key={msg.id}
                    className={`p-4 hover:bg-gray-50 ${!msg.is_read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${type.color}`}>
                            {type.text}
                          </span>
                          {!msg.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-medium mb-1">{msg.title || '系统消息'}</h3>
                        <p className="text-gray-700">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!msg.is_read && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                          >
                            标记已读
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-red-600 hover:underline text-sm whitespace-nowrap"
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
            <div className="text-center py-12">
              <p className="text-gray-500">暂无消息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
