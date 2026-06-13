import { AppCode } from '@/types';

// 模板分类
export type TemplateCategory = 'productivity' | 'tools' | 'creative' | 'data' | 'games';

// 模板参数
export interface TemplateParams {
  theme?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  features?: string[];
  dataSource?: 'local' | 'mock';
  title?: string;
}

// 模板定义
export interface AppTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  icon: string;
  params: TemplateParams;
  code: AppCode;
  // 参数化生成器
  generate?: (params: TemplateParams) => AppCode;
}

// 默认主题
export const defaultTheme = {
  primary: '#3b82f6',
  secondary: '#10b981',
  background: '#f9fafb',
  text: '#1f2937',
};
