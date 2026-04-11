'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// 管理后台路由保护组件
// - 检查用户是否登录（支持 Zustand persist 异步恢复）
// - 检查用户是否为管理员
// - 未登录 → 跳转到 /admin/login
// - 非管理员 → 跳转到 /auth/login
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState(false);

  // 等待 Zustand persist hydration 完成
  useEffect(() => {
    // Zustand persist hydration 在客户端首次渲染后异步进行
    // 用 requestAnimationFrame 确保在 hydration 后再检查
    const raf = requestAnimationFrame(() => {
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // hydration 完成后再检查权限
  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      if (!user || !isAuthenticated) {
        console.log('[AdminProtectedRoute] Not logged in, redirecting to /admin/login');
        router.replace('/admin/login');
        return;
      }

      if (user.role !== 'admin') {
        console.log('[AdminProtectedRoute] Not admin, redirecting to /auth/login');
        router.replace('/auth/login');
        return;
      }

      setChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [hydrated, user, isAuthenticated, router]);

  // 等待 hydration 或权限检查
  if (!hydrated || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">验证权限中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
