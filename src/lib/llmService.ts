import { AppCode } from '@/types';

interface LLMGenerateResult {
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

interface AgentMessageContent {
  agent: string;
  content: string;
}

/**
 * 从 localStorage 读取用户配置的 API Key
 */
function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('atoms-api-key');
}

/**
 * 调用 LLM API 生成应用代码
 * 优先使用用户在 UI 中配置的 API Key，否则使用服务端 .env.local 中的 Key
 */
export async function generateAppCode(
  prompt: string,
  templateType: string,
  onAgentMessage?: (message: AgentMessageContent) => void
): Promise<LLMGenerateResult> {
  onAgentMessage?.({
    agent: 'Alex',
    content: `正在分析需求：${prompt}`,
  });

  const apiKey = getApiKey();

  // 如果用户没有配置 API Key，给出明确提示
  if (!apiKey) {
    throw new Error(
      '未配置 API Key。请点击输入框左侧的 🔑 按钮，输入您的 DeepSeek API Key。' +
      '获取地址：https://platform.deepseek.com/api_keys'
    );
  }

  onAgentMessage?.({
    agent: 'Alex',
    content: '正在调用 AI 模型生成代码...',
  });

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, templateType, apiKey }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '未知错误' }));
    throw new Error(errorData.error || `API 请求失败 (${response.status})`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  onAgentMessage?.({
    agent: 'Alex',
    content: 'AI 代码生成完成！已生成 HTML、CSS 和 JavaScript 文件。',
  });

  return {
    name: data.name,
    description: data.description,
    html: data.html,
    css: data.css,
    js: data.js,
  };
}

/**
 * 生成 Agent 对话消息流
 */
export async function generateAgentMessages(
  prompt: string,
  templateType: string,
  mode: 'team' | 'engineer',
  onMessage: (message: AgentMessageContent) => void
): Promise<void> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (mode === 'team') {
    onMessage({ agent: 'Mike', content: `开始分析需求：${prompt}` });
    await delay(600);
    onMessage({ agent: 'Mike', content: `需求分析完成。识别到这是一个${getTypeName(templateType)}应用。` });

    onMessage({ agent: 'Emma', content: '基于需求分析结果，开始设计产品界面和交互流程...' });
    await delay(600);
    onMessage({ agent: 'Emma', content: '产品设计完成。已确定主要功能模块和视觉风格。' });

    onMessage({ agent: 'Bob', content: '开始设计应用架构，确定技术栈和组件结构...' });
    await delay(600);
    onMessage({ agent: 'Bob', content: '架构设计完成。采用纯前端方案，HTML + CSS + JavaScript。' });
  } else {
    onMessage({ agent: 'Alex', content: `快速理解需求：${prompt}` });
    await delay(400);
    onMessage({ agent: 'Alex', content: '需求已理解，跳过规划和设计，直接生成代码。' });
  }
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    todo: '待办事项管理',
    weather: '天气查询',
    calculator: '计算器',
    custom: '自定义',
  };
  return names[type] || '自定义';
}
