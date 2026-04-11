'use client';

import { useEffect, useState } from 'react';
import { useAvatarStore } from '@/lib/store';
import { AvatarAnalyticsClient } from './AvatarAnalyticsClient';
import type { Avatar } from '@/lib/store';

export default function AvatarAnalyticsPage({ params }: { params: { id: string } }) {
  const { currentAvatar, fetchAvatarById, isLoading } = useAvatarStore();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchAvatarById(params.id).then(() => {
      // If avatar not found after fetch, show not found
      setTimeout(() => {
        if (!useAvatarStore.getState().currentAvatar) {
          setNotFound(true);
        }
      }, 2000);
    });
  }, [params.id, fetchAvatarById]);

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
