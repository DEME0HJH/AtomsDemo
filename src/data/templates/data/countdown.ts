import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="countdown-app">
  <header class="cd-header">
    <h1 class="cd-title">⏰ 倒计时</h1>
  </header>
  <div class="cd-setup" id="setupPanel">
    <label class="cd-label">目标日期</label>
    <input type="datetime-local" id="targetDate" class="cd-date-input" />
    <label class="cd-label">事件名称</label>
    <input type="text" id="eventName" class="cd-event-input" placeholder="例如：春节、生日、考试..." value="新年" />
    <button id="startBtn" class="cd-start-btn">开始倒计时</button>
  </div>
  <div class="cd-display" id="displayPanel" style="display:none;">
    <h2 class="cd-event-title" id="displayEventName">新年</h2>
    <div class="cd-timer-grid">
      <div class="cd-timer-item">
        <span class="cd-timer-value" id="days">00</span>
        <span class="cd-timer-label">天</span>
      </div>
      <div class="cd-timer-item">
        <span class="cd-timer-value" id="hours">00</span>
        <span class="cd-timer-label">时</span>
      </div>
      <div class="cd-timer-item">
        <span class="cd-timer-value" id="minutes">00</span>
        <span class="cd-timer-label">分</span>
      </div>
      <div class="cd-timer-item">
        <span class="cd-timer-value" id="seconds">00</span>
        <span class="cd-timer-label">秒</span>
      </div>
    </div>
    <p class="cd-message" id="cdMessage"></p>
    <button id="resetBtn" class="cd-reset-btn">重新设置</button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.countdown-app { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; color: white; }
.cd-header { text-align: center; margin-bottom: 32px; }
.cd-title { font-size: 32px; font-weight: 700; }
.cd-setup { display: flex; flex-direction: column; gap: 14px; max-width: 360px; width: 100%; }
.cd-label { font-size: 14px; font-weight: 500; opacity: 0.8; }
.cd-date-input, .cd-event-input { padding: 12px 16px; border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 15px; outline: none; background: rgba(255,255,255,0.1); color: white; transition: border-color 0.2s; }
.cd-date-input:focus, .cd-event-input:focus { border-color: #3b82f6; }
.cd-start-btn { padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
.cd-start-btn:hover { background: #2563eb; }
.cd-display { text-align: center; }
.cd-event-title { font-size: 22px; font-weight: 500; margin-bottom: 28px; opacity: 0.9; }
.cd-timer-grid { display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
.cd-timer-item { background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; min-width: 80px; backdrop-filter: blur(10px); }
.cd-timer-value { display: block; font-size: 40px; font-weight: 700; font-variant-numeric: tabular-nums; }
.cd-timer-label { font-size: 13px; opacity: 0.6; margin-top: 4px; display: block; }
.cd-message { font-size: 16px; margin-bottom: 20px; color: #f59e0b; }
.cd-reset-btn { padding: 10px 24px; background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.cd-reset-btn:hover { background: rgba(255,255,255,0.25); }
@media (max-width: 400px) { .cd-timer-grid { gap: 8px; } .cd-timer-item { padding: 14px; min-width: 60px; } .cd-timer-value { font-size: 30px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const setupPanel = document.getElementById('setupPanel');
  const displayPanel = document.getElementById('displayPanel');
  const targetDate = document.getElementById('targetDate');
  const eventName = document.getElementById('eventName');
  let timer = null;

  // Set default to next day
  const t = new Date(); t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  targetDate.value = t.toISOString().slice(0, 16);

  const saved = JSON.parse(localStorage.getItem('atoms_countdown') || 'null');
  if (saved && new Date(saved.target).getTime() > Date.now()) {
    targetDate.value = saved.target; eventName.value = saved.name;
    startCountdown();
  }

  function startCountdown() {
    const target = new Date(targetDate.value).getTime();
    const name = eventName.value.trim() || '目标日期';
    if (isNaN(target) || target < Date.now()) { alert('请选择未来的时间'); return; }

    localStorage.setItem('atoms_countdown', JSON.stringify({ target: targetDate.value, name }));
    setupPanel.style.display = 'none'; displayPanel.style.display = 'block';
    document.getElementById('displayEventName').textContent = name;

    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('cdMessage').textContent = '🎉 时间到！';
        clearInterval(timer); timer = null;
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.getElementById('days').textContent = String(d).padStart(2, '0');
      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    tick();
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  document.getElementById('startBtn').addEventListener('click', startCountdown);
  document.getElementById('resetBtn').addEventListener('click', () => {
    clearInterval(timer); timer = null;
    setupPanel.style.display = 'flex'; displayPanel.style.display = 'none';
  });
});
`,
};

export const countdownTemplate: AppTemplate = {
  id: 'countdown',
  name: '倒计时',
  category: 'data',
  description: '事件倒计时器，设置目标日期实时倒计时',
  icon: 'Clock',
  params: {},
  code: defaultCode,
};
