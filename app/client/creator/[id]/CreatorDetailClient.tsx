'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Bot, Star, Briefcase, MessageCircle, FileText, 
  CheckCircle, Clock, ChevronRight, User, Award, MapPin, 
  Download, ExternalLink, ShieldCheck, Building2
} from 'lucide-react';

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface AvatarItem {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  expertise: string[];
  pricing: {
    type: string;
    min?: number;
    max?: number;
    monthly?: number;
  };
  canDo: string[];
  cannotDo: string[];
  responseTime: string;
  stats: {
    hiredCount: number;
    completedTasks: number;
    rating: number;
    reviewCount: number;
  };
}

interface Creator {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  identity: string[];
  profession: string;
  company: string;
  experienceYears: number | null;
  skills: string[];
  experiences: Experience[];
  resumeUrl: string | null;
  portfolioUrl: string | null;
  rating: number;
  completedTasks: number;
  reviewCount: number;
  totalHires: number;
  joinDate: string;
  avatars: AvatarItem[];
}

interface CreatorDetailClientProps {
  creator: Creator;
}

export default function CreatorDetailClient({ creator }: CreatorDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'avatars' | 'resume'>('avatars');
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem | null>(null);

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  const joinDateStr = creator.joinDate 
    ? new Date(creator.joinDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/client/market" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          返回市场
        </Link>
      </div>

      {/* 创作者信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 头像 */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
              {creator.avatar ? (
                <span className="text-4xl">{creator.avatar}</span>
              ) : (
                <span className="text-3xl font-bold text-white">{creator.name[0]}</span>
              )}
            </div>
          </div>

          {/* 信息 */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{creator.name}</h1>
                
                {/* 职业 + 公司 */}
                {(creator.profession || creator.company) && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    {creator.profession && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {creator.profession}
                      </span>
                    )}
                    {creator.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {creator.company}
                      </span>
                    )}
                    {creator.experienceYears && (
                      <span className="text-gray-500">{creator.experienceYears}年经验</span>
                    )}
                  </div>
                )}

                {/* 身份标签 */}
                {creator.identity.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {creator.identity.map((id) => (
                      <span key={id} className="badge-blue text-sm">{id}</span>
                    ))}
                  </div>
                )}

                {/* 个人简介 */}
                {creator.bio && (
                  <p className="text-gray-600 max-w-2xl">{creator.bio}</p>
                )}
              </div>

              {/* 统计 */}
              <div className="flex items-center gap-6 text-sm flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-xl font-bold text-gray-900">{creator.rating || '-'}</span>
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

            {/* 技能标签 */}
            {creator.skills.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <span key={skill} className="badge-gray text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 元信息 */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>完成 {creator.completedTasks} 个任务</span>
              </div>
              {joinDateStr && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{joinDateStr} 入驻</span>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={() => setActiveTab('resume')}
                className="btn-secondary flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                查看简历
              </button>
              {creator.resumeUrl && (
                <a 
                  href={creator.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载简历
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('avatars')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'avatars' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          所有分身 ({creator.avatars.length})
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

      {/* Tab 内容 */}
      {activeTab === 'avatars' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {creator.avatars.length > 0 ? creator.avatars.map((avatar) => (
            <div key={avatar.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* 分身头部 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    {avatar.avatarUrl ? (
                      <span className="text-2xl">{avatar.avatarUrl}</span>
                    ) : (
                      <Bot className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{avatar.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">by {creator.name}</span>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 text-sm mb-4">{avatar.description}</p>

                {/* 专长标签 */}
                {avatar.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {avatar.expertise.map((exp) => (
                      <span key={exp} className="badge-gray text-xs">{exp}</span>
                    ))}
                  </div>
                )}

                {/* 能做什么 */}
                {avatar.canDo.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">可以做的事</p>
                    <div className="flex flex-wrap gap-1">
                      {avatar.canDo.slice(0, 3).map((item) => (
                        <span key={item} className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">{item}</span>
                      ))}
                      {avatar.canDo.length > 3 && (
                        <span className="text-xs text-gray-500">+{avatar.canDo.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 价格 & 操作 */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {avatar.pricing.type === 'per_task' ? (
                      <div className="text-sm">
                        <span className="text-gray-500">按任务</span>
                        <div className="font-semibold text-gray-900">
                          {avatar.pricing.min ? formatPrice(avatar.pricing.min) : '详询'}
                          {avatar.pricing.max ? ` - ${formatPrice(avatar.pricing.max)}` : ''}
                        </div>
                      </div>
                    ) : avatar.pricing.type === 'hourly' ? (
                      <div className="text-sm">
                        <span className="text-gray-500">按小时</span>
                        <div className="font-semibold text-gray-900">
                          {avatar.pricing.min ? `${formatPrice(avatar.pricing.min)}/小时` : '详询'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="text-gray-500">订阅</span>
                        <div className="font-semibold text-gray-900">
                          {avatar.pricing.monthly ? `${formatPrice(avatar.pricing.monthly)}/月` : '详询'}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/client/hire/${avatar.id}`}
                    className="btn-primary text-sm"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-16 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>该创作者暂无上架分身</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">创作者简历</h2>
          
          {/* 基本信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              基本信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creator.profession && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">职业:</span>
                  <span className="font-medium text-gray-900">{creator.profession}</span>
                </div>
              )}
              {creator.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">公司:</span>
                  <span className="font-medium text-gray-900">{creator.company}</span>
                </div>
              )}
              {creator.experienceYears && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">工作年限:</span>
                  <span className="font-medium text-gray-900">{creator.experienceYears}年</span>
                </div>
              )}
            </div>
          </div>

          {/* 技能 */}
          {creator.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                专业技能
              </h3>
              <div className="flex flex-wrap gap-2">
                {creator.skills.map((skill) => (
                  <span key={skill} className="badge-blue text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* 工作经历 */}
          {creator.experiences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                工作经历
              </h3>
              <div className="space-y-4">
                {creator.experiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 py-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">{exp.position || '职位未填写'}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{exp.company || '公司未填写'}</span>
                    </div>
                    {exp.duration && (
                      <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                    )}
                    {exp.description && (
                      <p className="text-sm text-gray-600">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 简历文件 */}
          {creator.resumeUrl && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                简历文件
              </h3>
              <a 
                href={creator.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                下载完整简历
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* 空状态提示 */}
          {!creator.profession && !creator.company && creator.experiences.length === 0 && !creator.resumeUrl && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>该创作者暂未完善简历信息</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
