import { GeneratedApp } from '@/types';
import { createClient } from './client';

/**
 * Save a project to the cloud (Supabase)
 */
export async function saveProjectToCloud(app: GeneratedApp): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');

  const { data, error } = await supabase
    .from('projects')
    .upsert({
      id: app.id,
      user_id: user.id,
      name: app.name,
      description: app.description,
      type: app.type,
      code: app.code as unknown as Record<string, unknown>,
      prompt: app.prompt,
      steps: app.steps as unknown as Record<string, unknown>[],
      messages: app.messages as unknown as Record<string, unknown>[],
      used_ai: app.usedAI,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<GeneratedApp[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => ({
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
  }));
}

/**
 * Delete a project from the cloud
 */
export async function deleteProjectFromCloud(appId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', appId);

  if (error) throw error;
}

/**
 * Create a share link for a project
 */
export async function createShareLink(projectId: string): Promise<string> {
  const supabase = createClient();
  const slug = Math.random().toString(36).substring(2, 10);

  const { error } = await supabase
    .from('shares')
    .insert({ project_id: projectId, slug });

  if (error) throw error;
  return `${window.location.origin}/share/${slug}`;
}

/**
 * Get a project by share slug (client-side)
 */
export async function getProjectBySlug(slug: string): Promise<GeneratedApp | null> {
  const supabase = createClient();

  const { data: shareData, error: shareError } = await supabase
    .from('shares')
    .select('project_id, projects(*)')
    .eq('slug', slug)
    .single();

  if (shareError || !shareData) return null;

  const projects = shareData.projects as unknown as Record<string, unknown>;
  if (!projects || typeof projects !== 'object' || Array.isArray(projects)) return null;

  return {
    id: projects.id as string,
    name: projects.name as string,
    description: projects.description as string,
    type: projects.type as string,
    code: projects.code as GeneratedApp['code'],
    prompt: projects.prompt as string,
    steps: (projects.steps as GeneratedApp['steps']) || [],
    messages: (projects.messages as GeneratedApp['messages']) || [],
    usedAI: (projects.used_ai as boolean) || false,
    createdAt: new Date(projects.created_at as string).getTime(),
  };
}
