import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="habit-app">
  <header class="habit-header">
    <h1 class="habit-title">✅ 习惯追踪</h1>
    <p class="habit-subtitle">坚持就是胜利</p>
  </header>
  <div class="habit-input-group">
    <input type="text" id="habitInput" class="habit-input" placeholder="添加新习惯..." />
    <button id="addHabitBtn" class="habit-add-btn">添加</button>
  </div>
  <div id="habitList" class="habit-list"></div>
  <div class="habit-stats-bar">
    <span id="streakCount" class="habit-streak">🔥 连续 0 天</span>
    <span id="totalCount" class="habit-total">完成率: 0%</span>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.habit-app { max-width: 480px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; background: #f0fdf4; }
.habit-header { text-align: center; margin-bottom: 24px; }
.habit-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.habit-subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
.habit-input-group { display: flex; gap: 8px; margin-bottom: 20px; }
.habit-input { flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; background: white; transition: border-color 0.2s; }
.habit-input:focus { border-color: #10b981; }
.habit-add-btn { padding: 12px 20px; background: #10b981; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
.habit-add-btn:hover { background: #059669; }
.habit-list { display: flex; flex-direction: column; gap: 8px; }
.habit-item { background: white; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: transform 0.2s; }
.habit-item:hover { transform: translateY(-1px); }
.habit-day-grid { display: flex; gap: 3px; margin-left: auto; }
.habit-day-dot { width: 14px; height: 14px; border-radius: 50%; background: #e5e7eb; cursor: pointer; transition: all 0.2s; }
.habit-day-dot.checked { background: #10b981; }
.habit-day-dot.today { border: 2px solid #10b981; }
.habit-name { flex: 1; font-size: 15px; font-weight: 500; color: #374151; }
.habit-streak { color: #f59e0b; font-weight: 600; font-size: 13px; white-space: nowrap; margin-right: 8px; }
.habit-delete { padding: 4px 8px; background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; }
.habit-stats-bar { display: flex; justify-content: space-between; margin-top: 20px; padding: 12px; background: white; border-radius: 12px; font-size: 14px; font-weight: 500; color: #374151; }
@media (max-width: 400px) { .habit-day-dot { width: 11px; height: 11px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('habitInput');
  const addBtn = document.getElementById('addHabitBtn');
  const list = document.getElementById('habitList');
  const streakCount = document.getElementById('streakCount');
  const totalCount = document.getElementById('totalCount');
  let habits = JSON.parse(localStorage.getItem('atoms_habits') || '[]');
  const DAYS = 7;

  function save() { localStorage.setItem('atoms_habits', JSON.stringify(habits)); updateStats(); }
  function getTodayStr() { return new Date().toISOString().slice(0, 10); }
  function getLast7Days() {
    const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  function render() {
    const weekDays = getLast7Days();
    const today = getTodayStr();
    if (habits.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:20px;">还没有习惯，快添加一个吧！</div>';
    } else {
      list.innerHTML = habits.map((h, i) => {
        let streak = 0;
        for (let j = weekDays.length - 1; j >= 0; j--) {
          if (h.checkedDays && h.checkedDays[weekDays[j]]) streak++; else break;
        }
        const dots = weekDays.map(day => {
          const checked = h.checkedDays && h.checkedDays[day];
          const isToday = day === today;
          return '<span class="habit-day-dot' + (checked ? ' checked' : '') + (isToday ? ' today' : '') + '" data-idx="' + i + '" data-day="' + day + '"></span>';
        }).join('');
        return '<div class="habit-item">' +
          '<span class="habit-streak">' + streak + '天</span>' +
          '<span class="habit-name">' + escapeHtml(h.name) + '</span>' +
          '<div class="habit-day-grid">' + dots + '</div>' +
          '<button class="habit-delete" data-idx="' + i + '">删除</button>' +
        '</div>';
      }).join('');
    }
    updateStats();
  }
  function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  function updateStats() {
    let totalDone = 0, totalPossible = 0;
    const today = getTodayStr();
    habits.forEach(h => {
      if (h.checkedDays) { const vals = Object.values(h.checkedDays); totalDone += vals.filter(Boolean).length; totalPossible += vals.length; }
      if (h.checkedDays && h.checkedDays[today]) totalDone;
    });
    const rate = totalPossible > 0 ? Math.round(totalDone / totalPossible * 100) : 0;
    totalCount.textContent = '完成率: ' + rate + '%';
    const maxStreak = habits.reduce((max, h) => {
      const weekDays = getLast7Days(); let s = 0;
      for (let j = weekDays.length - 1; j >= 0; j--) { if (h.checkedDays && h.checkedDays[weekDays[j]]) s++; else break; }
      return Math.max(max, s);
    }, 0);
    streakCount.textContent = '🔥 最长连续 ' + maxStreak + ' 天';
  }

  addBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) return;
    if (habits.find(h => h.name === name)) { alert('该习惯已存在'); return; }
    habits.push({ name, checkedDays: {}, createdAt: Date.now() });
    input.value = ''; save(); render();
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addBtn.click(); });

  list.addEventListener('click', e => {
    if (e.target.classList.contains('habit-day-dot')) {
      const idx = parseInt(e.target.dataset.idx);
      const day = e.target.dataset.day;
      if (!habits[idx].checkedDays) habits[idx].checkedDays = {};
      habits[idx].checkedDays[day] = !habits[idx].checkedDays[day];
      save(); render();
    } else if (e.target.classList.contains('habit-delete')) {
      const idx = parseInt(e.target.dataset.idx);
      habits.splice(idx, 1);
      save(); render();
    }
  });

  render();
});
`,
};

export const habitTemplate: AppTemplate = {
  id: 'habit',
  name: '习惯追踪',
  category: 'productivity',
  description: '每日打卡习惯追踪器，支持连续天数统计',
  icon: 'Target',
  params: {},
  code: defaultCode,
};
