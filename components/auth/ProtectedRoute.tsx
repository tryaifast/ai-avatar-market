'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 用户路由保护组件
 * - 使用 useAuthStore._hasHydrated 精确等待 Zustand persist hydration 完成
 * - 同时检查 user、token 和 isAuthenticated 三个条件
 * - token 为空说明认证无效，不能放行
 * - 未登录 → 跳转到 /auth/login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // 等 hydration 完成后再检查认证
  useEffect(() => {
    if (!isHydrated) return; // 还在 hydrating，等等

    // hydration 完成了，现在可以安全判断
    // 三重检查：user存在 + token存在 + isAuthenticated为true
    if (!user || !token || !isAuthenticated) {
      console.warn('[ProtectedRoute] 认证检查失败:', {
        hasUser: !!user,
        hasToken: !!token,
        isAuthenticated,
      });
      router.replace('/auth/login');
      return;
    }
    setChecked(true);
  }, [isHydrated, user, token, isAuthenticated, router]);

  // 等待 hydration 或权限检查
  if (!isHydrated || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">验证登录状态...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
