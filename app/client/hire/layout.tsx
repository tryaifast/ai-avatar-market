'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Bot, ClipboardList, MessageSquare, 
  ChevronRight, User, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const menuItems = [
  { href: '/client/hire', icon: LayoutDashboard, label: '首页' },
  { href: '/client/hire/avatars', icon: Bot, label: '我的分身' },
  { href: '/client/hire/orders', icon: ClipboardList, label: '订单管理' },
  { href: '/client/hire/messages', icon: MessageSquare, label: '消息中心' },
];

export default function ClientHireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <span className="font-bold text-gray-900 hidden sm:block">雇佣者中心</span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === item.href || pathname?.startsWith(item.href + '/')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/client/market" className="text-sm text-gray-600 hover:text-gray-900">
                  返回市场
                </Link>
                <div className="h-4 w-px bg-gray-200" />
                <Link href="/client/messages" className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.[0] || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar - Mobile hidden */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      pathname === item.href || pathname?.startsWith(item.href + '/')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    <ChevronRight className={cn(
                      'w-4 h-4 ml-auto transition-transform',
                      pathname === item.href || pathname?.startsWith(item.href + '/') ? 'rotate-90' : ''
                    )} />
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">快捷入口</p>
                <Link 
                  href="/client/market"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  <Bot className="w-5 h-5" />
                  浏览分身市场
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
