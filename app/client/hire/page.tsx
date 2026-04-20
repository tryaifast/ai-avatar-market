'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, Briefcase, CheckCircle, Clock, ChevronRight, 
  MessageSquare, TrendingUp, Wallet, ArrowRight, Star
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';

interface DashboardData {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
  };
  activeOrders: any[];
  hiredAvatars: any[];
  unreadCount: number;
}

export default function ClientHireDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await authFetch('/api/client-center/dashboard');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，{user?.name}</h1>
        <p className="text-blue-100">管理你的雇佣订单，与AI分身协作完成任务</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">总订单</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.stats?.totalOrders || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">进行中</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.stats?.pendingOrders || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">已完成</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.stats?.completedOrders || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">总花费</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(data?.stats?.totalSpent || 0)}</p>
        </div>
      </div>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">进行中的订单</h2>
          <Link 
            href="/client/hire/orders?status=active"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {data?.activeOrders && data.activeOrders.length > 0 ? (
          <div className="space-y-3">
            {data.activeOrders.map((order: any) => (
              <Link 
                key={order.id}
                href={`/workspace/${order.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    {order.avatar?.avatar_url ? (
                      <span className="text-xl">{order.avatar.avatar_url}</span>
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{order.title}</h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {order.avatar?.name} · {order.creator?.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatPrice(order.price)}</span>
                      <span>{new Date(order.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">暂无进行中的订单</p>
            <Link 
              href="/client/market"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              去市场雇佣分身 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Hired Avatars */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近雇佣的分身</h2>
          <Link 
            href="/client/hire/avatars"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {data?.hiredAvatars && data.hiredAvatars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.hiredAvatars.map((item: any) => (
              <Link 
                key={item.id}
                href={`/client/hire/${item.avatar?.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.avatar?.avatar_url ? (
                      <span className="text-lg">{item.avatar.avatar_url}</span>
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.avatar?.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">by {item.creator?.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{item.total_tasks} 次雇佣</span>
                      {item.avatar?.stats_rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {item.avatar.stats_rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center border">
            <p className="text-gray-500">还没有雇佣过任何分身</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/client/market"
          className="flex items-center justify-between bg-blue-50 rounded-xl p-5 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">浏览分身市场</h3>
              <p className="text-sm text-gray-500">发现更多专业AI分身</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-600" />
        </Link>

        <Link 
          href="/client/hire/messages"
          className="flex items-center justify-between bg-green-50 rounded-xl p-5 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                消息中心
                {data?.unreadCount && data.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {data.unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">查看系统通知和创作者消息</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-green-600" />
        </Link>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; className: string }> = {
    pending: { text: '待开始', className: 'bg-gray-100 text-gray-600' },
    ai_working: { text: 'AI工作中', className: 'bg-blue-100 text-blue-600' },
    human_review: { text: '人工审核中', className: 'bg-yellow-100 text-yellow-600' },
    delivered: { text: '待确认', className: 'bg-purple-100 text-purple-600' },
    completed: { text: '已完成', className: 'bg-green-100 text-green-600' },
  };

  const { text, className } = config[status] || config.pending;

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
      {text}
    </span>
  );
}
