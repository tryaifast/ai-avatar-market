import { HirePageClient } from './HirePageClient';

// 静态导出需要生成参数
export function generateStaticParams() {
  // 生成一些示例ID，实际使用中可以通过API获取所有ID
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'demo' },
  ];
}

export default function HirePage({ params }: { params: { id: string } }) {
  return <HirePageClient avatarId={params.id} />;
}
