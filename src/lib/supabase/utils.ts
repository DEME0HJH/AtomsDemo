/**
 * Check if Supabase is configured (valid project URL set in env)
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return (
    url.length > 0 &&
    !url.includes('your-project') &&
    !url.includes('xxxx')
  );
}
