'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bot, Star, Briefcase, MessageCircle, FileText, 
  CheckCircle, Clock, ChevronRight, User, Award, TrendingUp
} from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  identity: string[];
  avatar: string;
  bio: string;
  rating: number;
  totalHires: number;
  reviewCount: number;
  responseTime: string;
  completionRate: number;
  joinDate: string;
  skills: string[];
  resume: {
    education: string;
    experience: string[];
    certifications: string[];
  };
}

interface Avatar {
  id: string;
  name: string;
  description: string;
  price: {
    type: 'per_task' | 'hourly' | 'subscription';
    min?: number;
    max?: number;
    rate?: number;
    monthly?: number;
    yearly?: number;
  };
  expertise: string[];
  canDo: string[];
  cannotDo: string[];
}

interface CreatorDetailClientProps {
  creator: Creator;
  avatars: Avatar[];
}

export default function CreatorDetailClient({ creator, avatars }: CreatorDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'avatars' | 'resume'>('avatars');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700" title="返回首页">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-px h-5 bg-gray-300" />
              <Link href="/client/market" className="text-gray-500 hover:text-gray-700">
                <span className="text-sm">分身市场</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 ml-4">创作者详情</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{creator.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {creator.identity.map((id) => (
                      <span key={id} className="badge-blue text-sm">
                        {id}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 max-w-2xl">{creator.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-xl font-bold text-gray-900">{creator.rating}</span>
                    </div>
                    <span className="text-gray-500">{creator.reviewCount}条评价</span>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-blue-600 mb-1">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-xl font-bold text-gray-900">{creator.totalHires}</span>
                    </div>
                    <span className="text-gray-500">次雇佣</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <span key={skill} className="badge-gray text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>响应时间: {creator.responseTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>完成率: {creator.completionRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>入驻时间: {creator.joinDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  咨询创作者
                </button>
                <button 
                  onClick={() => setActiveTab('resume')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  查看简历
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'avatars' 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            所有分身 ({avatars.length})
            {activeTab === 'avatars' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'resume' 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            创作者简历
            {activeTab === 'resume' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'avatars' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="card hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Avatar Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{avatar.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">by {creator.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{avatar.description}</p>

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {avatar.expertise.map((exp) => (
                      <span key={exp} className="badge-gray text-xs">
                        {exp}
                      </span>
                    ))}
                  </div>

                  {/* Can Do / Cannot Do */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{avatar.canDo.join('、')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">{avatar.cannotDo.join('、')}</span>
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {avatar.price.type === 'per_task' ? (
                        <div className="text-sm">
                          <span className="text-gray-500">按任务</span>
                          <div className="font-semibold text-gray-900">
                            {formatPrice(avatar.price.min!)} - {formatPrice(avatar.price.max!)}
                          </div>
                        </div>
                      ) : avatar.price.type === 'hourly' ? (
                        <div className="text-sm">
                          <span className="text-gray-500">按小时</span>
                          <div className="font-semibold text-gray-900">
                            {formatPrice(avatar.price.rate!)}/小时
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="text-gray-500">订阅</span>
                          <div className="font-semibold text-gray-900">
                            {formatPrice(avatar.price.monthly!)}/月
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setShowHireModal(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      立即雇佣
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">创作者简历</h2>
            
            {/* Education */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                教育背景
              </h3>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                {creator.resume.education}
              </p>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                工作经历
              </h3>
              <div className="space-y-2">
                {creator.resume.experience.map((exp, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                    <span className="text-gray-600">{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                专业认证
              </h3>
              <div className="flex flex-wrap gap-2">
                {creator.resume.certifications.map((cert) => (
                  <span key={cert} className="badge-blue text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">咨询 {creator.name}</h3>
            <p className="text-gray-600 mb-4">
              你可以向创作者咨询服务内容、价格、交付时间等问题。
            </p>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg mb-4"
              rows={4}
              placeholder="请输入你的问题..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  alert('消息已发送！创作者会尽快回复你。');
                }}
                className="flex-1 btn-primary"
              >
                发送消息
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hire Modal */}
      {showHireModal && selectedAvatar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">雇佣 {selectedAvatar.name}</h3>
            <p className="text-gray-600 mb-6">by {creator.name}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务描述
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  rows={4}
                  placeholder="请详细描述你需要完成的任务..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预算范围
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="flex-1 p-3 border border-gray-200 rounded-lg"
                    placeholder="最低预算"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    className="flex-1 p-3 border border-gray-200 rounded-lg"
                    placeholder="最高预算"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期望交付时间
                </label>
                <select className="w-full p-3 border border-gray-200 rounded-lg">
                  <option>3天内</option>
                  <option>1周内</option>
                  <option>2周内</option>
                  <option>1个月内</option>
                  <option>可协商</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">服务费用</span>
                <span className="font-medium">
                  {selectedAvatar.price.type === 'per_task' 
                    ? `${formatPrice(selectedAvatar.price.min!)} - ${formatPrice(selectedAvatar.price.max!)}`
                    : selectedAvatar.price.type === 'hourly'
                    ? `${formatPrice(selectedAvatar.price.rate!)}/小时`
                    : `${formatPrice(selectedAvatar.price.monthly!)}/月`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">平台服务费 (5%)</span>
                <span className="font-medium">待计算</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">预估总计</span>
                  <span className="font-bold text-blue-600">根据实际协商</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHireModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <Link
                href={`/client/payment?avatarId=${selectedAvatar.id}&creatorId=${creator.id}`}
                className="flex-1 btn-primary text-center"
              >
                确认雇佣
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
