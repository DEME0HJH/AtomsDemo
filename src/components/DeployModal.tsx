'use client';

import { useState } from 'react';
import { DeployConfig, DeployTarget, GeneratedApp } from '@/types';
import { addDeploy, updateDeploy } from '@/lib/storage';
import { X, Globe, Server, ExternalLink, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface DeployModalProps {
  app: GeneratedApp;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeployModal({ app, isOpen, onClose }: DeployModalProps) {
  const [target, setTarget] = useState<DeployTarget>('cloud');
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployConfig | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    const deployId = `deploy_${Date.now()}`;
    const deploy: DeployConfig = {
      id: deployId,
      appId: app.id,
      target,
      url: url || undefined,
      domain: domain || undefined,
      status: 'deploying',
      createdAt: Date.now(),
    };

    addDeploy(deploy);

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (target === 'cloud') {
      // Simulate cloud deployment
      const success = Math.random() > 0.1; // 90% success rate for demo
      if (success) {
        const finalUrl = url || `https://atoms-demo.vercel.app/app/${app.id}`;
        updateDeploy(deployId, { 
          status: 'success', 
          url: finalUrl,
          message: '应用已成功部署到云端' 
        });
        setDeployResult({ ...deploy, status: 'success', url: finalUrl, message: '应用已成功部署到云端' });
        showToast('部署成功！', 'success');
      } else {
        updateDeploy(deployId, { 
          status: 'failed', 
          message: '云端部署失败，请检查配置' 
        });
        setDeployResult({ ...deploy, status: 'failed', message: '云端部署失败，请检查配置' });
        showToast('部署失败', 'error');
      }
    } else {
      // Local deployment - always success
      const localUrl = url || `http://localhost:3000/preview/${app.id}`;
      updateDeploy(deployId, { 
        status: 'success', 
        url: localUrl,
        message: '本地部署配置已保存' 
      });
      setDeployResult({ ...deploy, status: 'success', url: localUrl, message: '本地部署配置已保存' });
      showToast('本地部署配置已保存', 'success');
    }

    setIsDeploying(false);
  };

  const handleCopyUrl = () => {
    if (deployResult?.url) {
      navigator.clipboard.writeText(deployResult.url);
      showToast('链接已复制', 'success');
    }
  };

  const handleDownloadPackage = () => {
    const htmlFile = app.code.files?.find(f => f.path === 'index.html') || app.code.files?.[0];
    const cssFile = app.code.files?.find(f => f.path.endsWith('.css'));
    const jsFile = app.code.files?.find(f => f.path.endsWith('.js'));

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
    showToast('部署包已下载', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-atoms-card border border-atoms-border rounded-xl m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-atoms-border">
          <div>
            <h2 className="text-lg font-bold text-atoms-text">部署应用</h2>
            <p className="text-xs text-atoms-textMuted mt-1">{app.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Deploy Target Selection */}
          {!deployResult && (
            <>
              <div>
                <label className="block text-sm font-medium text-atoms-text mb-3">选择部署方式</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTarget('cloud')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      target === 'cloud'
                        ? 'border-atoms-accent bg-atoms-accent/10'
                        : 'border-atoms-border hover:border-atoms-textMuted'
                    }`}
                  >
                    <Globe size={24} className={target === 'cloud' ? 'text-atoms-accent' : 'text-atoms-textMuted'} />
                    <span className={`text-sm font-medium ${target === 'cloud' ? 'text-atoms-accent' : 'text-atoms-text'}`}>
                      云端部署
                    </span>
                    <span className="text-xs text-atoms-textMuted">部署到 Vercel/Netlify 等平台</span>
                  </button>
                  <button
                    onClick={() => setTarget('local')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      target === 'local'
                        ? 'border-atoms-accent bg-atoms-accent/10'
                        : 'border-atoms-border hover:border-atoms-textMuted'
                    }`}
                  >
                    <Server size={24} className={target === 'local' ? 'text-atoms-accent' : 'text-atoms-textMuted'} />
                    <span className={`text-sm font-medium ${target === 'local' ? 'text-atoms-accent' : 'text-atoms-text'}`}>
                      本地部署
                    </span>
                    <span className="text-xs text-atoms-textMuted">本地服务器或静态托管</span>
                  </button>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-atoms-text mb-2">
                  部署地址 {target === 'cloud' ? '(可选)' : '(可选)'}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder={target === 'cloud' ? 'https://your-app.vercel.app' : 'http://localhost:3000'}
                  className="w-full px-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text placeholder-atoms-textMuted text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                />
                <p className="text-xs text-atoms-textMuted mt-1">
                  {target === 'cloud' 
                    ? '输入你的云端部署地址，留空将使用默认地址' 
                    : '输入本地服务器地址，留空将使用默认地址'}
                </p>
              </div>

              {/* Domain Input */}
              <div>
                <label className="block text-sm font-medium text-atoms-text mb-2">
                  自定义域名 (可选)
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text placeholder-atoms-textMuted text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                />
                <p className="text-xs text-atoms-textMuted mt-1">
                  如果你有自定义域名，可以在这里配置
                </p>
              </div>

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-atoms-accent hover:bg-atoms-accentHover disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isDeploying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    {target === 'cloud' ? '部署到云端' : '配置本地部署'}
                  </>
                )}
              </button>
            </>
          )}

          {/* Deploy Result */}
          {deployResult && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                deployResult.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {deployResult.status === 'success' ? (
                  <CheckCircle size={24} className="text-green-400" />
                ) : (
                  <AlertCircle size={24} className="text-red-400" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    deployResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {deployResult.status === 'success' ? '部署成功' : '部署失败'}
                  </p>
                  <p className="text-xs text-atoms-textMuted">{deployResult.message}</p>
                </div>
              </div>

              {deployResult.url && (
                <div>
                  <label className="block text-sm font-medium text-atoms-text mb-2">访问地址</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deployResult.url}
                      readOnly
                      className="flex-1 px-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 rounded-lg bg-atoms-card border border-atoms-border text-atoms-textMuted hover:text-atoms-text transition-colors"
                      title="复制链接"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}

              {deployResult.domain && (
                <div>
                  <label className="block text-sm font-medium text-atoms-text mb-2">自定义域名</label>
                  <input
                    type="text"
                    value={deployResult.domain}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPackage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-atoms-card border border-atoms-border hover:border-atoms-accent text-atoms-text rounded-lg text-sm font-medium transition-colors"
                >
                  <Server size={16} />
                  下载部署包
                </button>
                {deployResult.url && (
                  <a
                    href={deployResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-atoms-accent hover:bg-atoms-accentHover text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={16} />
                    访问应用
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  setDeployResult(null);
                  setUrl('');
                  setDomain('');
                }}
                className="w-full px-4 py-2 text-sm text-atoms-textMuted hover:text-atoms-text transition-colors"
              >
                重新部署
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
