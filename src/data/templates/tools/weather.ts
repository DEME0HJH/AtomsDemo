import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="weather-app">
  <div class="weather-container">
    <header class="weather-header">
      <h1>🌤️ 天气查询</h1>
    </header>
    <div class="search-box">
      <input type="text" id="cityInput" class="city-input" placeholder="输入城市名称..." value="北京" />
      <button id="searchBtn" class="search-btn">查询</button>
    </div>
    <div class="suggestions" id="suggestions"></div>
    <div id="weatherCard" class="weather-card">
      <div class="weather-main">
        <div class="weather-icon" id="weatherIcon">☀️</div>
        <div class="weather-temp" id="temperature">22°C</div>
        <div class="weather-city" id="cityName">北京</div>
        <div class="weather-desc" id="weatherDesc">晴朗</div>
      </div>
      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-label">💧 湿度</span>
          <span class="detail-value" id="humidity">45%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🌬️ 风速</span>
          <span class="detail-value" id="wind">3级</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">🌡️ 体感</span>
          <span class="detail-value" id="feelsLike">20°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">📊 气压</span>
          <span class="detail-value" id="pressure">1013hPa</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.weather-app { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
.weather-container { width: 100%; max-width: 420px; }
.weather-header { text-align: center; margin-bottom: 24px; }
.weather-header h1 { color: white; font-size: 28px; font-weight: 700; }
.search-box { display: flex; gap: 8px; margin-bottom: 8px; }
.city-input { flex: 1; padding: 14px 18px; border: none; border-radius: 14px; font-size: 15px; outline: none; background: rgba(255,255,255,0.95); }
.city-input:focus { box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
.search-btn { padding: 14px 22px; background: white; color: #667eea; border: none; border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.search-btn:hover { background: #f0f0ff; transform: translateY(-1px); }
.suggestions { margin-bottom: 8px; }
.suggestion-item { padding: 8px 16px; background: rgba(255,255,255,0.9); border-radius: 8px; margin-bottom: 4px; cursor: pointer; font-size: 14px; color: #374151; transition: background 0.2s; }
.suggestion-item:hover { background: white; }
.weather-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 32px; color: white; }
.weather-main { text-align: center; margin-bottom: 24px; }
.weather-icon { font-size: 64px; margin-bottom: 8px; }
.weather-temp { font-size: 56px; font-weight: 700; }
.weather-city { font-size: 20px; font-weight: 500; margin-top: 4px; }
.weather-desc { font-size: 16px; opacity: 0.85; margin-top: 4px; }
.weather-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.detail-item { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 14px; text-align: center; }
.detail-label { display: block; font-size: 12px; opacity: 0.8; margin-bottom: 4px; }
.detail-value { font-size: 18px; font-weight: 600; }
@media (max-width: 400px) { .weather-card { padding: 20px; } .weather-temp { font-size: 44px; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const suggestions = document.getElementById('suggestions');

  const weatherDB = {
    '北京': { temp: 22, desc: '晴朗', icon: '☀️', humidity: 45, wind: 3, feelsLike: 20, pressure: 1013 },
    '上海': { temp: 25, desc: '多云', icon: '⛅', humidity: 60, wind: 2, feelsLike: 24, pressure: 1010 },
    '广州': { temp: 28, desc: '小雨', icon: '🌧️', humidity: 75, wind: 4, feelsLike: 30, pressure: 1008 },
    '深圳': { temp: 29, desc: '阴天', icon: '☁️', humidity: 70, wind: 3, feelsLike: 31, pressure: 1009 },
    '杭州': { temp: 24, desc: '晴朗', icon: '☀️', humidity: 55, wind: 2, feelsLike: 23, pressure: 1012 },
    '成都': { temp: 20, desc: '阴天', icon: '☁️', humidity: 70, wind: 1, feelsLike: 19, pressure: 1005 },
    '武汉': { temp: 26, desc: '多云', icon: '⛅', humidity: 65, wind: 3, feelsLike: 27, pressure: 1007 },
    '西安': { temp: 23, desc: '晴朗', icon: '☀️', humidity: 40, wind: 2, feelsLike: 22, pressure: 1011 },
  };

  const cityList = Object.keys(weatherDB);
  const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌨️', '🌫️'];
  const descs = ['晴朗', '多云', '阴天', '小雨', '雷阵雨', '小雪', '雾'];

  function getWeather(city) {
    if (weatherDB[city]) return weatherDB[city];
    const seed = city.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return {
      temp: 15 + (seed % 20),
      desc: descs[seed % descs.length],
      icon: icons[seed % icons.length],
      humidity: 30 + (seed % 50),
      wind: 1 + (seed % 5),
      feelsLike: 14 + (seed % 20),
      pressure: 1000 + (seed % 30),
    };
  }

  function renderWeather(city) {
    const w = getWeather(city);
    document.getElementById('weatherIcon').textContent = w.icon;
    document.getElementById('temperature').textContent = w.temp + '°C';
    document.getElementById('cityName').textContent = city;
    document.getElementById('weatherDesc').textContent = w.desc;
    document.getElementById('humidity').textContent = w.humidity + '%';
    document.getElementById('wind').textContent = w.wind + '级';
    document.getElementById('feelsLike').textContent = w.feelsLike + '°C';
    document.getElementById('pressure').textContent = w.pressure + 'hPa';
    suggestions.innerHTML = '';
  }

  searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) renderWeather(city);
  });
  cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn.click(); });

  cityInput.addEventListener('input', () => {
    const val = cityInput.value.trim().toLowerCase();
    if (!val) { suggestions.innerHTML = ''; return; }
    const matches = cityList.filter(c => c.toLowerCase().includes(val)).slice(0, 5);
    suggestions.innerHTML = matches.map(c => '<div class="suggestion-item">' + c + '</div>').join('');
  });

  suggestions.addEventListener('click', e => {
    if (e.target.classList.contains('suggestion-item')) {
      cityInput.value = e.target.textContent;
      renderWeather(e.target.textContent);
    }
  });

  renderWeather('北京');
});
`,
};

export const weatherTemplate: AppTemplate = {
  id: 'weather',
  name: '天气查询',
  category: 'tools',
  description: '天气查询应用，支持城市搜索建议',
  icon: 'CloudSun',
  params: {},
  code: defaultCode,
};
