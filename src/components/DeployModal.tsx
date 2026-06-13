'use client';

import { useState } from 'react';
import { DeployConfig, DeployTarget, GeneratedApp } from '@/types';
import { addDeploy, updateDeploy } from '@/lib/storage';
import { deployToVercel, checkDeploymentStatus } from '@/lib/deploy/vercel';
import { X, Globe, Server, ExternalLink, CheckCircle, AlertCircle, Loader2, Copy, Download, Key } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface DeployModalProps {
  app: GeneratedApp;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeployModal({ app, isOpen, onClose }: DeployModalProps) {
  const [target, setTarget] = useState<DeployTarget>('cloud');
  const [vercelToken, setVercelToken] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployConfig | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const buildFullHTML = (): string => {
    const htmlFile = app.code.files?.find(f => f.path === 'index.html') || app.code.files?.[0];
    const cssFile = app.code.files?.find(f => f.path.endsWith('.css'));
    const jsFile = app.code.files?.find(f => f.path.endsWith('.js'));

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  ${cssFile ? `<style>\n${cssFile.content}\n  </style>` : `<style>\n${app.code.css}\n  </style>`}
</head>
<body>
${htmlFile?.content || app.code.html}
${jsFile ? `  <script>\n${jsFile.content}\n  </script>` : `  <script>\n${app.code.js}\n  </script>`}
</body>
</html>`;
  };

  const handleDeploy = async () => {
    setIsDeploying(true);

    const deployId = `deploy_${Date.now()}`;
    const deploy: DeployConfig = {
      id: deployId,
      appId: app.id,
      target,
      status: 'deploying',
      createdAt: Date.now(),
    };

    addDeploy(deploy);

    if (target === 'cloud') {
      // === Real Vercel deployment ===
      try {
        if (!vercelToken.trim()) {
          throw new Error('请输入 Vercel Access Token');
        }

        const result = await deployToVercel(buildFullHTML(), app.name, vercelToken.trim());

        // Poll for readiness (max 15s)
        if (!result.ready && result.deploymentId) {
          let attempts = 0;
          while (attempts < 10) {
            await new Promise(r => setTimeout(r, 1500));
            const status = await checkDeploymentStatus(result.deploymentId, vercelToken.trim());
            if (status.ready) {
              result.url = status.url;
              result.ready = true;
              break;
            }
            attempts++;
          }
        }

        updateDeploy(deployId, {
          status: 'success',
          url: result.url,
          message: result.ready
            ? '应用已成功部署到 Vercel'
            : '部署已提交，可能需要几秒生效',
        });
        setDeployResult({
          ...deploy,
          status: 'success',
          url: result.url,
          message: '成功部署到 Vercel',
        });
        showToast('部署成功！', 'success');
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : '部署失败';
        updateDeploy(deployId, { status: 'failed', message: errMsg });
        setDeployResult({ ...deploy, status: 'failed', message: errMsg });
        showToast(errMsg, 'error');
      }
    } else {
      // Local deployment — download HTML file
      try {
        const blob = new Blob([buildFullHTML()], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${app.name.replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
        updateDeploy(deployId, {
          status: 'success',
          message: 'HTML 文件已下载',
          url: '本地文件',
        });
        setDeployResult({
          ...deploy,
          status: 'success',
          message: '部署包已下载到本地',
          url: '本地文件',
        });
        showToast('部署包已下载', 'success');
      } catch {
        updateDeploy(deployId, { status: 'failed', message: '下载失败' });
        setDeployResult({ ...deploy, status: 'failed', message: '下载失败' });
        showToast('下载失败', 'error');
      }
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
    const html = buildFullHTML();
    const blob = new Blob([html], { type: 'text/html' });
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
          {!deployResult && (
            <>
              {/* Deploy Target Selection */}
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
                    <span className="text-sm font-medium">云端部署</span>
                    <span className="text-xs text-atoms-textMuted text-center">通过 Vercel API 部署到公网</span>
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
                    <span className="text-sm font-medium">本地下载</span>
                    <span className="text-xs text-atoms-textMuted text-center">下载 HTML 文件自行托管</span>
                  </button>
                </div>
              </div>

              {/* Vercel Token (cloud mode) */}
              {target === 'cloud' && (
                <div>
                  <label className="block text-sm font-medium text-atoms-text mb-2">
                    Vercel Access Token
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atoms-textMuted" />
                    <input
                      type="password"
                      value={vercelToken}
                      onChange={e => setVercelToken(e.target.value)}
                      placeholder="在 vercel.com/account/tokens 获取"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                    />
                  </div>
                  <p className="text-xs text-atoms-textMuted mt-1">
                    在 <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-atoms-accent hover:underline">vercel.com/account/tokens</a> 创建 Token
                  </p>
                </div>
              )}

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={isDeploying || (target === 'cloud' && !vercelToken.trim())}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-atoms-accent hover:bg-atoms-accentHover disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isDeploying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    部署中...（可能需要几秒）
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    {target === 'cloud' ? '部署到 Vercel' : '下载 HTML 文件'}
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

              {deployResult.url && deployResult.url !== '本地文件' && (
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

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPackage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-atoms-card border border-atoms-border hover:border-atoms-accent text-atoms-text rounded-lg text-sm font-medium transition-colors"
                >
                  <Download size={16} />
                  下载部署包
                </button>
                {deployResult.url && deployResult.url !== '本地文件' && (
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
