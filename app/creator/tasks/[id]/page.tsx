import { mockOrders } from '@/lib/mock/data';
import { TaskDetailClient } from './TaskDetailClient';

export function generateStaticParams() {
  return mockOrders.map((order) => ({
    id: order.id,
  }));
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = mockOrders.find(o => o.id === params.id);
  return <TaskDetailClient task={task} />;
}
