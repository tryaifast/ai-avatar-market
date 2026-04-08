import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/useAuth';

export const metadata: Metadata = {
  title: 'AI分身市场 - 你的AI分身，创造价值',
  description: '创建、训练、出租你的AI分身。让AI帮你工作，你负责审核和收钱。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
