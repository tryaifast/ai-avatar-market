// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Star, Briefcase, Clock, ChevronRight,
  Bot, User, MessageCircle
} from 'lucide-react';

// 模拟数据
const mockAvatars = [
  {
    id: 'avatar_1',
    name: '代码审查助手·小明',
    description: '专注前端代码审查，熟悉React/Vue/TypeScript。帮你发现潜在bug，优化代码结构。',
    avatar: '/avatars/1.png',
    creatorId: 'creator_1',
    creator: {
      id: 'creator_1',
      name: '张明',
      identity: ['程序员'],
      avatar: '/avatars/creator1.png',
      bio: '10年前端开发经验，曾就职于阿里巴巴、字节跳动。擅长前端架构设计和性能优化。',
      rating: 4.9,
      totalHires: 320,
      reviewCount: 156,
    },
    personality: {
      expertise: ['前端开发', '代码审查', '性能优化'],
      communicationStyle: 'professional',
    },
    pricing: {
      type: 'per_task' as const,
      perTask: { min: 500, max: 2000, estimate: '根据代码量' },
    },
    stats: {
      hiredCount: 128,
      rating: 4.9,
      reviewCount: 86,
    },
  },
  {
    id: 'avatar_2',
    name: '产品经理·Lisa',
    description: '10年产品经验，擅长需求分析、PRD撰写、竞品分析。帮你理清产品思路。',
    avatar: '/avatars/2.png',
    creatorId: 'creator_2',
    creator: {
      id: 'creator_2',
      name: '李莎',
      identity: ['产品经理'],
      avatar: '/avatars/creator2.png',
      bio: '前腾讯高级产品经理，主导过多款千万级用户产品。擅长从0到1的产品设计和用户增长。',
      rating: 4.8,
      totalHires: 280,
      reviewCount: 134,
    },
    personality: {
      expertise: ['需求分析', 'PRD撰写', '竞品分析'],
      communicationStyle: 'friendly',
    },
    pricing: {
      type: 'per_task' as const,
      perTask: { min: 1000, max: 5000, estimate: '根据复杂度' },
    },
    stats: {
      hiredCount: 89,
      rating: 4.8,
      reviewCount: 62,
    },
  },
  {
    id: 'avatar_3',
    name: '文案策划·阿文',
    description: '资深文案，擅长品牌文案、社交媒体内容、广告创意。让你的内容更有传播力。',
    avatar: '/avatars/3.png',
    creatorId: 'creator_3',
    creator: {
      id: 'creator_3',
      name: '王文',
      identity: ['运营'],
      avatar: '/avatars/creator3.png',
      bio: '8年品牌运营经验，服务过50+知名品牌。擅长爆款内容策划和社媒运营。',
      rating: 4.7,
      totalHires: 450,
      reviewCount: 289,
    },
    personality: {
      expertise: ['品牌文案', '社媒运营', '创意策划'],
      communicationStyle: 'humorous',
    },
    pricing: {
      type: 'subscription' as const,
      subscription: { monthly: 29900, yearly: 299900 },
    },
    stats: {
      hiredCount: 256,
      rating: 4.7,
      reviewCount: 178,
    },
  },
  {
    id: 'avatar_4',
    name: '数据分析·DataPro',
    description: '数据分析师，精通SQL/Python/Excel。帮你从数据中发现洞察，做出数据驱动决策。',
    avatar: '/avatars/4.png',
    creatorId: 'creator_4',
    creator: {
      id: 'creator_4',
      name: '陈数',
      identity: ['数据分析师'],
      avatar: '/avatars/creator4.png',
      bio: '数学博士，曾任职于美团、京东数据分析部门。专注用户行为分析和商业智能。',
      rating: 4.9,
      totalHires: 180,
      reviewCount: 98,
    },
    personality: {
      expertise: ['数据分析', 'SQL', 'Python', '可视化'],
      communicationStyle: 'detailed',
    },
    pricing: {
      type: 'per_task' as const,
      perTask: { min: 800, max: 3000, estimate: '根据数据量' },
    },
    stats: {
      hiredCount: 67,
      rating: 4.9,
      reviewCount: 45,
    },
  },
  {
    id: 'avatar_5',
    name: '法律顾问·正义',
    description: '执业律师，专注合同法、知识产权、劳动法。为你提供专业的法律建议。',
    avatar: '/avatars/5.png',
    creatorId: 'creator_5',
    creator: {
      id: 'creator_5',
      name: '刘正',
      identity: ['律师'],
      avatar: '/avatars/creator5.png',
      bio: '执业15年，曾任职于金杜律师事务所。擅长企业法务、知识产权保护和劳动纠纷处理。',
      rating: 4.8,
      totalHires: 220,
      reviewCount: 145,
    },
    personality: {
      expertise: ['合同法', '知识产权', '劳动法'],
      communicationStyle: 'professional',
    },
    pricing: {
      type: 'per_task' as const,
      perTask: { min: 2000, max: 10000, estimate: '根据咨询类型' },
    },
    stats: {
      hiredCount: 45,
      rating: 4.8,
      reviewCount: 32,
    },
  },
  {
    id: 'avatar_6',
    name: 'UI设计·Pixel',
    description: 'UI/UX设计师，擅长移动端和Web设计。帮你做出美观且易用的界面。',
    avatar: '/avatars/6.png',
    creatorId: 'creator_6',
    creator: {
      id: 'creator_6',
      name: '赵艺',
      identity: ['设计师'],
      avatar: '/avatars/creator6.png',
      bio: '前Apple设计师，专注于用户体验设计。作品获得多项国际设计大奖。',
      rating: 4.9,
      totalHires: 350,
      reviewCount: 198,
    },
    personality: {
      expertise: ['UI设计', 'UX设计', 'Figma', '原型设计'],
      communicationStyle: 'friendly',
    },
    pricing: {
      type: 'per_task' as const,
      perTask: { min: 1500, max: 8000, estimate: '根据页面数' },
    },
    stats: {
      hiredCount: 112,
      rating: 4.9,
      reviewCount: 89,
    },
  },
];

