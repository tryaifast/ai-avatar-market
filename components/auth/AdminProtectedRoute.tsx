'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 管理后台路由保护组件
 * - 使用 useAdminAuthStore._hasHydrated 精确等待 hydration 完成
 * - 检查管理员是否登录
 * - 未登录 → 跳转到 /admin/login
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const admin = useAdminAuthStore((s) => s.admin);
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const isHydrated = useAdminAuthStore((s) => s._hasHydrated);
  const [checked, setChecked] = useState(false);

  // hydration 完成后再检查权限
  useEffect(() => {
    if (!isHydrated) return;

    if (!admin || !isAdminAuthenticated) {
      console.log('[AdminProtectedRoute] Admin not logged in, redirecting to /admin/login');
      router.replace('/admin/login');
      return;
    }

    setChecked(true);
  }, [isHydrated, admin, isAdminAuthenticated, router]);

  // 等待 hydration 或权限检查
  if (!isHydrated || !checked) {
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
