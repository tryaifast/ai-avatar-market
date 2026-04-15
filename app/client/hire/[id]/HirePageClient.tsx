'use client';

import Link from 'next/link';
import { useAvatarStore, useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Star, Briefcase } from 'lucide-react';

interface HirePageClientProps {
  avatarId: string;
}

export function HirePageClient({ avatarId }: HirePageClientProps) {
  const { currentAvatar, fetchAvatarById, isLoading } = useAvatarStore();
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    fetchAvatarById(avatarId);
  }, [avatarId, fetchAvatarById]);

  // 如果未登录，跳转登录
  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">请先登录后再雇佣分身</p>
          <Link href="/login" className="btn btn-primary">去登录</Link>
        </div>
      </div>
    );
  }

  if (isLoading || !currentAvatar) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const avatar = currentAvatar;
  const hourlyPrice = (avatar as any).pricing?.perTask?.min || 200;
  const fixedPrice = (avatar as any).pricing?.subscription?.monthly || 5000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
            {avatar.avatar || '🤖'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{avatar.name}</h2>
            <p className="text-gray-600 mb-4">{avatar.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{(avatar as any).stats?.rating || '-'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{(avatar as any).stats?.completedTasks || 0}次雇佣</span>
              </div>
            </div>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">服务价格</h3>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">按小时</p>
              <p className="text-xl font-bold text-blue-600">¥{hourlyPrice}<span className="text-sm font-normal">/小时</span></p>
            </div>
            <div className="flex-1 p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">按项目</p>
              <p className="text-xl font-bold text-purple-600">¥{fixedPrice}<span className="text-sm font-normal">起</span></p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex justify-end">
          <Link href={`/client/hire/${avatarId}/confirm`}>
            <button className="btn btn-primary">
              立即雇佣
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
