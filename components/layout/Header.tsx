'use client';

import Link from 'next/link';
import { Bot, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

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
