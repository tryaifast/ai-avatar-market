'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Briefcase, Clock, CheckCircle, Award, User, FileText, Download, ExternalLink } from 'lucide-react';
import CreatorDetailClient from './CreatorDetailClient';

interface CreatorPageProps {
  params: { id: string };
}

export default function CreatorPage({ params }: CreatorPageProps) {
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setCreator(data.creator);
        } else {
          setError(data.error || '创作者不存在');
        }
      } catch (err: any) {
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || '创作者未找到'}
          </h1>
          <p className="text-gray-600 mb-4">该创作者不存在或尚未入驻</p>
          <Link href="/client/market" className="text-blue-600 hover:underline">
            返回市场
          </Link>
        </div>
      </div>
    );
  }

  return <CreatorDetailClient creator={creator} />;
}
