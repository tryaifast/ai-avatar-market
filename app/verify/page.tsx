'use client';

import { useState } from 'react';
import Link from 'next/link';

// 认证服务页面
export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<'identity' | 'ip'>('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">申请已提交！</h1>
          <p className="text-gray-600 mb-6">
            我们会在 1-3 个工作日内完成审核，请留意邮件通知
          </p>
          <Link href="/creator/dashboard">
            <button className="btn btn-primary w-full">
              返回个人中心
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/creator/dashboard" className="text-gray-500 hover:text-gray-700">
              ← 返回
            </Link>
            <h1 className="text-lg font-semibold">平台认证服务</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 服务介绍 */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">认证服务价值</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">✓</div>
              <h3 className="font-medium mb-1">身份认证</h3>
              <p className="text-sm text-gray-600">工牌/名片验证，建立真实可信身份</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-medium mb-1">产权保护</h3>
              <p className="text-sm text-gray-600">AI分身知识产权法律认证</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-medium mb-1">优先展示</h3>
              <p className="text-sm text-gray-600">认证用户获得更多曝光机会</p>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="tabs mb-6">
          <button
            onClick={() => setActiveTab('identity')}
            className={`tab ${activeTab === 'identity' ? 'tab-active' : ''}`}
          >
            身份认证
          </button>
          <button
            onClick={() => setActiveTab('ip')}
            className={`tab ${activeTab === 'ip' ? 'tab-active' : ''}`}
          >
            知识产权认证
          </button>
        </div>

        {/* 身份认证表单 */}
        {activeTab === 'identity' && (
          <form onSubmit={handleSubmit} className="card">
            <h3 className="font-semibold mb-4">身份认证申请</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">真实姓名</label>
                <input type="text" className="input" placeholder="请输入真实姓名" required />
              </div>
              <div>
                <label className="form-label">身份证号</label>
                <input type="text" className="input" placeholder="请输入身份证号" required />
              </div>
              <div>
                <label className="form-label">当前公司</label>
                <input type="text" className="input" placeholder="请输入当前就职公司" />
              </div>
              <div>
                <label className="form-label">职位</label>
                <input type="text" className="input" placeholder="请输入职位" />
              </div>
              <div>
                <label className="form-label">工牌/名片照片</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-gray-600">点击上传或拖拽文件到此处</p>
                  <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG，最大 5MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="agree" required className="w-4 h-4" />
                <label htmlFor="agree" className="text-sm text-gray-600">
                  我同意平台对提交信息进行真实性核验
                </label>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">认证费用：</span>¥199/次
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  认证失败将全额退款
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? '提交中...' : '提交认证申请'}
              </button>
            </div>
          </form>
        )}

        {/* 知识产权认证表单 */}
        {activeTab === 'ip' && (
          <form onSubmit={handleSubmit} className="card">
            <h3 className="font-semibold mb-4">AI分身知识产权认证</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">AI分身名称</label>
                <input type="text" className="input" placeholder="请输入要认证的AI分身名称" required />
              </div>
              <div>
                <label className="form-label">训练语料来源说明</label>
                <textarea className="input" rows={3} placeholder="描述您的训练语料来源，如：个人工作笔记、项目文档、沟通记录等" />
              </div>
              <div>
                <label className="form-label">语料样本文件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-gray-600">上传语料样本（脱敏处理）</p>
                  <p className="text-sm text-gray-400 mt-1">支持 PDF、DOC、TXT，最大 50MB</p>
                </div>
              </div>
              <div>
                <label className="form-label">知识产权声明</label>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
                  <p>1. 本人确认所提交的AI分身训练语料均为本人原创或已获得合法授权</p>
                  <p>2. 本人拥有该AI分身及其产出内容的完整知识产权</p>
                  <p>3. 平台仅提供技术托管服务，不拥有AI分身所有权</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">认证费用：</span>¥999/分身
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  包含：数字存证证书 + 法律咨询1小时
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? '提交中...' : '提交认证申请'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
