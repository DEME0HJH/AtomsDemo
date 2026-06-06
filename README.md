# Atoms Demo

AI 智能体驱动的应用生成平台演示项目。

## 功能特性

- **多智能体协作引擎**：模拟研究员、产品经理、架构师、工程师、数据分析师等角色的协作流程
- **双模式生成**：
  - 团队模式：完整的多智能体协作流程，包含需求分析、产品设计、架构设计、代码生成、质量检查
  - 工程师模式：快速原型，跳过规划直接生成代码
- **对话式开发**：基于已有应用进行迭代更新，保留完整历史记录
- **内置代码编辑器**：支持多文件编辑、实时预览、代码保存
- **API Key 支持**：可配置 OpenAI/DeepSeek API Key 使用真实 AI 生成
- **数据持久化**：使用 localStorage 和 IndexedDB 双存储

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Lucide React 图标库
- Vitest 测试框架

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发调试

```bash
npm run dev
```

访问 http://localhost:3000

### 构建

```bash
npm run build
```

静态文件输出到 `dist` 目录。

### 测试

```bash
npm run test
```

## 部署

本项目使用 Next.js 静态导出，可部署到任何静态托管平台：

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

### GitHub Pages 部署

1. 将代码推送到 GitHub 仓库
2. 在仓库 Settings > Pages 中配置 Source 为 GitHub Actions
3. 使用提供的 workflow 自动部署

## 使用指南

1. **首次使用**：完成引导流程，设置用户名
2. **生成应用**：在输入框描述想要的应用，按 Enter 直接生成
3. **查看代码**：生成后切换到"代码"或"编辑器"标签查看/修改代码
4. **迭代更新**：点击"继续编辑"基于已有应用添加新功能
5. **配置 API Key**：点击顶部状态栏的"配置 Key"使用真实 AI

## 项目结构

```
atoms-demo/
├── src/
│   ├── app/              # Next.js 应用路由
│   ├── components/       # React 组件
│   ├── data/             # 模板数据
│   ├── lib/              # 工具函数和核心逻辑
│   ├── types/            # TypeScript 类型定义
│   └── test/             # 测试文件
├── public/               # 静态资源
└── package.json
```

## License

MIT
