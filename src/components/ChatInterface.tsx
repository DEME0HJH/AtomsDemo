'use client';

import { useState, useRef, useEffect } from 'react';
import { AppMode, AgentMessage, GenerationStep, GenerationConfig, GeneratedApp } from '@/types';
import { AgentEngine } from '@/lib/agentEngine';
import { addApp, updateApp } from '@/lib/storage';
import { Send, Loader2, Sparkles, ChevronDown, Key, Bot, User, Wand2, ArrowLeft, Pencil } from 'lucide-react';
import { useToast } from '@/components/Toast';
import ApiKeyModal from '@/components/ApiKeyModal';

interface ChatInterfaceProps {
  mode: AppMode;
  onAppGenerated: (appId: string) => void;
  username: string;
  editingApp?: GeneratedApp | null;
  onCancelEdit?: () => void;
}

const templates = [
  { id: 'todo', name: '待办事项', desc: '任务管理应用' },
  { id: 'weather', name: '天气查询', desc: '实时天气展示' },
  { id: 'calculator', name: '计算器', desc: '科学计算器' },
];

export default function ChatInterface({ mode, onAppGenerated, username, editingApp, onCancelEdit }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Load editing app context
  useEffect(() => {
    if (editingApp) {
      setMessages([
        ...editingApp.messages,
        {
          agent: 'System',
          content: `--- 开始基于 "${editingApp.name}" 进行更新 ---`,
          timestamp: Date.now(),
        }
      ]);
      setInput('');
      inputRef.current?.focus();
    }
  }, [editingApp]);

  useEffect(() => {
    const key = localStorage.getItem('atoms-api-key');
    setHasApiKey(!!key);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const detectTemplateType = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('待办') || p.includes('任务') || p.includes('todo') || p.includes('清单')) return 'todo';
    if (p.includes('天气') || p.includes('weather') || p.includes('温度')) return 'weather';
    if (p.includes('计算') || p.includes('calculator') || p.includes('加减乘除')) return 'calculator';
    return 'custom';
  };

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: AgentMessage = {
      agent: 'User',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setSteps([]);
    setInput('');

    try {
      const detectedType = detectTemplateType(input.trim());
      const config: GenerationConfig = {
        prompt: input.trim(),
        templateType: detectedType as 'todo' | 'weather' | 'calculator' | 'custom',
        mode,
      };

      // If editing existing app, pass previous code as context
      if (editingApp) {
        (config as any).previousCode = editingApp.code;
        (config as any).previousName = editingApp.name;
      }

      const engine = new AgentEngine(
        mode,
        (message) => setMessages(prev => [...prev, message]),
        (step) => setSteps(prev => {
          const exists = prev.find(s => s.id === step.id);
          if (exists) {
            return prev.map(s => s.id === step.id ? step : s);
          }
          return [...prev, step];
        })
      );

      const app = await engine.generate(config);

      // If editing, update existing app instead of creating new
      if (editingApp) {
        const updatedApp: GeneratedApp = {
          ...editingApp,
          name: app.name,
          description: app.description,
          code: app.code,
          prompt: `${editingApp.prompt}\n\n[更新] ${input.trim()}`,
          steps: [...editingApp.steps, ...app.steps],
          messages: [...messages, userMessage, ...app.messages],
          usedAI: app.usedAI || editingApp.usedAI,
          createdAt: Date.now(),
        };
        await updateApp(updatedApp);
        showToast(`应用 "${updatedApp.name}" 更新成功！`, 'success');
        onAppGenerated(updatedApp.id);
      } else {
        await addApp(app);
        showToast(`应用 "${app.name}" 生成成功！${app.usedAI ? '（AI生成）' : '（模板）'}`, 'success');
        onAppGenerated(app.id);
      }

      // Reset messages for next generation
      setMessages([]);
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error('Generation failed:', error);
      showToast(editingApp ? '应用更新失败，请重试' : '应用生成失败，请重试', 'error');
      setMessages(prev => [...prev, {
        agent: 'System',
        content: '生成过程中出现错误，请重试。',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleCancelEdit = () => {
    setMessages([]);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="flex flex-col h-full" role="main" aria-label="聊天界面">
      {/* API Key Status Bar */}
      <div className="px-4 py-1.5 bg-atoms-card border-b border-atoms-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} aria-hidden="true" />
          <span className="text-xs text-atoms-textMuted">
            {hasApiKey ? '已配置 API Key' : '未配置 API Key（使用本地模板）'}
          </span>
        </div>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="text-xs text-atoms-accent hover:text-atoms-accentHover transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent rounded px-2 py-0.5"
        >
          {hasApiKey ? '更换 Key' : '配置 Key'}
        </button>
      </div>

      {/* Editing Mode Banner */}
      {editingApp && (
        <div className="px-4 py-2 bg-atoms-accent/10 border-b border-atoms-accent/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil size={14} className="text-atoms-accent" aria-hidden="true" />
            <span className="text-sm text-atoms-accent">
              正在更新: {editingApp.name}
            </span>
          </div>
          <button
            onClick={handleCancelEdit}
            className="text-xs text-atoms-textMuted hover:text-atoms-text transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent rounded px-2 py-0.5"
          >
            取消更新
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="消息记录"
      >
        {messages.length === 0 && !editingApp && (
          <div className="flex flex-col items-center justify-center h-full text-atoms-textMuted">
            <Sparkles size={48} className="mb-4 opacity-50" aria-hidden="true" />
            <h3 className="text-lg font-medium text-atoms-text mb-2">
              你好，{username}！
            </h3>
            <p className="text-sm text-center max-w-md mb-4">
              描述你想要的应用，AI 智能体团队将协作为你生成完整的代码。
              <br />
              <span className="text-xs opacity-75">例如："帮我做一个番茄钟应用"、"创建一个记账本"</span>
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    setInput(`创建一个${t.name}应用`);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-atoms-card border border-atoms-border text-sm text-atoms-textMuted hover:text-atoms-text hover:border-atoms-accent transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                  aria-label={`快速选择：${t.name}，${t.desc}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.agent === 'User' ? 'flex-row-reverse' : ''}`}
            role="article"
            aria-label={`${msg.agent} 的消息`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              msg.agent === 'User'
                ? 'bg-atoms-accent text-white'
                : msg.agent === 'System'
                ? 'bg-gray-600 text-white'
                : `bg-agent-${msg.agent.toLowerCase()} text-white`
            }`}>
              {msg.agent === 'User' ? (
                <User size={14} aria-hidden="true" />
              ) : msg.agent === 'System' ? (
                'S'
              ) : (
                <Bot size={14} aria-hidden="true" />
              )}
            </div>

            {/* Message Content */}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.agent === 'User'
                ? 'bg-atoms-accent text-white rounded-tr-sm'
                : 'bg-atoms-card border border-atoms-border text-atoms-text rounded-tl-sm'
            }`}>
              {msg.agent !== 'User' && msg.agent !== 'System' && (
                <div className="text-xs font-medium mb-1 opacity-75">
                  {msg.agent}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-atoms-textMuted animate-typing" aria-label="正在生成中">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span className="text-sm">AI 正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Steps Progress */}
      {steps.length > 0 && (
        <div className="px-4 py-2 border-t border-atoms-border bg-atoms-card" role="region" aria-label="生成进度">
          <div className="flex gap-2 overflow-x-auto">
            {steps.map(step => (
              <div
                key={step.id}
                className={`step-indicator ${step.status}`}
                aria-label={`${step.name} - ${step.status === 'completed' ? '已完成' : step.status === 'active' ? '进行中' : '等待中'}`}
              >
                <span className="text-xs">{step.agent}</span>
                <span className="text-xs opacity-75">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-atoms-border bg-atoms-card">
        <div className="flex gap-2">
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-atoms-dark border border-atoms-border text-sm text-atoms-textMuted hover:text-atoms-text transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            aria-label="配置 API Key"
            title="配置 API Key"
          >
            <Key size={16} aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-atoms-dark border border-atoms-border text-sm text-atoms-textMuted hover:text-atoms-text transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
              aria-expanded={showTemplates}
              aria-haspopup="listbox"
              aria-label="选择应用模板"
            >
              {templates.find(t => t.id === selectedTemplate)?.name || '自定义'}
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {showTemplates && (
              <div
                className="absolute bottom-full left-0 mb-1 w-40 bg-atoms-card border border-atoms-border rounded-lg shadow-lg overflow-hidden z-10"
                role="listbox"
                aria-label="模板列表"
              >
                <button
                  onClick={() => {
                    setSelectedTemplate('custom');
                    setShowTemplates(false);
                    inputRef.current?.focus();
                  }}
                  role="option"
                  aria-selected={selectedTemplate === 'custom'}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                    selectedTemplate === 'custom'
                      ? 'bg-atoms-accent/20 text-atoms-accent'
                      : 'text-atoms-text hover:bg-atoms-border'
                  }`}
                >
                  <div className="font-medium">自定义</div>
                  <div className="text-xs text-atoms-textMuted">根据描述自动匹配</div>
                </button>
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplate(t.id);
                      setShowTemplates(false);
                      inputRef.current?.focus();
                    }}
                    role="option"
                    aria-selected={selectedTemplate === t.id}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                      selectedTemplate === t.id
                        ? 'bg-atoms-accent/20 text-atoms-accent'
                        : 'text-atoms-text hover:bg-atoms-border'
                    }`}
                  >
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-atoms-textMuted">{t.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editingApp ? "描述你想要修改的内容，例如：添加一个深色模式..." : "描述你想要的应用，例如：帮我做一个番茄钟..."}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text placeholder-atoms-textMuted text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent disabled:opacity-50"
            aria-label="应用描述输入框"
            aria-disabled={isGenerating}
          />

          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 rounded-lg bg-atoms-accent hover:bg-atoms-accentHover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-atoms-accent focus:ring-offset-2 focus:ring-offset-atoms-card"
            aria-label={editingApp ? "更新应用" : "生成应用"}
            aria-disabled={!input.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : editingApp ? (
              <Pencil size={18} aria-hidden="true" />
            ) : (
              <Wand2 size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => {
        setShowApiKeyModal(false);
        const key = localStorage.getItem('atoms-api-key');
        setHasApiKey(!!key);
      }} />
    </div>
  );
}
