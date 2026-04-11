import { HirePageClient } from './HirePageClient';

export default function HirePage({ params }: { params: { id: string } }) {
  return <HirePageClient avatarId={params.id} />;
}
