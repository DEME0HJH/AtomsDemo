import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/lib/supabase/auth';

export const metadata: Metadata = {
  title: 'Atoms Demo - AI Agent 平台',
  description: '基于多智能体的 AI 原生应用生成平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
