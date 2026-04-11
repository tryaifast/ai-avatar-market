'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// 管理后台路由保护组件
// - 检查用户是否登录
// - 检查用户是否为管理员
// - 未登录 → 跳转到 /admin/login
// - 非管理员 → 跳转到 /auth/login
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 等待 auth 状态加载完成
    if (isLoading) return;

    // 检查登录状态
    if (!user) {
      console.log('[AdminProtectedRoute] Not logged in, redirecting to /admin/login');
      router.replace('/admin/login');
      return;
    }

    // 检查管理员权限
    if (user.role !== 'admin') {
      console.log('[AdminProtectedRoute] Not admin, redirecting to /auth/login');
      router.replace('/auth/login');
      return;
    }

    // 通过验证
    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, isLoading, router]);

  // 加载中显示 loading
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">验证权限中...</p>
        </div>
      </div>
    );
  }

  // 未授权不渲染内容
  if (!isAuthorized) {
    return null;
  }

  // 已授权渲染子内容
  return <>{children}</>;
}
