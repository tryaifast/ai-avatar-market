'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bot, Star, Briefcase } from 'lucide-react';

export default function HirePage() {
  const params = useParams();
  const avatarId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/client/market" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">雇佣AI分身</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">分身ID: {avatarId}</h2>
              <p className="text-gray-600 mb-4">雇佣功能开发中...</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>128次雇佣</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">任务描述</h3>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg"
              rows={4}
              placeholder="描述你需要完成的任务..."
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button className="btn-primary">
              确认雇佣
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
