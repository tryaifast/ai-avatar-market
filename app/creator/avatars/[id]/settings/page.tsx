'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bot, AlertCircle, CheckCircle } from 'lucide-react';
import { useAvatarStore, useAuthStore, authFetch } from '@/lib/store';

export default function AvatarSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentAvatar, fetchAvatarById, updateAvatar } = useAvatarStore();
  const user = useAuthStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    pricingPerTaskMin: '',
    pricingPerTaskMax: '',
    pricingEstimate: '',
    responseTime: '',
  });

  useEffect(() => {
    const loadAvatar = async () => {
      setIsLoading(true);
      await fetchAvatarById(params.id);
      setIsLoading(false);
    };
    loadAvatar();
  }, [params.id, fetchAvatarById]);

  useEffect(() => {
    if (currentAvatar) {
      setFormData({
        name: currentAvatar.name || '',
        description: currentAvatar.description || '',
        status: currentAvatar.status || 'draft',
        pricingPerTaskMin: currentAvatar.pricing?.perTask?.min?.toString() || '',
        pricingPerTaskMax: currentAvatar.pricing?.perTask?.max?.toString() || '',
        pricingEstimate: currentAvatar.pricing?.perTask?.estimate || '',
        responseTime: currentAvatar.scope?.responseTime || '',
      });
    }
  }, [currentAvatar]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!currentAvatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">未找到该分身信息</p>
          <Link href="/creator/avatars" className="text-blue-600 hover:underline mt-2 inline-block">
            返回我的分身
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        personality: currentAvatar.personality, // 保留原有
        pricing: {
          type: 'per_task',
          perTask: {
            min: formData.pricingPerTaskMin ? Number(formData.pricingPerTaskMin) : undefined,
            max: formData.pricingPerTaskMax ? Number(formData.pricingPerTaskMax) : undefined,
            estimate: formData.pricingEstimate || undefined,
          },
        },
        scope: {
          ...currentAvatar.scope,
          responseTime: formData.responseTime || undefined,
        },
      };

      const result = await updateAvatar(params.id, updateData);
      if (result.success) {
        setMessage({ type: 'success', text: '保存成功' });
      } else {
        setMessage({ type: 'error', text: result.error || '保存失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const result = await updateAvatar(params.id, { status: newStatus });
      if (result.success) {
        setFormData(prev => ({ ...prev, status: newStatus }));
        setMessage({ type: 'success', text: '状态已更新' });
      } else {
        setMessage({ type: 'error', text: result.error || '状态更新失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '状态更新失败' });
    }
  };

  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'reviewing', label: '提交审核' },
    { value: 'paused', label: '暂停接单' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator/avatars" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">分身设置</h1>
          <p className="text-gray-600 mt-1">修改 {currentAvatar.name} 的配置</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* 基本信息 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
          
          <div className="form-group">
            <label className="form-label">分身名称</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="分身名称"
            />
          </div>

          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              className="textarea"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述你的分身能力..."
            />
          </div>
        </div>

        {/* 定价设置 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">定价设置</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">最低价格（分）</label>
              <input
                type="number"
                className="input"
                value={formData.pricingPerTaskMin}
                onChange={(e) => setFormData(prev => ({ ...prev, pricingPerTaskMin: e.target.value }))}
                placeholder="如 5000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">最高价格（分）</label>
              <input
                type="number"
                className="input"
                value={formData.pricingPerTaskMax}
                onChange={(e) => setFormData(prev => ({ ...prev, pricingPerTaskMax: e.target.value }))}
                placeholder="如 50000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">价格说明</label>
            <input
              type="text"
              className="input"
              value={formData.pricingEstimate}
              onChange={(e) => setFormData(prev => ({ ...prev, pricingEstimate: e.target.value }))}
              placeholder="如：根据任务复杂度评估"
            />
          </div>
        </div>

        {/* 响应时间 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">工作设置</h3>
          
          <div className="form-group">
            <label className="form-label">响应时间</label>
            <input
              type="text"
              className="input"
              value={formData.responseTime}
              onChange={(e) => setFormData(prev => ({ ...prev, responseTime: e.target.value }))}
              placeholder="如：通常在30分钟内响应"
            />
          </div>
        </div>

        {/* 状态管理 */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">状态管理</h3>
          <p className="text-sm text-gray-500 mb-4">当前状态：{
            currentAvatar.status === 'active' ? '已上架' :
            currentAvatar.status === 'reviewing' ? '审核中' :
            currentAvatar.status === 'draft' ? '草稿' :
            currentAvatar.status === 'paused' ? '已暂停' :
            currentAvatar.status === 'rejected' ? '未通过' :
            currentAvatar.status === 'banned' ? '已封禁' :
            currentAvatar.status
          }</p>
          
          <div className="flex gap-3">
            {currentAvatar.status === 'draft' && (
              <button
                onClick={() => handleStatusChange('reviewing')}
                className="btn-primary"
              >
                提交审核
              </button>
            )}
            {currentAvatar.status === 'active' && (
              <button
                onClick={() => handleStatusChange('paused')}
                className="btn-secondary text-orange-600"
              >
                暂停接单
              </button>
            )}
            {currentAvatar.status === 'paused' && (
              <button
                onClick={() => handleStatusChange('reviewing')}
                className="btn-primary"
              >
                重新上架
              </button>
            )}
            {currentAvatar.status === 'rejected' && (
              <button
                onClick={() => handleStatusChange('reviewing')}
                className="btn-primary"
              >
                重新提交审核
              </button>
            )}
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/creator/avatars" className="btn-secondary">
            取消
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name}
            className="btn-primary"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                保存中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存修改
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
