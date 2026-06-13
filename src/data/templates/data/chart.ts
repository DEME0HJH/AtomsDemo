import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="chart-app">
  <header class="chart-header">
    <h1 class="chart-title">📊 简易图表</h1>
  </header>
  <div class="chart-controls">
    <button class="chart-type-btn active" data-type="bar">柱状图</button>
    <button class="chart-type-btn" data-type="line">折线图</button>
    <button class="chart-type-btn" data-type="pie">饼图</button>
  </div>
  <div class="chart-canvas-container">
    <canvas id="chartCanvas" class="chart-canvas"></canvas>
  </div>
  <div class="chart-data-editor">
    <h3 class="chart-data-title">数据编辑</h3>
    <div id="dataInputs" class="chart-data-inputs">
      <div class="chart-data-row">
        <input type="text" class="chart-label-input" value="一月" placeholder="标签" />
        <input type="number" class="chart-value-input" value="30" placeholder="数值" />
        <button class="chart-remove-btn" disabled>−</button>
      </div>
    </div>
    <button id="addDataBtn" class="chart-add-btn">+ 添加数据</button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.chart-app { max-width: 540px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #f8fafc; }
.chart-header { text-align: center; margin-bottom: 20px; }
.chart-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.chart-controls { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; }
.chart-type-btn { padding: 8px 18px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 13px; background: white; color: #6b7280; cursor: pointer; transition: all 0.2s; font-weight: 500; }
.chart-type-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.chart-canvas-container { background: white; border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 16px; }
.chart-canvas { width: 100%; height: 280px; display: block; }
.chart-data-editor { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.chart-data-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; }
.chart-data-inputs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.chart-data-row { display: flex; gap: 8px; align-items: center; }
.chart-label-input { flex: 2; padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; }
.chart-value-input { flex: 1; padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; }
.chart-label-input:focus, .chart-value-input:focus { border-color: #3b82f6; }
.chart-remove-btn { padding: 6px 12px; background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
.chart-remove-btn:disabled { opacity: 0.4; cursor: default; }
.chart-add-btn { width: 100%; padding: 10px; background: #f3f4f6; color: #374151; border: 1px dashed #d1d5db; border-radius: 10px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.chart-add-btn:hover { background: #e5e7eb; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('chartCanvas');
  const ctx = canvas.getContext('2d');
  const dataInputs = document.getElementById('dataInputs');
  let chartType = 'bar';
  const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316'];

  function getData() {
    const rows = dataInputs.querySelectorAll('.chart-data-row');
    return [...rows].map(row => ({
      label: row.querySelector('.chart-label-input').value || '?',
      value: parseFloat(row.querySelector('.chart-value-input').value) || 0,
    }));
  }

  function draw() {
    const data = getData();
    if (data.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = rect.width, H = rect.height, pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const cw = W - pad.left - pad.right, ch = H - pad.top - pad.bottom;
    ctx.clearRect(0, 0, W, H);

    if (chartType === 'pie') {
      const total = data.reduce((s, d) => s + d.value, 0);
      if (total === 0) return;
      const cx = W / 2, cy = H / 2, r = Math.min(cw, ch) / 2 - 10;
      let angle = -Math.PI / 2;
      data.forEach((d, i) => {
        const slice = (d.value / total) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice);
        ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        const mid = angle + slice / 2;
        const tx = cx + Math.cos(mid) * (r * 0.65);
        const ty = cy + Math.sin(mid) * (r * 0.65);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(d.label, tx, ty);
        angle += slice;
      });
    } else {
      const maxVal = Math.max(...data.map(d => d.value), 1);
      const barW = Math.min(40, cw / data.length * 0.6);
      const gap = cw / data.length;

      ctx.beginPath(); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch * i / 4;
        ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + ch); ctx.lineTo(W - pad.right, pad.top + ch); ctx.stroke();

      data.forEach((d, i) => {
        const x = pad.left + gap * i + gap / 2;
        if (chartType === 'bar') {
          const h = (d.value / maxVal) * ch;
          const y = pad.top + ch - h;
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(x - barW / 2, y, barW, h);
          ctx.fillStyle = '#374151'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(d.value, x, y - 4);
        } else if (chartType === 'line') {
          if (i > 0) {
            const px = pad.left + gap * (i-1) + gap / 2;
            const ph = pad.top + ch - (data[i-1].value / maxVal) * ch;
            const cy = pad.top + ch - (d.value / maxVal) * ch;
            ctx.beginPath(); ctx.moveTo(px, ph); ctx.lineTo(x, cy);
            ctx.strokeStyle = colors[i % colors.length]; ctx.lineWidth = 2; ctx.stroke();
          }
          const cy = pad.top + ch - (d.value / maxVal) * ch;
          ctx.beginPath(); ctx.arc(x, cy, 4, 0, Math.PI*2); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
          ctx.fillStyle = '#374151'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(d.value, x, cy - 10);
        }
        ctx.fillStyle = '#374151'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(d.label, x, pad.top + ch + 16);
      });
    }
  }

  function addRow(label = '', value = '') {
    const rows = dataInputs.querySelectorAll('.chart-data-row');
    const row = document.createElement('div');
    row.className = 'chart-data-row';
    row.innerHTML = '<input type="text" class="chart-label-input" value="' + label + '" placeholder="标签" />' +
      '<input type="number" class="chart-value-input" value="' + value + '" placeholder="数值" />' +
      '<button class="chart-remove-btn">−</button>';
    row.querySelector('.chart-remove-btn').addEventListener('click', () => { row.remove(); updateRemoveBtns(); draw(); });
    row.querySelector('.chart-label-input').addEventListener('input', draw);
    row.querySelector('.chart-value-input').addEventListener('input', draw);
    dataInputs.appendChild(row);
    updateRemoveBtns();
  }

  function updateRemoveBtns() {
    const btns = dataInputs.querySelectorAll('.chart-remove-btn');
    btns.forEach(b => b.disabled = btns.length <= 1);
  }

  document.getElementById('addDataBtn').addEventListener('click', () => addRow());
  document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartType = btn.dataset.type;
      draw();
    });
  });

  dataInputs.innerHTML = '';
  ['一月','二月','三月','四月','五月'].forEach((l, i) => addRow(l, String(20 + Math.floor(Math.random()*50))));
  draw();
  window.addEventListener('resize', draw);
});
`,
};

export const chartTemplate: AppTemplate = {
  id: 'chart',
  name: '简易图表',
  category: 'data',
  description: '简易图表工具，支持柱状图/折线图/饼图',
  icon: 'BarChart3',
  params: {},
  code: defaultCode,
};
