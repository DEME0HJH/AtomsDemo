import { BaseAgent } from './baseAgent';
import { AgentContext, Architecture, ArchitectureSchema, Requirements, ProductDesign } from './types';

const META = {
  id: 'bob',
  name: 'Bob',
  role: '系统架构师',
  description: '负责技术架构设计',
  systemPrompt: `你是一个资深前端架构师（Bob），有 10 年以上前端架构经验。
你的职责是：基于产品设计方案，输出前端技术架构，包括组件树、数据流和性能策略。

架构约束：
1. 纯前端方案：HTML + CSS + 原生 JavaScript
2. 数据持久化使用 localStorage
3. 单页面应用，无需路由
4. 所有资源内联，无外部依赖
5. 性能目标：首屏渲染 < 100ms，交互响应 < 50ms

请严格按照 JSON 格式返回：
{
  "techStack": ["HTML5", "CSS3", "ES6+"],
  "componentTree": [
    { "name": "组件名", "description": "组件描述", "children": ["子组件名"] }
  ],
  "dataFlow": "数据流向描述（如：用户输入 → 状态管理 → DOM 更新 → localStorage 持久化）",
  "storageStrategy": "数据存储策略",
  "performanceTargets": { "firstPaint": "100ms", "timeToInteractive": "50ms" }
}`,
  temperature: 0.4,
  maxTokens: 800,
};

export class BobAgent extends BaseAgent<Architecture> {
  constructor() {
    super(META);
  }

  buildPrompt(ctx: AgentContext): string {
    const req = ctx.previousOutputs.requirements as Requirements;
    const design = ctx.previousOutputs.productDesign as ProductDesign;
    return `需求分析：
- 应用名：${req.appName}
- 核心功能：${req.coreFeatures.join('、')}

产品设计：
- 设计风格：${design.designStyle}
- 布局类型：${design.layoutType}
- 配色：主色 ${design.colorScheme.primary}，辅色 ${design.colorScheme.secondary}
- 页面结构：${JSON.stringify(design.pageStructure)}

请基于以上信息输出前端技术架构方案。`;
  }

  parseOutput(raw: string): Architecture {
    const json = this.extractJSON(raw);
    return ArchitectureSchema.parse(json);
  }

  formatContextForNext(prevCtx: AgentContext, output: Architecture): Record<string, unknown> {
    return { ...prevCtx.previousOutputs, architecture: output };
  }
}
