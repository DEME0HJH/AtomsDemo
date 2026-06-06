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

本项目采用 Next.js 14 + React 18 构建，核心架构包含以下层次：

1. **表现层**: React 组件 + Tailwind CSS 样式
2. **业务逻辑层**: AgentEngine 引擎 + 状态管理
3. **数据层**: localStorage + IndexedDB 双存储方案
4. **模板层**: 预设应用模板（HTML/CSS/JS）

## 关键技术难点及解决方案

### 1. 多智能体协作模拟
- **难点**: 如何模拟多个 AI Agent 的协作流程
- **方案**: 采用异步消息队列，每个 Agent 按顺序执行并发送消息
- **取舍**: 使用预设模板而非真实 LLM，降低复杂度但牺牲灵活性

### 2. 代码实时预览
- **难点**: 生成的代码需要安全地在浏览器中运行
- **方案**: 使用 iframe + Blob URL 隔离执行环境
- **取舍**: 限制为纯前端应用，不支持后端代码

### 3. 数据持久化
- **难点**: 纯前端项目的数据存储可靠性
- **方案**: localStorage 主存储 + IndexedDB 备份 + 导出/导入功能
- **取舍**: 无后端，数据无法跨设备同步

## 技术选型依据

| 技术 | 选型 | 原因 |
|------|------|------|
| Next.js 14 | App Router | 支持静态导出，适合部署到 CDN |
| React 18 | Hooks + 函数组件 | 现代化开发模式，性能优化 |
| TypeScript | 严格模式 | 类型安全，减少运行时错误 |
| Tailwind CSS | Utility-first | 快速开发，一致的设计风格 |
| Lucide React | 图标库 | 轻量，支持 tree-shaking |

## 架构图

