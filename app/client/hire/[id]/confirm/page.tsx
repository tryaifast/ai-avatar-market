import HireConfirmClient from './HireConfirmClient';

export default function HireConfirmPage({ params }: { params: { id: string } }) {
  return <HireConfirmClient avatarId={params.id} />;
}
