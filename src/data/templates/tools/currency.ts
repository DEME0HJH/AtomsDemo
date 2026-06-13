import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="currency-app">
  <header class="cur-header">
    <h1 class="cur-title">💱 汇率转换</h1>
  </header>
  <div class="cur-card">
    <div class="cur-input-group">
      <label class="cur-label">金额</label>
      <input type="number" id="amountInput" class="cur-amount-input" value="100" min="0" step="any" />
    </div>
    <div class="cur-row">
      <div class="cur-select-group">
        <label class="cur-label">从</label>
        <select id="fromCurrency" class="cur-select">
          <option value="CNY">🇨🇳 CNY - 人民币</option>
          <option value="USD">🇺🇸 USD - 美元</option>
          <option value="EUR">🇪🇺 EUR - 欧元</option>
          <option value="JPY">🇯🇵 JPY - 日元</option>
          <option value="GBP">🇬🇧 GBP - 英镑</option>
          <option value="KRW">🇰🇷 KRW - 韩元</option>
          <option value="HKD">🇭🇰 HKD - 港币</option>
        </select>
      </div>
      <button id="swapBtn" class="cur-swap-btn" title="交换">⇄</button>
      <div class="cur-select-group">
        <label class="cur-label">到</label>
        <select id="toCurrency" class="cur-select">
          <option value="USD" selected>🇺🇸 USD - 美元</option>
          <option value="CNY">🇨🇳 CNY - 人民币</option>
          <option value="EUR">🇪🇺 EUR - 欧元</option>
          <option value="JPY">🇯🇵 JPY - 日元</option>
          <option value="GBP">🇬🇧 GBP - 英镑</option>
          <option value="KRW">🇰🇷 KRW - 韩元</option>
          <option value="HKD">🇭🇰 HKD - 港币</option>
        </select>
      </div>
    </div>
    <div class="cur-result" id="result">
      <span class="cur-result-amount" id="resultAmount">13.90</span>
      <span class="cur-result-unit" id="resultUnit">USD</span>
    </div>
    <p class="cur-rate-text" id="rateText">1 CNY = 0.1390 USD</p>
    <p class="cur-update-time" id="updateTime">汇率更新时间: --</p>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.currency-app { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #1e40af, #3b82f6); font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
.cur-header { text-align: center; margin-bottom: 24px; }
.cur-title { color: white; font-size: 28px; font-weight: 700; }
.cur-card { background: white; border-radius: 24px; padding: 28px; max-width: 400px; width: 100%; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.cur-input-group { margin-bottom: 20px; }
.cur-label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500; }
.cur-amount-input { width: 100%; padding: 14px 18px; border: 2px solid #e5e7eb; border-radius: 14px; font-size: 20px; font-weight: 600; outline: none; transition: border-color 0.2s; }
.cur-amount-input:focus { border-color: #3b82f6; }
.cur-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 24px; }
.cur-select-group { flex: 1; }
.cur-select { width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; background: white; cursor: pointer; }
.cur-select:focus { border-color: #3b82f6; }
.cur-swap-btn { width: 40px; height: 40px; border: 2px solid #e5e7eb; border-radius: 50%; background: white; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
.cur-swap-btn:hover { border-color: #3b82f6; background: #eff6ff; transform: rotate(180deg); }
.cur-result { text-align: center; padding: 20px; background: #f0f9ff; border-radius: 16px; margin-bottom: 12px; }
.cur-result-amount { font-size: 32px; font-weight: 700; color: #1e40af; }
.cur-result-unit { font-size: 18px; color: #6b7280; margin-left: 4px; }
.cur-rate-text { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.cur-update-time { text-align: center; font-size: 12px; color: #9ca3af; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amountInput');
  const fromSelect = document.getElementById('fromCurrency');
  const toSelect = document.getElementById('toCurrency');
  const swapBtn = document.getElementById('swapBtn');

  const rates = {
    CNY: 1, USD: 0.139, EUR: 0.128, JPY: 20.72, GBP: 0.109, KRW: 182.5, HKD: 1.087,
  };

  function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;
    const cnyAmount = amount / rates[from];
    const result = cnyAmount * rates[to];
    document.getElementById('resultAmount').textContent = result.toFixed(2);
    document.getElementById('resultUnit').textContent = to;
    document.getElementById('rateText').textContent = '1 ' + from + ' = ' + (rates[to] / rates[from]).toFixed(4) + ' ' + to;
    document.getElementById('updateTime').textContent = '汇率更新: ' + new Date().toLocaleString();
  }

  amountInput.addEventListener('input', convert);
  fromSelect.addEventListener('change', convert);
  toSelect.addEventListener('change', convert);
  swapBtn.addEventListener('click', () => {
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    convert();
  });

  convert();
});
`,
};

export const currencyTemplate: AppTemplate = {
  id: 'currency',
  name: '汇率转换',
  category: 'tools',
  description: '多币种汇率转换器，支持 7 种常用货币',
  icon: 'ArrowLeftRight',
  params: {},
  code: defaultCode,
};
