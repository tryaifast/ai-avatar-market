import CreatorDetailClient from './CreatorDetailClient';

// 创作者数据
const creatorsData: Record<string, Creator> = {
  'creator_1': {
    id: 'creator_1',
    name: '张明',
    identity: ['程序员', '前端架构师'],
    avatar: '/avatars/creator1.png',
    bio: '10年前端开发经验，曾就职于阿里巴巴、字节跳动。擅长前端架构设计和性能优化。GitHub 10k+ stars开源作者。',
    rating: 4.9,
    totalHires: 320,
    reviewCount: 156,
    responseTime: '平均2小时内',
    completionRate: 98,
    joinDate: '2024-01',
    skills: ['React', 'Vue', 'TypeScript', 'Node.js', '前端架构', '性能优化'],
    resume: {
      education: '计算机科学硕士',
      experience: [
        '阿里巴巴 高级前端工程师 (2018-2022)',
        '字节跳动 前端架构师 (2022-2024)',
        '自由职业技术顾问 (2024-至今)'
      ],
      certifications: ['AWS认证架构师', 'Google认证开发者']
    }
  },
  'creator_2': {
    id: 'creator_2',
    name: '李莎',
    identity: ['产品经理', '产品总监'],
    avatar: '/avatars/creator2.png',
    bio: '前腾讯高级产品经理，主导过多款千万级用户产品。擅长从0到1的产品设计和用户增长策略。',
    rating: 4.8,
    totalHires: 280,
    reviewCount: 134,
    responseTime: '平均1小时内',
    completionRate: 96,
    joinDate: '2024-02',
    skills: ['产品设计', '需求分析', '用户研究', '数据分析', '增长策略', '竞品分析'],
    resume: {
      education: '工商管理硕士',
      experience: [
        '腾讯 高级产品经理 (2016-2020)',
        '美团 产品总监 (2020-2023)',
        'AI产品顾问 (2023-至今)'
      ],
      certifications: ['PMP项目管理认证', 'NPDP产品经理认证']
    }
  },
  'creator_3': {
    id: 'creator_3',
    name: '王文',
    identity: ['运营专家', '品牌策划'],
    avatar: '/avatars/creator3.png',
    bio: '8年品牌运营经验，服务过50+知名品牌。擅长爆款内容策划和社媒运营，累计创造10亿+阅读量。',
    rating: 4.7,
    totalHires: 450,
    reviewCount: 289,
    responseTime: '平均30分钟内',
    completionRate: 94,
    joinDate: '2024-01',
    skills: ['品牌营销', '内容策划', '社媒运营', '短视频', '广告投放', '舆情管理'],
    resume: {
      education: '新闻传播学学士',
      experience: [
        '奥美广告 资深文案 (2015-2018)',
        '新榜 内容运营总监 (2018-2022)',
        '独立品牌顾问 (2022-至今)'
      ],
      certifications: ['新媒体运营师', '品牌营销师']
    }
  },
  'creator_4': {
    id: 'creator_4',
    name: '陈数',
    identity: ['数据分析师', '数据科学家'],
    avatar: '/avatars/creator4.png',
    bio: '数学博士，曾任职于美团、京东数据分析部门。专注用户行为分析和商业智能，发表多篇数据分析论文。',
    rating: 4.9,
    totalHires: 180,
    reviewCount: 98,
    responseTime: '平均3小时内',
    completionRate: 99,
    joinDate: '2024-03',
    skills: ['数据分析', 'SQL', 'Python', '机器学习', '数据可视化', 'AB测试'],
    resume: {
      education: '应用数学博士',
      experience: [
        '美团 高级数据分析师 (2017-2020)',
        '京东 数据科学专家 (2020-2024)',
        '数据咨询顾问 (2024-至今)'
      ],
      certifications: ['Google数据分析认证', 'AWS机器学习认证']
    }
  },
  'creator_5': {
    id: 'creator_5',
    name: '刘正',
    identity: ['律师', '法律顾问'],
    avatar: '/avatars/creator5.png',
    bio: '执业15年，曾任职于金杜律师事务所。擅长企业法务、知识产权保护和劳动纠纷处理，服务过100+企业客户。',
    rating: 4.8,
    totalHires: 220,
    reviewCount: 145,
    responseTime: '平均4小时内',
    completionRate: 97,
    joinDate: '2024-02',
    skills: ['合同法', '知识产权', '劳动法', '公司法', '合规审查', '争议解决'],
    resume: {
      education: '法学硕士',
      experience: [
        '金杜律师事务所 执业律师 (2009-2018)',
        '某上市公司 法务总监 (2018-2023)',
        '独立法律顾问 (2023-至今)'
      ],
      certifications: ['执业律师资格证', '专利代理人资格证']
    }
  },
  'creator_6': {
    id: 'creator_6',
    name: '赵艺',
    identity: ['UI设计师', 'UX设计师'],
    avatar: '/avatars/creator6.png',
    bio: '前Apple设计师，专注于用户体验设计。作品获得多项国际设计大奖，包括红点奖和iF设计奖。',
    rating: 4.9,
    totalHires: 350,
    reviewCount: 198,
    responseTime: '平均2小时内',
    completionRate: 98,
    joinDate: '2024-01',
    skills: ['UI设计', 'UX设计', 'Figma', 'Sketch', '原型设计', '设计系统'],
    resume: {
      education: '视觉传达设计硕士',
      experience: [
        'Apple 产品设计师 (2015-2019)',
        'Frog Design 资深设计师 (2019-2022)',
        '独立设计顾问 (2022-至今)'
      ],
      certifications: ['Adobe认证专家', 'Figma高级认证']
    }
  },
};