\`\`\`
用户输入 → ChatInterface → AgentEngine → 模板匹配 → 代码生成
                ↓                ↓
          localStorage      消息流展示
          IndexedDB         步骤进度
\`\`\`

## 数据流程图

\`\`\`
[用户描述] → [需求分析] → [模板选择] → [代码组装] → [iframe预览]
                ↓
          [localStorage持久化]
                ↓
          [IndexedDB备份]
\`\`\``,
  },
  {
    id: 'requirements',
    title: '需求分析结果',
    icon: <FileText size={20} />,
    content: `# 需求分析结果

## 核心功能需求

### 1. 智能体协作展示
- **需求**: 展示多个 AI Agent 的协作流程
- **优先级**: P0
- **验收标准**: 
  - 至少 5 个不同角色的 Agent
  - 每个 Agent 有明确的分工
  - 消息流清晰展示协作过程

### 2. 应用代码生成
- **需求**: 根据用户描述生成可运行的应用代码
- **优先级**: P0
- **验收标准**:
  - 生成完整的 HTML/CSS/JS
  - 代码无语法错误
  - 支持在 iframe 中预览

### 3. 历史记录管理
- **需求**: 查看和管理生成的应用历史
- **优先级**: P1
- **验收标准**:
  - 列表展示历史应用
  - 支持删除操作
  - 数据持久化存储

## 用户使用场景

### 场景 1: 快速原型开发
用户需要快速验证一个应用想法，通过描述需求，AI 团队生成可运行的原型。

### 场景 2: 学习参考
用户通过观察 AI 协作流程，学习应用开发的完整流程。

### 场景 3: 代码复用
用户从历史记录中找到之前生成的应用，复用或修改代码。

## 功能优先级矩阵

| 功能 | 优先级 | 实现状态 |
|------|--------|----------|
| 多智能体协作 | P0 | 已实现 |
| 代码生成 | P0 | 已实现 |
| 实时预览 | P0 | 已实现 |
| 历史记录 | P1 | 已实现 |
| 数据导出/导入 | P1 | 已实现 |
| 单元测试 | P1 | 已实现 |
| WCAG 可访问性 | P1 | 已实现 |
| 真实 LLM 驱动 | P2 | 待接入 |
| Race 模式 | P2 | 待实现 |`,
  },
  {
    id: 'tasks',
    title: '任务划分及原因',
    icon: <ListTodo size={20} />,
    content: `# 任务划分及原因

## 任务分解

### Phase 1: 基础架构 (2天)
- **任务**: 项目初始化、依赖安装、目录结构搭建
- **原因**: 为后续开发提供基础环境
- **依赖**: 无

### Phase 2: 核心引擎 (3天)
- **任务**: AgentEngine 实现、模板系统、消息流管理
- **原因**: 核心业务逻辑，其他功能依赖于此
- **依赖**: Phase 1

### Phase 3: UI 组件 (3天)
- **任务**: ChatInterface、AppPreview、HistoryPanel、布局组件
- **原因**: 用户交互界面，需要与核心引擎集成
- **依赖**: Phase 2

### Phase 4: 数据层 (2天)
- **任务**: localStorage 封装、IndexedDB 备份、导出/导入
- **原因**: 数据持久化，确保用户数据不丢失
- **依赖**: Phase 3

### Phase 5: 测试与优化 (2天)
- **任务**: 单元测试、集成测试、性能优化、可访问性
- **原因**: 保证代码质量，满足验收标准
- **依赖**: Phase 4

### Phase 6: 文档与部署 (1天)
- **任务**: 技术文档、部署配置、在线链接
- **原因**: 交付要求，方便用户使用
- **依赖**: Phase 5

## 任务依赖关系

\`\`\`
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
\`\`\`

## 时间成本估算

| 阶段 | 时间 | 人力 |
|------|------|------|
| Phase 1 | 2天 | 1人 |
| Phase 2 | 3天 | 1人 |
| Phase 3 | 3天 | 1人 |
| Phase 4 | 2天 | 1人 |
| Phase 5 | 2天 | 1人 |
| Phase 6 | 1天 | 1人 |
| **总计** | **13天** | **1人** |`,
  },
  {
    id: 'design',
    title: '功能设计文档',
    icon: <Palette size={20} />,
    content: `# 功能设计文档

## 模块设计

### 1. ChatInterface 模块
- **职责**: 用户输入、消息展示、模板选择
- **接口**:
  - Props: \`mode: AppMode\`, \`onAppGenerated: (appId: string) => void\`
  - 状态: \`input\`, \`messages\`, \`steps\`, \`isGenerating\`
- **交互**:
  - 输入框支持 Enter 发送
  - 模板按钮快速填充
  - 生成中禁用输入

### 2. AppPreview 模块
- **职责**: 应用代码预览、iframe 渲染
- **接口**:
  - Props: \`code: { html, css, js }\`
- **安全**:
  - 使用 iframe sandbox
  - Blob URL 隔离

### 3. HistoryPanel 模块
- **职责**: 历史记录列表、删除、导出/导入
- **接口**:
  - 无 Props，自主管理状态
  - 监听 storage 事件刷新

### 4. AgentEngine 模块
- **职责**: 多智能体协作流程控制
- **接口**:
  - \`generate(config: GenerationConfig): Promise<GeneratedApp>\`
  - 回调: \`onMessage\`, \`onStep\`

## 状态管理

采用 React Hooks 本地状态管理：
- \`useState\`: 组件级状态
- \`useRef\`: DOM 引用和持久化值
- \`useEffect\`: 副作用处理

## 数据模型

\`\`\`typescript
interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  type: string;
  code: { html: string; css: string; js: string };
  createdAt: number;
  prompt: string;
  steps: GenerationStep[];
}

interface GenerationStep {
  id: string;
  agent: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}
\`\`\``,
  },
  {
    id: 'testing',
    title: '测试方案',
    icon: <TestTube size={20} />,
    content: `# 测试方案

## 测试框架

- **Vitest**: 单元测试和集成测试
- **@testing-library/react**: React 组件测试
- **jsdom**: 浏览器环境模拟

## 测试覆盖范围

### 单元测试

#### AgentEngine
- 团队模式生成流程
- 工程师模式生成流程
- 自定义名称覆盖
- 未知模板回退

#### Storage
- localStorage 读写
- 应用添加/删除
- 设置更新

### 集成测试

#### ChatInterface
- 初始状态渲染
- 输入更新
- 模板选择
- 发送按钮状态
- 键盘提交

#### AppPreview
- iframe 渲染
- 代码执行

## 测试命令

\`\`\`bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run coverage

# UI 模式
npm run test:ui
\`\`\`

## 覆盖率目标

| 模块 | 目标覆盖率 | 当前状态 |
|------|-----------|----------|
| AgentEngine | 80% | 已实现 |
| Storage | 80% | 已实现 |
| ChatInterface | 70% | 已实现 |
| AppPreview | 70% | 已实现 |

## Mock 策略

- \`localStorage\`: 内存存储模拟
- \`matchMedia\`: 返回默认 false
- \`IntersectionObserver\`: 空实现
- \`scrollIntoView\`: vi.fn() 模拟
- \`CustomEvent\`: 类模拟`,
  },
  {
    id: 'deployment',
    title: '部署指南',
    icon: <Rocket size={20} />,
    content: `# 部署指南

## 部署前准备

1. 确保 Node.js 版本 >= 18
2. 安装依赖: \`npm install\`
3. 构建项目: \`npm run build\`

## 部署方式

### 方式 1: Vercel (推荐)

1. 将代码推送到 GitHub 仓库
2. 登录 Vercel (https://vercel.com)
3. 导入 GitHub 项目
4. 配置构建设置:
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`
5. 点击 Deploy

### 方式 2: Netlify

1. 构建项目: \`npm run build\`
2. 登录 Netlify (https://netlify.com)
3. 拖拽 \`dist\` 目录到部署区域
4. 或使用 Git 连接自动部署

### 方式 3: GitHub Pages

1. 安装 gh-pages: \`npm install -D gh-pages\`
2. 添加脚本: \`"deploy": "gh-pages -d dist"\`
3. 运行: \`npm run deploy\`

## 环境变量

如需接入真实 LLM，配置以下环境变量:

\`\`\`bash
# .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
\`\`\`

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 验证清单

- [ ] 构建成功无错误
- [ ] 首页正常加载
- [ ] 应用生成流程正常
- [ ] 历史记录功能正常
- [ ] 导出/导入功能正常
- [ ] 响应式布局正常`,
  },
  {
    id: 'api',
    title: 'API 参考',
    icon: <BookOpen size={20} />,
    content: `# API 参考

## AgentEngine

### Constructor

\`\`\`typescript
new AgentEngine(
  mode: AppMode,
  onMessage: (message: AgentMessage) => void,
  onStep: (step: GenerationStep) => void
)
\`\`\`

### Methods

\`\`\`typescript
async generate(config: GenerationConfig): Promise<GeneratedApp>
\`\`\`

## Storage API

\`\`\`typescript
// 获取所有应用
function getApps(): GeneratedApp[]

// 添加应用
async function addApp(app: GeneratedApp): Promise<void>

// 删除应用
async function deleteApp(appId: string): Promise<void>

// 获取设置
function getSettings(): AppSettings

// 更新设置
function updateSettings(settings: Partial<AppSettings>): void

// 从 IndexedDB 恢复
async function restoreFromIndexedDB(): Promise<void>
\`\`\`

## IndexedDB API

\`\`\`typescript
// 保存数据
async function saveToIndexedDB(data: unknown): Promise<void>

// 获取数据
async function getFromIndexedDB(id: string): Promise<unknown | null>

// 删除数据
async function deleteFromIndexedDB(id: string): Promise<void>

// 获取所有数据
async function getAllFromIndexedDB(): Promise<unknown[]>

// 导出数据
async function exportData(): Promise<string>

// 导入数据
async function importData(jsonString: string): Promise<void>
\`\`\`

## Types

\`\`\`typescript
type AppMode = 'team' | 'engineer';

interface GenerationConfig {
  prompt: string;
  templateType: string;
  mode: AppMode;
  name?: string;
}

interface AgentMessage {
  agent: string;
  content: string;
  timestamp: number;
}

interface GenerationStep {
  id: string;
  agent: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}
\`\`\``,
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
