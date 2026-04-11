'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState(false);

  // 等待 Zustand persist hydration
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHydrated(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    const timer = setTimeout(() => {
      if (!user || !isAuthenticated) {
        router.replace('/auth/login');
        return;
      }
      setChecked(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [hydrated, user, isAuthenticated, router]);

  if (!hydrated || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
