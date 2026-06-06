'use client';

import { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const { showToast } = useToast();

  useEffect(() => {
    // Load saved API key on open
    if (isOpen) {
      const saved = localStorage.getItem('atoms-api-key');
      const savedProvider = localStorage.getItem('atoms-api-provider') as 'openai' | 'anthropic' | 'custom';
      if (saved) setApiKey(saved);
      if (savedProvider) setProvider(savedProvider);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      showToast('请输入 API Key', 'warning');
      return;
    }

    localStorage.setItem('atoms-api-key', apiKey.trim());
    localStorage.setItem('atoms-api-provider', provider);
    showToast('API Key 已保存', 'success');
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('atoms-api-key');
    localStorage.removeItem('atoms-api-provider');
    setApiKey('');
    showToast('API Key 已清除', 'info');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div className="w-full max-w-md bg-atoms-card border border-atoms-border rounded-xl p-6 m-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-atoms-accent" aria-hidden="true" />
            <h2 id="api-key-title" className="text-lg font-bold text-atoms-text">
              配置 LLM API Key
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-atoms-border text-atoms-textMuted transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            aria-label="关闭"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm text-atoms-textMuted mb-2">选择模型提供商</label>
          <div className="flex gap-2" role="radiogroup" aria-label="模型提供商">
            {(['openai', 'anthropic', 'custom'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                role="radio"
                aria-checked={provider === p}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                  provider === p
                    ? 'bg-atoms-accent text-white'
                    : 'bg-atoms-dark text-atoms-textMuted hover:text-atoms-text border border-atoms-border'
                }`}
              >
                {p === 'openai' ? 'OpenAI' : p === 'anthropic' ? 'Anthropic' : '自定义'}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-4">
          <label htmlFor="api-key-input" className="block text-sm text-atoms-textMuted mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 pr-10 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-atoms-textMuted hover:text-atoms-text focus:outline-none focus:ring-2 focus:ring-atoms-accent rounded"
              aria-label={showKey ? '隐藏 API Key' : '显示 API Key'}
            >
              {showKey ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          <p className="text-xs text-atoms-textMuted mt-1">
            API Key 仅存储在本地浏览器中，不会上传到任何服务器。
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-atoms-accent hover:bg-atoms-accentHover text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
          >
            <Check size={16} aria-hidden="true" />
            保存
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-atoms-dark hover:bg-atoms-border text-atoms-text rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  );
}
