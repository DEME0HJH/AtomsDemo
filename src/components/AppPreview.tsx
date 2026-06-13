'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GeneratedApp, AppFile } from '@/types';
import { X, Code, Eye, Download, MessageSquare, Bot, Pencil, Save, FolderTree, Rocket } from 'lucide-react';
import { useToast } from '@/components/Toast';
import CodeEditor from './CodeEditor';
import DeployModal from './DeployModal';
import { updateApp } from '@/lib/storage';

interface AppPreviewProps {
  app: GeneratedApp | null;
  onClose: () => void;
  onEdit?: (app: GeneratedApp) => void;
}

export default function AppPreview({ app, onClose, onEdit }: AppPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'chat' | 'editor'>('preview');
  const [files, setFiles] = useState<AppFile[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const { showToast } = useToast();

  // Convert app code to file structure
  useEffect(() => {
    if (app) {
      const fileList: AppFile[] = app.code.files || [
        { path: 'index.html', content: app.code.html, language: 'html' },
        { path: 'styles.css', content: app.code.css, language: 'css' },
        { path: 'script.js', content: app.code.js, language: 'javascript' },
      ];
      setFiles(fileList);
      setHasChanges(false);
    }
  }, [app]);

  // Update iframe when files change
  useEffect(() => {
    if (app && iframeRef.current && activeTab === 'preview') {
      const iframe = iframeRef.current;
      const htmlFile = files.find(f => f.path === 'index.html') || files[0];
      const cssFile = files.find(f => f.path.endsWith('.css'));
      const jsFile = files.find(f => f.path.endsWith('.js'));

      const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${cssFile ? `<style>${cssFile.content}</style>` : ''}
</head>
<body>
  ${htmlFile?.content || ''}
  ${jsFile ? `<script>${jsFile.content}<\/script>` : ''}
</body>
</html>`;

      iframe.srcdoc = htmlContent;
    }
  }, [app, files, activeTab]);

  const handleFilesChange = useCallback((newFiles: AppFile[]) => {
    setFiles(newFiles);
    setHasChanges(true);
  }, []);

  const handleSaveCode = async () => {
    if (!app) return;

    const htmlFile = files.find(f => f.path === 'index.html') || files[0];
    const cssFile = files.find(f => f.path.endsWith('.css'));
    const jsFile = files.find(f => f.path.endsWith('.js'));

    const updatedApp: GeneratedApp = {
      ...app,
      code: {
        html: htmlFile?.content || '',
        css: cssFile?.content || '',
        js: jsFile?.content || '',
        files: files,
      },
      createdAt: Date.now(),
    };

    try {
      await updateApp(updatedApp);
      setHasChanges(false);
      showToast('代码已保存', 'success');
    } catch {
      showToast('保存失败', 'error');
    }
  };

  const handleDownload = () => {
    if (!app) return;
    try {
      const htmlFile = files.find(f => f.path === 'index.html') || files[0];
      const cssFile = files.find(f => f.path.endsWith('.css'));
      const jsFile = files.find(f => f.path.endsWith('.js'));

      const fullCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  ${cssFile ? `<style>\n${cssFile.content}\n  </style>` : ''}
</head>
<body>
${htmlFile?.content || ''}
${jsFile ? `  <script>\n${jsFile.content}\n  </script>` : ''}
</body>
</html>`;

      const blob = new Blob([fullCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.replace(/\s+/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('代码下载成功', 'success');
    } catch {
      showToast('下载失败，请重试', 'error');
    }
  };

  if (!app) return null;

  const fullCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  <style>
${app.code.css}
  </style>
</head>
<body>
${app.code.html}
  <script>
${app.code.js}
  </script>
</body>
</html>`;

  return (
    <div className="flex flex-col h-full bg-atoms-dark" role="region" aria-label={`应用预览：${app.name}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-atoms-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-atoms-text">{app.name}</h2>
            {app.usedAI && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                AI 生成
              </span>
            )}
            {!app.usedAI && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                模板
              </span>
            )}
            {hasChanges && (
              <span className="px-2 py-0.5 bg-atoms-accent/20 text-atoms-accent text-xs rounded-full">
                有未保存修改
              </span>
            )}
          </div>
          <p className="text-xs text-atoms-textMuted">{app.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-atoms-card rounded-lg p-1" role="tablist" aria-label="预览选项">
            <button
              onClick={() => setActiveTab('preview')}
              role="tab"
              aria-selected={activeTab === 'preview'}
              aria-label="预览应用"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                activeTab === 'preview' ? 'bg-atoms-accent text-white' : 'text-atoms-textMuted hover:text-atoms-text'
              }`}
            >
              <Eye size={14} aria-hidden="true" />
              预览
            </button>
            <button
              onClick={() => setActiveTab('code')}
              role="tab"
              aria-selected={activeTab === 'code'}
              aria-label="查看代码"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                activeTab === 'code' ? 'bg-atoms-accent text-white' : 'text-atoms-textMuted hover:text-atoms-text'
              }`}
            >
              <Code size={14} aria-hidden="true" />
              代码
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              role="tab"
              aria-selected={activeTab === 'editor'}
              aria-label="编辑代码"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                activeTab === 'editor' ? 'bg-atoms-accent text-white' : 'text-atoms-textMuted hover:text-atoms-text'
              }`}
            >
              <FolderTree size={14} aria-hidden="true" />
              编辑器
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              role="tab"
              aria-selected={activeTab === 'chat'}
              aria-label="查看对话记录"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent ${
                activeTab === 'chat' ? 'bg-atoms-accent text-white' : 'text-atoms-textMuted hover:text-atoms-text'
              }`}
            >
              <MessageSquare size={14} aria-hidden="true" />
              对话
            </button>
          </div>

          {activeTab === 'editor' && hasChanges && (
            <button
              onClick={handleSaveCode}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-atoms-accent hover:bg-atoms-accentHover text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
              title="保存修改"
            >
              <Save size={14} aria-hidden="true" />
              保存
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-atoms-card border border-atoms-border text-atoms-textMuted hover:text-atoms-text hover:border-atoms-accent transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            title="下载 HTML 文件"
            aria-label="下载 HTML 文件"
          >
            <Download size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="部署应用"
            title="部署应用"
          >
            <Rocket size={14} aria-hidden="true" />
            部署
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(app)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-atoms-accent hover:bg-atoms-accentHover text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
              aria-label="继续编辑应用"
              title="继续编辑应用"
            >
              <Pencil size={14} aria-hidden="true" />
              继续编辑
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-atoms-card border border-atoms-border text-atoms-textMuted hover:text-atoms-error hover:border-atoms-error transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-error"
            aria-label="关闭预览"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'preview' && (
          <div className="w-full bg-white rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <iframe
              ref={iframeRef}
              className="preview-frame"
              title={app.name}
              sandbox="allow-scripts allow-same-origin"
              style={{ width: '100%', height: '100%', border: 'none' }}
              aria-label={`${app.name} 预览`}
            />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="bg-atoms-card rounded-lg border border-atoms-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-atoms-border bg-atoms-dark">
              <div className="w-3 h-3 rounded-full bg-atoms-error" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-atoms-warning" aria-hidden="true" />
              <div className="w-3 h-3 rounded-full bg-atoms-success" aria-hidden="true" />
              <span className="ml-2 text-xs text-atoms-textMuted">{app.name}.html</span>
            </div>
            <pre className="p-4 text-sm text-atoms-text overflow-auto max-h-[calc(100vh-200px)]" role="code" tabIndex={0} aria-label="源代码">
              <code>{fullCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="h-full" style={{ height: 'calc(100vh - 200px)' }}>
            <CodeEditor
              files={files}
              onChange={handleFilesChange}
              readOnly={false}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-atoms-card rounded-lg border border-atoms-border overflow-hidden">
            <div className="px-4 py-3 border-b border-atoms-border bg-atoms-dark">
              <h3 className="text-sm font-medium text-atoms-text">生成过程对话记录</h3>
              <p className="text-xs text-atoms-textMuted mt-1">
                模式: {app.steps.length > 2 ? '团队模式' : '工程师模式'} | 
                共 {app.messages.length} 条消息 | 
                {app.usedAI ? '使用 AI 生成' : '使用本地模板'}
              </p>
            </div>
            <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {app.messages.map((msg, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    msg.agent === 'User'
                      ? 'bg-atoms-accent text-white'
                      : msg.agent === 'System'
                      ? 'bg-gray-600 text-white'
                      : 'bg-atoms-border text-atoms-text'
                  }`}>
                    {msg.agent === 'User' ? 'U' : msg.agent === 'System' ? 'S' : <Bot size={12} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-atoms-text">{msg.agent}</span>
                      <span className="text-xs text-atoms-textMuted">
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-sm text-atoms-text whitespace-pre-wrap bg-atoms-dark rounded-lg px-3 py-2">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-atoms-border text-xs text-atoms-textMuted flex justify-between">
        <span>生成于 {new Date(app.createdAt).toLocaleString('zh-CN')}</span>
        <span>模式: {app.steps.length > 2 ? '团队模式' : '工程师模式'}</span>
      </div>

      {/* Deploy Modal */}
      {app && (
        <DeployModal
          app={app}
          isOpen={showDeployModal}
          onClose={() => setShowDeployModal(false)}
        />
      )}
    </div>
  );
}
