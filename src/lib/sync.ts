import { GeneratedApp } from '@/types';
import { getApps, addApp } from '@/lib/storage';
import { getUserProjects, saveProjectToCloud } from '@/lib/supabase/storage';

/**
 * Sync local data to cloud. Returns count of uploaded items.
 */
export async function syncToCloud(): Promise<{ uploaded: number; errors: string[] }> {
  const localApps = getApps();
  let uploaded = 0;
  const errors: string[] = [];

  for (const app of localApps) {
    try {
      await saveProjectToCloud(app);
      uploaded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('Not logged in')) {
        errors.push('Not logged in');
        break; // Don't continue if not logged in
      }
      errors.push(`Failed to sync "${app.name}": ${msg}`);
    }
  }

  return { uploaded, errors };
}

/**
 * Pull cloud data into local storage. Returns count of downloaded items.
 */
export async function syncFromCloud(): Promise<{ downloaded: number; errors: string[] }> {
  try {
    const cloudApps = await getUserProjects();
    if (cloudApps.length === 0) return { downloaded: 0, errors: [] };

    const localApps = getApps();
    const localIds = new Set(localApps.map(a => a.id));

    let downloaded = 0;
    for (const app of cloudApps) {
      if (!localIds.has(app.id)) {
        await addApp(app);
        downloaded++;
      }
    }

    return { downloaded, errors: [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { downloaded: 0, errors: [msg] };
  }
}

/**
 * Full bidirectional sync.
 */
export async function fullSync(): Promise<{
  uploaded: number;
  downloaded: number;
  errors: string[];
}> {
  const up = await syncToCloud();
  const down = await syncFromCloud();
  return {
    uploaded: up.uploaded,
    downloaded: down.downloaded,
    errors: [...up.errors, ...down.errors],
  };
}
