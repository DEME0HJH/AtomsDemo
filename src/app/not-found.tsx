import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-atoms-dark p-4">
      <div className="max-w-md w-full bg-atoms-card border border-atoms-border rounded-xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-atoms-warning/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-atoms-warning" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-atoms-text mb-2">页面未找到</h2>
        <p className="text-sm text-atoms-textMuted mb-4">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-atoms-accent hover:bg-atoms-accentHover text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent focus:ring-offset-2 focus:ring-offset-atoms-card"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
