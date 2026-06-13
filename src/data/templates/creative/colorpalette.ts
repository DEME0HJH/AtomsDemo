import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="palette-app">
  <header class="palette-header">
    <h1 class="palette-title">🎨 调色板</h1>
    <p class="palette-subtitle">选择颜色，生成配色方案</p>
  </header>
  <div class="palette-picker">
    <input type="color" id="baseColor" class="palette-base-picker" value="#3b82f6" />
    <span class="palette-picker-label">选择基色</span>
  </div>
  <div id="colorPalette" class="palette-grid"></div>
  <div class="palette-actions">
    <button id="regenerateBtn" class="palette-btn">🎲 随机方案</button>
    <button id="copyAllBtn" class="palette-btn">📋 复制全部</button>
    <button id="exportBtn" class="palette-btn">💾 导出 CSS</button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.palette-app { max-width: 480px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #fafafa; }
.palette-header { text-align: center; margin-bottom: 24px; }
.palette-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.palette-subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
.palette-picker { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px; }
.palette-base-picker { width: 48px; height: 48px; border: none; border-radius: 50%; cursor: pointer; padding: 0; }
.palette-picker-label { font-size: 14px; color: #374151; }
.palette-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.palette-row { display: flex; gap: 8px; }
.palette-swatch { flex: 1; height: 64px; border-radius: 12px; cursor: pointer; position: relative; display: flex; align-items: flex-end; justify-content: center; padding: 8px; transition: transform 0.2s, box-shadow 0.2s; }
.palette-swatch:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.palette-swatch-text { font-size: 11px; font-family: monospace; padding: 2px 6px; background: rgba(0,0,0,0.3); color: white; border-radius: 4px; }
.palette-swatch.copied::after { content: '已复制!'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; animation: fadeOut 1s forwards; }
@keyframes fadeOut { 0%,50% { opacity: 1; } 100% { opacity: 0; } }
.palette-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.palette-btn { padding: 10px 18px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.palette-btn:hover { background: #e5e7eb; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const baseColor = document.getElementById('baseColor');
  const paletteGrid = document.getElementById('colorPalette');

  function hslToHex(h, s, l) {
    l /= 100; const a = s * Math.min(l, 1 - l) / 100;
    const f = n => { const k = (n + h / 30) % 12; const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * color).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4);
  }
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3), 16) / 255, g = parseInt(hex.slice(3,5), 16) / 255, b = parseInt(hex.slice(5,7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) % 6; break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
  }

  function generatePalette(hex) {
    const { h, s, l } = hexToHsl(hex);
    const schemes = {
      '互补色': [hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l)],
      '类似色': [hslToHex((h + 30) % 360, s, l), hslToHex(h, s, l), hslToHex((h + 330) % 360, s, l)],
      '三角色': [hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
      '单色深浅': [hslToHex(h, s, Math.max(10, l - 25)), hslToHex(h, s, l), hslToHex(h, s, Math.min(90, l + 25))],
      '分裂互补': [hslToHex(h, s, l), hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)],
    };

    paletteGrid.innerHTML = Object.entries(schemes).map(([name, colors]) => {
      const swatches = colors.map(c => '<div class="palette-swatch" style="background:' + c + '" data-color="' + c + '" title="' + c + '"><span class="palette-swatch-text">' + c + '</span></div>').join('');
      return '<div style="margin-bottom:4px;font-size:12px;color:#6b7280;font-weight:500">' + name + '</div><div class="palette-row">' + swatches + '</div>';
    }).join('');
  }

  paletteGrid.addEventListener('click', e => {
    const swatch = e.target.closest('.palette-swatch');
    if (!swatch) return;
    const color = swatch.dataset.color;
    navigator.clipboard.writeText(color).then(() => {
      swatch.classList.add('copied');
      setTimeout(() => swatch.classList.remove('copied'), 1100);
    }).catch(() => {});
  });

  baseColor.addEventListener('input', () => generatePalette(baseColor.value));
  document.getElementById('regenerateBtn').addEventListener('click', () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    baseColor.value = hex; generatePalette(hex);
  });
  document.getElementById('copyAllBtn').addEventListener('click', () => {
    const colors = [...document.querySelectorAll('.palette-swatch')].map(s => s.dataset.color).join(', ');
    navigator.clipboard.writeText(colors).then(() => alert('所有色值已复制！')).catch(() => {});
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const colors = [...document.querySelectorAll('.palette-swatch')].map((s, i) => '  --color-' + (i+1) + ': ' + s.dataset.color + ';').join('\\n');
    const css = ':root {\\n' + colors + '\\n}';
    navigator.clipboard.writeText(css).then(() => alert('CSS 变量已复制！')).catch(() => {});
  });

  generatePalette(baseColor.value);
});
`,
};

export const colorpaletteTemplate: AppTemplate = {
  id: 'colorpalette',
  name: '调色板',
  category: 'creative',
  description: '调色板工具，生成配色方案并复制色值',
  icon: 'Palette',
  params: {},
  code: defaultCode,
};
