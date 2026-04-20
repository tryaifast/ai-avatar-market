'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, MessageSquare, CheckCircle, Clock, ChevronRight,
  User, Bot, ArrowRight
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';

interface Message {
  id: string;
  type: 'system' | 'creator';
  title?: string;
  content: string;
  senderType?: 'client' | 'creator';
  isRead: boolean;
  createdAt: string;
  data?: any;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'system' | 'creator'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await authFetch(`/api/client-center/messages?type=${filter}`);
      const result = await res.json();
      if (result.success) {
        setMessages(result.messages);
        setUnreadCount(result.messages.filter((m: Message) => !m.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(messageId: string) {
    try {
      // 这里应该调用 API 标记已读，现在先前端处理
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-500 mt-1">
            系统通知和创作者消息
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unreadCount} 未读
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
        {(['all', 'system', 'creator'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              filter === f
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'all' && <Bell className="w-4 h-4" />}
            {f === 'system' && <CheckCircle className="w-4 h-4" />}
            {f === 'creator' && <MessageSquare className="w-4 h-4" />}
            {f === 'all' && '全部'}
            {f === 'system' && '系统通知'}
            {f === 'creator' && '创作者消息'}
          </button>
        ))}
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              onRead={() => markAsRead(message.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无消息</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? '有新消息时会在这里显示' 
              : filter === 'system' 
                ? '暂无系统通知' 
                : '暂无创作者消息'}
          </p>
        </div>
      )}
    </div>
  );
}

function MessageItem({ message, onRead }: { message: Message; onRead: () => void }) {
  if (message.type === 'system') {
    return (
      <div 
        onClick={onRead}
        className={`bg-white rounded-xl p-4 border hover:shadow-sm transition-shadow cursor-pointer ${
          !message.isRead ? 'border-blue-200 bg-blue-50/30' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{message.title}</h3>
              {!message.isRead && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{message.content}</p>
            <p className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Creator message
  const isFromCreator = message.senderType === 'creator';
  
  return (
    <Link 
      href={message.creator ? `/client/hire/creator/${message.creator.id}/contact` : '#'}
      onClick={onRead}
      className={`block bg-white rounded-xl p-4 border hover:shadow-sm transition-shadow ${
        !message.isRead ? 'border-green-200 bg-green-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isFromCreator ? 'bg-purple-100' : 'bg-gray-100'
        }`}>
          {isFromCreator ? (
            <User className="w-5 h-5 text-purple-600" />
          ) : (
            <Bot className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {isFromCreator ? message.creator?.name : '我'}
            </span>
            <span className="text-xs text-gray-500">
              {isFromCreator ? '回复了你的咨询' : '发送给创作者'}
            </span>
            {!message.isRead && isFromCreator && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleString('zh-CN')}
            </p>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}
