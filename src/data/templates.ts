import { AppTemplate } from '@/types';

export const appTemplates: AppTemplate[] = [
  {
    id: 'todo',
    name: '待办事项',
    type: 'todo',
    description: '任务管理应用',
    code: {
      html: `
<div class="app-container">
  <h1>待办事项</h1>
  <div class="input-group">
    <input type="text" id="todoInput" placeholder="添加新任务..." />
    <button id="addBtn">添加</button>
  </div>
  <ul id="todoList"></ul>
</div>
      `,
      css: `
.app-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
button:hover {
  background: #2563eb;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}
li.completed {
  text-decoration: line-through;
  opacity: 0.6;
}
li input[type="checkbox"] {
  margin-right: 10px;
}
li button {
  margin-left: auto;
  padding: 4px 8px;
  background: #ef4444;
  font-size: 12px;
}
      `,
      js: `
document.addEventListener('DOMContentLoaded', function() {
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');

  let todos = JSON.parse(localStorage.getItem('todos') || '[]');

  function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = todo.completed ? 'completed' : '';
      li.innerHTML = \`
        <input type="checkbox" \${todo.completed ? 'checked' : ''} data-index="\${index}">
        <span>\${todo.text}</span>
        <button data-index="\${index}">删除</button>
      \`;
      todoList.appendChild(li);
    });
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
      todos.push({ text, completed: false });
      todoInput.value = '';
      renderTodos();
    }
  }

  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTodo();
  });

  todoList.addEventListener('click', function(e) {
    if (e.target.type === 'checkbox') {
      todos[e.target.dataset.index].completed = e.target.checked;
      renderTodos();
    }
    if (e.target.tagName === 'BUTTON') {
      todos.splice(e.target.dataset.index, 1);
      renderTodos();
    }
  });

  renderTodos();
});
      `,
    },
  },
  {
    id: 'weather',
    name: '天气查询',
    type: 'weather',
    description: '实时天气展示',
    code: {
      html: `
<div class="app-container">
  <h1>天气查询</h1>
  <div class="search-box">
    <input type="text" id="cityInput" placeholder="输入城市名称..." value="北京" />
    <button id="searchBtn">查询</button>
  </div>
  <div id="weatherResult" class="weather-card">
    <div class="city-name">北京</div>
    <div class="temperature">22°C</div>
    <div class="weather-desc">晴朗</div>
    <div class="details">
      <div>湿度: 45%</div>
      <div>风速: 3级</div>
      <div>气压: 1013hPa</div>
    </div>
  </div>
</div>
      `,
      css: `
.app-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
button:hover {
  background: #2563eb;
}
.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
}
.city-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.temperature {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}
.weather-desc {
  font-size: 18px;
  margin-bottom: 20px;
}
.details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-size: 14px;
}
      `,
      js: `
document.addEventListener('DOMContentLoaded', function() {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const weatherResult = document.getElementById('weatherResult');

  const weatherData = {
    '北京': { temp: 22, desc: '晴朗', humidity: '45%', wind: '3级', pressure: '1013hPa' },
    '上海': { temp: 25, desc: '多云', humidity: '60%', wind: '2级', pressure: '1010hPa' },
    '广州': { temp: 28, desc: '小雨', humidity: '75%', wind: '4级', pressure: '1008hPa' },
    '深圳': { temp: 29, desc: '阴天', humidity: '70%', wind: '3级', pressure: '1009hPa' },
    '杭州': { temp: 24, desc: '晴朗', humidity: '55%', wind: '2级', pressure: '1012hPa' },
  };

  function searchWeather() {
    const city = cityInput.value.trim();
    const data = weatherData[city] || {
      temp: Math.floor(Math.random() * 20 + 15),
      desc: '未知',
      humidity: Math.floor(Math.random() * 40 + 40) + '%',
      wind: Math.floor(Math.random() * 5 + 1) + '级',
      pressure: Math.floor(Math.random() * 20 + 1000) + 'hPa'
    };

    weatherResult.innerHTML = \`
      <div class="city-name">\${city}</div>
      <div class="temperature">\${data.temp}°C</div>
      <div class="weather-desc">\${data.desc}</div>
      <div class="details">
        <div>湿度: \${data.humidity}</div>
        <div>风速: \${data.wind}</div>
        <div>气压: \${data.pressure}</div>
      </div>
    \`;
  }

  searchBtn.addEventListener('click', searchWeather);
  cityInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchWeather();
  });
});
      `,
    },
  },
  {
    id: 'calculator',
    name: '计算器',
    type: 'calculator',
    description: '科学计算器',
    code: {
      html: `
<div class="app-container">
  <h1>计算器</h1>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="buttons">
      <button class="clear" data-action="clear">C</button>
      <button data-action="operator" data-value="/">÷</button>
      <button data-action="operator" data-value="*">×</button>
      <button data-action="delete">←</button>
      <button data-action="number" data-value="7">7</button>
      <button data-action="number" data-value="8">8</button>
      <button data-action="number" data-value="9">9</button>
      <button data-action="operator" data-value="-">-</button>
      <button data-action="number" data-value="4">4</button>
      <button data-action="number" data-value="5">5</button>
      <button data-action="number" data-value="6">6</button>
      <button data-action="operator" data-value="+">+</button>
      <button data-action="number" data-value="1">1</button>
      <button data-action="number" data-value="2">2</button>
      <button data-action="number" data-value="3">3</button>
      <button class="equals" data-action="calculate">=</button>
      <button class="zero" data-action="number" data-value="0">0</button>
      <button data-action="number" data-value=".">.</button>
    </div>
  </div>
</div>
      `,
      css: `
.app-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
.calculator {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 20px;
}
.display {
  background: #333;
  color: white;
  font-size: 32px;
  text-align: right;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  min-height: 50px;
  word-wrap: break-word;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
button {
  padding: 15px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #333;
  color: white;
  transition: background 0.2s;
}
button:hover {
  background: #444;
}
button.clear {
  background: #ef4444;
}
button.clear:hover {
  background: #dc2626;
}
button.equals {
  background: #3b82f6;
  grid-row: span 2;
}
button.equals:hover {
  background: #2563eb;
}
button.zero {
  grid-column: span 2;
}
      `,
      js: `
document.addEventListener('DOMContentLoaded', function() {
  const display = document.getElementById('display');
  const buttons = document.querySelector('.buttons');

  let currentValue = '0';
  let previousValue = '';
  let operator = '';

  function updateDisplay() {
    display.textContent = currentValue;
  }

  function clear() {
    currentValue = '0';
    previousValue = '';
    operator = '';
    updateDisplay();
  }

  function deleteLast() {
    currentValue = currentValue.slice(0, -1) || '0';
    updateDisplay();
  }

  function appendNumber(num) {
    if (currentValue === '0' && num !== '.') {
      currentValue = num;
    } else {
      currentValue += num;
    }
    updateDisplay();
  }

  function setOperator(op) {
    previousValue = currentValue;
    currentValue = '0';
    operator = op;
  }

  function calculate() {
    if (!operator || !previousValue) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    switch (operator) {
      case '+':
        currentValue = String(prev + current);
        break;
      case '-':
        currentValue = String(prev - current);
        break;
      case '*':
        currentValue = String(prev * current);
        break;
      case '/':
        currentValue = current === 0 ? 'Error' : String(prev / current);
        break;
    }

    operator = '';
    previousValue = '';
    updateDisplay();
  }

  buttons.addEventListener('click', function(e) {
    if (!e.target.matches('button')) return;

    const action = e.target.dataset.action;
    const value = e.target.dataset.value;

    switch (action) {
      case 'clear':
        clear();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'number':
        appendNumber(value);
        break;
      case 'operator':
        setOperator(value);
        break;
      case 'calculate':
        calculate();
        break;
    }
  });
});
      `,
    },
  },
];
