import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="pomodoro-app">
  <header class="pm-header">
    <h1 class="pm-title">🍅 番茄钟</h1>
    <p class="pm-subtitle">专注工作，高效生活</p>
  </header>
  <div class="pm-timer-container">
    <svg class="pm-progress-ring" width="260" height="260" viewBox="0 0 260 260">
      <circle class="pm-ring-bg" cx="130" cy="130" r="115" fill="none" stroke="#e5e7eb" stroke-width="8" />
      <circle id="progressCircle" class="pm-ring-progress" cx="130" cy="130" r="115" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round" transform="rotate(-90 130 130)" stroke-dasharray="722.6" stroke-dashoffset="0" />
    </svg>
    <div class="pm-time-display">
      <span id="minutesDisplay" class="pm-minutes">25</span>
      <span class="pm-separator">:</span>
      <span id="secondsDisplay" class="pm-seconds">00</span>
    </div>
    <p id="sessionLabel" class="pm-session-label">工作时间</p>
  </div>
  <div class="pm-controls">
    <button id="startBtn" class="pm-btn pm-btn-start">开始</button>
    <button id="pauseBtn" class="pm-btn pm-btn-pause" style="display:none;">暂停</button>
    <button id="resetBtn" class="pm-btn pm-btn-reset">重置</button>
  </div>
  <div class="pm-stats">
    <div class="pm-stat-item">
      <span class="pm-stat-value" id="roundCount">0</span>
      <span class="pm-stat-label">已完成轮次</span>
    </div>
    <div class="pm-stat-item">
      <span class="pm-stat-value" id="totalMinutes">0</span>
      <span class="pm-stat-label">专注分钟</span>
    </div>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.pomodoro-app { max-width: 400px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; min-height: 100vh; background: #fef2f2; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.pm-header { margin-bottom: 32px; }
.pm-title { font-size: 32px; font-weight: 700; color: #1f2937; }
.pm-subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
.pm-timer-container { position: relative; width: 260px; height: 260px; margin: 0 auto 32px; }
.pm-progress-ring { position: absolute; top: 0; left: 0; }
.pm-ring-progress { transition: stroke-dashoffset 1s linear; }
.pm-time-display { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.pm-minutes, .pm-seconds { font-size: 56px; font-weight: 700; color: #1f2937; font-variant-numeric: tabular-nums; }
.pm-separator { font-size: 56px; font-weight: 700; color: #ef4444; }
.pm-session-label { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); font-size: 14px; color: #6b7280; font-weight: 500; }
.pm-controls { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; justify-content: center; }
.pm-btn { padding: 12px 32px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.pm-btn-start { background: #ef4444; color: white; }
.pm-btn-start:hover { background: #dc2626; transform: translateY(-1px); }
.pm-btn-pause { background: #f59e0b; color: white; }
.pm-btn-pause:hover { background: #d97706; }
.pm-btn-reset { background: #f3f4f6; color: #374151; }
.pm-btn-reset:hover { background: #e5e7eb; }
.pm-btn:active { transform: scale(0.97); }
.pm-stats { display: flex; gap: 24px; }
.pm-stat-item { background: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); min-width: 100px; }
.pm-stat-value { display: block; font-size: 24px; font-weight: 700; color: #ef4444; }
.pm-stat-label { font-size: 12px; color: #6b7280; }
@media (max-width: 400px) { .pm-title { font-size: 28px; } .pm-minutes, .pm-seconds { font-size: 48px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const minutesDisplay = document.getElementById('minutesDisplay');
  const secondsDisplay = document.getElementById('secondsDisplay');
  const sessionLabel = document.getElementById('sessionLabel');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const roundCount = document.getElementById('roundCount');
  const totalMinutes = document.getElementById('totalMinutes');
  const progressCircle = document.getElementById('progressCircle');
  const totalDash = 722.6;

  let WORK_MIN = 25, BREAK_MIN = 5;
  let timeLeft = WORK_MIN * 60;
  let isWork = true;
  let timer = null;
  let rounds = 0;
  let totalMins = 0;
  let totalSec = WORK_MIN * 60;

  function load() {
    const saved = JSON.parse(localStorage.getItem('atoms_pomodoro') || '{}');
    rounds = saved.rounds || 0;
    totalMins = saved.totalMins || 0;
    roundCount.textContent = rounds;
    totalMinutes.textContent = totalMins;
  }
  function save() {
    localStorage.setItem('atoms_pomodoro', JSON.stringify({ rounds, totalMins }));
  }
  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesDisplay.textContent = String(mins).padStart(2, '0');
    secondsDisplay.textContent = String(secs).padStart(2, '0');
    const ratio = 1 - (timeLeft / totalSec);
    progressCircle.style.strokeDashoffset = totalDash * ratio;
  }
  function switchSession() {
    if (isWork) { rounds++; totalMins += WORK_MIN; roundCount.textContent = rounds; totalMinutes.textContent = totalMins; save(); }
    isWork = !isWork;
    totalSec = (isWork ? WORK_MIN : BREAK_MIN) * 60;
    timeLeft = totalSec;
    sessionLabel.textContent = isWork ? '工作时间' : '休息时间';
    progressCircle.style.stroke = isWork ? '#ef4444' : '#10b981';
    updateDisplay();
    if (Notification.permission === 'granted') {
      new Notification(isWork ? '开始工作！' : '休息一下！', { body: isWork ? '专注 25 分钟' : '休息 5 分钟' });
    }
  }
  function tick() {
    if (timeLeft <= 0) { switchSession(); return; }
    timeLeft--;
    updateDisplay();
  }
  startBtn.addEventListener('click', () => {
    if (timer) return;
    if (timeLeft === totalSec && timeLeft === WORK_MIN * 60) switchSession();
    timer = setInterval(tick, 1000);
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    if ('Notification' in window) Notification.requestPermission();
  });
  pauseBtn.addEventListener('click', () => {
    clearInterval(timer); timer = null;
    pauseBtn.style.display = 'none'; startBtn.style.display = 'inline-block';
  });
  resetBtn.addEventListener('click', () => {
    clearInterval(timer); timer = null;
    isWork = true; totalSec = WORK_MIN * 60; timeLeft = totalSec;
    sessionLabel.textContent = '工作时间';
    progressCircle.style.stroke = '#ef4444';
    progressCircle.style.strokeDashoffset = '0';
    updateDisplay();
    startBtn.style.display = 'inline-block'; pauseBtn.style.display = 'none';
  });
  load(); updateDisplay();
});
`,
};

export const pomodoroTemplate: AppTemplate = {
  id: 'pomodoro',
  name: '番茄钟',
  category: 'productivity',
  description: '番茄工作法计时器，25分钟工作+5分钟休息循环',
  icon: 'Timer',
  params: {},
  code: defaultCode,
};
