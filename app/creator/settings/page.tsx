'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Phone, FileText, Crown, ChevronRight, Check, 
  AlertCircle, Loader2, Shield, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { MEMBERSHIP_LABELS, AVATAR_LIMITS, MEMBERSHIP_PRICES, MEMBERSHIP_FEATURES } from '@/lib/constants';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  
  // 编辑状态
  const [editingField, setEditingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 表单数据
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formBio, setFormBio] = useState(user?.bio || '');
  const [formIdentity, setFormIdentity] = useState<string[]>(user?.identity || []);

  useEffect(() => {
    if (user) {
      setFormName(user.name || '');
      setFormPhone(user.phone || '');
      setFormBio(user.bio || '');
      setFormIdentity(user.identity || []);
    }
  }, [user]);

  const identityOptions = [
    '程序员', '产品经理', '设计师', '运营', '市场',
    '医生', '律师', '教师', '咨询顾问', '作家',
    '翻译', '数据分析师', '财务', 'HR', '其他',
  ];

  const handleSave = async (field: string) => {
    setSaving(true);
    setMessage(null);
    try {
      let updates: any = {};
      switch (field) {
        case 'name':
          if (!formName.trim()) { setMessage({ type: 'error', text: '昵称不能为空' }); setSaving(false); return; }
          updates = { name: formName.trim() };
          break;
        case 'phone':
          updates = { phone: formPhone.trim() };
          break;
        case 'bio':
          updates = { bio: formBio.trim() };
          break;
        case 'identity':
          updates = { identity: formIdentity };
          break;
      }
      const result = await updateProfile(updates);
      if (result.success) {
        setMessage({ type: 'success', text: '保存成功' });
        setEditingField(null);
      } else {
        setMessage({ type: 'error', text: result.error || '保存失败' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleIdentity = (tag: string) => {
    setFormIdentity(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const membershipType = (user as any)?.membershipType || 'free';
  const membershipLabel = MEMBERSHIP_LABELS[membershipType] || '免费用户';
  const avatarLimit = AVATAR_LIMITS[membershipType] || 1;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">设置</h1>

      {/* 提示消息 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* 会员状态卡片 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            {membershipType !== 'free' ? (
              <Crown className="w-8 h-8 text-yellow-300" />
            ) : (
              <Shield className="w-8 h-8 text-blue-200" />
            )}
            <div>
              <h2 className="text-xl font-bold">{membershipLabel}</h2>
              <p className="text-blue-100 text-sm">
                可创建 {avatarLimit} 个AI分身
              </p>
            </div>
          </div>
          {(user as any)?.membershipExpiresAt && (
            <p className="text-blue-100 text-xs mb-3">
              到期时间：{new Date((user as any).membershipExpiresAt).toLocaleDateString('zh-CN')}
            </p>
          )}
          {membershipType === 'free' && (
            <Link
              href="/creator/membership"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              升级会员，解锁10个分身
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 基本信息区块 */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            基本信息
          </h3>
        </div>

        {/* 昵称 */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500 block mb-1">昵称</label>
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="输入昵称"
                    maxLength={20}
                  />
                  <button
                    onClick={() => handleSave('name')}
                    disabled={saving}
                    className="btn-primary btn-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                  </button>
                  <button
                    onClick={() => { setEditingField(null); setFormName(user?.name || ''); }}
                    className="btn-secondary btn-sm"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900">{user?.name || '未设置'}</p>
                  <button
                    onClick={() => setEditingField('name')}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    修改
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 联系电话 */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500 block mb-1">联系电话</label>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    className="input flex-1"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="输入手机号"
                    maxLength={11}
                  />
                  <button
                    onClick={() => handleSave('phone')}
                    disabled={saving}
                    className="btn-primary btn-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                  </button>
                  <button
                    onClick={() => { setEditingField(null); setFormPhone(user?.phone || ''); }}
                    className="btn-secondary btn-sm"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900">{user?.phone || '未设置'}</p>
                  <button
                    onClick={() => setEditingField('phone')}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {user?.phone ? '修改' : '设置'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">个人简介</label>
            {editingField === 'bio' ? (
              <div>
                <textarea
                  className="textarea w-full"
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="介绍你自己..."
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{formBio.length}/300</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave('bio')}
                      disabled={saving}
                      className="btn-primary btn-sm"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                    </button>
                    <button
                      onClick={() => { setEditingField(null); setFormBio(user?.bio || ''); }}
                      className="btn-secondary btn-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="text-gray-900 text-sm flex-1">{user?.bio || '未设置'}</p>
                <button
                  onClick={() => setEditingField('bio')}
                  className="text-blue-600 text-sm hover:underline ml-4 whitespace-nowrap"
                >
                  {user?.bio ? '修改' : '设置'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 身份标签 */}
        <div className="px-6 py-4">
          <label className="text-sm font-medium text-gray-500 block mb-2">身份标签</label>
          {editingField === 'identity' ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {identityOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleIdentity(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formIdentity.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave('identity')}
                  disabled={saving}
                  className="btn-primary btn-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                </button>
                <button
                  onClick={() => { setEditingField(null); setFormIdentity(user?.identity || []); }}
                  className="btn-secondary btn-sm"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap gap-1.5">
                {user?.identity && user.identity.length > 0 ? (
                  user.identity.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">未设置</span>
                )}
              </div>
              <button
                onClick={() => setEditingField('identity')}
                className="text-blue-600 text-sm hover:underline ml-4 whitespace-nowrap"
              >
                修改
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 账户信息（只读） */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            账户信息
          </h3>
        </div>
        <div className="px-6 py-4 border-b border-gray-50">
          <label className="text-sm font-medium text-gray-500 block mb-1">邮箱</label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        <div className="px-6 py-4 border-b border-gray-50">
          <label className="text-sm font-medium text-gray-500 block mb-1">角色</label>
          <p className="text-gray-900">
            {user?.role === 'creator' ? '创作者' : user?.role === 'client' ? '客户' : user?.role === 'both' ? '创作者+客户' : user?.role === 'admin' ? '管理员' : user?.role}
          </p>
        </div>
        <div className="px-6 py-4">
          <label className="text-sm font-medium text-gray-500 block mb-1">注册时间</label>
          <p className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}</p>
        </div>
      </div>

      {/* 会员中心入口 */}
      {membershipType === 'free' && (
        <Link
          href="/creator/membership"
          className="block bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">升级会员</h3>
                <p className="text-sm text-gray-500">解锁10个分身、优先审核、专属标识等权益</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      )}
    </div>
  );
}
