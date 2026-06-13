import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="calc-app">
  <div class="calculator">
    <div class="calc-display" id="display">0</div>
    <div class="calc-buttons">
      <button class="calc-btn func" data-action="clear">C</button>
      <button class="calc-btn func" data-action="operator" data-value="/">÷</button>
      <button class="calc-btn func" data-action="operator" data-value="*">×</button>
      <button class="calc-btn func" data-action="delete">⌫</button>
      <button class="calc-btn" data-action="number" data-value="7">7</button>
      <button class="calc-btn" data-action="number" data-value="8">8</button>
      <button class="calc-btn" data-action="number" data-value="9">9</button>
      <button class="calc-btn func" data-action="operator" data-value="-">-</button>
      <button class="calc-btn" data-action="number" data-value="4">4</button>
      <button class="calc-btn" data-action="number" data-value="5">5</button>
      <button class="calc-btn" data-action="number" data-value="6">6</button>
      <button class="calc-btn func" data-action="operator" data-value="+">+</button>
      <button class="calc-btn" data-action="number" data-value="1">1</button>
      <button class="calc-btn" data-action="number" data-value="2">2</button>
      <button class="calc-btn" data-action="number" data-value="3">3</button>
      <button class="calc-btn" data-action="operator" data-value="%">%</button>
      <button class="calc-btn zero" data-action="number" data-value="0">0</button>
      <button class="calc-btn" data-action="number" data-value=".">.</button>
      <button class="calc-btn equals" data-action="calculate">=</button>
    </div>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.calc-app { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; font-family: -apple-system, sans-serif; padding: 20px; }
.calculator { background: #1e293b; border-radius: 24px; padding: 24px; max-width: 340px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.calc-display { background: #0f172a; color: white; font-size: 36px; text-align: right; padding: 20px; border-radius: 16px; margin-bottom: 20px; min-height: 80px; display: flex; align-items: center; justify-content: flex-end; overflow: hidden; word-break: break-all; }
.calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.calc-btn { padding: 16px 0; font-size: 20px; border: none; border-radius: 14px; cursor: pointer; background: #334155; color: white; font-weight: 500; transition: all 0.15s; }
.calc-btn:hover { background: #475569; transform: translateY(-1px); }
.calc-btn:active { transform: scale(0.95); }
.calc-btn.func { background: #475569; color: #93c5fd; }
.calc-btn.func:hover { background: #64748b; }
.calc-btn.equals { background: #3b82f6; color: white; }
.calc-btn.equals:hover { background: #2563eb; }
.calc-btn.zero { grid-column: span 2; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  let current = '0', previous = '', operator = '', shouldResetDisplay = false;

  function update() { display.textContent = current; }
  function clear() { current = '0'; previous = ''; operator = ''; shouldResetDisplay = false; update(); }
  function appendNum(num) {
    if (num === '.' && current.includes('.')) return;
    if (shouldResetDisplay || current === '0') { if (num !== '.') { current = num; shouldResetDisplay = false; } else { current = '0.'; shouldResetDisplay = false; } }
    else current += num;
    update();
  }
  function setOp(op) {
    if (operator && !shouldResetDisplay) calculate();
    previous = current; operator = op; shouldResetDisplay = true;
  }
  function calculate() {
    if (!operator || shouldResetDisplay) return;
    const prev = parseFloat(previous), curr = parseFloat(current);
    let result;
    switch (operator) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/': if (curr === 0) { current = 'Error'; previous = ''; operator = ''; update(); return; } result = prev / curr; break;
      case '%': result = prev % curr; break;
      default: return;
    }
    current = String(Math.round(result * 1e10) / 1e10);
    previous = ''; operator = ''; shouldResetDisplay = true; update();
  }
  function deleteLast() {
    if (shouldResetDisplay) return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    update();
  }

  document.querySelector('.calc-buttons').addEventListener('click', e => {
    if (!e.target.matches('button')) return;
    const action = e.target.dataset.action;
    const value = e.target.dataset.value;
    switch (action) {
      case 'clear': clear(); break;
      case 'delete': deleteLast(); break;
      case 'number': appendNum(value); break;
      case 'operator': setOp(value); break;
      case 'calculate': calculate(); break;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') appendNum(e.key);
    else if (e.key === '.') appendNum('.');
    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') setOp(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Escape') clear();
    else if (e.key === 'Backspace') deleteLast();
  });
  update();
});
`,
};

export const calculatorTemplate: AppTemplate = {
  id: 'calculator',
  name: '计算器',
  category: 'tools',
  description: '科学计算器，支持四则运算和键盘操作',
  icon: 'Calculator',
  params: {},
  code: defaultCode,
};
