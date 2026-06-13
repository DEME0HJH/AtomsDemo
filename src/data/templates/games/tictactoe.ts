import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="ttt-app">
  <header class="ttt-header">
    <h1 class="ttt-title">🎮 井字棋</h1>
  </header>
  <div class="ttt-info">
    <span class="ttt-turn" id="turnIndicator">轮到 ✕ 落子</span>
  </div>
  <div class="ttt-board" id="board">
    <button class="ttt-cell" data-index="0"></button>
    <button class="ttt-cell" data-index="1"></button>
    <button class="ttt-cell" data-index="2"></button>
    <button class="ttt-cell" data-index="3"></button>
    <button class="ttt-cell" data-index="4"></button>
    <button class="ttt-cell" data-index="5"></button>
    <button class="ttt-cell" data-index="6"></button>
    <button class="ttt-cell" data-index="7"></button>
    <button class="ttt-cell" data-index="8"></button>
  </div>
  <div class="ttt-score">
    <div class="ttt-score-item">
      <span class="ttt-score-label">✕</span>
      <span class="ttt-score-value" id="scoreX">0</span>
    </div>
    <div class="ttt-score-item">
      <span class="ttt-score-label">平局</span>
      <span class="ttt-score-value" id="scoreDraw">0</span>
    </div>
    <div class="ttt-score-item">
      <span class="ttt-score-label">○</span>
      <span class="ttt-score-value" id="scoreO">0</span>
    </div>
  </div>
  <button id="resetBtn" class="ttt-reset-btn">重新开始</button>
  <p id="resultMessage" class="ttt-result"></p>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.ttt-app { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
.ttt-header { margin-bottom: 16px; }
.ttt-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.ttt-info { margin-bottom: 16px; }
.ttt-turn { font-size: 16px; font-weight: 600; color: #3b82f6; }
.ttt-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: #1e293b; border-radius: 16px; padding: 6px; max-width: 270px; width: 100%; margin-bottom: 20px; }
.ttt-cell { aspect-ratio: 1; background: #f8fafc; border: none; border-radius: 10px; font-size: 36px; font-weight: 700; cursor: pointer; transition: background 0.2s; color: #1e293b; display: flex; align-items: center; justify-content: center; }
.ttt-cell:hover:not(.played) { background: #e2e8f0; }
.ttt-cell.played { cursor: default; }
.ttt-cell.win { background: #dbeafe; color: #3b82f6; }
.ttt-score { display: flex; gap: 20px; margin-bottom: 16px; }
.ttt-score-item { text-align: center; }
.ttt-score-label { display: block; font-size: 20px; }
.ttt-score-value { font-size: 24px; font-weight: 700; color: #374151; }
.ttt-reset-btn { padding: 12px 32px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.ttt-reset-btn:hover { background: #2563eb; }
.ttt-result { font-size: 18px; font-weight: 600; margin-top: 12px; min-height: 28px; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const cells = board.querySelectorAll('.ttt-cell');
  const turnIndicator = document.getElementById('turnIndicator');
  const scoreX = document.getElementById('scoreX');
  const scoreO = document.getElementById('scoreO');
  const scoreDraw = document.getElementById('scoreDraw');
  const resultMsg = document.getElementById('resultMessage');
  const resetBtn = document.getElementById('resetBtn');

  let state = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameOver = false;
  let scores = JSON.parse(localStorage.getItem('atoms_tictactoe') || '{"X":0,"O":0,"draw":0}');

  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function updateScore() { scoreX.textContent = scores.X; scoreO.textContent = scores.O; scoreDraw.textContent = scores.draw; localStorage.setItem('atoms_tictactoe', JSON.stringify(scores)); }
  function render() {
    cells.forEach((c, i) => { c.textContent = state[i] || ''; c.classList.toggle('played', !!state[i]); c.classList.remove('win'); });
    turnIndicator.textContent = gameOver ? '' : ('轮到 ' + (currentPlayer === 'X' ? '✕' : '○') + ' 落子');
  }
  function checkWin() {
    for (const [a,b,c] of winLines) {
      if (state[a] && state[a] === state[b] && state[b] === state[c]) {
        cells[a].classList.add('win'); cells[b].classList.add('win'); cells[c].classList.add('win');
        return state[a];
      }
    }
    return state.every(c => c !== null) ? 'draw' : null;
  }
  function makeMove(idx) {
    if (gameOver || state[idx]) return;
    state[idx] = currentPlayer;
    render();
    const winner = checkWin();
    if (winner) {
      gameOver = true;
      if (winner === 'draw') { resultMsg.textContent = '🤝 平局！'; scores.draw++; }
      else { resultMsg.textContent = (winner === 'X' ? '✕' : '○') + ' 获胜！🎉'; scores[winner]++; }
      updateScore();
      turnIndicator.textContent = '';
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      render();
    }
  }
  function reset() {
    state = Array(9).fill(null); currentPlayer = 'X'; gameOver = false; resultMsg.textContent = ''; render();
  }

  board.addEventListener('click', e => {
    if (!e.target.matches('.ttt-cell')) return;
    makeMove(parseInt(e.target.dataset.index));
  });
  resetBtn.addEventListener('click', reset);
  updateScore(); render();
});
`,
};

export const tictactoeTemplate: AppTemplate = {
  id: 'tictactoe',
  name: '井字棋',
  category: 'games',
  description: '经典井字棋，双人对战，胜负判定',
  icon: 'Grid3X3',
  params: {},
  code: defaultCode,
};
