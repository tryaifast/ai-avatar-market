'use client';

import { useEffect, useState } from 'react';
import { useAvatarStore, authFetch } from '@/lib/store';
import { AvatarAnalyticsClient } from './AvatarAnalyticsClient';

export default function AvatarAnalyticsPage({ params }: { params: { id: string } }) {
  const { currentAvatar, isLoading, setCurrentAvatar } = useAvatarStore();
  const [notFound, setNotFound] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      setFetching(true);
      setNotFound(false);
      try {
        // 使用 authFetch 替代裸 fetch，确保带认证token
        const res = await authFetch(`/api/avatars/${params.id}`);
        const data = await res.json();
        if (data.success && data.avatar) {
          setCurrentAvatar(data.avatar);
        } else {
          setCurrentAvatar(null);
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to fetch avatar:', error);
        setCurrentAvatar(null);
        setNotFound(true);
      } finally {
        setFetching(false);
      }
    };

    fetchAvatar();
  }, [params.id, setCurrentAvatar]);

  if (fetching || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (notFound || !currentAvatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">未找到该分身信息</p>
        </div>
      </div>
    );
  }

  return <AvatarAnalyticsClient avatar={currentAvatar as any} />;
}
