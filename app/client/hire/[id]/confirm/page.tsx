import { mockApi } from '@/lib/mock/data';
import HireConfirmClient from './HireConfirmClient';

// 生成静态参数
export async function generateStaticParams() {
  const avatars = await mockApi.getAvatars();
  return avatars.map((avatar) => ({
    id: avatar.id,
  }));
}

export default function HireConfirmPage({ params }: { params: { id: string } }) {
  return <HireConfirmClient avatarId={params.id} />;
}
