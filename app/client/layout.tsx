'use client';

import { useAuthHydrated } from '@/lib/store';
import Link from 'next/link';
import { Bot, Bell, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 客户端布局 - 带认证保护的统一布局
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated, user } = useAuthHydrated();
  const logout = useAuthStore((s) => s.logout);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // 获取未读消息数量
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await authFetch('/api/messages');
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        // 静默处理，不影响用户体验
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isHydrated, isAuthenticated, user]);

  // 等待 hydration 完成
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/landing" className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">AI分身市场</span>
              </Link>
              <nav className="flex items-center gap-4 ml-6">
                <Link href="/client/market" className="text-sm text-gray-600 hover:text-gray-900">分身市场</Link>
                {isAuthenticated && (
                  <>
                    <Link href="/client/hire" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      雇佣者中心
                    </Link>
                    <Link href="/client/messages" className="text-sm text-gray-600 hover:text-gray-900 relative">
                      消息
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link href="/client/feedback" className="text-sm text-gray-600 hover:text-gray-900">反馈</Link>
              </nav>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/creator/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                  创作者中心
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/landing');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
                <Link href="/auth/register" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">注册</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
