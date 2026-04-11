'use client';

import Link from 'next/link';
import { Bot, User, LogOut, Shield, ChevronDown, MessageSquare, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取未读消息数量
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // 每30秒刷新一次
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">AI分身市场</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link href="/client/market" className="text-gray-600 hover:text-gray-900">
              分身市场
            </Link>
            <Link href="/creator/dashboard" className="text-gray-600 hover:text-gray-900">
              创作者中心
            </Link>
            
            {/* Admin Entry */}
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <Shield className="w-4 h-4" />
                管理后台
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdminMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <Link 
                    href="/admin/login" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    <Shield className="w-4 h-4" />
                    管理员登录
                  </Link>
                  <div className="border-t my-1" />
                  <div className="px-4 py-2 text-xs text-gray-400">
                    仅限管理员访问
                  </div>
                </div>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/creator/avatar/create" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  创建分身
                </Link>
                
                {/* 消息提醒 */}
                <Link 
                  href="/client/messages" 
                  className="relative text-gray-600 hover:text-gray-900"
                  title="我的消息"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                
                {/* 意见反馈 */}
                <Link 
                  href="/client/feedback" 
                  className="text-gray-600 hover:text-gray-900"
                  title="意见反馈"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  登录
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
