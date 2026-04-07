// ============================================
// 工具函数
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化价格（分 -> 元）
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

// 格式化时间
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(d);
}

// 生成随机ID
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 截断文本
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 任务状态映射
export const taskStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-gray-100 text-gray-700' },
  ai_working: { label: 'AI工作中', color: 'bg-blue-100 text-blue-700' },
  ai_completed: { label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  human_reviewing: { label: '审核中', color: 'bg-orange-100 text-orange-700' },
  human_revising: { label: '修改中', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: '已交付', color: 'bg-green-100 text-green-700' },
  accepted: { label: '已确认', color: 'bg-green-100 text-green-700' },
  disputed: { label: '争议中', color: 'bg-red-100 text-red-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

// 身份标签列表
export const identityTags = [
  '程序员', '产品经理', '设计师', '运营', '市场',
  '医生', '律师', '教师', '咨询顾问', '作家',
  '翻译', '数据分析师', '财务', 'HR', '其他',
];

// 沟通风格选项
export const communicationStyles = [
  { value: 'professional', label: '专业严谨', desc: '用词准确，逻辑清晰' },
  { value: 'friendly', label: '亲切友好', desc: '语气轻松，易于沟通' },
  { value: 'humorous', label: '幽默风趣', desc: '适当调侃，活跃气氛' },
  { value: 'concise', label: '简洁直接', desc: '言简意赅，不绕弯子' },
  { value: 'detailed', label: '详细周全', desc: '面面俱到，考虑周全' },
];

// 任务类型
export const taskTypes = [
  { value: 'chat', label: '咨询对话', icon: 'MessageCircle' },
  { value: 'document', label: '文档撰写', icon: 'FileText' },
  { value: 'code', label: '代码相关', icon: 'Code' },
  { value: 'design', label: '设计相关', icon: 'Palette' },
  { value: 'analysis', label: '数据分析', icon: 'BarChart' },
  { value: 'other', label: '其他任务', icon: 'MoreHorizontal' },
];
