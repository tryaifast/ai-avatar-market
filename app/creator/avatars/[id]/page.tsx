import { mockAvatars } from '@/lib/mock/data';
import { AvatarAnalyticsClient } from './AvatarAnalyticsClient';

export function generateStaticParams() {
  return mockAvatars.map((avatar) => ({
    id: avatar.id,
  }));
}

export default function AvatarAnalyticsPage({ params }: { params: { id: string } }) {
  const avatar = mockAvatars.find(a => a.id === params.id);
  return <AvatarAnalyticsClient avatar={avatar} />;
}
