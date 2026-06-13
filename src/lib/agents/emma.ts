import { BaseAgent } from './baseAgent';
import { AgentContext, ProductDesign, ProductDesignSchema, Requirements } from './types';

const META = {
  id: 'emma',
  name: 'Emma',
  role: '产品经理',
  description: '负责产品设计和功能规划',
  systemPrompt: `你是一个经验丰富的产品经理（Emma），曾在多个成功的 SaaS 产品中负责产品设计。
你的职责是：基于需求分析文档，输出产品设计方案，包括界面风格、布局结构和交互流程。

设计原则：
1. 界面风格现代简约，符合 Material Design 3 规范
2. 移动优先，响应式设计
3. 注重无障碍访问
4. 交互要有即时反馈和流畅动画

请严格按照 JSON 格式返回：
{
  "designStyle": "设计风格描述（如：现代简约、新拟态、玻璃态等）",
  "colorScheme": { "primary": "#hex", "secondary": "#hex", "background": "#hex", "text": "#hex" },
  "layoutType": "布局类型（如：卡片式网格布局、列表式布局、仪表盘布局等）",
  "pageStructure": [
    { "section": "区域名称", "description": "区域描述", "components": ["组件1", "组件2"] }
  ],
  "interactionFlow": "主要交互流程的文字描述"
}`,
  temperature: 0.6,
  maxTokens: 800,
};

export class EmmaAgent extends BaseAgent<ProductDesign> {
  constructor() {
    super(META);
  }

  buildPrompt(ctx: AgentContext): string {
    const req = ctx.previousOutputs.requirements as Requirements;
    return `需求分析结果：
- 应用名：${req.appName}
- 目标用户：${req.targetUsers}
- 核心功能：${req.coreFeatures.join('、')}
- 用户故事：${req.userStories.join('；')}
- 约束条件：${req.constraints.join('、')}

原始需求：${ctx.userPrompt}

请基于以上信息输出产品设计方案。`;
  }

  parseOutput(raw: string): ProductDesign {
    const json = this.extractJSON(raw);
    return ProductDesignSchema.parse(json);
  }

  formatContextForNext(prevCtx: AgentContext, output: ProductDesign): Record<string, unknown> {
    return { ...prevCtx.previousOutputs, productDesign: output };
  }
}
