export type AppMode = 'engineer' | 'team';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  avatar: string;
}

export interface AgentMessage {
  agent: string;
  content: string;
  timestamp: number;
}

export interface GenerationStep {
  id: string;
  agent: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}

export interface GenerationConfig {
  prompt: string;
  templateType: 'todo' | 'weather' | 'calculator' | 'custom';
  mode: AppMode;
  name?: string;
}

export interface AppFile {
  path: string;
  content: string;
  language: string;
}

export interface AppCode {
  html: string;
  css: string;
  js: string;
  files?: AppFile[]; // 多文件结构
}

export interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  type: string;
  code: AppCode;
  createdAt: number;
  prompt: string;
  steps: GenerationStep[];
  messages: AgentMessage[]; // 保存完整消息流
  usedAI: boolean; // 是否使用了真实AI
}

export interface AppTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  code: AppCode;
}

export interface AppSettings {
  theme: 'dark' | 'light';
}

export type DeployTarget = 'cloud' | 'local';

export interface DeployConfig {
  id: string;
  appId: string;
  target: DeployTarget;
  url?: string;
  domain?: string;
  status: 'pending' | 'deploying' | 'success' | 'failed';
  createdAt: number;
  message?: string;
}

export interface UserSession {
  apps: GeneratedApp[];
  settings: AppSettings;
  deploys: DeployConfig[];
}
