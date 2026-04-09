'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Plus, Bot, Clock, CheckCircle, XCircle, Eye, Settings,
  TrendingUp, Users, ArrowLeft, Sparkles
} from 'lucide-react';

// 模拟数据
const mockAvatars = [
  {
    id: '1',
    name: '代码审查助手·小明',
    description: '专注前端代码审查，擅长React、Vue、TypeScript',
    status: 'active',
    price: '¥50/任务',
    earnings: 28900,
    tasks: 18,
    views: 1250,
    createdAt: '2026-03-15',
  },
  {
    id: '2',
    name: '产品顾问·Pro',
    description: '10年产品经验，提供需求分析、产品规划服务',
    status: 'reviewing',
    price: '¥200/小时',
    earnings: 0,
    tasks: 0,
    views: 45,
    createdAt: '2026-04-08',
  },
  {
    id: '3',
    name: '文案策划·阿文',
    description: '创意文案撰写，品牌故事、营销文案',
    status: 'active',
    price: '¥30/任务',
    earnings: 7840,
    tasks: 8,
    views: 520,
    createdAt: '2026-03-20',
  },
];

const statusConfig = {
  active: {
    label: '已上架',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  reviewing: {
    label: '审核中',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  rejected: {
    label: '未通过',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  inactive: {
    label: '已下架',
    color: 'bg-gray-100 text-gray-700',
    icon: XCircle,
  },
};

export default function MyAvatarsPage() {
  const [avatars] = useState(mockAvatars);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">我的分身</h1>
            </div>
            <Link
              href="/creator/avatar/create"
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建新分身
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">总分身</p>
                <p className="text-xl font-bold text-gray-900">{avatars.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">已上架</p>
                <p className="text-xl font-bold text-gray-900">
                  {avatars.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">累计收益</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{(avatars.reduce((sum, a) => sum + a.earnings, 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">总任务数</p>
                <p className="text-xl font-bold text-gray-900">
                  {avatars.reduce((sum, a) => sum + a.tasks, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Avatars List */}
        {avatars.length > 0 ? (
          <div className="space-y-4">
            {avatars.map((avatar) => {
              const status = statusConfig[avatar.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              
              return (
                <div key={avatar.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{avatar.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{avatar.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>定价: {avatar.price}</span>
                          <span>·</span>
                          <span>浏览: {avatar.views}</span>
                          <span>·</span>
                          <span>创建: {avatar.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creator/avatars/${avatar.id}`}
                        className="btn-secondary btn-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Link>
                      <Link
                        href={`/creator/avatars/${avatar.id}/settings`}
                        className="btn-secondary btn-sm"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        设置
                      </Link>
                    </div>
                  </div>
                  
                  {avatar.status === 'active' && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">累计收益</p>
                        <p className="text-lg font-semibold text-green-600">
                          ¥{(avatar.earnings / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">完成任务</p>
                        <p className="text-lg font-semibold text-gray-900">{avatar.tasks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">平均评分</p>
                        <p className="text-lg font-semibold text-yellow-600">4.9★</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有创建分身</h3>
            <p className="text-gray-600 mb-6">创建你的第一个AI分身，开始接单赚钱</p>
            <Link href="/creator/avatar/create" className="btn-primary inline-flex">
              <Sparkles className="w-4 h-4 mr-2" />
              立即创建
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
