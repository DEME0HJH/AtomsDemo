import { AppTemplate, TemplateCategory, TemplateParams } from './types';

// Import all templates
import { todoTemplate } from './productivity/todo';
import { pomodoroTemplate } from './productivity/pomodoro';
import { notesTemplate } from './productivity/notes';
import { habitTemplate } from './productivity/habit';
import { calculatorTemplate } from './tools/calculator';
import { weatherTemplate } from './tools/weather';
import { currencyTemplate } from './tools/currency';
import { qrcodeTemplate } from './tools/qrcode';
import { drawingTemplate } from './creative/drawing';
import { quoteTemplate } from './creative/quote';
import { colorpaletteTemplate } from './creative/colorpalette';
import { budgetTemplate } from './data/budget';
import { chartTemplate } from './data/chart';
import { countdownTemplate } from './data/countdown';
import { tictactoeTemplate } from './games/tictactoe';
import { memoryTemplate } from './games/memory';

// All templates registry
export const allTemplates: AppTemplate[] = [
  todoTemplate,
  pomodoroTemplate,
  notesTemplate,
  habitTemplate,
  calculatorTemplate,
  weatherTemplate,
  currencyTemplate,
  qrcodeTemplate,
  drawingTemplate,
  quoteTemplate,
  colorpaletteTemplate,
  budgetTemplate,
  chartTemplate,
  countdownTemplate,
  tictactoeTemplate,
  memoryTemplate,
];

// Get templates by category
export function getTemplatesByCategory(category: TemplateCategory): AppTemplate[] {
  return allTemplates.filter(t => t.category === category);
}

// Get template by ID
export function getTemplateById(id: string): AppTemplate | undefined {
  return allTemplates.find(t => t.id === id);
}

// Keyword-based smart matching (Phase 1: rule-based; Phase 2: LLM-enhanced)
export function matchTemplate(prompt: string): { template: AppTemplate; confidence: number } {
  const lower = prompt.toLowerCase();

  const rules: [RegExp, string][] = [
    [/番茄|pomodoro|计时|专注|时钟/, 'pomodoro'],
    [/待办|todo|任务|清单|事项|要做/, 'todo'],
    [/笔记|note|记录|备忘录|记事/, 'notes'],
    [/习惯|habit|打卡|坚持/, 'habit'],
    [/计算|calculator|运算|加减|乘除/, 'calculator'],
    [/天气|weather|温度|气候|气温/, 'weather'],
    [/汇率|货币|换算|currency|换汇/, 'currency'],
    [/二维码|qrcode|qr|扫码/, 'qrcode'],
    [/画画|画板|draw|涂鸦|绘画|画笔/, 'drawing'],
    [/名言|quote|名言警句|金句|语录/, 'quote'],
    [/调色板|配色|颜色|palette|色板/, 'colorpalette'],
    [/记账|budget|账本|开销|收入|支出|消费/, 'budget'],
    [/图表|chart|柱状|折线|饼图|统计/, 'chart'],
    [/倒计时|countdown|计时器|倒数/, 'countdown'],
    [/井字棋|tictactoe|三子棋|井字/, 'tictactoe'],
    [/翻牌|记忆|memory game|配对/, 'memory'],
  ];

  for (const [regex, templateId] of rules) {
    if (regex.test(lower)) {
      const template = getTemplateById(templateId);
      if (template) return { template, confidence: 0.8 };
    }
  }

  // Default: return todo template
  return { template: getTemplateById('todo')!, confidence: 0.1 };
}

// Backward compatibility: export appTemplates
export const appTemplates = allTemplates;
