'use client';

import { useState } from 'react';
import { X, Mail, Lock, Github, Loader2, User } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { useToast } from '@/components/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, signInWithGitHub, user, signOut, configured } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = tab === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        setError(result.error);
      } else if (tab === 'register') {
        showToast('注册成功！请检查邮箱确认链接。', 'success');
        setTab('login');
      } else {
        showToast('登录成功！', 'success');
        onClose();
      }
    } catch {
      setError('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
    } catch {
      showToast('GitHub 登录失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-atoms-card border border-atoms-border rounded-xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-atoms-border">
          <h2 className="text-lg font-bold text-atoms-text">
            {user ? '账号' : tab === 'login' ? '登录' : '注册'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {user ? (
            /* Logged-in state */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-atoms-dark rounded-lg">
                <div className="w-10 h-10 rounded-full bg-atoms-accent flex items-center justify-center text-white font-bold">
                  {user.email?.[0]?.toUpperCase() || <User size={18} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-atoms-text">{user.email}</p>
                  <p className="text-xs text-atoms-textMuted">已登录</p>
                </div>
              </div>
              <button
                onClick={async () => { await signOut(); showToast('已退出登录', 'info'); onClose(); }}
                className="w-full px-4 py-2.5 rounded-lg bg-atoms-error/10 text-atoms-error hover:bg-atoms-error/20 text-sm font-medium transition-colors"
              >
                退出登录
              </button>
            </div>
          ) : (
            /* Login/Register form */
            <>
              {/* Tabs */}
              <div className="flex bg-atoms-dark rounded-lg p-1">
                <button
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    tab === 'login' ? 'bg-atoms-card text-atoms-text' : 'text-atoms-textMuted'
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    tab === 'register' ? 'bg-atoms-card text-atoms-text' : 'text-atoms-textMuted'
                  }`}
                >
                  注册
                </button>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-atoms-error/10 text-atoms-error text-xs">
                  {error}
                </div>
              )}

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atoms-textMuted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atoms-textMuted" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="密码"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-atoms-accent hover:bg-atoms-accentHover disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {tab === 'login' ? '登录' : '注册'}
                </button>
              </form>

              {/* Divider + GitHub OAuth — only when Supabase is configured */}
              {configured && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-atoms-border" />
                    <span className="text-xs text-atoms-textMuted">或</span>
                    <div className="flex-1 h-px bg-atoms-border" />
                  </div>

                  <button
                    onClick={handleGitHubLogin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-atoms-dark border border-atoms-border hover:border-atoms-accent text-atoms-text rounded-lg text-sm font-medium transition-colors"
                  >
                    <Github size={18} />
                    使用 GitHub 登录
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
