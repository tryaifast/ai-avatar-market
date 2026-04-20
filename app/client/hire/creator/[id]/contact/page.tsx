'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Send, User, Bot, Clock, Paperclip,
  ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';

interface Message {
  id: string;
  content: string;
  senderType: 'client' | 'creator';
  isRead: boolean;
  createdAt: string;
  relatedAvatarId?: string;
  relatedTaskId?: string;
}

interface Creator {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  company?: string;
}

export default function CreatorContactPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const creatorId = params.id;

  useEffect(() => {
    fetchMessages();
  }, [creatorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await authFetch(`/api/client-center/creators/${creatorId}/messages`);
      const result = await res.json();
      if (result.success) {
        setMessages(result.messages);
        setCreator(result.creator);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await authFetch(`/api/client-center/creators/${creatorId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: input.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, result.message]);
        setInput('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // 按日期分组消息
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/client/hire/messages"
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          返回消息列表
        </Link>
      </div>

      {/* Creator Info Card */}
      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            {creator?.avatar ? (
              <span className="text-2xl">{creator.avatar}</span>
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{creator?.name || '创作者'}</h1>
            <p className="text-sm text-gray-500">
              {creator?.profession && (
                <span>{creator.profession}</span>
              )}
              {creator?.profession && creator?.company && (
                <span className="mx-1">·</span>
              )}
              {creator?.company && (
                <span>{creator.company}</span>
              )}
              {!creator?.profession && !creator?.company && 'AI分身创作者'}
            </p>
          </div>
          <Link
            href={`/client/creator/${creatorId}`}
            className="btn-secondary btn-sm"
          >
            查看主页
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-white rounded-xl border shadow-sm flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
              <h3 className="text-gray-900 font-medium mb-1">开始对话</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                向{creator?.name || '创作者'}发送消息，咨询关于分身服务的问题
              </p>
              <div className="mt-4 space-y-2">
                <QuickReply 
                  text="你好，我想了解一下你的服务内容"
                  onClick={() => setInput('你好，我想了解一下你的服务内容')}
                />
                <QuickReply 
                  text="请问这个价格可以调整吗？"
                  onClick={() => setInput('请问这个价格可以调整吗？')}
                />
                <QuickReply 
                  text="我的任务有什么需要注意的地方吗？"
                  onClick={() => setInput('我的任务有什么需要注意的地方吗？')}
                />
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Divider */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                    {formatDate(date)}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {dateMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === 'client' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex items-start gap-2 max-w-[80%] ${
                        msg.senderType === 'client' ? 'flex-row-reverse' : ''
                      }`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.senderType === 'client' 
                            ? 'bg-blue-500' 
                            : 'bg-purple-100'
                        }`}>
                          {msg.senderType === 'client' ? (
                            <span className="text-white text-xs font-medium">我</span>
                          ) : (
                            <User className="w-4 h-4 text-purple-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          msg.senderType === 'client'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            msg.senderType === 'client' ? 'justify-end' : ''
                          }`}>
                            <span className={`text-xs ${
                              msg.senderType === 'client' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {msg.senderType === 'client' && msg.isRead && (
                              <CheckCircle className="w-3 h-3 text-blue-100" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                rows={1}
                className="w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="btn-primary px-4 py-3 disabled:opacity-50"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            消息会直接发送给创作者本人，不是AI分身
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickReply({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
    >
      {text}
    </button>
  );
}

function MessageSquare(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
