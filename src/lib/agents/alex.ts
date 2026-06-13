import { BaseAgent } from './baseAgent';
import { AgentContext, GeneratedCode, GeneratedCodeSchema, Requirements, ProductDesign, Architecture } from './types';

const META = {
  id: 'alex',
  name: 'Alex',
  role: '前端工程师',
  description: '负责代码生成和实现',
  systemPrompt: `你是一个资深前端开发工程师（Alex），擅长编写高质量、可维护的代码。
你的职责是：根据需求、设计和架构方案，生成完整可运行的单页应用代码。

代码规范：
1. HTML：语义化标签，合理使用 aria 属性提升无障碍
2. CSS：使用现代 CSS（Grid/Flexbox/自定义属性），响应式设计
3. JavaScript：ES6+ 语法，函数式编程风格，完善的错误处理
4. 所有 CSS 内联在 <style> 标签中，所有 JS 内联在 <script> 标签中
5. 界面美观，配色合理，交互流畅
6. 使用 localStorage 持久化用户数据

请严格按照 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "name": "应用名称",
  "description": "简短描述",
  "html": "完整的 HTML 结构代码",
  "css": "完整的 CSS 样式代码",
  "js": "完整的 JavaScript 逻辑代码"
}`,
  temperature: 0.7,
  maxTokens: 8192,
};

export class AlexAgent extends BaseAgent<GeneratedCode> {
  constructor() {
    super(META);
  }

  buildPrompt(ctx: AgentContext): string {
    const req = ctx.previousOutputs.requirements as Requirements;
    const design = ctx.previousOutputs.productDesign as ProductDesign;
    const arch = ctx.previousOutputs.architecture as Architecture;

    return `用户原始需求：${ctx.userPrompt}

需求分析结果：
- 应用名：${req.appName}
- 核心功能：${req.coreFeatures.join('、')}
- 用户故事：${req.userStories.join('；')}

产品设计方案：
- 设计风格：${design.designStyle}
- 配色方案：主色 ${design.colorScheme.primary}，辅色 ${design.colorScheme.secondary}，背景 ${design.colorScheme.background}，文字 ${design.colorScheme.text}
- 布局类型：${design.layoutType}
- 页面结构：${JSON.stringify(design.pageStructure)}
- 交互流程：${design.interactionFlow}

技术架构方案：
- 技术栈：${arch.techStack.join(' + ')}
- 组件树：${JSON.stringify(arch.componentTree)}
- 数据流：${arch.dataFlow}
- 存储策略：${arch.storageStrategy}

请基于以上所有信息，生成完整可运行的单页应用代码（HTML + CSS + JS）。`;
  }

  parseOutput(raw: string): GeneratedCode {
    try {
      const json = this.extractJSON(raw);
      return GeneratedCodeSchema.parse(json);
    } catch (jsonError) {
      // Final fallback: try to salvage code from raw text
      console.warn('[Alex] JSON extraction failed, attempting raw code extraction...');
      return this.salvageCode(raw);
    }
  }

  /**
   * Last-resort: extract code sections directly from raw LLM output
   * when JSON parsing is impossible (truncation, malformatting, etc.)
   */
  private salvageCode(raw: string): GeneratedCode {
    const extractSection = (tag: string): string => {
      // Try to match "tag": "..." or "tag": "... (incomplete)
      const patterns = [
        new RegExp(`"${tag}"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*[,}]|$)`, 'm'),
        new RegExp(`"${tag}"\\s*:\\s*\`([\\s\\S]*?)(?:\`\\s*[,}]|$)`, 'm'),
      ];
      for (const pattern of patterns) {
        const match = raw.match(pattern);
        if (match && match[1]) return unescapeJSONString(match[1]);
      }
      return '';
    };

    // Try to extract name from raw text
    let name = '未命名应用';
    const nameMatch = raw.match(/"name"\s*:\s*"([^"]*)"/);
    if (nameMatch) name = nameMatch[1];

    let description = '';
    const descMatch = raw.match(/"description"\s*:\s*"([^"]*)"/);
    if (descMatch) description = descMatch[1];

    return {
      name,
      description,
      html: extractSection('html'),
      css: extractSection('css'),
      js: extractSection('js'),
    };
  }

  formatContextForNext(prevCtx: AgentContext, output: GeneratedCode): Record<string, unknown> {
    return { ...prevCtx.previousOutputs, generatedCode: output };
  }
}

/**
 * Unescape JSON string escape sequences (\n, \t, \\, \", \uXXXX, etc.)
 */
function unescapeJSONString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}
