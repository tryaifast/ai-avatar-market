'use client';

import Link from 'next/link';
import { Bot, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

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
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/creator/avatar/create" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  创建分身
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
