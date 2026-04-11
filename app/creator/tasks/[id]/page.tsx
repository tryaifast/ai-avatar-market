'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store';
import { TaskDetailClient } from './TaskDetailClient';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { currentTask, fetchTaskById, isLoading } = useTaskStore();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchTaskById(params.id).then(() => {
      setTimeout(() => {
        if (!useTaskStore.getState().currentTask) {
          setNotFound(true);
        }
      }, 2000);
    });
  }, [params.id, fetchTaskById]);

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

  if (notFound || !currentTask) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">未找到该任务信息</p>
        </div>
      </div>
    );
  }

  return <TaskDetailClient task={currentTask as any} />;
}
