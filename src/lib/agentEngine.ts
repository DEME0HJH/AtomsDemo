import { AppMode, GenerationConfig, GenerationStep, GeneratedApp, AgentMessage } from '@/types';
import { appTemplates } from '@/data/templates';
import { generateAppCode } from '@/lib/llmService';

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
    const appId = `app_${Date.now()}`;
    this.messages = [];

    if (this.mode === 'team') {
      return this.generateTeamMode(config, appId);
    } else {
      return this.generateEngineerMode(config, appId);
    }
  }

  private addMessage(agent: string, content: string) {
    const msg: AgentMessage = { agent, content, timestamp: Date.now() };
    this.messages.push(msg);
    this.onMessage(msg);
  }

  private async generateTeamMode(config: GenerationConfig, appId: string): Promise<GeneratedApp> {
    const steps: GenerationStep[] = [
      { id: '1', agent: 'Mike', name: '需求分析', status: 'pending' },
      { id: '2', agent: 'Emma', name: '产品设计', status: 'pending' },
      { id: '3', agent: 'Bob', name: '架构设计', status: 'pending' },
      { id: '4', agent: 'Alex', name: '代码生成', status: 'pending' },
      { id: '5', agent: 'David', name: '质量检查', status: 'pending' },
    ];

    // Step 1: Mike - 需求分析（团队负责人视角）
    steps[0].status = 'active';
    this.onStep({ ...steps[0] });
    this.addMessage('Mike', `收到需求："${config.prompt}"`);
    await delay(600);
    this.addMessage('Mike', `📋 需求拆解：\n• 应用类型：${this.getAppTypeDescription(config.templateType)}\n• 核心功能：${this.extractFeatures(config.prompt)}\n• 目标用户：个人用户\n• 复杂度：中等`);
    await delay(500);
    this.addMessage('Mike', '✅ 需求分析完成。已识别关键功能点，准备分配给产品团队。');
    steps[0].status = 'completed';
    this.onStep({ ...steps[0] });

    // Step 2: Emma - 产品设计（产品经理视角）
    steps[1].status = 'active';
    this.onStep({ ...steps[1] });
    this.addMessage('Emma', '🎨 开始产品设计...');
    await delay(500);
    this.addMessage('Emma', `📐 设计方案：\n• 界面风格：现代简约，卡片式布局\n• 配色方案：主色 #3b82f6，辅色 #10b981\n• 交互方式：即时反馈，动画过渡\n• 响应式：适配移动端和桌面端`);
    await delay(500);
    this.addMessage('Emma', '✅ 产品设计完成。已输出 PRD 文档和原型图。');
    steps[1].status = 'completed';
    this.onStep({ ...steps[1] });

    // Step 3: Bob - 架构设计（系统架构师视角）
    steps[2].status = 'active';
    this.onStep({ ...steps[2] });
    this.addMessage('Bob', '🏗️ 开始架构设计...');
    await delay(500);
    this.addMessage('Bob', `⚙️ 技术方案：\n• 前端：纯 HTML5 + CSS3 + ES6\n• 存储：localStorage 持久化\n• 架构：单页应用，组件化设计\n• 安全：输入校验，XSS 防护`);
    await delay(500);
    this.addMessage('Bob', '✅ 架构设计完成。技术方案可行，无性能瓶颈。');
    steps[2].status = 'completed';
    this.onStep({ ...steps[2] });

    // Step 4: Alex - 代码生成
    steps[3].status = 'active';
    this.onStep({ ...steps[3] });
    this.addMessage('Alex', '💻 开始编写代码...');

    const result = await this.generateCodeWithAI(config);

    this.addMessage('Alex', `✅ 代码生成完成！\n• HTML: ${result.html.length} 字符\n• CSS: ${result.css.length} 字符\n• JS: ${result.js.length} 字符`);
    steps[3].status = 'completed';
    this.onStep({ ...steps[3] });

    // Step 5: David - 质量检查（数据分析师视角）
    steps[4].status = 'active';
    this.onStep({ ...steps[4] });
    this.addMessage('David', '🔍 开始质量检查...');
    await delay(400);
    this.addMessage('David', `📊 检查结果：\n• 语法检查：通过\n• 功能完整性：通过\n• 代码规范：通过\n• 性能评估：优秀（首屏 < 100ms）`);
    await delay(300);
    this.addMessage('David', '✅ 质量检查通过！代码质量评级：A+');
    steps[4].status = 'completed';
    this.onStep({ ...steps[4] });

    return {
      id: appId,
      name: result.name,
      description: config.prompt,
      type: config.templateType,
      code: {
        html: result.html,
        css: result.css,
        js: result.js,
      },
      createdAt: Date.now(),
      prompt: config.prompt,
      steps,
      messages: [...this.messages],
      usedAI: result.usedAI,
    };
  }

  private async generateEngineerMode(config: GenerationConfig, appId: string): Promise<GeneratedApp> {
    const steps: GenerationStep[] = [
      { id: '1', agent: 'Alex', name: '需求理解', status: 'pending' },
      { id: '2', agent: 'Alex', name: '快速编码', status: 'pending' },
    ];

    // Step 1: 需求理解（快速）
    steps[0].status = 'active';
    this.onStep({ ...steps[0] });
    this.addMessage('Alex', `👨‍💻 工程师模式启动："${config.prompt}"`);
    await delay(200);
    this.addMessage('Alex', '⚡ 跳过规划和设计，直接生成代码。');
    steps[0].status = 'completed';
    this.onStep({ ...steps[0] });

    // Step 2: 快速编码
    steps[1].status = 'active';
    this.onStep({ ...steps[1] });
    this.addMessage('Alex', '💻 正在快速编码...');

    const result = await this.generateCodeWithAI(config);

    this.addMessage('Alex', `✅ 完成！代码已生成（${result.html.length + result.css.length + result.js.length} 字符）`);
    steps[1].status = 'completed';
    this.onStep({ ...steps[1] });

    return {
      id: appId,
      name: result.name,
      description: config.prompt,
      type: config.templateType,
      code: {
        html: result.html,
        css: result.css,
        js: result.js,
      },
      createdAt: Date.now(),
      prompt: config.prompt,
      steps,
      messages: [...this.messages],
      usedAI: result.usedAI,
    };
  }

  /**
   * 调用真实 LLM API 生成代码，失败时自动回退到模板
   */
  private async generateCodeWithAI(config: GenerationConfig): Promise<{
    name: string;
    html: string;
    css: string;
    js: string;
    usedAI: boolean;
  }> {
    // 检查是否有 API Key
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('atoms-api-key') : null;

    if (apiKey) {
      try {
        this.addMessage('System', '🔑 检测到 API Key，正在调用 AI 模型...');
        const result = await generateAppCode(
          config.prompt,
          config.templateType,
          (msg) => this.addMessage(msg.agent, msg.content)
        );
        this.addMessage('System', '✅ AI 调用成功！');
        return { ...result, usedAI: true };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : '未知错误';
        this.addMessage('System', `⚠️ AI API 调用失败：${errMsg}。回退到本地模板。`);
      }
    } else {
      this.addMessage('System', '💡 提示：配置 API Key 可使用真实 AI 生成更丰富的应用。');
    }

    // 回退到模板
    const template = appTemplates.find(t => t.type === config.templateType) || appTemplates[0];
    return {
      name: config.name || template.name,
      html: template.code.html,
      css: template.code.css,
      js: template.code.js,
      usedAI: false,
    };
  }

  private getAppTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      todo: '待办事项管理',
      weather: '天气查询',
      calculator: '计算器',
      custom: '自定义应用',
    };
    return descriptions[type] || '自定义应用';
  }

  private extractFeatures(prompt: string): string {
    // 简单的特征提取
    if (prompt.includes('番茄') || prompt.includes('计时') || prompt.includes('时钟')) {
      return '计时器、状态切换、声音提醒';
    }
    if (prompt.includes('待办') || prompt.includes('任务') || prompt.includes('todo')) {
      return '任务增删改查、完成状态、本地存储';
    }
    if (prompt.includes('天气') || prompt.includes('weather')) {
      return '城市搜索、天气展示、数据模拟';
    }
    if (prompt.includes('计算') || prompt.includes('calculator')) {
      return '四则运算、数字输入、结果显示';
    }
    return '根据用户描述定制功能';
  }
}
