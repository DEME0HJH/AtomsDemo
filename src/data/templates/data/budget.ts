import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="budget-app">
  <header class="budget-header">
    <h1 class="budget-title">💰 记账本</h1>
    <p class="budget-month" id="currentMonth">6月 2026</p>
  </header>
  <div class="budget-summary">
    <div class="budget-summary-item income">
      <span class="summary-label">收入</span>
      <span class="summary-value" id="totalIncome">¥0.00</span>
    </div>
    <div class="budget-summary-item expense">
      <span class="summary-label">支出</span>
      <span class="summary-value" id="totalExpense">¥0.00</span>
    </div>
    <div class="budget-summary-item balance">
      <span class="summary-label">结余</span>
      <span class="summary-value" id="balance">¥0.00</span>
    </div>
  </div>
  <div class="budget-input-group">
    <input type="text" id="descInput" class="budget-desc-input" placeholder="描述..." />
    <input type="number" id="amountInput" class="budget-amount-input" placeholder="金额" step="0.01" min="0" />
    <select id="typeSelect" class="budget-type-select">
      <option value="expense">支出</option>
      <option value="income">收入</option>
    </select>
    <select id="categorySelect" class="budget-category-select">
      <option value="🍔 餐饮">🍔 餐饮</option>
      <option value="🚗 交通">🚗 交通</option>
      <option value="🛒 购物">🛒 购物</option>
      <option value="🏠 住房">🏠 住房</option>
      <option value="🎮 娱乐">🎮 娱乐</option>
      <option value="💊 医疗">💊 医疗</option>
      <option value="📚 教育">📚 教育</option>
      <option value="💼 工资">💼 工资</option>
      <option value="💰 其他">💰 其他</option>
    </select>
    <button id="addRecordBtn" class="budget-add-btn">记一笔</button>
  </div>
  <div id="recordsList" class="budget-records"></div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.budget-app { max-width: 500px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #f8fafc; }
.budget-header { text-align: center; margin-bottom: 20px; }
.budget-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.budget-month { font-size: 14px; color: #6b7280; margin-top: 4px; }
.budget-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.budget-summary-item { text-align: center; padding: 14px 8px; border-radius: 14px; }
.budget-summary-item.income { background: #ecfdf5; }
.budget-summary-item.expense { background: #fef2f2; }
.budget-summary-item.balance { background: #eff6ff; }
.summary-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.summary-value { font-size: 18px; font-weight: 700; }
.income .summary-value { color: #10b981; }
.expense .summary-value { color: #ef4444; }
.balance .summary-value { color: #3b82f6; }
.budget-input-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding: 16px; background: white; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.budget-desc-input { flex: 2; min-width: 120px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; }
.budget-amount-input { flex: 1; min-width: 80px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; }
.budget-type-select, .budget-category-select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; cursor: pointer; background: white; }
.budget-desc-input:focus, .budget-amount-input:focus, .budget-type-select:focus, .budget-category-select:focus { border-color: #3b82f6; }
.budget-add-btn { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.budget-add-btn:hover { background: #2563eb; }
.budget-records { display: flex; flex-direction: column; gap: 6px; }
.record-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: white; border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.record-category { font-size: 18px; }
.record-desc { flex: 1; font-size: 14px; color: #374151; }
.record-amount { font-weight: 600; font-size: 15px; }
.record-amount.income { color: #10b981; }
.record-amount.expense { color: #ef4444; }
.record-delete { padding: 4px 8px; background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; }
.empty-records { text-align: center; color: #9ca3af; padding: 40px; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const descInput = document.getElementById('descInput');
  const amountInput = document.getElementById('amountInput');
  const typeSelect = document.getElementById('typeSelect');
  const categorySelect = document.getElementById('categorySelect');
  const recordsList = document.getElementById('recordsList');

  let records = JSON.parse(localStorage.getItem('atoms_budget') || '[]');
  const now = new Date();
  document.getElementById('currentMonth').textContent = (now.getMonth()+1) + '月 ' + now.getFullYear();

  function save() { localStorage.setItem('atoms_budget', JSON.stringify(records)); updateSummary(); }
  function updateSummary() {
    let income = 0, expense = 0;
    records.forEach(r => { if (r.type === 'income') income += r.amount; else expense += r.amount; });
    document.getElementById('totalIncome').textContent = '¥' + income.toFixed(2);
    document.getElementById('totalExpense').textContent = '¥' + expense.toFixed(2);
    document.getElementById('balance').textContent = '¥' + (income - expense).toFixed(2);
  }
  function render() {
    if (records.length === 0) {
      recordsList.innerHTML = '<div class="empty-records">📝 还没有记录，开始记账吧！</div>';
    } else {
      recordsList.innerHTML = records.map((r, i) => '<div class="record-item">' +
        '<span class="record-category">' + r.category.split(' ')[0] + '</span>' +
        '<span class="record-desc">' + escapeHtml(r.desc) + ' <small style="color:#9ca3af">' + r.category.split(' ')[1] + '</small></span>' +
        '<span class="record-amount ' + r.type + '">' + (r.type === 'income' ? '+' : '-') + '¥' + r.amount.toFixed(2) + '</span>' +
        '<button class="record-delete" data-idx="' + i + '">删除</button>' +
      '</div>').join('');
    }
    updateSummary();
  }
  function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function addRecord() {
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    if (!desc || isNaN(amount) || amount <= 0) { alert('请输入描述和有效金额'); return; }
    records.unshift({ desc, amount, type: typeSelect.value, category: categorySelect.value, date: Date.now() });
    descInput.value = ''; amountInput.value = ''; save(); render();
  }

  document.getElementById('addRecordBtn').addEventListener('click', addRecord);
  amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') addRecord(); });
  recordsList.addEventListener('click', e => {
    if (e.target.classList.contains('record-delete')) {
      records.splice(parseInt(e.target.dataset.idx), 1);
      save(); render();
    }
  });

  render();
});
`,
};

export const budgetTemplate: AppTemplate = {
  id: 'budget',
  name: '记账本',
  category: 'data',
  description: '收支记账本，分类统计和月度汇总',
  icon: 'Wallet',
  params: {},
  code: defaultCode,
};
