import { z } from 'zod';

// ========== Agent Metadata ==========
export interface AgentMeta {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// ========== Context (passed between Agents) ==========
export interface AgentContext {
  userPrompt: string;
  templateType: string;
  apiKey: string;
  previousOutputs: Record<string, unknown>;
}

// ========== Output Schemas for Each Agent ==========

// Mike - Requirements Analysis
export const RequirementsSchema = z.object({
  appName: z.string(),
  targetUsers: z.string(),
  coreFeatures: z.array(z.string()),
  userStories: z.array(z.string()),
  constraints: z.array(z.string()),
});
export type Requirements = z.infer<typeof RequirementsSchema>;

// Emma - Product Design
export const ProductDesignSchema = z.object({
  designStyle: z.string(),
  colorScheme: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  layoutType: z.string(),
  pageStructure: z.array(z.object({
    section: z.string(),
    description: z.string(),
    components: z.array(z.string()),
  })),
  interactionFlow: z.string(),
});
export type ProductDesign = z.infer<typeof ProductDesignSchema>;

// Bob - Architecture Design
export const ArchitectureSchema = z.object({
  techStack: z.array(z.string()),
  componentTree: z.array(z.object({
    name: z.string(),
    description: z.string(),
    children: z.array(z.string()).optional(),
  })),
  dataFlow: z.string(),
  storageStrategy: z.string(),
  performanceTargets: z.object({
    firstPaint: z.string(),
    timeToInteractive: z.string(),
  }),
});
export type Architecture = z.infer<typeof ArchitectureSchema>;

// Alex - Code Generation
export const GeneratedCodeSchema = z.object({
  name: z.string(),
  description: z.string(),
  html: z.string(),
  css: z.string(),
  js: z.string(),
});
export type GeneratedCode = z.infer<typeof GeneratedCodeSchema>;

// David - Quality Review
export const ReviewSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'major', 'minor']),
    category: z.enum(['bug', 'security', 'performance', 'style', 'ux']),
    description: z.string(),
    suggestion: z.string(),
  })),
  summary: z.string(),
  fixedCode: GeneratedCodeSchema.optional(),
});
export type Review = z.infer<typeof ReviewSchema>;
