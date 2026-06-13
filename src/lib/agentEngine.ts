import { AppMode, GenerationConfig, GenerationStep, GeneratedApp, AgentMessage, AppFile } from '@/types';
import { matchTemplate } from '@/data/templates';
import { runPipeline } from '@/lib/agents/pipeline';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AgentEngine {
  private mode: AppMode;
  private onMessage: (message: AgentMessage) => void;
  private onStep: (step: GenerationStep) => void;
  private messages: AgentMessage[] = [];

  constructor(
    mode: AppMode,
    onMessage: (message: AgentMessage) => void,
    onStep: (step: GenerationStep) => void
  ) {
    this.mode = mode;
    this.onMessage = onMessage;
    this.onStep = onStep;
  }

  async generate(config: GenerationConfig): Promise<GeneratedApp> {
    this.messages = [];

    const apiKey = typeof window !== 'undefined'
      ? localStorage.getItem('atoms-api-key') || ''
      : '';

    // If API Key is configured, use real multi-agent pipeline
    if (apiKey) {
      this.addMessage('System', '🔑 检测到 API Key，启用真正的多智能体协作...');

      const workflow = this.mode === 'team' ? 'team' : 'engineer';

      return runPipeline({
        workflow,
        prompt: config.prompt,
        templateType: config.templateType,
        apiKey,
        onMessage: this.onMessage,
        onStep: this.onStep,
      });
    }

    // No API Key: use simulated agent flow with template fallback
    this.addMessage('System', '💡 提示：配置 API Key 可使用真正的 AI 多智能体协作。');

    if (this.mode === 'team') {
      return this.generateTeamModeSimulated(config);
    } else {
      return this.generateEngineerModeSimulated(config);
    }
  }

  private addMessage(agent: string, content: string): void {
    const msg: AgentMessage = { agent, content, timestamp: Date.now() };
    this.messages.push(msg);
    this.onMessage(msg);
  }

  /**
   * Simulated team mode: show agent roles with descriptions, then fallback to template
   */
  private async generateTeamModeSimulated(config: GenerationConfig): Promise<GeneratedApp> {
    const appId = `app_${Date.now()}`;
    const steps: GenerationStep[] = [
      { id: '1', agent: 'Mike', name: '需求分析', status: 'pending' },
      { id: '2', agent: 'Emma', name: '产品设计', status: 'pending' },
      { id: '3', agent: 'Bob', name: '架构设计', status: 'pending' },
      { id: '4', agent: 'Alex', name: '代码生成', status: 'pending' },
      { id: '5', agent: 'David', name: '质量检查', status: 'pending' },
    ];

    // Step 1: Mike
    steps[0].status = 'active';
    this.onStep({ ...steps[0] });
    this.addMessage('Mike', `收到需求："${config.prompt}"`);
    await delay(500);
    this.addMessage('Mike', `📋 需求拆解：\n• 应用类型：${this.getAppTypeDescription(config.templateType)}\n• 核心功能：${this.extractFeatures(config.prompt)}\n• 目标用户：个人用户`);
    await delay(400);
    this.addMessage('Mike', '✅ 需求分析完成。请配置 API Key 以获得真正的 AI 分析。');
    steps[0].status = 'completed';
    this.onStep({ ...steps[0] });

    // Step 2: Emma
    steps[1].status = 'active';
    this.onStep({ ...steps[1] });
    this.addMessage('Emma', '🎨 开始产品设计...');
    await delay(400);
    this.addMessage('Emma', `📐 设计方案：\n• 界面风格：现代简约，卡片式布局\n• 配色方案：主色 #3b82f6，辅色 #10b981\n• 交互方式：即时反馈，动画过渡`);
    steps[1].status = 'completed';
    this.onStep({ ...steps[1] });

    // Step 3: Bob
    steps[2].status = 'active';
    this.onStep({ ...steps[2] });
    this.addMessage('Bob', '🏗️ 开始架构设计...');
    await delay(400);
    this.addMessage('Bob', '⚙️ 技术方案：纯 HTML5 + CSS3 + ES6，localStorage 持久化');
    steps[2].status = 'completed';
    this.onStep({ ...steps[2] });

    // Step 4: Alex
    steps[3].status = 'active';
    this.onStep({ ...steps[3] });
    this.addMessage('Alex', '💻 正在从模板库生成代码...');

    const { template } = matchTemplate(config.prompt);
    await delay(600);

    this.addMessage('Alex', `✅ 代码生成完成！（来自「${template.name}」模板）`);
    steps[3].status = 'completed';
    this.onStep({ ...steps[3] });

    // Step 5: David
    steps[4].status = 'active';
    this.onStep({ ...steps[4] });
    this.addMessage('David', '🔍 开始质量检查...');
    await delay(300);
    this.addMessage('David', '✅ 代码已通过基础检查，可正常使用。');
    steps[4].status = 'completed';
    this.onStep({ ...steps[4] });

    // Generate docs from simulated agent pipeline
    const features = this.extractFeatures(config.prompt);
    const appType = this.getAppTypeDescription(config.templateType);
    const appName = config.name || template.name;
    const templateDocs = generateSimulatedDocs(appName, appType, features, config.prompt);

    // Build files: HTML/CSS/JS from template + docs
    const allFiles: AppFile[] = [
      { path: 'index.html', content: template.code.html, language: 'html' },
      { path: 'styles.css', content: template.code.css, language: 'css' },
      { path: 'app.js', content: template.code.js, language: 'javascript' },
      ...templateDocs,
    ];

    return {
      id: appId,
      name: appName,
      description: config.prompt,
      type: config.templateType,
      code: {
        html: template.code.html,
        css: template.code.css,
        js: template.code.js,
        files: allFiles,
      },
      createdAt: Date.now(),
      prompt: config.prompt,
      steps,
      messages: [...this.messages],
      usedAI: false,
    };
  }

  private async generateEngineerModeSimulated(config: GenerationConfig): Promise<GeneratedApp> {
    const appId = `app_${Date.now()}`;
    const steps: GenerationStep[] = [
      { id: '1', agent: 'Alex', name: '需求理解', status: 'pending' },
      { id: '2', agent: 'Alex', name: '快速编码', status: 'pending' },
    ];

    steps[0].status = 'active';
    this.onStep({ ...steps[0] });
    this.addMessage('Alex', `👨‍💻 工程师模式启动："${config.prompt}"`);
    await delay(200);
    this.addMessage('Alex', '⚡ 跳过规划和设计，直接从模板库生成代码。');
    steps[0].status = 'completed';
    this.onStep({ ...steps[0] });

    steps[1].status = 'active';
    this.onStep({ ...steps[1] });
    this.addMessage('Alex', '💻 正在快速编码...');

    const { template } = matchTemplate(config.prompt);
    await delay(500);

    this.addMessage('Alex', `✅ 完成！已生成「${template.name}」应用代码。`);
    steps[1].status = 'completed';
    this.onStep({ ...steps[1] });

    const appName = config.name || template.name;
    const appType = this.getAppTypeDescription(config.templateType);
    const features = this.extractFeatures(config.prompt);
    const templateDocs = generateSimulatedDocs(appName, appType, features, config.prompt);

    // Build files: HTML/CSS/JS from template + docs
    const allFiles: AppFile[] = [
      { path: 'index.html', content: template.code.html, language: 'html' },
      { path: 'styles.css', content: template.code.css, language: 'css' },
      { path: 'app.js', content: template.code.js, language: 'javascript' },
      ...templateDocs,
    ];

    return {
      id: appId,
      name: appName,
      description: config.prompt,
      type: config.templateType,
      code: {
        html: template.code.html,
        css: template.code.css,
        js: template.code.js,
        files: allFiles,
      },
      createdAt: Date.now(),
      prompt: config.prompt,
      steps,
      messages: [...this.messages],
      usedAI: false,
    };
  }

  private getAppTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      todo: '待办事项管理',
      weather: '天气查询',
      calculator: '计算器',
      pomodoro: '番茄钟',
      notes: '记事本',
      habit: '习惯追踪',
      currency: '汇率转换',
      qrcode: '二维码生成',
      drawing: '画板',
      quote: '名言卡片',
      colorpalette: '调色板',
      budget: '记账本',
      chart: '图表',
      countdown: '倒计时',
      tictactoe: '井字棋',
      memory: '记忆翻牌',
    };
    return descriptions[type] || '自定义应用';
  }

  private extractFeatures(prompt: string): string {
    const rules: [RegExp, string][] = [
      [/番茄|pomodoro|计时|专注/, '计时器、状态切换、声音提醒'],
      [/待办|todo|任务|清单/, '任务增删改查、完成状态、本地存储'],
      [/笔记|note|记录|备忘录/, '笔记创建编辑、搜索、本地存储'],
      [/习惯|habit|打卡/, '每日打卡、连续统计、进度追踪'],
      [/天气|weather|温度|气候/, '城市搜索、天气展示、数据模拟'],
      [/计算|calculator|运算|加减/, '四则运算、数字输入、结果显示'],
      [/汇率|货币|换算|currency/, '汇率换算、货币切换、实时计算'],
      [/二维码|qrcode|qr/, '文本编码、二维码生成、下载'],
      [/画画|画板|draw|涂鸦/, '画笔工具、颜色选择、撤销重做'],
      [/名言|quote|名言警句|金句/, '名言展示、换肤、分享功能'],
      [/配色|颜色|palette|色板/, '颜色选择、配色方案生成、色值复制'],
      [/记账|budget|账本|开销/, '收支记录、分类统计、月度汇总'],
      [/图表|chart|柱状|折线|饼图/, '数据可视化、图表切换、数据编辑'],
      [/倒计时|countdown|倒数/, '目标日期设置、实时倒计时、事件提醒'],
      [/井字棋|tictactoe|三子棋/, '双人对战、胜负判定、分数记录'],
      [/翻牌|记忆|memory/, '卡片配对、步数统计、计时器'],
    ];

    for (const [regex, features] of rules) {
      if (regex.test(prompt)) return features;
    }
    return '根据用户描述定制功能';
  }
}

