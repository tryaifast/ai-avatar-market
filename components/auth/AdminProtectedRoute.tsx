'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// 管理后台路由保护组件
// - 使用独立的 adminAuthStore，与用户登录互不影响
// - 检查管理员是否登录
// - 未登录 → 跳转到 /admin/login
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const router = useRouter();
  const admin = useAdminAuthStore((s) => s.admin);
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState(false);

  // 等待 Zustand persist hydration 完成
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // hydration 完成后再检查权限
  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      if (!admin || !isAdminAuthenticated) {
        console.log('[AdminProtectedRoute] Admin not logged in, redirecting to /admin/login');
        router.replace('/admin/login');
        return;
      }

      setChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [hydrated, admin, isAdminAuthenticated, router]);

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
