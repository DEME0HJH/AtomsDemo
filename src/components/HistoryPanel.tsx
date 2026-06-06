'use client';

import { useState, useEffect, useCallback } from 'react';
import { GeneratedApp } from '@/types';
import { getApps, deleteApp } from '@/lib/storage';
import { History, Trash2, ExternalLink, Clock, Download, Upload } from 'lucide-react';
import { exportData, importData } from '@/lib/indexedDB';
import { useToast } from '@/components/Toast';

interface HistoryPanelProps {
  onSelectApp: (app: GeneratedApp) => void;
  selectedAppId?: string;
}

export default function HistoryPanel({ onSelectApp, selectedAppId }: HistoryPanelProps) {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const { showToast } = useToast();

  const refresh = useCallback(() => {
    setApps(getApps());
  }, []);

  useEffect(() => {
    refresh();
    // Listen for storage changes from other components
    const handleStorageChange = () => refresh();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('atoms:historyUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('atoms:historyUpdated', handleStorageChange);
    };
  }, [refresh]);

  const handleDelete = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    deleteApp(appId);
    refresh();
    showToast('已删除应用', 'info');
  };

  const handleSelect = (app: GeneratedApp) => {
    onSelectApp(app);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atoms-demo-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('数据导出成功', 'success');
    } catch {
      showToast('数据导出失败', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      refresh();
      showToast('数据导入成功', 'success');
    } catch {
      showToast('数据导入失败，请检查文件格式', 'error');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className={`flex flex-col bg-atoms-card border-r border-atoms-border transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-12'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-atoms-border">
        {isOpen && (
          <div className="flex items-center gap-2 text-atoms-text">
            <History size={18} aria-hidden="true" />
            <span className="font-medium text-sm">生成历史</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md hover:bg-atoms-border text-atoms-textMuted transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
          aria-label={isOpen ? '收起侧边栏' : '展开侧边栏'}
          aria-expanded={isOpen}
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {/* List */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto">
            {apps.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-atoms-textMuted">
                <Clock size={32} className="mb-2 opacity-50" aria-hidden="true" />
                <p className="text-sm text-center">暂无生成记录</p>
                <p className="text-xs text-center mt-1">在左侧输入需求开始生成</p>
              </div>
            ) : (
              <div className="p-2 space-y-1" role="list" aria-label="应用历史列表">
                {apps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => handleSelect(app)}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleSelect(app)}
                    className={`group flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                      selectedAppId === app.id
                        ? 'bg-atoms-accent/20 border border-atoms-accent'
                        : 'hover:bg-atoms-border border border-transparent'
                    }`}
                    aria-selected={selectedAppId === app.id}
                    aria-label={`${app.name}, ${new Date(app.createdAt).toLocaleDateString('zh-CN')}`}
                  >
                    <ExternalLink size={14} className="mt-0.5 text-atoms-textMuted flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-atoms-text truncate">{app.name}</div>
                      <div className="text-xs text-atoms-textMuted mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <button
                      onClick={e => handleDelete(e, app.id)}
                      className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 p-1 rounded hover:bg-atoms-error/20 text-atoms-textMuted hover:text-atoms-error transition-all focus:outline-none focus:ring-2 focus:ring-atoms-error"
                      aria-label={`删除 ${app.name}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export/Import */}
          <div className="p-2 border-t border-atoms-border space-y-1">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
              aria-label="导出数据"
            >
              <Download size={14} aria-hidden="true" />
              导出数据
            </button>
            <label className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-atoms-accent">
              <Upload size={14} aria-hidden="true" />
              导入数据
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="sr-only"
                aria-label="选择导入文件"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
