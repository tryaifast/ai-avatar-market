import { mockAvatars } from '@/lib/mock/data';
import HireConfirmClient from './HireConfirmClient';

// 生成静态参数
export async function generateStaticParams() {
  return mockAvatars.map((avatar) => ({
    id: avatar.id,
  }));
}

export default function HireConfirmPage({ params }: { params: { id: string } }) {
  return <HireConfirmClient avatarId={params.id} />;
}
