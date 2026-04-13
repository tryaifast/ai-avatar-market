'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuthStore, adminFetch } from '@/lib/store';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const MEMBERSHIP_LABELS: Record<string, string> = {
  free: '免费用户',
  yearly: '年费会员',
  lifetime: '终身会员',
};

const MEMBERSHIP_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  yearly: 'bg-blue-100 text-blue-700',
  lifetime: 'bg-purple-100 text-purple-700',
};

// 用户管理页面内容
function AdminUsersContent() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'creator' | 'client' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'free' | 'yearly' | 'lifetime'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useAdminAuthStore((s) => s.admin);

  // 修改密码弹窗
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // 用户详情弹窗
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 会员操作弹窗
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipTarget, setMembershipTarget] = useState<any>(null);
  const [selectedMembership, setSelectedMembership] = useState<string>('yearly');
  const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);

  // 封禁/解封操作反馈
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/users');
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

  const showActionMsg = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleBan = async (userId: string, action: 'ban' | 'unban') => {
    const actionText = action === 'ban' ? '封禁' : '解封';
    const confirmed = window.confirm(`确定要${actionText}该用户吗？${action === 'ban' ? '封禁后该用户所有分身将自动下架。' : '解封后该用户之前被下架的分身将恢复为暂停状态。'}`);
    if (!confirmed) return;

    try {
      const res = await adminFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action === 'ban' ? 'banned' : 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        showActionMsg('success', `${actionText}成功！`);
        fetchUsers();
        if (showDetailModal && detailUser?.user?.id === userId) {
          fetchUserDetail(userId);
        }
      } else {
        showActionMsg('error', data.error || `${actionText}失败`);
      }
    } catch (error) {
      showActionMsg('error', `${actionText}操作网络错误`);
    }
  };

  const handleMembershipAction = async () => {
    if (!membershipTarget || !selectedMembership) return;

    setIsUpdatingMembership(true);
    try {
      const res = await adminFetch(`/api/admin/users/${membershipTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          action: 'grantMembership',
          membershipType: selectedMembership,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const actionText = selectedMembership === 'free' ? '取消会员' : '授予会员';
        showActionMsg('success', `${actionText}成功！`);
        setShowMembershipModal(false);
        setMembershipTarget(null);
        fetchUsers();
        if (showDetailModal && detailUser?.user?.id === membershipTarget.id) {
          fetchUserDetail(membershipTarget.id);
        }
      } else {
        showActionMsg('error', data.error || '操作失败');
      }
    } catch (error) {
      showActionMsg('error', '操作网络错误');
    } finally {
      setIsUpdatingMembership(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await adminFetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setDetailUser(data);
      } else {
        showActionMsg('error', data.error || '获取用户详情失败');
      }
    } catch (error) {
      showActionMsg('error', '获取用户详情网络错误');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const openDetailModal = (userId: string) => {
    fetchUserDetail(userId);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailUser(null);
  };

  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const openMembershipModal = (user: any) => {
    setMembershipTarget(user);
    setSelectedMembership((user.membershipType || 'free') === 'free' ? 'yearly' : 'free');
    setShowMembershipModal(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 6) {
      setPasswordError('新密码至少6位');
      return;
    }
    if (selectedUser.id === currentUser?.id && !currentPassword) {
      setPasswordError('请输入当前密码');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await adminFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
          currentPassword: selectedUser.id === currentUser?.id ? currentPassword : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('密码修改成功！');
        setTimeout(() => closePasswordModal(), 1500);
      } else {
        setPasswordError(data.error || '修改失败');
      }
    } catch (error) {
      setPasswordError('网络错误，请重试');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 判断用户是否被封禁
  const isBanned = (user: any) => user.onboardingStatus === 'banned';

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name?.includes(search) || u.email?.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isBanned(u)) ||
      (statusFilter === 'banned' && isBanned(u));
    const matchesMembership =
      membershipFilter === 'all' || (u.membershipType || 'free') === membershipFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesMembership;
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
        {/* 操作反馈 */}
        {actionMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="input max-w-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部角色</option>
            <option value="creator">创作者</option>
            <option value="client">需求方</option>
            <option value="admin">管理员</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="banned">已封禁</option>
          </select>
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value as any)}
            className="input w-auto"
          >
            <option value="all">全部会员</option>
            <option value="free">免费用户</option>
            <option value="yearly">年费会员</option>
            <option value="lifetime">终身会员</option>
          </select>
          <span className="text-sm text-gray-500">共 {filteredUsers.length} 个用户</span>
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
                    <th>会员</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs ${MEMBERSHIP_COLORS[user.membershipType || 'free']}`}>
                          {MEMBERSHIP_LABELS[user.membershipType || 'free']}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          isBanned(user) ? 'bg-red-100 text-red-700' :
                          user.onboardingStatus === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {isBanned(user) ? '已封禁' :
                           user.onboardingStatus === 'submitted' ? '审核中' :
                           user.onboardingStatus === 'rejected' ? '已拒绝' : '正常'}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailModal(user.id)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            查看
                          </button>
                          <button
                            onClick={() => openMembershipModal(user)}
                            className="text-purple-600 hover:underline text-sm"
                          >
                            会员
                          </button>
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="text-orange-600 hover:underline text-sm"
                          >
                            改密码
                          </button>
                          {user.id !== currentUser?.id && !isBanned(user) && (
                            <button
                              onClick={() => handleBan(user.id, 'ban')}
                              className="text-red-600 hover:underline text-sm"
                            >
                              封禁
                            </button>
                          )}
                          {isBanned(user) && (
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

      {/* 用户详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeDetailModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {isLoadingDetail ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : detailUser ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">用户详情</h2>
                  <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                {/* 基本信息 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">昵称：</span><span className="font-medium">{detailUser.user?.name || '-'}</span></div>
                    <div><span className="text-gray-500">邮箱：</span><span className="font-medium">{detailUser.user?.email || '-'}</span></div>
                    <div><span className="text-gray-500">角色：</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        detailUser.user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                        detailUser.user?.role === 'creator' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {detailUser.user?.role === 'admin' ? '管理员' :
                         detailUser.user?.role === 'creator' ? '创作者' : '需求方'}
                      </span>
                    </div>
                    <div><span className="text-gray-500">状态：</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        isBanned(detailUser.user) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isBanned(detailUser.user) ? '已封禁' : '正常'}
                      </span>
                    </div>
                    <div><span className="text-gray-500">入驻状态：</span><span className="font-medium">{detailUser.user?.onboardingStatus || '未申请'}</span></div>
                    <div><span className="text-gray-500">信用分：</span><span className="font-medium">{detailUser.user?.creditScore || 80}</span></div>
                    <div><span className="text-gray-500">余额：</span><span className="font-medium">¥{Number(detailUser.user?.walletBalance || 0).toFixed(2)}</span></div>
                    <div><span className="text-gray-500">注册时间：</span><span className="font-medium">{detailUser.user?.createdAt ? new Date(detailUser.user.createdAt).toLocaleString() : '-'}</span></div>
                  </div>
                  {detailUser.user?.bio && (
                    <div className="mt-3"><span className="text-gray-500 text-sm">简介：</span><span className="text-sm">{detailUser.user.bio}</span></div>
                  )}
                  {detailUser.user?.identity?.length > 0 && (
                    <div className="mt-2"><span className="text-gray-500 text-sm">身份标签：</span>
                      {detailUser.user.identity.map((tag: string) => (
                        <span key={tag} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded mr-1">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 会员信息 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">会员信息</h3>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">当前会员：</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${MEMBERSHIP_COLORS[detailUser.user?.membershipType || 'free']}`}>
                        {MEMBERSHIP_LABELS[detailUser.user?.membershipType || 'free']}
                      </span>
                    </div>
                    {detailUser.user?.membershipExpiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">到期时间：</span>
                        <span className="text-sm font-medium">{new Date(detailUser.user.membershipExpiresAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {/* 会员订单记录 */}
                  {detailUser.membershipOrders?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500 block mb-2">支付记录：</span>
                      <div className="space-y-2">
                        {detailUser.membershipOrders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">{order.type === 'yearly' ? '年费' : '终身'}</span>
                              <span className="text-gray-500">¥{(order.amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {order.status === 'paid' ? '已支付' : order.status === 'pending' ? '待支付' : order.status}
                              </span>
                              <span className="text-gray-400 text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 分身列表 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">分身（{detailUser.avatars?.length || 0}个）</h3>
                  {detailUser.avatars?.length > 0 ? (
                    <div className="space-y-2">
                      {detailUser.avatars.map((avatar: any) => (
                        <div key={avatar.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{avatar.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            avatar.status === 'active' ? 'bg-green-100 text-green-700' :
                            avatar.status === 'banned' ? 'bg-red-100 text-red-700' :
                            avatar.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {avatar.status === 'active' ? '已上线' :
                             avatar.status === 'banned' ? '已封禁' :
                             avatar.status === 'paused' ? '已暂停' :
                             avatar.status === 'reviewing' ? '审核中' : avatar.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">暂无分身</p>
                  )}
                </div>

                {/* 任务统计 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">任务统计</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-500">作为客户发布</p>
                      <p className="text-lg font-semibold">{detailUser.taskStats?.asClient || 0} 个</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-gray-500">已完成</p>
                      <p className="text-lg font-semibold">{detailUser.taskStats?.completed || 0} 个</p>
                    </div>
                  </div>
                </div>

                {/* 入驻申请 */}
                {detailUser.applications?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">入驻申请</h3>
                    <div className="space-y-2">
                      {detailUser.applications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{app.profession || '-'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            app.status === 'approved' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status === 'approved' ? '已通过' :
                             app.status === 'rejected' ? '已拒绝' : '审核中'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => { openMembershipModal(detailUser.user); closeDetailModal(); }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    会员管理
                  </button>
                  {detailUser.user?.id !== currentUser?.id && !isBanned(detailUser.user) && (
                    <button
                      onClick={() => { handleBan(detailUser.user.id, 'ban'); closeDetailModal(); }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      封禁用户
                    </button>
                  )}
                  {isBanned(detailUser.user) && (
                    <button
                      onClick={() => { handleBan(detailUser.user.id, 'unban'); closeDetailModal(); }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      解封用户
                    </button>
                  )}
                  <button onClick={closeDetailModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">
                    关闭
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">无法加载用户详情</p>
            )}
          </div>
        </div>
      )}

      {/* 会员管理弹窗 */}
      {showMembershipModal && membershipTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowMembershipModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">会员管理 - {membershipTarget.name}</h3>
              <button onClick={() => setShowMembershipModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded mb-4">
                <span className="text-sm text-gray-500">当前会员：</span>
                <span className={`px-2 py-0.5 rounded text-xs ${MEMBERSHIP_COLORS[membershipTarget.membershipType || 'free']}`}>
                  {MEMBERSHIP_LABELS[membershipTarget.membershipType || 'free']}
                </span>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">选择操作</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMembership === 'yearly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="membership"
                    value="yearly"
                    checked={selectedMembership === 'yearly'}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-sm">授予年费会员</span>
                    <p className="text-xs text-gray-500">9.9元/年，10个分身，有效期1年</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMembership === 'lifetime' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="membership"
                    value="lifetime"
                    checked={selectedMembership === 'lifetime'}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="font-medium text-sm">授予终身会员</span>
                    <p className="text-xs text-gray-500">99元/永久，10个分身，永不过期</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMembership === 'free' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="membership"
                    value="free"
                    checked={selectedMembership === 'free'}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="text-red-600"
                  />
                  <div>
                    <span className="font-medium text-sm text-red-600">取消会员</span>
                    <p className="text-xs text-gray-500">降级为免费用户，1个分身</p>
                  </div>
                </label>
              </div>
            </div>

            {selectedMembership === 'free' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">⚠️ 取消会员后，用户将降级为免费用户，超过1个的分身不会被删除但无法创建新分身。此操作不可自动撤销。</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMembershipModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={isUpdatingMembership}
              >
                取消
              </button>
              <button
                onClick={handleMembershipAction}
                disabled={isUpdatingMembership}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                  selectedMembership === 'free' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isUpdatingMembership ? '处理中...' : selectedMembership === 'free' ? '确认取消会员' : '确认授予'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              修改密码 - {selectedUser.name}
            </h2>

            {selectedUser.id === currentUser?.id && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
                className="input w-full"
              />
            </div>

            {passwordError && <p className="text-red-600 text-sm mb-4">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm mb-4">{passwordSuccess}</p>}

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

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <AdminUsersContent />
    </AdminProtectedRoute>
  );
}
