'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Bot, Briefcase, Wallet, MessageSquare, Settings, LogOut, Crown, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const menuItems = [
  { href: '/creator/dashboard', icon: LayoutDashboard, label: '总览' },
  { href: '/creator/avatars', icon: Bot, label: '我的分身' },
  { href: '/creator/tasks', icon: Briefcase, label: '任务管理' },
  { href: '/creator/earnings', icon: Wallet, label: '收益' },
  { href: '/creator/messages', icon: MessageSquare, label: '消息' },
  { href: '/creator/membership', icon: Crown, label: '会员中心' },
  { href: '/creator/certifications', icon: ShieldCheck, label: '知识产权认证', badge: 'NEW' },
  { href: '/creator/settings', icon: Settings, label: '设置' },
];

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <Bot className="w-7 h-7 text-blue-600" />
              <span className="text-lg font-bold">AI分身市场</span>
            </Link>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {'badge' in item && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
