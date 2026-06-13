import { BaseAgent } from './baseAgent';
import { AgentContext, Requirements, RequirementsSchema } from './types';

const META = {
  id: 'mike',
  name: 'Mike',
  role: '需求分析师',
  description: '负责需求分析和用户研究',
  systemPrompt: `你是一个资深需求分析师（Mike），在国际顶级科技公司有 15 年经验。
你的职责是：将用户模糊的应用描述转化为清晰、完整的功能需求规格。

工作方式：
1. 仔细理解用户的描述，识别显性和隐性需求
2. 定义目标用户画像
3. 拆解核心功能点（5-8 个）
4. 编写用户故事（每条格式："作为[角色]，我希望[功能]，以便[价值]"）
5. 识别技术约束和边界条件

请严格按照 JSON 格式返回，不要包含任何其他内容：
{
  "appName": "应用名称（简洁中文）",
  "targetUsers": "目标用户群体描述",
  "coreFeatures": ["功能1", "功能2", ...],
  "userStories": ["作为X，我希望Y，以便Z", ...],
  "constraints": ["约束1", "约束2", ...]
}`,
  temperature: 0.5,
  maxTokens: 800,
};

export class MikeAgent extends BaseAgent<Requirements> {
  constructor() {
    super(META);
  }

  buildPrompt(ctx: AgentContext): string {
    return `用户需求：${ctx.userPrompt}\n\n请分析以上需求，输出需求规格文档。`;
  }

  parseOutput(raw: string): Requirements {
    const json = this.extractJSON(raw);
    return RequirementsSchema.parse(json);
  }

  formatContextForNext(prevCtx: AgentContext, output: Requirements): Record<string, unknown> {
    return { requirements: output };
  }
}
