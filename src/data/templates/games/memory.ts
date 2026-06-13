import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="memory-app">
  <header class="memory-header">
    <h1 class="memory-title">🧠 记忆翻牌</h1>
    <p class="memory-subtitle">找出所有匹配的卡片对</p>
  </header>
  <div class="memory-stats">
    <span class="memory-stat">⏱️ <span id="timer">0</span>s</span>
    <span class="memory-stat">👆 步数 <span id="moves">0</span></span>
    <span class="memory-stat">✅ <span id="matched">0</span>/8</span>
  </div>
  <div id="memoryBoard" class="memory-board"></div>
  <button id="restartBtn" class="memory-restart-btn">🔄 重新开始</button>
  <p id="winMessage" class="memory-win-msg"></p>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.memory-app { max-width: 420px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #fefce8; text-align: center; }
.memory-header { margin-bottom: 16px; }
.memory-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.memory-subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
.memory-stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
.memory-stat { font-size: 14px; font-weight: 500; color: #374151; }
.memory-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
.memory-card { aspect-ratio: 1; border-radius: 12px; cursor: pointer; transition: transform 0.3s, background 0.3s; position: relative; font-size: 30px; display: flex; align-items: center; justify-content: center; background: #3b82f6; color: white; user-select: none; }
.memory-card.flipped { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: default; }
.memory-card.matched { background: #d1fae5; box-shadow: none; cursor: default; animation: matchPulse 0.5s; }
@keyframes matchPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.memory-restart-btn { padding: 10px 24px; background: #f59e0b; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.memory-restart-btn:hover { background: #d97706; }
.memory-win-msg { font-size: 18px; font-weight: 600; margin-top: 12px; color: #10b981; min-height: 28px; }
@media (max-width: 360px) { .memory-board { gap: 6px; } .memory-card { font-size: 24px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('memoryBoard');
  const timerEl = document.getElementById('timer');
  const movesEl = document.getElementById('moves');
  const matchedEl = document.getElementById('matched');
  const winMsg = document.getElementById('winMessage');

  const emojis = ['🍎','🍊','🍋','🍇','🍓','🍒','🥝','🍑'];
  let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  let flipped = [], matched = new Set(), moves = 0, seconds = 0, timer = null, locked = false;

  function render() {
    board.innerHTML = cards.map((emoji, i) => {
      const isFlipped = flipped.includes(i) || matched.has(i);
      const isMatched = matched.has(i);
      return '<div class="memory-card' + (isFlipped ? ' flipped' : '') + (isMatched ? ' matched' : '') + '" data-index="' + i + '">' + (isFlipped ? emoji : '?') + '</div>';
    }).join('');
    matchedEl.textContent = matched.size / 2;
    movesEl.textContent = moves;
    if (matched.size === cards.length) {
      clearInterval(timer);
      winMsg.textContent = '🎉 恭喜通关！用时 ' + seconds + ' 秒，共 ' + moves + ' 步';
    }
  }

  function flip(index) {
    if (locked || flipped.includes(index) || matched.has(index) || matched.size === cards.length) return;
    flipped.push(index);
    if (flipped.length === 1 && moves === 0) { timer = setInterval(() => { seconds++; timerEl.textContent = seconds; }, 1000); }
    render();

    if (flipped.length === 2) {
      moves++;
      const [a, b] = flipped;
      if (cards[a] === cards[b]) { matched.add(a); matched.add(b); flipped = []; render(); }
      else {
        locked = true;
        setTimeout(() => { flipped = []; locked = false; render(); }, 800);
      }
    }
  }

  board.addEventListener('click', e => {
    const card = e.target.closest('.memory-card');
    if (!card) return;
    flip(parseInt(card.dataset.index));
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    clearInterval(timer); timer = null; seconds = 0; moves = 0;
    cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    flipped = []; matched = new Set(); locked = false;
    timerEl.textContent = '0'; winMsg.textContent = '';
    render();
  });

  render();
});
`,
};

export const memoryTemplate: AppTemplate = {
  id: 'memory',
  name: '记忆翻牌',
  category: 'games',
  description: '4×4 记忆翻牌游戏，配对判定和步数统计',
  icon: 'Brain',
  params: {},
  code: defaultCode,
};
