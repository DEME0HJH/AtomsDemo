import { Requirements, ProductDesign, Architecture, GeneratedCode, Review } from './types';

/**
 * Convert Mike's requirements analysis to a Markdown document
 */
export function formatRequirementsDoc(req: Requirements, userPrompt: string): string {
  return `# 📋 需求分析文档

> **原始需求**：${userPrompt}

---

## 应用名称
**${req.appName}**

## 目标用户
${req.targetUsers}

## 核心功能
${req.coreFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 用户故事
${req.userStories.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## 约束条件
${req.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

> 🤖 本文档由 AI 智能体 **Mike（需求分析师）** 自动生成
`;
}

/**
 * Convert Emma's product design to a Markdown document
 */
export function formatProductDesignDoc(design: ProductDesign): string {
  return `# 🎨 产品设计文档

---

## 设计风格
${design.designStyle}

## 配色方案
| 角色 | 色值 |
|------|------|
| 主色 | \`${design.colorScheme.primary}\` |
| 辅色 | \`${design.colorScheme.secondary}\` |
| 背景 | \`${design.colorScheme.background}\` |
| 文字 | \`${design.colorScheme.text}\` |

## 布局类型
${design.layoutType}

## 页面结构
${design.pageStructure.map(s => `### ${s.section}
- **描述**：${s.description}
- **组件**：${s.components.map(c => `\`${c}\``).join('、')}
`).join('\n')}

## 交互流程
${design.interactionFlow}

---

> 🤖 本文档由 AI 智能体 **Emma（产品经理）** 自动生成
`;
}

/**
 * Convert Bob's architecture design to a Markdown document
 */
export function formatArchitectureDoc(arch: Architecture): string {
  return `# 🏗️ 技术架构文档

---

## 技术栈
${arch.techStack.map(t => `- \`${t}\``).join('\n')}

## 组件树
${arch.componentTree.map(c => {
  const children = c.children?.length ? `\n  - 子组件：${c.children.map(ch => `\`${ch}\``).join('、')}` : '';
  return `### ${c.name}
- **描述**：${c.description}${children}
`;
}).join('\n')}

## 数据流
${arch.dataFlow}

## 存储策略
${arch.storageStrategy}

## 性能目标
| 指标 | 目标值 |
|------|--------|
| 首屏渲染 | ${arch.performanceTargets.firstPaint} |
| 可交互时间 | ${arch.performanceTargets.timeToInteractive} |

---

> 🤖 本文档由 AI 智能体 **Bob（系统架构师）** 自动生成
`;
}

/**
 * Convert Alex's generated code to a README document
 */
export function formatCodeReadme(code: GeneratedCode, userPrompt: string): string {
  return `# ${code.name}

> ${code.description || userPrompt}

---

## 项目说明

这是一个由 Atoms AI 多智能体协作生成的单页 Web 应用。

### 文件说明
| 文件 | 说明 |
|------|------|
| \`index.html\` | 应用 HTML 结构与内容 |
| \`styles.css\` | 应用样式与布局 |
| \`app.js\` | 应用交互逻辑 |

### 使用方法
1. 直接在浏览器中打开 \`index.html\` 即可运行
2. 应用数据保存在浏览器 localStorage 中
3. 支持桌面端和移动端响应式布局

---

> 🤖 本文档由 **Atoms AI 平台** 自动生成
`;
}

/**
 * Convert David's code review to a Markdown document
 */
export function formatReviewDoc(review: Review): string {
  const severityLabels: Record<string, string> = {
    critical: '🔴 严重',
    major: '🟠 重要',
    minor: '🟡 建议',
  };
  const categoryLabels: Record<string, string> = {
    bug: 'Bug',
    security: '安全',
    performance: '性能',
    style: '代码风格',
    ux: '用户体验',
  };

  return `# 🔍 代码审查报告

---

## 总体评分
# **${review.score}** / 100

## 整体评价
${review.summary}

---

## 发现问题

${review.issues.length === 0 ? '✅ 未发现明显问题，代码质量良好！' : review.issues.map((issue, i) => `
### ${i + 1}. ${severityLabels[issue.severity] || issue.severity} — ${categoryLabels[issue.category] || issue.category}

- **问题描述**：${issue.description}
- **修复建议**：${issue.suggestion}
`).join('')}

${review.fixedCode ? '\n> 💡 David 已提供修复后的代码，已自动应用到最终产物中。' : ''}

---

> 🤖 本文档由 AI 智能体 **David（代码审查专家）** 自动生成
`;
}