const identityFilters = ['全部', '程序员', '产品经理', '设计师', '运营', '律师', '数据分析师'];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState('全部');

  const filteredAvatars = mockAvatars.filter(avatar => {
    const matchesSearch = 
      avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      avatar.personality.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIdentity = 
      selectedIdentity === '全部' || 
      avatar.creator.identity.includes(selectedIdentity as any);
    
    return matchesSearch && matchesIdentity;
  });

  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(0)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Bot className="w-7 h-7 text-blue-600" />
              <span className="text-lg font-bold">AI分身市场</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/creator/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
                创作者中心
              </Link>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">分身市场</h1>
          <p className="text-gray-600 mt-1">发现适合你的AI分身，让专业人士为你服务</p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索分身名称、技能、领域..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {identityFilters.map((identity) => (
                <button
                  key={identity}
                  onClick={() => setSelectedIdentity(identity)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedIdentity === identity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {identity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          找到 <span className="font-semibold">{filteredAvatars.length}</span> 个分身
        </div>

        {/* Avatar Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvatars.map((avatar) => (
            <div key={avatar.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Avatar Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{avatar.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-600">{avatar.creator.name}</span>
                      <span className="badge-blue text-xs">{avatar.creator.identity[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{avatar.description}</p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {avatar.personality.expertise.slice(0, 3).map((exp) => (
                    <span key={exp} className="badge-gray text-xs">
                      {exp}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{avatar.stats.rating}</span>
                    <span>({avatar.stats.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{avatar.stats.hiredCount}次雇佣</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {avatar.pricing.type === 'per_task' ? (
                      <div className="text-sm">
                        <span className="text-gray-500">按任务</span>
                        <div className="font-semibold text-gray-900">
                          {formatPrice(avatar.pricing.perTask!.min)} - {formatPrice(avatar.pricing.perTask!.max)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="text-gray-500">订阅</span>
                        <div className="font-semibold text-gray-900">
                          {formatPrice(avatar.pricing.subscription!.monthly)}/月
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/client/creator/${avatar.creatorId}`}
                    className="btn-primary text-sm"
                  >
                    雇佣
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAvatars.length === 0 && (
          <div className="text-center py-16">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的分身</h3>
            <p className="text-gray-600">试试调整搜索关键词或筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
