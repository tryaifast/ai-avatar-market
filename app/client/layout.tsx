'use client';

import { useAuthHydrated } from '@/lib/store';
import Link from 'next/link';
import { Bot, User, LogOut, ChevronDown, Briefcase, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 客户端布局 - 带认证保护的统一布局
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated, user } = useAuthHydrated();
  const logout = useAuthStore((s) => s.logout);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                <Link href="/client/feedback" className="text-sm text-gray-600 hover:text-gray-900">反馈</Link>
              </nav>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* 用户下拉菜单 */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{user.name?.[0] || <User className="w-3.5 h-3.5" />}</span>
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 下拉菜单 */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <p className="px-4 py-1.5 text-xs font-medium text-gray-400 uppercase">切换身份</p>
                        
                        <Link
                          href="/client/hire"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">雇佣者中心</p>
                            <p className="text-xs text-gray-500">管理订单和分身</p>
                          </div>
                        </Link>

                        <Link
                          href="/creator/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">创作者中心</p>
                            <p className="text-xs text-gray-500">管理分身和收益</p>
                          </div>
                        </Link>
                      </div>

                      <div className="border-t py-1 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowDropdown(false);
                            router.push('/landing');
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