/**
 * Generate simulated agent documents when running without API key
 */
function generateSimulatedDocs(
  appName: string,
  appType: string,
  features: string,
  userPrompt: string
): AppFile[] {
  const now = new Date().toLocaleString('zh-CN');
  return [
    {
      path: 'docs/README.md',
      content: `# ${appName}

> ${userPrompt}

---

## 项目说明

这是一个由 Atoms AI 智能体平台生成的单页 Web 应用（模板模式）。

### 文件说明
| 文件 | 说明 |
|------|------|
| \`index.html\` | 应用 HTML 结构与内容 |
| \`styles.css\` | 应用样式与布局 |
| \`app.js\` | 应用交互逻辑 |

### 使用方法
1. 直接在浏览器中打开 \`index.html\` 即可运行
2. 应用数据保存在浏览器 localStorage 中
3. 支持桌面端和移动端响应式布局

> 💡 配置 API Key 可启用真正的 AI 多智能体协作模式，获得更个性化的应用。

> 🤖 本文档由 **Atoms AI 平台** 自动生成（${now}）
`,
      language: 'markdown',
    },
    {
      path: 'docs/01-需求分析.md',
      content: `# 📋 需求分析文档

> **原始需求**：${userPrompt}

---

## 应用名称
**${appName}**

## 应用类型
${appType}

## 核心功能
${features.split('、').map((f, i) => `${i + 1}. ${f.trim()}`).join('\n')}

## 目标用户
个人用户

## 用户故事
1. 作为用户，我希望能够打开应用即可使用，无需额外配置
2. 作为用户，我希望数据能够自动保存，不会丢失
3. 作为用户，我希望界面响应迅速，操作流畅

## 约束条件
1. 纯前端实现，HTML + CSS + JavaScript
2. 使用 localStorage 持久化用户数据
3. 响应式设计，适配移动端和桌面端
4. 所有资源内联，无外部依赖

---

> 💡 配置 API Key 可由 AI 智能体 Mike 生成更精准的需求分析。

> 🤖 本文档由 **Atoms AI 平台** 自动生成（${now}）
`,
      language: 'markdown',
    },
  ];
}
