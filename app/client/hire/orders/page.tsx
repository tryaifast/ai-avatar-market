'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, ChevronRight, Clock, CheckCircle, AlertCircle,
  RefreshCw, Filter, Search, ArrowRight, FileText
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';

interface Order {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  pricingType: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  completedAt: string | null;
  avatar: {
    id: string;
    name: string;
    avatar_url: string;
  } | null;
  creator: {
    id: string;
    name: string;
  } | null;
  progress: number;
}

type OrderStatus = 'all' | 'pending' | 'active' | 'completed';

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: '待开始', className: 'bg-gray-100 text-gray-600', icon: Clock },
  ai_working: { label: 'AI工作中', className: 'bg-blue-100 text-blue-600', icon: Bot },
  human_review: { label: '人工审核中', className: 'bg-yellow-100 text-yellow-600', icon: RefreshCw },
  delivered: { label: '待确认', className: 'bg-purple-100 text-purple-600', icon: AlertCircle },
  completed: { label: '已完成', className: 'bg-green-100 text-green-600', icon: CheckCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [status, pagination.page]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await authFetch(
        `/api/client-center/orders?status=${status}&page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      const result = await res.json();
      if (result.success) {
        setOrders(result.orders);
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  const filteredOrders = orders.filter(order =>
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.avatar?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-500 mt-1">查看和管理你的所有订单</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
          {(['all', 'pending', 'active', 'completed'] as OrderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                status === s
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'all' && '全部'}
              {s === 'pending' && '待开始'}
              {s === 'active' && '进行中'}
              {s === 'completed' && '已完成'}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索订单标题或分身名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <Link
                key={order.id}
                href={`/client/hire/orders/${order.id}`}
                className="block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    {order.avatar?.avatar_url ? (
                      <span className="text-xl">{order.avatar.avatar_url}</span>
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{order.title}</h3>
                        <p className="text-sm text-gray-500">
                          {order.avatar?.name} · {order.creator?.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 flex-shrink-0 ${config.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>进度</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="font-medium text-gray-900">{formatPrice(order.price)}</span>
                      <span>创建于 {new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
                      {order.deliveredAt && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          已交付
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? '没有找到匹配的订单' : '暂无订单'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? '尝试调整搜索关键词' 
              : '还没有创建任何订单，去市场雇佣分身开始你的第一个任务'}
          </p>
          <Link 
            href="/client/market"
            className="btn-primary"
          >
            浏览分身市场
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            共 {pagination.total} 条记录
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="text-sm text-gray-600">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
