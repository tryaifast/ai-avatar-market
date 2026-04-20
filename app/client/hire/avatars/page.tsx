'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, Star, Briefcase, Clock, ChevronRight, 
  Heart, MessageSquare, Plus, ArrowRight
} from 'lucide-react';
import { useAuthStore, authFetch } from '@/lib/store';

interface HiredAvatar {
  id: string;
  totalTasks: number;
  completedTasks: number;
  totalSpent: number;
  lastHiredAt: string;
  isFavorite: boolean;
  nickname: string | null;
  avatar: {
    id: string;
    name: string;
    description: string;
    avatar_url: string;
    status: string;
    pricing_type: string;
    pricing_per_task_min: number;
    pricing_per_task_max: number;
    pricing_subscription_monthly: number;
    scope_can_do: string[];
    scope_cannot_do: string[];
    scope_response_time: string;
    stats_hired_count: number;
    stats_rating: number;
  };
  creator: {
    id: string;
    name: string;
  };
}

export default function HiredAvatarsPage() {
  const [avatars, setAvatars] = useState<HiredAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorite'>('all');

  useEffect(() => {
    async function fetchAvatars() {
      try {
        const res = await authFetch('/api/client-center/avatars');
        const result = await res.json();
        if (result.success) {
          setAvatars(result.avatars);
        }
      } catch (err) {
        console.error('Failed to fetch avatars:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAvatars();
  }, []);

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  const filteredAvatars = filter === 'favorite' 
    ? avatars.filter(a => a.isFavorite)
    : avatars;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的分身</h1>
          <p className="text-gray-500 mt-1">快速访问你雇佣过的AI分身</p>
        </div>
        <Link 
          href="/client/market"
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          雇佣新分身
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            filter === 'all' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          全部 ({avatars.length})
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setFilter('favorite')}
          className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-1 ${
            filter === 'favorite' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          收藏 ({avatars.filter(a => a.isFavorite).length})
          {filter === 'favorite' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {/* Avatars Grid */}
      {filteredAvatars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAvatars.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.avatar.avatar_url ? (
                    <span className="text-2xl">{item.avatar.avatar_url}</span>
                  ) : (
                    <Bot className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.avatar.name}</h3>
                      {item.nickname && (
                        <p className="text-sm text-gray-500">你的备注: {item.nickname}</p>
                      )}
                    </div>
                    <button 
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.isFavorite 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                      }`}
                      title={item.isFavorite ? '取消收藏' : '收藏'}
                    >
                      <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>by {item.creator.name}</span>
                    {item.avatar.stats_rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {item.avatar.stats_rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.avatar.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {item.totalTasks} 次雇佣
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.avatar.scope_response_time}
                </span>
              </div>

              {/* Can Do */}
              {item.avatar.scope_can_do.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.avatar.scope_can_do.slice(0, 3).map((cap) => (
                      <span key={cap} className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                    {item.avatar.scope_can_do.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.avatar.scope_can_do.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  {item.avatar.pricing_type === 'per_task' ? (
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.avatar.pricing_per_task_min)} 起
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.avatar.pricing_subscription_monthly)}/月
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/client/hire/creator/${item.creator.id}/contact`}
                    className="btn-secondary btn-sm"
                    title="咨询创作者"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/client/hire/${item.avatar.id}`}
                    className="btn-primary btn-sm"
                  >
                    再次雇佣
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border">
          <Bot className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'favorite' ? '还没有收藏任何分身' : '还没有雇佣任何分身'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'favorite' 
              ? '收藏你常用的分身，方便快速访问' 
              : '去市场发现专业的AI分身，开始你的第一个任务'}
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
    </div>
  );
}
