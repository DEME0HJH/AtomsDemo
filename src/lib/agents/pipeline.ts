import { AgentContext, Requirements, ProductDesign, Architecture, GeneratedCode, Review } from './types';
import { getAgent } from './registry';
import { GeneratedApp, AgentMessage, GenerationStep, AppFile } from '@/types';
import { matchTemplate } from '@/data/templates';
import {
  formatRequirementsDoc,
  formatProductDesignDoc,
  formatArchitectureDoc,
  formatCodeReadme,
  formatReviewDoc,
} from './docs';

// Workflow definitions
export type WorkflowName = 'team' | 'engineer' | 'review' | 'plan';

const workflowAgents: Record<WorkflowName, string[]> = {
  team:     ['mike', 'emma', 'bob', 'alex', 'david'],
  engineer: ['alex'],
  review:   ['david'],
  plan:     ['mike', 'emma', 'bob'],
};

// Each agent's corresponding step name
const agentSteps: Record<string, { name: string }> = {
  mike:  { name: '需求分析' },
  emma:  { name: '产品设计' },
  bob:   { name: '架构设计' },
  alex:  { name: '代码生成' },
  david: { name: '质量检查' },
};

interface PipelineOptions {
  workflow: WorkflowName;
  prompt: string;
  templateType: string;
  apiKey: string;
  skipAgents?: string[];
  onMessage: (msg: AgentMessage) => void;
  onStep: (step: GenerationStep) => void;
  onAgentChunk?: (agent: string, chunk: string) => void;
}

export async function runPipeline(options: PipelineOptions): Promise<GeneratedApp> {
  const { workflow, prompt, templateType, apiKey, skipAgents = [], onMessage, onStep, onAgentChunk } = options;

  const agentIds = workflowAgents[workflow].filter(id => !skipAgents.includes(id));
  const appId = `app_${Date.now()}`;
  const messages: AgentMessage[] = [];
  const agentDocs: AppFile[] = [];
  const steps: GenerationStep[] = agentIds.map((id, index) => ({
    id: String(index + 1),
    agent: getAgent(id)?.name || id,
    name: agentSteps[id]?.name || id,
    status: 'pending' as const,
  }));

  const addMessage = (agent: string, content: string): void => {
    const msg: AgentMessage = { agent, content, timestamp: Date.now() };
    messages.push(msg);
    onMessage(msg);
  };

  // Build initial context
  const ctx: AgentContext = {
    userPrompt: prompt,
    templateType,
    apiKey,
    previousOutputs: {},
  };

  // Execute each agent in sequence
  for (let i = 0; i < agentIds.length; i++) {
    const agentId = agentIds[i];
    const agent = getAgent(agentId);

    if (!agent) {
      addMessage('System', `Agent ${agentId} not found, skipping`);
      continue;
    }

    // Update step status to active
    steps[i].status = 'active';
    onStep({ ...steps[i] });

    addMessage(agent.name, `🔍 ${agent.role}：开始工作...`);

    try {
      const output = await agent.run(ctx, onAgentChunk
        ? (chunk) => onAgentChunk(agent.name, chunk)
        : undefined
      );

      // --- Generate document from agent output ---
      const docFile = generateAgentDoc(agentId, output, prompt);
      if (docFile) {
        agentDocs.push(docFile);
        addMessage('System', `📄 已生成「${docFile.path}」文档`);
      }

      // Update context to pass to next agent
      ctx.previousOutputs = agent.formatContextForNext(ctx, output);

      // Mark step as completed
      steps[i].status = 'completed';
      onStep({ ...steps[i] });

      addMessage(agent.name, `✅ ${agent.role}：工作完成`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      steps[i].status = 'completed';
      onStep({ ...steps[i] });
      addMessage('System', `⚠️ ${agent.name}(${agent.role}) failed: ${errMsg}`);

      // If Alex fails, fallback to template
      if (agentId === 'alex') {
        addMessage('System', '回退到本地模板生成...');
        const { template } = matchTemplate(prompt);

        // Include template code as files alongside any docs from previous agents
        const fallbackFiles: AppFile[] = [
          { path: 'index.html', content: template.code.html, language: 'html' },
          { path: 'styles.css', content: template.code.css, language: 'css' },
          { path: 'app.js', content: template.code.js, language: 'javascript' },
          ...agentDocs,
        ];

        return {
          id: appId,
          name: template.name,
          description: prompt,
          type: templateType,
          code: {
            html: template.code.html,
            css: template.code.css,
            js: template.code.js,
            files: fallbackFiles,
          },
          createdAt: Date.now(),
          prompt,
          steps,
          messages,
          usedAI: false,
        };
      }
    }
  }

  // Extract final outputs
  const generatedCode = ctx.previousOutputs.generatedCode as GeneratedCode | undefined;
  const review = ctx.previousOutputs.review as Review | undefined;

  // Prefer fixed code from review if available
  const finalCode = review?.fixedCode || generatedCode;

  // Build code files: HTML, CSS, JS + agent docs
  const codeFiles: AppFile[] = [
    {
      path: 'index.html',
      content: finalCode?.html || '',
      language: 'html',
    },
    {
      path: 'styles.css',
      content: finalCode?.css || '',
      language: 'css',
    },
    {
      path: 'app.js',
      content: finalCode?.js || '',
      language: 'javascript',
    },
    ...agentDocs,
  ];

  return {
    id: appId,
    name: finalCode?.name || '未命名应用',
    description: finalCode?.description || prompt,
    type: templateType,
    code: {
      html: finalCode?.html || '',
      css: finalCode?.css || '',
      js: finalCode?.js || '',
      files: codeFiles,
    },
    createdAt: Date.now(),
    prompt,
    steps,
    messages,
    usedAI: true,
  };
}

/**
 * Convert an agent's output to a Markdown document file
 */
function generateAgentDoc(
  agentId: string,
  output: unknown,
  userPrompt: string
): AppFile | null {
  try {
    switch (agentId) {
      case 'mike': {
        const req = output as Requirements;
        return {
          path: 'docs/01-需求分析.md',
          content: formatRequirementsDoc(req, userPrompt),
          language: 'markdown',
        };
      }
      case 'emma': {
        const design = output as ProductDesign;
        return {
          path: 'docs/02-产品设计.md',
          content: formatProductDesignDoc(design),
          language: 'markdown',
        };
      }
      case 'bob': {
        const arch = output as Architecture;
        return {
          path: 'docs/03-架构设计.md',
          content: formatArchitectureDoc(arch),
          language: 'markdown',
        };
      }
      case 'alex': {
        const code = output as GeneratedCode;
        return {
          path: 'docs/README.md',
          content: formatCodeReadme(code, userPrompt),
          language: 'markdown',
        };
      }
      case 'david': {
        const review = output as Review;
        return {
          path: 'docs/05-代码审查报告.md',
          content: formatReviewDoc(review),
          language: 'markdown',
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
