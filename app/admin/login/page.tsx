'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/store';

// 管理端登录页面（使用独立的 adminAuthStore，与用户登录互不影响）
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const adminLogin = useAdminAuthStore((s) => s.adminLogin);
  const isLoading = useAdminAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const result = await adminLogin(email, password);

      if (result.success) {
        // 给 Zustand persist 一点时间写入 localStorage
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 200);
      } else {
        setError(result.error || '邮箱或密码错误');
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setError('登录失败，请重试');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">管理后台</h1>
          <p className="text-gray-600">AI分身市场管理平台</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">管理员邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@example.com"
              required
              disabled={isLoggingIn}
            />
          </div>

          <div>
            <label className="form-label">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="请输入密码"
              required
              disabled={isLoggingIn}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isLoading}
            className="btn btn-primary w-full"
          >
            {isLoggingIn ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          仅限授权管理员访问
        </p>
      </div>
    </div>
  );
}
