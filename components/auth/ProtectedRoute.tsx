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
 * - 不再依赖 setTimeout 猜测，彻底解决刷新后误判未登录的问题
 * - 未登录 → 跳转到 /auth/login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // 等 hydration 完成后再检查认证
  useEffect(() => {
    if (!isHydrated) return; // 还在 hydrating，等等

    // hydration 完成了，现在可以安全判断
    if (!user || !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    setChecked(true);
  }, [isHydrated, user, isAuthenticated, router]);

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
