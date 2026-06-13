import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="quote-app">
  <div class="quote-card" id="quoteCard">
    <div class="quote-icon">💬</div>
    <blockquote class="quote-text" id="quoteText">生活不止眼前的苟且，还有诗和远方。</blockquote>
    <p class="quote-author" id="quoteAuthor">—— 高晓松</p>
  </div>
  <div class="quote-controls">
    <button id="newQuoteBtn" class="quote-btn quote-new-btn">✨ 换一句</button>
    <button id="copyBtn" class="quote-btn quote-copy-btn">📋 复制</button>
    <button id="shareBtn" class="quote-btn quote-share-btn">📤 分享</button>
  </div>
  <div class="quote-themes">
    <span class="quote-theme-label">配色：</span>
    <button class="quote-theme-dot" data-theme="default" style="background:linear-gradient(135deg,#667eea,#764ba2)"></button>
    <button class="quote-theme-dot" data-theme="warm" style="background:linear-gradient(135deg,#f97316,#ec4899)"></button>
    <button class="quote-theme-dot" data-theme="nature" style="background:linear-gradient(135deg,#10b981,#06b6d4)"></button>
    <button class="quote-theme-dot" data-theme="dark" style="background:linear-gradient(135deg,#374151,#1f2937)"></button>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.quote-app { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Noto Serif SC', serif; padding: 20px; transition: background 0.5s; }
.quote-card { background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); border-radius: 24px; padding: 40px 32px; max-width: 500px; width: 100%; text-align: center; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.1); margin-bottom: 24px; transition: opacity 0.3s; }
.quote-icon { font-size: 40px; margin-bottom: 16px; }
.quote-text { font-size: 22px; line-height: 1.6; font-weight: 500; margin-bottom: 16px; font-style: italic; }
.quote-author { font-size: 16px; opacity: 0.8; }
.quote-controls { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center; }
.quote-btn { padding: 12px 24px; border: 2px solid rgba(255,255,255,0.3); border-radius: 14px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.15); color: white; }
.quote-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
.quote-themes { display: flex; align-items: center; gap: 8px; }
.quote-theme-label { color: rgba(255,255,255,0.7); font-size: 13px; }
.quote-theme-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; transition: transform 0.2s; }
.quote-theme-dot:hover { transform: scale(1.15); }
.quote-theme-dot.active { border-color: white; }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const quotes = [
    { text: '生活不止眼前的苟且，还有诗和远方。', author: '高晓松' },
    { text: '人生就是一场旅行，不在乎目的地，在乎的是沿途的风景以及看风景的心情。', author: '佚名' },
    { text: '世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。', author: '罗曼·罗兰' },
    { text: '你若盛开，蝴蝶自来；你若精彩，天自安排。', author: '佚名' },
    { text: '不要因为走得太远，而忘记为什么出发。', author: '纪伯伦' },
    { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
    { text: '种一棵树最好的时间是十年前，其次是现在。', author: '佚名' },
    { text: '当你真心渴望某样东西时，整个宇宙都会联合起来帮助你。', author: '保罗·柯艾略' },
    { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
    { text: '没有不可治愈的伤痛，没有不能结束的沉沦。', author: '约翰·肖尔斯' },
  ];

  const themes = {
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    warm: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    nature: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    dark: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
  };

  let currentQuote = 0;
  const app = document.querySelector('.quote-app');
  const card = document.getElementById('quoteCard');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');

  function showQuote(idx) {
    card.style.opacity = '0';
    setTimeout(() => {
      quoteText.textContent = quotes[idx].text;
      quoteAuthor.textContent = '—— ' + quotes[idx].author;
      card.style.opacity = '1';
      currentQuote = idx;
    }, 200);
  }

  function randomQuote() {
    let idx;
    do { idx = Math.floor(Math.random() * quotes.length); } while (idx === currentQuote && quotes.length > 1);
    showQuote(idx);
  }

  document.getElementById('newQuoteBtn').addEventListener('click', randomQuote);
  document.getElementById('copyBtn').addEventListener('click', () => {
    const txt = '"' + quotes[currentQuote].text + '" ——' + quotes[currentQuote].author;
    navigator.clipboard.writeText(txt).then(() => alert('名言已复制！')).catch(() => alert('复制失败'));
  });
  document.getElementById('shareBtn').addEventListener('click', () => {
    const txt = '"' + quotes[currentQuote].text + '" ——' + quotes[currentQuote].author;
    if (navigator.share) { navigator.share({ title: '名言分享', text: txt }).catch(() => {}); }
    else { navigator.clipboard.writeText(txt).then(() => alert('已复制到剪贴板！')).catch(() => {}); }
  });

  document.querySelectorAll('.quote-theme-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.quote-theme-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      app.style.background = themes[dot.dataset.theme] || themes.default;
    });
  });

  document.querySelector('[data-theme="default"]').classList.add('active');
  showQuote(0);
});
`,
};

export const quoteTemplate: AppTemplate = {
  id: 'quote',
  name: '名言卡片',
  category: 'creative',
  description: '名言卡片生成器，支持换肤和分享',
  icon: 'Quote',
  params: {},
  code: defaultCode,
};
