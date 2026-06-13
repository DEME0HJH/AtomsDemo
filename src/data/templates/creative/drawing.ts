import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="draw-app">
  <header class="draw-header">
    <h1 class="draw-title">🎨 画板</h1>
  </header>
  <div class="draw-toolbar">
    <input type="color" id="colorPicker" class="draw-color" value="#3b82f6" title="画笔颜色" />
    <input type="range" id="brushSize" class="draw-brush" min="1" max="20" value="3" title="画笔粗细" />
    <button id="eraserBtn" class="draw-tool-btn" title="橡皮擦">🧹</button>
    <button id="clearBtn" class="draw-tool-btn" title="清空">🗑️</button>
    <button id="undoBtn" class="draw-tool-btn" title="撤销">↩️</button>
    <button id="saveBtn" class="draw-tool-btn" title="下载">💾</button>
  </div>
  <div class="draw-canvas-container">
    <canvas id="drawCanvas" class="draw-canvas"></canvas>
  </div>
  <p class="draw-hint">按住鼠标左键绘画，滚轮或拖动调整画笔大小</p>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.draw-app { max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #fafaf9; display: flex; flex-direction: column; }
.draw-header { text-align: center; margin-bottom: 16px; }
.draw-title { font-size: 24px; font-weight: 700; color: #1f2937; }
.draw-toolbar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
.draw-color { width: 36px; height: 36px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; padding: 2px; }
.draw-brush { width: 100px; accent-color: #3b82f6; cursor: pointer; }
.draw-tool-btn { padding: 8px 12px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.2s; }
.draw-tool-btn:hover { background: #e5e7eb; }
.draw-tool-btn.active { background: #dbeafe; border-color: #3b82f6; }
.draw-canvas-container { flex: 1; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.draw-canvas { display: block; cursor: crosshair; touch-action: none; max-width: 100%; }
.draw-hint { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 12px; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const undoBtn = document.getElementById('undoBtn');
  const saveBtn = document.getElementById('saveBtn');

  let isDrawing = false, isErasing = false;
  let history = [];

  function initCanvas() {
    const container = canvas.parentElement;
    const w = Math.min(container.clientWidth - 4, 560);
    const h = Math.min(window.innerHeight * 0.5, 400);
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    saveState();
  }

  function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 30) history.shift();
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = (canvas.style.width ? parseFloat(canvas.style.width) : canvas.width) / canvas.width;
    const scaleY = (canvas.style.height ? parseFloat(canvas.style.height) : canvas.height) / canvas.height;
    return {
      x: (e.clientX - rect.left) / (scaleX || 1),
      y: (e.clientY - rect.top) / (scaleY || 1),
    };
  }

  canvas.addEventListener('mousedown', e => { isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const p = getPos(e);
    ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;
    ctx.lineWidth = parseInt(brushSize.value);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  canvas.addEventListener('mouseup', () => { if (isDrawing) { isDrawing = false; saveState(); } });
  canvas.addEventListener('mouseleave', () => { if (isDrawing) { isDrawing = false; saveState(); } });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); isDrawing = true;
    const t = e.touches[0];
    const p = getPos(t); ctx.beginPath(); ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const t = e.touches[0];
    const p = getPos(t);
    ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;
    ctx.lineWidth = parseInt(brushSize.value);
    ctx.lineTo(p.x, p.y); ctx.stroke();
  });
  canvas.addEventListener('touchend', () => { if (isDrawing) { isDrawing = false; saveState(); } });

  eraserBtn.addEventListener('click', () => { isErasing = !isErasing; eraserBtn.classList.toggle('active', isErasing); });
  clearBtn.addEventListener('click', () => {
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
  });
  undoBtn.addEventListener('click', () => {
    if (history.length <= 1) return;
    history.pop();
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = history[history.length - 1];
  });
  saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  initCanvas();
  window.addEventListener('resize', initCanvas);
});
`,
};

export const drawingTemplate: AppTemplate = {
  id: 'drawing',
  name: '画板',
  category: 'creative',
  description: '简易画板，支持颜色选择、橡皮擦、撤销和下载',
  icon: 'PenTool',
  params: {},
  code: defaultCode,
};
