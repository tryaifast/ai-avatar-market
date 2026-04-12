'use client';

import { useState, useEffect } from 'react';
import { useAdminAuthStore, adminFetch } from '@/lib/store';
import Link from 'next/link';

// 管理后台消息推送页面
export default function AdminMessagesPage() {
  const admin = useAdminAuthStore((s) => s.admin);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoadingBroadcasts, setIsLoadingBroadcasts] = useState(true);

  // 获取用户列表和历史推送
  useEffect(() => {
    fetchUsers();
    fetchBroadcasts();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminFetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await adminFetch('/api/admin/messages');
      const data = await res.json();
      if (data.success) {
        setBroadcasts(data.broadcasts || []);
      }
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setIsLoadingBroadcasts(false);
    }
  };

  const handleSend = async () => {
    setSendError('');
    setSendSuccess(false);

    if (!title.trim() || !content.trim()) {
      setSendError('请填写标题和内容');
      return;
    }

    if (targetType === 'specific_users' && selectedUsers.length === 0) {
      setSendError('请选择至少一个用户');
      return;
    }

    setIsSending(true);

    try {
      const res = await adminFetch('/api/admin/messages', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          targetType,
          targetUsers: targetType === 'specific_users' ? selectedUsers : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSendSuccess(true);
        setTitle('');
        setContent('');
        setSelectedUsers([]);
        fetchBroadcasts(); // 刷新历史
      } else {
        setSendError(data.error || '发送失败');
      }
    } catch (error) {
      setSendError('网络错误，请重试');
    } finally {
      setIsSending(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">消息推送</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 发送消息表单 */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">发送消息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入消息标题"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入消息内容"
                rows={4}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                发送目标
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="all"
                    checked={targetType === 'all'}
                    onChange={(e) => setTargetType(e.target.value)}
                  />
                  <span>全部用户</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="specific_users"
                    checked={targetType === 'specific_users'}
                    onChange={(e) => setTargetType(e.target.value)}
                  />
                  <span>指定用户</span>
                </label>
              </div>
            </div>

            {targetType === 'specific_users' && (
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-2">
                  已选择 {selectedUsers.length} 人
                </p>
                <div className="space-y-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <span>{user.name}</span>
                      <span className="text-sm text-gray-500">({user.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {sendError && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 bg-green-50 text-green-600 rounded text-sm">
                消息发送成功！
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={isSending}
              className="btn btn-primary w-full"
            >
              {isSending ? '发送中...' : '发送消息'}
            </button>
          </div>
        </div>

        {/* 发送历史 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">发送历史</h2>

          {isLoadingBroadcasts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : broadcasts.length > 0 ? (
            <div className="space-y-4">
              {broadcasts.map((bc) => (
                <div key={bc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{bc.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(bc.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{bc.content}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        bc.target_type === 'all'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {bc.target_type === 'all' ? '全部用户' : `指定用户 (${bc.target_users?.length || 0}人)`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无发送记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
