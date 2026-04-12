'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuthStore } from '@/lib/store';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// 用户管理页面内容 - 从API获取真实用户数据
function AdminUsersContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'creator' | 'client' | 'admin'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useAdminAuthStore((s) => s.admin);
  const token = currentUser?.id;
  
  // 修改密码弹窗状态
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'ban' ? 'banned' : 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // 打开修改密码弹窗
  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordModal(true);
  };

  // 关闭修改密码弹窗
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  // 提交修改密码
  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    // 验证密码长度
    if (newPassword.length < 6) {
      setPasswordError('新密码至少6位');
      return;
    }

    // 如果是修改自己的密码，需要当前密码
    if (selectedUser.id === currentUser?.id && !currentPassword) {
      setPasswordError('请输入当前密码');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
          currentPassword: selectedUser.id === currentUser?.id ? currentPassword : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPasswordSuccess('密码修改成功！');
        setTimeout(() => {
          closePasswordModal();
        }, 1500);
      } else {
        setPasswordError(data.error || '修改失败');
      }
    } catch (error) {
      setPasswordError('网络错误，请重试');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name?.includes(search) || u.email?.includes(search);
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">用户管理</h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="input max-w-sm"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部用户</option>
            <option value="creator">创作者</option>
            <option value="client">需求方</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        {/* 用户列表 */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>加入日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user.role === 'creator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' ? '管理员' : 
                           user.role === 'creator' ? '创作者' : 
                           user.role === 'client' ? '需求方' : user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.onboardingStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          user.onboardingStatus === 'pending' || user.onboardingStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.onboardingStatus === 'approved' ? '正常' :
                           user.onboardingStatus === 'pending' || user.onboardingStatus === 'submitted' ? '审核中' :
                           user.onboardingStatus === 'rejected' ? '已拒绝' : user.onboardingStatus || '正常'}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            查看
                          </button>
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="text-orange-600 hover:underline text-sm"
                          >
                            改密码
                          </button>
                          {user.onboardingStatus !== 'banned' && (
                            <button
                              onClick={() => handleBan(user.id, 'ban')}
                              className="text-red-600 hover:underline text-sm"
                            >
                              封禁
                            </button>
                          )}
                          {user.onboardingStatus === 'banned' && (
                            <button
                              onClick={() => handleBan(user.id, 'unban')}
                              className="text-green-600 hover:underline text-sm"
                            >
                              解封
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无用户数据</p>
          )}
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              修改密码 - {selectedUser.name}
            </h2>
            
            {selectedUser.id === currentUser?.id && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="input w-full"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
                className="input w-full"
              />
            </div>

            {passwordError && (
              <p className="text-red-600 text-sm mb-4">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-600 text-sm mb-4">{passwordSuccess}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closePasswordModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={isChangingPassword}
              >
                取消
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isChangingPassword || !newPassword}
              >
                {isChangingPassword ? '修改中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 导出带权限保护的页面
export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <AdminUsersContent />
    </AdminProtectedRoute>
  );
}
