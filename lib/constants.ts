// ============================================
// AI分身市场 - 共享常量配置
// ============================================

// 分身数量限制配置（按会员类型）
export const AVATAR_LIMITS: Record<string, number> = {
  free: 1,      // 免费用户1个分身
  yearly: 10,   // 年费会员10个分身
  lifetime: 10, // 终身会员10个分身
};

// 会员价格配置（单位：分）
export const MEMBERSHIP_PRICES = {
  yearly: 990,    // 年费会员 9.9元/年
  lifetime: 9900, // 终身会员 99元
} as const;

// 会员类型标签
export const MEMBERSHIP_LABELS: Record<string, string> = {
  free: '免费用户',
  yearly: '年费会员',
  lifetime: '终身会员',
};

// 会员权益对比
export const MEMBERSHIP_FEATURES = [
  {
    name: 'AI分身数量',
    free: '1个',
    yearly: '10个',
    lifetime: '10个',
  },
  {
    name: '记忆文件上传',
    free: '不支持',
    yearly: '支持（500KB/人）',
    lifetime: '支持（500KB/人）',
  },
  {
    name: '优先审核',
    free: '普通',
    yearly: '优先',
    lifetime: '最高优先',
  },
  {
    name: '专属标识',
    free: '无',
    yearly: '年费标识',
    lifetime: '终身标识',
  },
  {
    name: '客服支持',
    free: '社区',
    yearly: '在线客服',
    lifetime: '1对1专属',
  },
];
