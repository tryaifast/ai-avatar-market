import { redirect } from 'next/navigation';

// 首页重定向到landing页面
export default function HomePage() {
  redirect('/landing');
}
