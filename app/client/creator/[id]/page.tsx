'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAvatarStore, useAuthStore } from '@/lib/store';
import CreatorDetailClient from './CreatorDetailClient';

// 创作者详情页 - 动态获取数据
export default function CreatorPage({ params }: { params: { id: string } }) {
  const { avatars, fetchAvatars, isLoading } = useAvatarStore();
  const { user } = useAuthStore();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchAvatars().then(() => {
      // 检查是否有该创作者的分身
      const creatorAvatars = useAvatarStore.getState().avatars.filter(
        (a: any) => a.creatorId === params.id
      );
      if (creatorAvatars.length === 0) {
        setNotFound(true);
      }
    });
  }, [params.id, fetchAvatars]);

  // 从分身数据中提取创作者信息
  const creatorAvatars = avatars.filter((a: any) => a.creatorId === params.id);
  const firstAvatar = creatorAvatars[0] as any;
  const creator = firstAvatar ? {
    id: params.id,
    name: firstAvatar.creatorName || firstAvatar.name,
    identity: firstAvatar.personality?.expertise || [firstAvatar.category || ''],
    avatar: firstAvatar.avatar || '👤',
    bio: firstAvatar.description || '',
    rating: firstAvatar.stats?.rating || firstAvatar.rating || 0,
    totalHires: firstAvatar.stats?.hiredCount || firstAvatar.hireCount || 0,
    reviewCount: firstAvatar.stats?.reviewCount || firstAvatar.reviewCount || 0,
    responseTime: firstAvatar.scope?.responseTime || '平均2小时内',
    completionRate: firstAvatar.stats?.completedTasks ? Math.round((firstAvatar.stats.completedTasks / (firstAvatar.stats.hiredCount || 1)) * 100) : 95,
    joinDate: firstAvatar.createdAt ? new Date(firstAvatar.createdAt).toISOString().slice(0, 7) : '2024-01',
    skills: firstAvatar.personality?.expertise || firstAvatar.tags || [],
    resume: {
      education: '',
      experience: [] as string[],
      certifications: [] as string[],
    },
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">创作者未找到</h1>
          <p className="text-gray-600 mb-4">该创作者不存在或已被下架</p>
          <Link href="/client/market" className="text-blue-600 hover:underline">
            返回市场
          </Link>
        </div>
      </div>
    );
  }

  return <CreatorDetailClient creator={creator} avatars={creatorAvatars as any} />;
}
