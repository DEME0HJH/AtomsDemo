import { createServerSupabaseClient } from './server';
import { GeneratedApp } from '@/types';

/**
 * Get a project by share slug (server-side)
 */
export async function getProjectBySlug(slug: string): Promise<GeneratedApp | null> {
  const supabase = await createServerSupabaseClient();

  const { data: shareData, error: shareError } = await supabase
    .from('shares')
    .select('project_id')
    .eq('slug', slug)
    .single();

  if (shareError || !shareData) return null;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', shareData.project_id as string)
    .single();

  if (projectError || !project) return null;

  const row = project as Record<string, unknown>;
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    type: row.type as string,
    code: row.code as GeneratedApp['code'],
    prompt: row.prompt as string,
    steps: (row.steps as GeneratedApp['steps']) || [],
    messages: (row.messages as GeneratedApp['messages']) || [],
    usedAI: (row.used_ai as boolean) || false,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}
