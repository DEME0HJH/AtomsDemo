'use client';

import { useState } from 'react';
import { X, Cloud, CloudOff, Mail, Check, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { useToast } from '@/components/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, isAnonymous, configured, loading, linkEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linked, setLinked] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    const result = await linkEmail(email.trim());
    setIsSubmitting(false);

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      setLinked(true);
      showToast('验证邮件已发送，请检查邮箱确认绑定', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-atoms-card border border-atoms-border rounded-xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-atoms-border">
          <h2 className="text-lg font-bold text-atoms-text">数据同步</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status */}
          {!configured ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10">
              <CloudOff size={20} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-400">云端未配置</p>
                <p className="text-xs text-atoms-textMuted mt-1">数据仅存在当前浏览器中</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-atoms-accent/10">
              <Loader2 size={20} className="text-atoms-accent animate-spin flex-shrink-0" />
              <p className="text-sm text-atoms-text">正在连接云端...</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10">
                <Cloud size={20} className="text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">云端同步已启用</p>
                  <p className="text-xs text-atoms-textMuted mt-1">
                    {isAnonymous
                      ? '匿名模式：数据自动保存到云端，绑定邮箱后可跨设备同步'
                      : '数据自动保存到云端，可在其他设备上访问'}
                  </p>
                </div>
              </div>

              {/* Email linking for anonymous users */}
              {isAnonymous && !linked && (
                <form onSubmit={handleLinkEmail} className="space-y-3">
                  <p className="text-xs text-atoms-textMuted">
                    绑定邮箱后，在手机/电脑上输入同一邮箱就能看到你的所有数据。
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 px-3 py-2 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-atoms-accent hover:bg-atoms-accentHover disabled:opacity-50 text-white text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                      绑定
                    </button>
                  </div>
                </form>
              )}

              {linked && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-400">验证邮件已发送，请检查邮箱</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10">
              <CloudOff size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">连接云端失败，请检查配置</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-atoms-textMuted">
            <Shield size={12} />
            数据使用 Supabase 加密存储，匿名用户数据仅你本人可访问
          </div>
        </div>
      </div>
    </div>
  );
}
