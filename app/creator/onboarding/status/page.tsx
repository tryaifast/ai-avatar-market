'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { 
  ArrowLeft, Clock, CheckCircle, XCircle, Bot, 
  FileText, MessageCircle, Sparkles
} from 'lucide-react';

export default function OnboardingStatusPage() {
  const user = useAuthStore((s) => s.user);
  const status = user?.onboardingStatus || 'submitted';

  const statusConfig = {
    submitted: {
      icon: Clock,
      title: '审核中',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      description: '你的入驻申请已提交，正在审核中',
      detail: '审核通常需要1-3个工作日，请耐心等待。审核结果将通过站内消息和短信通知你。',
    },
    approved: {
      icon: CheckCircle,
      title: '审核通过',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      description: '恭喜！你的入驻申请已通过审核',
      detail: '现在你可以创建AI分身，开始接单赚钱了！',
    },
    rejected: {
      icon: XCircle,
      title: '审核未通过',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      description: '你的入驻申请未通过审核',
      detail: '请查看审核反馈，修改后重新提交申请。',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-px h-5 bg-gray-300" />
              <Link href="/creator/onboarding" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 ml-4">入驻状态</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Status Card */}
        <div className={`card p-8 text-center border-2 ${config.borderColor}`}>
          <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${config.textColor}`} />
          </div>
          
          <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h2>
          <p className="text-gray-600 mb-2">{config.description}</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{config.detail}</p>

          {status === 'approved' && (
            <div className="mt-8 space-y-3">
              <Link href="/creator/avatars/create" className="btn-primary btn-lg inline-flex">
                <Sparkles className="w-5 h-5 mr-2" />
                创建AI分身
              </Link>
              <p className="text-sm text-gray-500">
                创建分身后即可开始接单
              </p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="mt-8 space-y-3">
              <Link href="/creator/onboarding/apply" className="btn-primary inline-flex">
                重新申请
              </Link>
            </div>
          )}

          {status === 'submitted' && (
            <div className="mt-8">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>预计审核时间：1-3个工作日</span>
              </div>
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">申请信息</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">申请编号</span>
              <span className="font-medium">APP-20240408-001</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">申请时间</span>
              <span className="font-medium">2024-04-08 14:30</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">申请职业</span>
              <span className="font-medium">产品经理</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">审核状态</span>
              <span className={`badge-${config.color}`}>{config.title}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {status === 'approved' && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">下一步</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">创建AI分身</h4>
                  <p className="text-sm text-gray-600">填写分身信息，上传训练材料</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">等待分身上架</h4>
                  <p className="text-sm text-gray-600">分身审核通过后即可对外展示</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">开始接单</h4>
                  <p className="text-sm text-gray-600">雇佣方可以在市场找到你的分身</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {status === 'rejected' && (
          <div className="card p-6 mt-6 border-red-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-red-500" />
              审核反馈
            </h3>
            
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                工作经历描述不够详细，请补充具体项目经验和成果。建议上传相关作品或案例以增加通过率。
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-gray-900">改进建议：</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>详细描述过往项目经历</li>
                <li>补充量化成果数据</li>
                <li>上传作品集或案例</li>
              </ul>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">需要帮助？</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/creator/messages" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">联系客服</h4>
                <p className="text-sm text-gray-500">在线咨询</p>
              </div>
            </Link>
            
            <a href="#" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">入驻指南</h4>
                <p className="text-sm text-gray-500">查看详细说明</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
