// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Star, Briefcase, Clock, ChevronRight,
  Bot, User, MessageCircle
} from 'lucide-react';
import { useAvatarStore } from '@/lib/store';

const identityFilters = ['全部', '程序员', '产品经理', '设计师', '运营', '律师', '数据分析师'];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('全部');
  const { avatars, fetchAvatars, isLoading } = useAvatarStore();

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const filteredAvatars = avatars.filter(avatar => {
    const matchesSearch = 
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (avatar.personality?.expertise || []).some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIdentity = 
      selectedIdentity === '全部' || 
      (avatar.personality?.expertise || []).some(e => e.includes(selectedIdentity));
    
    return matchesSearch && matchesIdentity;
  });

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  if (isLoading && avatars.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">加载分身市场中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Bot className="w-7 h-7 text-blue-600" />
              <span className="text-lg font-bold">AI分身市场</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/creator/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
                创作者中心
              </Link>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">分身市场</h1>
          <p className="text-gray-600 mt-1">发现适合你的AI分身，让专业人士为你服务</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索分身名称、技能、领域..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {identityFilters.map((identity) => (
                <button
                  key={identity}
                  onClick={() => setSelectedIdentity(identity)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedIdentity === identity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {identity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          找到 <span className="font-semibold">{filteredAvatars.length}</span> 个分身
        </div>

        {/* Avatar Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvatars.map((avatar) => (
            <div key={avatar.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Avatar Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{avatar.name}</h3>
                    <p className="text-sm text-gray-500">{avatar.creatorId}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{avatar.description}</p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(avatar.personality?.expertise || []).slice(0, 3).map((exp) => (
                    <span key={exp} className="badge-gray text-xs">
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{avatar.stats?.rating || 0}</span>
                    <span>({avatar.stats?.reviewCount || 0})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{avatar.stats?.hiredCount || 0}次雇佣</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {avatar.pricing?.type === 'per_task' ? (
                      <div className="text-sm">
                        <span className="text-gray-500">按任务</span>
                        <div className="font-semibold text-gray-900">
                          {avatar.pricing.perTask ? `${formatPrice(avatar.pricing.perTask.min)} - ${formatPrice(avatar.pricing.perTask.max)}` : '详询'}
                        </div>
                      </div>
                    ) : avatar.pricing?.type === 'subscription' ? (
                      <div className="text-sm">
                        <span className="text-gray-500">订阅</span>
                        <div className="font-semibold text-gray-900">
                          {avatar.pricing.subscription ? `${formatPrice(avatar.pricing.subscription.monthly)}/月` : '详询'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="text-gray-500">定价</span>
                        <div className="font-semibold text-gray-900">详询</div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/client/hire/${avatar.id}/confirm`}
                    className="btn-primary text-sm"
                  >
                    雇佣
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAvatars.length === 0 && (
          <div className="text-center py-16">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的分身</h3>
            <p className="text-gray-600">试试调整搜索关键词或筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