// 分身数据
const avatarsData: Record<string, Avatar[]> = {
  'creator_1': [
    {
      id: 'avatar_1',
      name: '代码审查助手·小明',
      description: '专注前端代码审查，熟悉React/Vue/TypeScript。帮你发现潜在bug，优化代码结构。',
      price: { type: 'per_task', min: 500, max: 2000 },
      expertise: ['前端开发', '代码审查', '性能优化'],
      canDo: ['代码审查', '技术方案', 'Bug排查', '性能优化'],
      cannotDo: ['直接访问您的代码库', '执行代码部署'],
    },
    {
      id: 'avatar_1_2',
      name: '前端架构顾问',
      description: '为你的项目提供前端架构设计、技术选型、性能优化方案。',
      price: { type: 'hourly', rate: 800 },
      expertise: ['前端架构', '技术选型', '团队协作'],
      canDo: ['架构设计', '技术评审', '团队培训', '代码规范制定'],
      cannotDo: ['直接编写业务代码', '长期驻场开发'],
    }
  ],
  'creator_2': [
    {
      id: 'avatar_2',
      name: '产品经理·Lisa',
      description: '10年产品经验，擅长需求分析、PRD撰写、竞品分析。帮你理清产品思路。',
      price: { type: 'per_task', min: 1000, max: 5000 },
      expertise: ['需求分析', 'PRD撰写', '竞品分析'],
      canDo: ['需求分析', '产品规划', '竞品调研', '用户访谈'],
      cannotDo: ['UI设计', '实际开发'],
    },
    {
      id: 'avatar_2_2',
      name: '产品增长顾问',
      description: '专注用户增长策略，帮你设计增长实验和数据分析方案。',
      price: { type: 'hourly', rate: 1200 },
      expertise: ['增长策略', '数据分析', '用户研究'],
      canDo: ['增长策略', 'A/B测试设计', '数据分析', '用户调研'],
      cannotDo: ['执行推广活动', '代理运营'],
    }
  ],
  'creator_3': [
    {
      id: 'avatar_3',
      name: '文案策划·阿文',
      description: '资深文案，擅长品牌文案、社交媒体内容、广告创意。让你的内容更有传播力。',
      price: { type: 'subscription', monthly: 29900, yearly: 299900 },
      expertise: ['品牌文案', '社媒运营', '创意策划'],
      canDo: ['品牌文案', '社媒内容', '创意策划', '内容策略'],
      cannotDo: ['线下活动执行', '媒介投放'],
    },
    {
      id: 'avatar_3_2',
      name: '短视频脚本顾问',
      description: '专注于短视频内容策划和脚本撰写，帮你打造爆款视频。',
      price: { type: 'per_task', min: 800, max: 3000 },
      expertise: ['短视频', '脚本撰写', '内容策划'],
      canDo: ['脚本撰写', '内容策划', '账号诊断', '选题建议'],
      cannotDo: ['视频拍摄', '后期制作'],
    }
  ],
  'creator_4': [
    {
      id: 'avatar_4',
      name: '数据分析·DataPro',
      description: '数据分析师，精通SQL/Python/Excel。帮你从数据中发现洞察，做出数据驱动决策。',
      price: { type: 'per_task', min: 800, max: 3000 },
      expertise: ['数据分析', 'SQL', 'Python', '可视化'],
      canDo: ['数据分析', '报表制作', '数据清洗', '可视化'],
      cannotDo: ['数据抓取', '系统开发'],
    },
    {
      id: 'avatar_4_2',
      name: 'AB测试顾问',
      description: '专注于实验设计和效果评估，帮你科学地优化产品。',
      price: { type: 'hourly', rate: 1000 },
      expertise: ['AB测试', '实验设计', '统计分析'],
      canDo: ['实验设计', '样本量计算', '效果评估', '报告撰写'],
      cannotDo: ['实验系统搭建', '长期数据分析'],
    }
  ],
  'creator_5': [
    {
      id: 'avatar_5',
      name: '法律顾问·正义',
      description: '执业律师，专注合同法、知识产权、劳动法。为你提供专业的法律建议。',
      price: { type: 'per_task', min: 2000, max: 10000 },
      expertise: ['合同法', '知识产权', '劳动法'],
      canDo: ['合同审查', '法律咨询', '风险评估', '文书起草'],
      cannotDo: ['出庭代理', '代做账'],
    },
    {
      id: 'avatar_5_2',
      name: '企业合规顾问',
      description: '为企业提供合规审查和风险防控方案，降低法律风险。',
      price: { type: 'hourly', rate: 1500 },
      expertise: ['企业合规', '风险防控', '制度建设'],
      canDo: ['合规审查', '制度建设', '风险评估', '培训指导'],
      cannotDo: ['法律诉讼', '政府沟通'],
    }
  ],
  'creator_6': [
    {
      id: 'avatar_6',
      name: 'UI设计·Pixel',
      description: 'UI/UX设计师，擅长移动端和Web设计。帮你做出美观且易用的界面。',
      price: { type: 'per_task', min: 1500, max: 8000 },
      expertise: ['UI设计', 'UX设计', 'Figma', '原型设计'],
      canDo: ['界面设计', '原型制作', '设计规范', '设计评审'],
      cannotDo: ['前端开发', '品牌设计'],
    },
    {
      id: 'avatar_6_2',
      name: 'UX体验顾问',
      description: '专注于用户体验研究和设计策略，提升产品用户满意度。',
      price: { type: 'hourly', rate: 1200 },
      expertise: ['用户研究', '体验设计', '可用性测试'],
      canDo: ['用户研究', '体验设计', '可用性测试', '设计策略'],
      cannotDo: ['视觉设计', '交互开发'],
    }
  ],
};

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

// 生成静态参数
export function generateStaticParams() {
  return [
    { id: 'creator_1' },
    { id: 'creator_2' },
    { id: 'creator_3' },
    { id: 'creator_4' },
    { id: 'creator_5' },
    { id: 'creator_6' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorPage({ params }: PageProps) {
  const { id } = await params;
  const creator = creatorsData[id];
  const avatars = avatarsData[id] || [];

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">创作者未找到</h1>
          <p className="text-gray-600 mb-4">该创作者不存在或已被下架</p>
          <a href="/client/market" className="text-blue-600 hover:underline">
            返回市场
          </a>
        </div>
      </div>
    );
  }

  return <CreatorDetailClient creator={creator} avatars={avatars} />;
}
