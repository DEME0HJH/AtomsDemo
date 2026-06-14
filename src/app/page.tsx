'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppMode, GeneratedApp } from '@/types';
import { getApps } from '@/lib/storage';
import { syncFromCloud } from '@/lib/sync';
import { Atom, BookOpen, User } from 'lucide-react';
import AgentTeam from '@/components/AgentTeam';
import ChatInterface from '@/components/ChatInterface';
import AppPreview from '@/components/AppPreview';
import HistoryPanel from '@/components/HistoryPanel';
import ModeSelector from '@/components/ModeSelector';
import OnboardingModal from '@/components/OnboardingModal';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('team');
  const [selectedApp, setSelectedApp] = useState<GeneratedApp | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [username, setUsername] = useState('用户');
  const [editingApp, setEditingApp] = useState<GeneratedApp | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('atoms-username');
    const hasSeenOnboarding = localStorage.getItem('atoms-onboarding-complete');

    if (!savedUsername || !hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      setUsername(savedUsername);
    }

    // Auto-pull cloud data on startup (anonymous or logged-in)
    syncFromCloud().then(({ downloaded }) => {
      if (downloaded > 0) {
        setRefreshHistory(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('atoms:historyUpdated'));
      }
      console.log(`[Cloud Sync] Downloaded ${downloaded} apps from cloud`);
    }).catch(() => {});
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUsername(name);
    setShowOnboarding(false);
  };

  const handleAppGenerated = useCallback((appId: string) => {
    const apps = getApps();
    const app = apps.find(a => a.id === appId);
    if (app) {
      setSelectedApp(app);
      setShowPreview(true);
      setEditingApp(null);
      setRefreshHistory(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('atoms:historyUpdated'));
    }
  }, []);

  const handleSelectApp = useCallback((app: GeneratedApp) => {
    setSelectedApp(app);
    setShowPreview(true);
    setEditingApp(null);
  }, []);

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedApp(null);
    setEditingApp(null);
  };

  const handleEditApp = useCallback((app: GeneratedApp) => {
    setEditingApp(app);
    setShowPreview(false);
    setSelectedApp(null);
  }, []);

  const handleCancelEdit = () => {
    setEditingApp(null);
  };

  return (
    <div className="flex flex-col h-screen bg-atoms-dark">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-atoms-accent focus:text-white focus:rounded-lg"
      >
        跳转到主内容
      </a>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-atoms-border bg-atoms-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-atoms-accent flex items-center justify-center" aria-hidden="true">
            <Atom size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-atoms-text">Atoms Demo</h1>
            <p className="text-xs text-atoms-textMuted">AI 智能体应用生成平台</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-atoms-dark border border-atoms-border text-sm text-atoms-textMuted">
            <User size={14} aria-hidden="true" />
            <span>{username}</span>
          </div>
          <ModeSelector mode={mode} onChange={setMode} />
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atoms-card text-atoms-textMuted hover:text-atoms-text border border-atoms-border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            aria-label="查看技术文档"
          >
            <BookOpen size={14} aria-hidden="true" />
            文档
          </a>
        </div>
      </header>

      {/* Agent Team Bar */}
      <nav className="px-4 py-3 border-b border-atoms-border" aria-label="智能体团队">
        <AgentTeam />
      </nav>

      {/* Main Content */}
      <div id="main-content" className="flex flex-1 overflow-hidden">
        {/* History Sidebar */}
        <HistoryPanel
          key={refreshHistory}
          onSelectApp={handleSelectApp}
          selectedAppId={selectedApp?.id}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {showPreview && selectedApp ? (
            <AppPreview 
              app={selectedApp} 
              onClose={handleClosePreview} 
              onEdit={handleEditApp}
            />
          ) : (
            <ChatInterface 
              mode={mode} 
              onAppGenerated={handleAppGenerated} 
              username={username}
              editingApp={editingApp}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-atoms-border bg-atoms-card text-xs text-atoms-textMuted">
        <div>基于多智能体架构的 AI 应用生成平台</div>
        <div className="flex items-center gap-4">
          <span>当前模式: {mode === 'team' ? '团队模式' : '工程师模式'}</span>
        </div>
      </footer>
    </div>
  );
}
