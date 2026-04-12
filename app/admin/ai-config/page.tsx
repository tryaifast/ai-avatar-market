'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuthStore, adminFetch } from '@/lib/store';
import { Plus, Trash2, Edit2, Check, X, Key, Server } from 'lucide-react';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

// AI配置管理页面
function AIConfigContent() {
  const admin = useAdminAuthStore((s) => s.admin);
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    provider: 'kimi',
    apiKey: '',
    apiUrl: '',
    model: 'kimi-latest',
    maxTokens: 2048,
    temperature: 0.7,
    isActive: true,
    usageLimit: 1000000,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/ai-config');
      const data = await res.json();
      if (data.success) {
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await adminFetch('/api/admin/ai-config', {
        method: 'POST',
        body: JSON.stringify({
          id: editingConfig?.id,
          provider: formData.provider,
          apiKey: formData.apiKey,
          apiUrl: formData.apiUrl,
          model: formData.model,
          maxTokens: formData.maxTokens,
          temperature: formData.temperature,
          isActive: formData.isActive,
          usageLimit: formData.usageLimit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingConfig(null);
        resetForm();
        fetchConfigs();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return;
    
    try {
      const res = await adminFetch(`/api/admin/ai-config?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        fetchConfigs();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    }
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      provider: config.provider,
      apiKey: '', // 不显示完整密钥，需要重新输入
      apiUrl: config.api_url || '',
      model: config.model,
      maxTokens: config.max_tokens,
      temperature: config.temperature,
      isActive: config.is_active,
      usageLimit: config.usage_limit,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      provider: 'kimi',
      apiKey: '',
      apiUrl: '',
      model: 'kimi-latest',
      maxTokens: 2048,
      temperature: 0.7,
      isActive: true,
      usageLimit: 1000000,
    });
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    resetForm();
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">AI配置管理</h1>
          </div>
          <button
            onClick={handleAddNew}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加配置
          </button>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            {/* 配置列表 */}
            <div className="grid gap-4">
              {configs.length > 0 ? (
                configs.map((config) => (
                  <div key={config.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Server className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold capitalize">{config.provider}</h3>
                          {config.is_active ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              启用中
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              已停用
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                          <div>
                            <span className="text-gray-400">模型:</span> {config.model}
                          </div>
                          <div>
                            <span className="text-gray-400">Max Tokens:</span> {config.max_tokens}
                          </div>
                          <div>
                            <span className="text-gray-400">Temperature:</span> {config.temperature}
                          </div>
                          <div>
                            <span className="text-gray-400">月度限额:</span> {config.usage_limit?.toLocaleString()} tokens
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">API密钥:</span> 
                            <span className="font-mono ml-2">{config.api_key}</span>
                          </div>
                          {config.api_url && (
                            <div className="col-span-2">
                              <span className="text-gray-400">API地址:</span> {config.api_url}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">还没有配置AI API</p>
                  <button onClick={handleAddNew} className="btn btn-primary">
                    添加第一个配置
                  </button>
                </div>
              )}
            </div>

            {/* 添加/编辑表单弹窗 */}
            {showForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg font-bold mb-4">
                    {editingConfig ? '编辑配置' : '添加AI配置'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        提供商 *
                      </label>
                      <select
                        value={formData.provider}
                        onChange={(e) => setFormData({...formData, provider: e.target.value})}
                        className="input w-full"
                        required
                      >
                        <option value="kimi">Kimi (阿里云百炼)</option>
                        <option value="openai">OpenAI</option>
                        <option value="azure">Azure OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="other">其他</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API密钥 *
                      </label>
                      <input
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                        placeholder={editingConfig ? '留空表示不修改' : '请输入API密钥'}
                        className="input w-full"
                        required={!editingConfig}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API地址（可选）
                      </label>
                      <input
                        type="text"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                        placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        模型
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        placeholder="kimi-latest"
                        className="input w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={formData.maxTokens}
                          onChange={(e) => setFormData({...formData, maxTokens: parseInt(e.target.value)})}
                          className="input w-full"
                          min="1"
                          max="8192"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={formData.temperature}
                          onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                          className="input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        月度使用限额 (tokens)
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                        className="input w-full"
                        min="1000"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        启用此配置
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingConfig(null);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {editingConfig ? '保存修改' : '创建配置'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 导出带权限保护的页面
export default function AIConfigPage() {
  return (
    <AdminProtectedRoute>
      <AIConfigContent />
    </AdminProtectedRoute>
  );
}
