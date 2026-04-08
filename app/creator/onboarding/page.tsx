'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { 
  Sparkles, Shield, TrendingUp, Users, ArrowRight, 
  CheckCircle, Clock, DollarSign, Bot
} from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: '变现你的经验',
    description: '将你的专业知识转化为收入，每次被雇佣都能获得收益',
  },
  {
    icon: Clock,
    title: '7x24小时在线',
    description: 'AI分身全天候为你工作，即使你睡觉时也能接单',
  },
  {
    icon: Users,
    title: '扩大影响力',
    description: '让你的专业知识帮助更多人，建立个人品牌',
  },
  {
    icon: Shield,
    title: '知识产权保障',
    description: '平台提供版权认证，保护你的知识资产',
  },
];

const steps = [
  { step: 1, title: '提交申请', desc: '填写基本信息和工作经历' },
  { step: 2, title: '审核通过', desc: '平台审核你的专业资质' },
  { step: 3, title: '创建分身', desc: '上传AI训练材料' },
  { step: 4, title: '开始接单', desc: '分身上架，接受雇佣' },
];

export default function OnboardingPage() {
  const { user } = useAppStore();

  const getStatusBadge = () => {
    switch (user?.onboardingStatus) {
      case 'approved':
        return <span className="badge-green">已入驻</span>;
      case 'submitted':
        return <span className="badge-yellow">审核中</span>;
      case 'rejected':
        return <span className="badge-red">未通过</span>;
      default:
        return <span className="badge-gray">未入驻</span>;
    }
  };

  const getActionButton = () => {
    switch (user?.onboardingStatus) {
      case 'approved':
        return (
          <Link href="/creator/avatars/create" className="btn-primary btn-lg">
            <Bot className="w-5 h-5 mr-2" />
            创建AI分身
          </Link>
        );
      case 'submitted':
        return (
          <Link href="/creator/onboarding/status" className="btn-primary btn-lg">
            <Clock className="w-5 h-5 mr-2" />
            查看审核进度
          </Link>
        );
      case 'rejected':
        return (
          <Link href="/creator/onboarding/apply" className="btn-primary btn-lg">
            <ArrowRight className="w-5 h-5 mr-2" />
            重新申请
          </Link>
        );
      default:
        return (
          <Link href="/creator/onboarding/apply" className="btn-primary btn-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            立即申请入驻
          </Link>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/creator/dashboard" className="flex items-center gap-2">
              <Bot className="w-7 h-7 text-blue-600" />
              <span className="text-lg font-bold">AI分身市场</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">入驻状态:</span>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            创作者招募计划
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            让你的经验<span className="text-blue-600">创造价值</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            创建你的AI分身，将你的专业知识、工作经验植入AI，
            让AI帮你24小时接单赚钱
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {getActionButton()}
            <a href="#how-it-works" className="btn-secondary btn-lg">
              了解详情
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div>
              <div className="text-3xl font-bold text-gray-900">¥500+</div>
              <div className="text-sm text-gray-500">平均时薪</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">2,000+</div>
              <div className="text-sm text-gray-500">已入驻创作者</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-500">好评率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            为什么选择入驻
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            入驻流程
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {steps.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-2">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            入驻要求
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                基本要求
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  年满18周岁
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  具备某一领域的专业知识或技能
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  能够承担相应的法律责任
                </li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                优先考虑
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">★</span>
                  3年以上行业经验
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">★</span>
                  有成功案例或作品集
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">★</span>
                  良好的沟通能力和服务意识
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-gray-600 mb-8">
            加入数千名创作者，让AI帮你实现知识变现
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {getActionButton()}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            入驻完全免费，平台仅收取成交金额的5%作为服务费
          </p>
        </div>
      </section>
    </div>
  );
}
