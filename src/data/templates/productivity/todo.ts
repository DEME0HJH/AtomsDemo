import { AppTemplate, TemplateParams, defaultTheme } from '../types';

const defaultCode = {
  html: `
<div class="app-container" id="todoApp">
  <header class="app-header">
    <h1 class="app-title">待办事项</h1>
    <p class="app-subtitle">让每一天更有条理</p>
  </header>
  <div class="input-group">
    <input type="text" id="todoInput" class="todo-input" placeholder="添加新任务..." />
    <button id="addBtn" class="add-btn">添加</button>
  </div>
  <div class="filter-group">
    <button class="filter-btn active" data-filter="all">全部</button>
    <button class="filter-btn" data-filter="active">未完成</button>
    <button class="filter-btn" data-filter="completed">已完成</button>
  </div>
  <ul id="todoList" class="todo-list"></ul>
  <div class="stats">
    <span id="todoCount">0 项任务</span>
    <button id="clearCompleted" class="clear-btn">清除已完成</button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.app-container { max-width: 480px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; background: #f9fafb; }
.app-header { text-align: center; margin-bottom: 24px; }
.app-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.app-subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
.input-group { display: flex; gap: 8px; margin-bottom: 16px; }
.todo-input { flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 15px; outline: none; transition: border-color 0.2s; background: #fff; }
.todo-input:focus { border-color: #3b82f6; }
.add-btn { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
.add-btn:hover { background: #2563eb; }
.add-btn:active { transform: scale(0.97); }
.filter-group { display: flex; gap: 6px; margin-bottom: 16px; justify-content: center; }
.filter-btn { padding: 6px 14px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 13px; background: #fff; color: #6b7280; cursor: pointer; transition: all 0.2s; }
.filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.todo-list { list-style: none; }
.todo-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border-radius: 12px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); animation: slideIn 0.3s ease; transition: transform 0.2s, opacity 0.2s; }
.todo-item:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.todo-item.completed { opacity: 0.6; }
.todo-item.completed .todo-text { text-decoration: line-through; color: #9ca3af; }
.todo-item.removing { transform: translateX(100%); opacity: 0; }
.todo-checkbox { width: 20px; height: 20px; accent-color: #3b82f6; cursor: pointer; flex-shrink: 0; }
.todo-text { flex: 1; font-size: 15px; color: #374151; word-break: break-all; }
.todo-delete { padding: 6px 10px; background: #fee2e2; color: #ef4444; border: none; border-radius: 8px; font-size: 12px; cursor: pointer; transition: background 0.2s; }
.todo-delete:hover { background: #fecaca; }
.stats { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; font-size: 13px; color: #6b7280; }
.clear-btn { background: none; border: none; color: #ef4444; font-size: 13px; cursor: pointer; }
.clear-btn:hover { text-decoration: underline; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) { .app-container { padding: 16px 12px; } .app-title { font-size: 24px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const list = document.getElementById('todoList');
  const countSpan = document.getElementById('todoCount');
  const clearBtn = document.getElementById('clearCompleted');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let todos = JSON.parse(localStorage.getItem('atoms_todos') || '[]');
  let currentFilter = 'all';

  function save() { localStorage.setItem('atoms_todos', JSON.stringify(todos)); }
  function updateCount() {
    const active = todos.filter(t => !t.completed).length;
    countSpan.textContent = active + ' 项任务';
  }
  function render() {
    list.innerHTML = '';
    const filtered = currentFilter === 'active' ? todos.filter(t => !t.completed)
      : currentFilter === 'completed' ? todos.filter(t => t.completed) : todos;
    if (filtered.length === 0) {
      list.innerHTML = '<li class="todo-item" style="justify-content:center;color:#9ca3af;font-size:14px;">暂无任务</li>';
    }
    filtered.forEach((todo, i) => {
      const idx = todos.indexOf(todo);
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.innerHTML = '<input type="checkbox" class="todo-checkbox" data-idx="' + idx + '" ' + (todo.completed ? 'checked' : '') + '>' +
        '<span class="todo-text">' + escapeHtml(todo.text) + '</span>' +
        '<button class="todo-delete" data-idx="' + idx + '">删除</button>';
      list.appendChild(li);
    });
    updateCount();
    save();
  }
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    todos.unshift({ text, completed: false, createdAt: Date.now() });
    input.value = '';
    render();
    input.focus();
  }
  addBtn.addEventListener('click', addTodo);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

  list.addEventListener('click', e => {
    const idx = e.target.dataset.idx;
    if (idx === undefined) return;
    if (e.target.classList.contains('todo-checkbox')) {
      todos[idx].completed = e.target.checked;
      render();
    } else if (e.target.classList.contains('todo-delete')) {
      todos.splice(idx, 1);
      render();
    }
  });

  clearBtn.addEventListener('click', () => { todos = todos.filter(t => !t.completed); render(); });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
  input.focus();
});
`,
};

export const todoTemplate: AppTemplate = {
  id: 'todo',
  name: '待办事项',
  category: 'productivity',
  description: '任务管理应用，支持分类筛选和本地存储',
  icon: 'CheckSquare',
  params: {
    title: '待办事项',
  },
  code: defaultCode,
  generate(params: TemplateParams) {
    if (!params.title || params.title === '待办事项') return defaultCode;
    return {
      html: defaultCode.html.replace('待办事项', params.title),
      css: defaultCode.css,
      js: defaultCode.js,
    };
  },
};
