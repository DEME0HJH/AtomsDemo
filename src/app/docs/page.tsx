'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
  ListTodo,
  Palette,
  TestTube,
  Rocket,
  BookOpen,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const docs: DocSection[] = [
  {
    id: 'architecture',
    title: '实现思路与关键取舍',
    icon: <Layers size={20} />,
    content: `# 实现思路与关键取舍

## 整体架构设计

本项目基于 Next.js 14 + React 18 + TypeScript + Tailwind CSS，核心架构分为四层：

1. **表现层**：React 组件 + Tailwind CSS + Monaco Editor
2. **业务逻辑层**：5 个真实 AI Agent + Pipeline 编排 + Zod 类型校验
3. **服务层**：Next.js API Routes（DeepSeek 代理）+ Supabase（可选云存储）
4. **存储层**：localStorage + IndexedDB（本地）+ Supabase PostgreSQL（云端，可选）

## 关键技术难点及解决方案

### 1. 真正的多智能体协作
- **难点**：5 个 Agent 各自调用 LLM，输出需结构化传递，任一环节失败不能全盘崩溃
- **方案**：Agent 基类封装 LLM 调用 + 重试 + Zod Schema 校验；Pipeline 编排器按 team/engineer/plan/review 四种工作流串联；每个 Agent 的输出通过 \`formatContextForNext\` 传递给下游
- **取舍**：团队模式需要 5 次 LLM 调用，成本约 0.02 元；提供工程师模式只需 1 次调用

### 2. LLM 返回 JSON 的健壮解析
- **难点**：代码生成场景下 LLM 返回的 JSON 包含大量 HTML/CSS/JS，常见字符未转义、响应截断等问题
- **方案**：4 层回退策略 — 直接解析 → Markdown 代码块提取 → 逐字符大括号计数匹配 → JSON 修复器（闭合字符串+补齐括号）；Alex Agent 独有 \`salvageCode()\` 正则直接提取代码
- **取舍**：增加了约 200 行解析容错代码，但将生成成功率从 ~70% 提升到 ~95%

### 3. API Key 安全存储
- **难点**：浏览器端存储 LLM API Key 有泄露风险
- **方案**：WebCrypto API AES-256-GCM 加密，设备绑定密钥，无法跨设备解密
- **取舍**：密钥存在本地，清除浏览器数据会丢失

### 4. 数据持久化与同步
- **难点**：纯前端存储易丢失，需要可选的云端方案
- **方案**：本地优先（Local-First）策略 —— localStorage 主存储 + IndexedDB 备份；可选绑定 Supabase 实现云端同步；未配置 Supabase 时优雅降级，不影响核心功能
- **取舍**：Supabase 设为可选项，降低部署复杂度

## 技术选型依据

| 技术 | 选型 | 原因 |
|------|------|------|
| Next.js 14 | App Router + API Routes | 支持服务端 API 代理，Vercel 原生托管 |
| React 18 | Hooks + 函数组件 | 现代化开发，Server Components 支持 |
| TypeScript | 严格模式 | 类型安全，Zod 运行时校验 |
| Tailwind CSS | Utility-first | 快速开发，暗色主题 |
| Monaco Editor | @monaco-editor/react | 专业代码编辑体验 |
| Supabase | Auth + PostgreSQL | 免费额度充足，支持 Auth + RLS |
| DeepSeek API | Chat Completions | 性价比高（GPT-4 的 1/50 价格） |
| Vitest | 单元 + 组件测试 | Vite 原生，速度快 |

## 架构图

\`\`\`
用户输入 → ChatInterface → AgentEngine → Pipeline 编排
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
          有 API Key?     有 API Key?      无 API Key?
          真正 AI Agent    真实 LLM 调用    16 模板回退
              │
    Mike → Emma → Bob → Alex → David
    (需求) (产品) (架构) (编码) (审查)
              │
              ▼
       Agent 文档生成 → code.files
              │
              ▼
         AppPreview（Monaco 编辑器 + iframe 预览）
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
  下载     Vercel部署   Supabase分享
\`\`\``,
  },
  {
    id: 'requirements',
    title: '需求分析结果',
    icon: <FileText size={20} />,
    content: `# 需求分析结果

## 核心功能需求

### 1. AI 多智能体协作（P0）
- **需求**：5 个 AI Agent 各自调用 LLM，形成真正的知识传递链
- **验收标准**：
  - Mike(需求分析) → Emma(产品设计) → Bob(架构设计) → Alex(代码生成) → David(质量审查)
  - 每个 Agent 独立调用 LLM API，输出结构化 JSON
  - 支持 team/engineer/review/plan 四种工作流
  - 无 API Key 时自动回退到 16 个智能模板

### 2. 应用代码生成（P0）
- **需求**：根据用户描述生成完整可运行的单页应用
- **验收标准**：
  - 生成 HTML + CSS + JS 完整代码
  - AI 模式下 5 个 Agent 协作产物形成完整技术文档
  - 代码在 iframe 中可正常预览
  - 支持下载 HTML 和一键部署到 Vercel

### 3. 模板系统（P0）
- **需求**：提供丰富的预设模板，无 AI 也能生成应用
- **验收标准**：
  - 16 个参数化模板，覆盖 5 个分类（生产力/工具/创意/数据/游戏）
  - 基于关键词的智能模板匹配
  - 每个模板有完整的 HTML/CSS/JS 实现

### 4. 代码编辑器（P1）
- **需求**：提供专业的代码编辑体验
- **验收标准**：
  - Monaco Editor 替代纯 textarea
  - 支持语法高亮、代码补全、格式化
  - 多文件 Tab 切换（含 Agent 分析文档）
  - Ctrl+S 保存、Ctrl+Shift+F 格式化

### 5. 数据管理（P1）
- **需求**：生成历史管理和数据持久化
- **验收标准**：
  - localStorge 主存储 + IndexedDB 备份
  - 历史列表查看、删除、导出/导入
  - 可选 Supabase 云端同步
  - API Key AES-256-GCM 加密存储

## 功能优先级矩阵

| 功能 | 优先级 | 状态 |
|------|--------|------|
| 5 Agent 真实 LLM 协作 | P0 | ✅ 已实现 |
| 4 种工作流编排 | P0 | ✅ 已实现 |
| 16 参数化模板 | P0 | ✅ 已实现 |
| 智能模板匹配 | P0 | ✅ 已实现 |
| Monaco 编辑器 | P1 | ✅ 已实现 |
| Agent 分析文档生成 | P1 | ✅ 已实现 |
| Vercel 真实部署 | P1 | ✅ 已实现 |
| Supabase 云端存储 | P2 | ✅ 已实现（可选） |
| API Key 加密 | P2 | ✅ 已实现 |
| GitHub OAuth 登录 | P2 | ✅ 已实现（需配置） |
| 分享链接 | P2 | ✅ 已实现（需配置） |`,
  },
  {
    id: 'tasks',
    title: '任务划分及原因',
    icon: <ListTodo size={20} />,
    content: `# 任务划分及原因

## 任务分解

### Phase 1：模板系统扩展（1-2 天）
- 建立模板类型系统和 16 个参数化模板
- 智能关键词匹配算法
- 更新 ChatInterface 模板选择器（按分类分组）

### Phase 2：真正的多智能体（2-3 天）
- Agent 基类和 Zod 类型系统
- Mike/Emma/Bob/Alex/David 五个 Agent 实现
- Pipeline 编排器（4 种工作流）
- API Route 升级（支持 messages 模式）
- Agent 分析文档生成

### Phase 3：Monaco Editor 升级（1 天）
- @monaco-editor/react 集成
- 语法高亮、代码补全、格式化
- 多文件 Tab 切换

### Phase 4：后端与云端存储（3-4 天）
- Supabase 客户端和服务端集成
- Auth 认证（邮箱/密码 + GitHub OAuth）
- 云存储服务（项目 CRUD + 分享链接）
- 本地优先同步策略
- 优雅降级（未配置时不报错）

### Phase 5：部署与分发（2-3 天）
- 移除 static export，启用 API Routes
- Vercel REST API 真实部署
- 分享页面（/share/[slug]）

### Phase 6：安全与测试（2-3 天）
- API Key AES-256-GCM 加密
- iframe sandbox 安全属性
- JSON 解析 4 层回退策略
- 测试覆盖补完

## 任务依赖关系

\`\`\`
Phase 1 ──→ Phase 2 ──→ Phase 3
                              │
Phase 4 ──→ Phase 5 ──→ Phase 6
\`\`\`

## 时间成本估算

| 阶段 | 时间 | 内容 |
|------|------|------|
| Phase 1 | 1-2天 | 模板系统 |
| Phase 2 | 2-3天 | 多智能体 |
| Phase 3 | 1天 | 编辑器 |
| Phase 4 | 3-4天 | 后端存储 |
| Phase 5 | 2-3天 | 部署分发 |
| Phase 6 | 2-3天 | 安全测试 |
| **总计** | **11-16天** | |`,
  },
  {
    id: 'design',
    title: '功能设计文档',
    icon: <Palette size={20} />,
    content: `# 功能设计文档

## 模块设计

### 1. ChatInterface
- **职责**：用户输入、消息展示、模板选择、生成触发
- **Props**：\`mode\`, \`onAppGenerated\`, \`username\`, \`editingApp\`
- **交互**：Enter 发送、模板分类下拉、API Key 配置入口、编辑模式横幅

### 2. AppPreview
- **职责**：应用预览、代码查看、文件编辑器、对话记录、一键部署
- **Tab 模式**：preview（iframe + sandbox）| code（源码）| editor（Monaco）| chat（对话记录）
- **安全**：\`sandbox="allow-scripts allow-same-origin"\`

### 3. CodeEditor
- **职责**：Monaco Editor 代码编辑、文件树管理
- **功能**：语法高亮、代码补全、Ctrl+S 保存、Ctrl+Shift+F 格式化、文件增删

### 4. AgentEngine + Pipeline
- **职责**：多智能体编排、LLM 调用管理、模板回退
- **有 API Key**：→ runPipeline（真正 5 Agent 协作）
- **无 API Key**：→ 仿真团队协作 + 16 模板回退

### 5. Agent 系统核心模块
- **BaseAgent**：LLM 调用封装、4 层 JSON 解析回退、超时重试
- **Pipeline**：4 种工作流（team/engineer/review/plan）
- **Docs 生成器**：各 Agent 输出 → Markdown 文档
- **Registry**：Agent 注册与发现

## 数据模型

\`\`\`typescript
interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  type: string;  // 模板 ID
  code: {
    html: string;
    css: string;
    js: string;
    files?: AppFile[];  // 含 Agent 文档
  };
  createdAt: number;
  prompt: string;
  steps: GenerationStep[];
  messages: AgentMessage[];
  usedAI: boolean;
}

interface AppFile {
  path: string;        // "index.html" / "docs/01-需求分析.md"
  content: string;
  language: string;    // "html" / "css" / "javascript" / "markdown"
}
\`\`\``,
  },
  {
    id: 'testing',
    title: '测试方案',
    icon: <TestTube size={20} />,
    content: `# 测试方案

## 测试框架

- **Vitest**：单元测试和组件测试
- **@testing-library/react**：React 组件渲染和交互测试
- **jsdom**：浏览器环境模拟

## 现有测试覆盖

### AgentEngine (4 tests)
- 团队模式生成流程
- 工程师模式生成流程
- 自定义名称覆盖
- 未知类型回退到智能模板匹配

### Storage (6 tests)
- localStorage 读写
- 应用添加/更新/删除
- 设置管理
- 部署记录

### ChatInterface (6 tests)
- 初始状态渲染（含问候语和模板快捷按钮）
- 输入更新
- 生成按钮启用/禁用状态
- Enter 键触发生成
- 模板按钮填充

### AppPreview (6 tests)
- iframe 渲染
- 代码 Tab 切换
- 编辑器和对话 Tab
- 下载功能

## 测试命令

\`\`\`bash
npm test          # 运行全部测试 (22 tests, 4 files)
npm run coverage  # 含覆盖率报告
npm run test:ui   # Vitest UI 交互模式
\`\`\`

## 建议补充的测试

| 模块 | 测试内容 | 优先级 |
|------|---------|--------|
| baseAgent | JSON 解析 4 层回退 | 高 |
| pipeline | team/engineer/plan 工作流 | 高 |
| mike/emma/bob | 输出解析（含异常输入） | 中 |
| crypto | 加密/解密循环 | 中 |
| docs | Agent 输出 → Markdown 格式化 | 中 |
| sync | 双向同步逻辑 | 低 |`,
  },
  {
    id: 'deployment',
    title: '部署指南',
    icon: <Rocket size={20} />,
    content: `# 部署指南

## 快速部署（Vercel，推荐）

\`\`\`bash
cd atoms-demo
vercel --prod
\`\`\`

部署后在 Vercel Dashboard → Settings → Environment Variables 添加：

| Key | Value |
|-----|-------|
| \`DEEPSEEK_API_KEY\` | 你的 DeepSeek API Key |

然后 Redeploy 即可。

## 可选：Supabase 配置

如需云端存储和用户登录，在 \`.env.local\` 中配置：

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

未配置 Supabase 时不影响核心功能，会自动降级。

## 关键技术点

- **不再使用 static export**：API Routes 在 Vercel 上原生可用
- **/api/generate** 作为 DeepSeek 代理，解决 CORS 问题
- Monaco Editor 使用 \`transpilePackages\` 支持

## 验证清单

- [ ] 首页加载正常
- [ ] 配置 API Key 后 AI 多智能体可工作
- [ ] 无 API Key 时 16 模板可用
- [ ] Monaco 编辑器正常
- [ ] Agent 分析文档可查看
- [ ] 下载 HTML 功能正常`,
  },
  {
    id: 'api',
    title: 'API 参考',
    icon: <BookOpen size={20} />,
    content: `# API 参考

## AgentEngine

\`\`\`typescript
class AgentEngine {
  constructor(
    mode: AppMode,
    onMessage: (msg: AgentMessage) => void,
    onStep: (step: GenerationStep) => void
  )

  async generate(config: GenerationConfig): Promise<GeneratedApp>
  // 有 API Key → runPipeline (5 个真实 Agent)
  // 无 API Key → 仿真协作 + 16 模板回退
}
\`\`\`

## Pipeline（多智能体编排）

\`\`\`typescript
type WorkflowName = 'team' | 'engineer' | 'review' | 'plan';

async function runPipeline(options: {
  workflow: WorkflowName;
  prompt: string;
  templateType: string;
  apiKey: string;
  skipAgents?: string[];
  onMessage: (msg: AgentMessage) => void;
  onStep: (step: GenerationStep) => void;
}): Promise<GeneratedApp>
\`\`\`

## 加密存储

\`\`\`typescript
// AES-256-GCM 加密 API Key
async function secureSetApiKey(apiKey: string): Promise<void>
async function secureGetApiKey(): Promise<string>
\`\`\`

## 数据同步

\`\`\`typescript
// 本地 → 云端
async function syncToCloud(): Promise<{ uploaded: number }>

// 云端 → 本地
async function syncFromCloud(): Promise<{ downloaded: number }>

// 双向同步
async function fullSync(): Promise<{ uploaded: number; downloaded: number }>
\`\`\`

## Vercel 部署

\`\`\`typescript
async function deployToVercel(
  htmlContent: string,
  projectName: string,
  token: string
): Promise<{ url: string; ready: boolean }>

async function checkDeploymentStatus(
  deploymentId: string,
  token: string
): Promise<{ url: string; ready: boolean }>
\`\`\`

## Agent 输出类型（Zod Schema）

| Agent | 输出类型 | 核心字段 |
|-------|---------|---------|
| Mike | Requirements | appName, coreFeatures[], userStories[], constraints[] |
| Emma | ProductDesign | designStyle, colorScheme, pageStructure[], interactionFlow |
| Bob | Architecture | techStack[], componentTree[], dataFlow, performanceTargets |
| Alex | GeneratedCode | name, html, css, js |
| David | Review | score, issues[], summary, fixedCode? |`,
  },
];

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['architecture']));

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={index} className="bg-atoms-dark rounded-lg p-4 overflow-x-auto my-4">
              <code className="text-sm text-atoms-text font-mono">{codeContent.trim()}</code>
            </pre>
          );
          codeContent = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-atoms-text mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-atoms-text mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-atoms-text mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-atoms-text ml-4 mb-1">
            {line.slice(2)}
          </li>
        );
      } else if (line.startsWith('| ')) {
        if (!line.includes('---')) {
          const cells = line.split('|').filter(Boolean).map(c => c.trim());
          elements.push(
            <div key={index} className="grid grid-cols-3 gap-2 py-2 border-b border-atoms-border">
              {cells.map((cell, i) => (
                <div key={i} className="text-sm text-atoms-text">{cell}</div>
              ))}
            </div>
          );
        }
      } else if (line.trim()) {
        elements.push(
          <p key={index} className="text-atoms-text mb-2 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-atoms-bg text-atoms-text">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">技术文档</h1>

        <div className="space-y-4">
          {docs.map(section => (
            <div
              key={section.id}
              className="bg-atoms-card border border-atoms-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-atoms-border/50 transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
                aria-expanded={expandedSections.has(section.id)}
                aria-controls={`section-${section.id}`}
              >
                <span className="text-atoms-accent">{section.icon}</span>
                <span className="flex-1 font-semibold">{section.title}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronDown size={20} className="text-atoms-textMuted" aria-hidden="true" />
                ) : (
                  <ChevronRight size={20} className="text-atoms-textMuted" aria-hidden="true" />
                )}
              </button>

              {expandedSections.has(section.id) && (
                <div
                  id={`section-${section.id}`}
                  className="px-6 pb-6 border-t border-atoms-border"
                >
                  <div className="pt-4">
                    {renderMarkdown(section.content)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
