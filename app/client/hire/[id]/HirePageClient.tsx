'use client';

import Link from 'next/link';
import { useAvatarStore, useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, Star, Briefcase, Clock, ChevronRight, ShieldCheck, 
  ArrowLeft, User, CheckCircle, XCircle, Shield, Eye
} from 'lucide-react';

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

  const avatar = currentAvatar as any;

  // 未登录提示
  if (!token) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
          <p className="text-gray-500 mb-4">登录后即可查看分身详情并雇佣</p>
          <Link href="/auth/login" className="btn-primary">去登录</Link>
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

  // 格式化价格
  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;
  const hourlyPrice = avatar.pricing?.perTask?.min || avatar.pricePerHour || 20000;
  const fixedPrice = avatar.pricing?.subscription?.monthly || avatar.pricePerTask || 500000;

  // 创作者信息
  const creatorName = avatar.creatorName || avatar.name || '创作者';
  const creatorId = avatar.creatorId || '';
  const expertise = avatar.personality?.expertise || [];
  const canDo = avatar.scope?.canDo || avatar.canDo || [];
  const cannotDo = avatar.scope?.cannotDo || avatar.cannotDo || [];
  const responseTime = avatar.scope?.responseTime || '平均2小时内';
  const isCertified = avatar.certification_status === 'certified';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 返回导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/client/market" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm text-gray-500">分身市场</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">{avatar.name}</span>
      </div>

      {/* 分身信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* 头像 */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            {avatar.avatar ? (
              <span className="text-4xl">{avatar.avatar}</span>
            ) : (
              <Bot className="w-12 h-12 text-white" />
            )}
          </div>
          
          {/* 基本信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{avatar.name}</h1>
              {isCertified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  已认证
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-3">{avatar.description}</p>
            
            {/* 统计数据 */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-900">{avatar.stats?.rating || avatar.rating || '-'}</span>
                <span>({avatar.stats?.reviewCount || 0}评价)</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{avatar.stats?.hiredCount || avatar.stats?.completedTasks || 0}次雇佣</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{responseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 创作者信息 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          创作者信息
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {creatorName[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{creatorName}</span>
              <Link 
                href={`/client/creator/${creatorId}`}
                className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-0.5"
              >
                查看主页 <Eye className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {expertise.slice(0, 5).map((exp: string) => (
                <span key={exp} className="badge-gray text-xs">{exp}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          了解创作者的背景、经验和专业能力，确保分身质量有保障。
        </p>
      </div>

      {/* 能力与担保 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          能力与担保
        </h2>
        
        {/* 能做什么 */}
        {canDo.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              可以做的事
            </h3>
            <div className="space-y-1.5">
              {canDo.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 不能做什么 */}
        {cannotDo.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <XCircle className="w-4 h-4 text-red-400" />
              不支持的事
            </h3>
            <div className="space-y-1.5">
              {cannotDo.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 服务承诺 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <h3 className="text-sm font-medium text-blue-800 mb-2">服务承诺</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="w-4 h-4" />
              <span>资金托管，满意后放款</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span>{responseTime}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="w-4 h-4" />
              <span>人机协同质量保障</span>
            </div>
          </div>
        </div>
      </div>

      {/* 价格信息 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">服务价格</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-1">按小时</p>
            <p className="text-2xl font-bold text-blue-600">{formatPrice(hourlyPrice)}<span className="text-sm font-normal">/小时</span></p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-sm text-gray-500 mb-1">按项目</p>
            <p className="text-2xl font-bold text-purple-600">{formatPrice(fixedPrice)}<span className="text-sm font-normal">起</span></p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">* 平台收取10%服务费，资金托管至满意后放款</p>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 sticky bottom-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">起步价</p>
            <p className="text-2xl font-bold text-blue-600">{formatPrice(hourlyPrice)}<span className="text-sm font-normal text-gray-500">/小时</span></p>
          </div>
          <Link
            href={`/client/hire/${avatarId}/confirm`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg"
          >
            立即雇佣
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
