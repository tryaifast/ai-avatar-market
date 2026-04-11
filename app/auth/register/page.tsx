// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { addMockUser, mockUsers } from '@/lib/mock/data';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 风控检查函数
  const checkEmailExists = (email: string): boolean => {
    return mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const checkDeviceLimit = (): { allowed: boolean; message?: string } => {
    const deviceKey = 'device_registrations';
    const today = new Date().toISOString().split('T')[0];
    
    // 获取设备注册记录
    const stored = localStorage.getItem(deviceKey);
    let records: { date: string; count: number } = stored 
      ? JSON.parse(stored) 
      : { date: today, count: 0 };
    
    // 如果日期不同，重置计数
    if (records.date !== today) {
      records = { date: today, count: 0 };
    }
    
    // 检查是否超过每日限制（3次）
    if (records.count >= 3) {
      return { 
        allowed: false, 
        message: '本设备今日注册次数已达上限（3次），请明天再试' 
      };
    }
    
    return { allowed: true };
  };

  const recordDeviceRegistration = () => {
    const deviceKey = 'device_registrations';
    const today = new Date().toISOString().split('T')[0];
    
    const stored = localStorage.getItem(deviceKey);
    let records: { date: string; count: number } = stored 
      ? JSON.parse(stored) 
      : { date: today, count: 0 };
    
    if (records.date !== today) {
      records = { date: today, count: 0 };
    }
    
    records.count += 1;
    localStorage.setItem(deviceKey, JSON.stringify(records));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    // 风控1: 检查邮箱是否已注册
    if (checkEmailExists(email)) {
      setError('该邮箱已注册，请直接登录');
      return;
    }

    // 风控2: 检查设备注册限制
    const deviceCheck = checkDeviceLimit();
    if (!deviceCheck.allowed) {
      setError(deviceCheck.message || '注册受限');
      return;
    }

    setLoading(true);

    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 生成新用户
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'client' as const,
        isVerified: false,
        onboardingStatus: 'pending' as const,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // 添加到mockUsers（这样后续登录才能找到）
      addMockUser(newUser);

      // 记录设备注册次数（风控）
      recordDeviceRegistration();

      // 生成模拟token
      const token = `mock_token_${newUser.id}_${Date.now()}`;

      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      // 跳转到首页
      router.push('/client/market');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="w-12 h-12 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AI分身市场</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">注册</h2>
          <p className="mt-2 text-gray-600">创建账号，开始你的AI分身之旅</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="你的昵称"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '注册'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              已有账号？{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                立即登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
