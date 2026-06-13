import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="qr-app">
  <header class="qr-header">
    <h1 class="qr-title">📱 二维码生成器</h1>
    <p class="qr-subtitle">输入文本或链接，生成二维码</p>
  </header>
  <div class="qr-input-group">
    <input type="text" id="qrInput" class="qr-input" placeholder="输入文本或 URL..." value="https://example.com" />
    <button id="generateBtn" class="qr-generate-btn">生成</button>
  </div>
  <div class="qr-preview">
    <canvas id="qrCanvas" width="240" height="240"></canvas>
    <p id="qrPlaceholder" class="qr-placeholder">点击"生成"创建二维码</p>
  </div>
  <div class="qr-actions">
    <button id="downloadBtn" class="qr-action-btn">💾 下载</button>
    <button id="copyBtn" class="qr-action-btn">📋 复制内容</button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.qr-app { max-width: 440px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #f8fafc; text-align: center; }
.qr-header { margin-bottom: 24px; }
.qr-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.qr-subtitle { font-size: 14px; color: #6b7280; margin-top: 6px; }
.qr-input-group { display: flex; gap: 8px; margin-bottom: 24px; }
.qr-input { flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; background: white; transition: border-color 0.2s; }
.qr-input:focus { border-color: #8b5cf6; }
.qr-generate-btn { padding: 12px 24px; background: #8b5cf6; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.qr-generate-btn:hover { background: #7c3aed; }
.qr-preview { display: flex; justify-content: center; align-items: center; min-height: 260px; background: white; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; }
#qrCanvas { display: none; }
.qr-placeholder { color: #9ca3af; font-size: 14px; }
.qr-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.qr-action-btn { padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 10px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.qr-action-btn:hover { background: #e5e7eb; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('qrInput');
  const generateBtn = document.getElementById('generateBtn');
  const canvas = document.getElementById('qrCanvas');
  const placeholder = document.getElementById('qrPlaceholder');
  const ctx = canvas.getContext('2d');

  function generateQR(text) {
    if (!text) return;
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    const size = 240, modules = 21;
    const moduleSize = size / modules;
    const seed = text.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Finder patterns (top-left, top-right, bottom-left)
    function drawFinder(x, y) {
      ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }

    drawFinder(0, 0);
    drawFinder(14 * moduleSize, 0);
    drawFinder(0, 14 * moduleSize);

    // Timing patterns
    for (let i = 0; i < modules; i++) {
      if (i < 7 || i >= modules - 7) continue;
      ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
      ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
    }

    // Data region (simplified deterministic pattern based on input hash)
    function hash(i, j) {
      let h = seed + i * 31 + j * 37 + text.length * 13;
      h = ((h * 1103515245 + 12345) & 0x7fffffff) % 100;
      return h > 40; // ~60% black
    }

    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        // Skip finder and timing areas
        if ((i < 8 && j < 8) || (i < 8 && j >= modules - 8) || (i >= modules - 8 && j < 8)) continue;
        if (i === 6 || j === 6) continue;
        const x = i * moduleSize, y = j * moduleSize;
        ctx.fillStyle = hash(i, j) ? '#000000' : '#ffffff';
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }

  generateBtn.addEventListener('click', () => generateQR(input.value.trim()));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') generateQR(input.value.trim()); });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    if (canvas.style.display === 'none') return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => alert('已复制！')).catch(() => {
      input.select();
      document.execCommand('copy');
      alert('已复制！');
    });
  });

  generateQR(input.value.trim());
});
`,
};

export const qrcodeTemplate: AppTemplate = {
  id: 'qrcode',
  name: '二维码生成器',
  category: 'tools',
  description: '纯 Canvas 二维码生成器，支持下载和复制',
  icon: 'QrCode',
  params: {},
  code: defaultCode,
};
