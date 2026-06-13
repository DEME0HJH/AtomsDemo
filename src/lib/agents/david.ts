import { BaseAgent } from './baseAgent';
import { AgentContext, Review, ReviewSchema, GeneratedCode, Requirements } from './types';

const META = {
  id: 'david',
  name: 'David',
  role: '质量审查专家',
  description: '负责代码审查和质量检查',
  systemPrompt: `你是一个资深代码审查专家（David），专注于前端代码质量、安全和性能。
你的职责是：审查生成的代码，发现 Bug、安全隐患、性能问题和代码风格问题。

审查维度：
1. 功能完整性：代码是否实现了所有需求功能
2. 安全性：XSS 防护、输入校验、安全存储
3. 性能：DOM 操作效率、事件处理、内存泄漏
4. 代码质量：命名规范、代码结构、注释合理性
5. 用户体验：错误处理、加载状态、空状态处理

请严格按照 JSON 格式返回：
{
  "score": 85,
  "issues": [
    {
      "severity": "critical|major|minor",
      "category": "bug|security|performance|style|ux",
      "description": "问题描述",
      "suggestion": "修复建议"
    }
  ],
  "summary": "整体评价",
  "fixedCode": {
    "name": "应用名称",
    "description": "描述",
    "html": "修复后的HTML（如果没有需要修复的就返回原始代码）",
    "css": "修复后的CSS",
    "js": "修复后的JS"
  }
}

如果代码质量较高没有需要修复的问题，fixedCode 字段可以不返回。`,
  temperature: 0.3,
  maxTokens: 1024,
};

export class DavidAgent extends BaseAgent<Review> {
  constructor() {
    super(META);
  }

  buildPrompt(ctx: AgentContext): string {
    const req = ctx.previousOutputs.requirements as Requirements;
    const code = ctx.previousOutputs.generatedCode as GeneratedCode;

    return `需求规格：
- 核心功能：${req.coreFeatures.join('、')}

生成的代码：
=== HTML ===
${code.html}
=== CSS ===
${code.css}
=== JavaScript ===
${code.js}

请全面审查以上代码，输出审查报告。如果发现问题，请在 fixedCode 中提供修复后的完整代码。`;
  }

  parseOutput(raw: string): Review {
    const json = this.extractJSON(raw);
    return ReviewSchema.parse(json);
  }

  formatContextForNext(prevCtx: AgentContext, output: Review): Record<string, unknown> {
    return { ...prevCtx.previousOutputs, review: output };
  }
}
