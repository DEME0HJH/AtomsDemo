import { UserSession, GeneratedApp, AppSettings } from '@/types';
import { saveToIndexedDB, getFromIndexedDB, deleteFromIndexedDB, getAllFromIndexedDB } from './indexedDB';

const STORAGE_KEY = 'atoms-demo';

function getStorage(): UserSession {
  if (typeof window === 'undefined') {
    return { apps: [], settings: { theme: 'dark' } };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    console.error('Failed to parse storage data');
  }
  return { apps: [], settings: { theme: 'dark' } };
}

function setStorage(session: UserSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    console.error('Failed to save storage data');
  }
}

export function getApps(): GeneratedApp[] {
  return getStorage().apps;
}

export async function addApp(app: GeneratedApp): Promise<void> {
  const session = getStorage();
  session.apps.unshift(app);
  // Keep max 50 apps
  if (session.apps.length > 50) {
    session.apps = session.apps.slice(0, 50);
  }
  setStorage(session);

  // Also save to IndexedDB for backup
  try {
    await saveToIndexedDB(app);
  } catch {
    console.warn('Failed to save app to IndexedDB');
  }
}

export async function updateApp(updatedApp: GeneratedApp): Promise<void> {
  const session = getStorage();
  const index = session.apps.findIndex(app => app.id === updatedApp.id);
  if (index !== -1) {
    session.apps[index] = updatedApp;
    // Move to top
    session.apps.splice(index, 1);
    session.apps.unshift(updatedApp);
    setStorage(session);

    // Also update in IndexedDB
    try {
      await saveToIndexedDB(updatedApp);
    } catch {
      console.warn('Failed to update app in IndexedDB');
    }
  }
}

export async function deleteApp(appId: string): Promise<void> {
  const session = getStorage();
  session.apps = session.apps.filter(app => app.id !== appId);
  setStorage(session);

  // Also delete from IndexedDB
  try {
    await deleteFromIndexedDB(appId);
  } catch {
    console.warn('Failed to delete app from IndexedDB');
  }
}

export function getSettings(): AppSettings {
  return getStorage().settings;
}

export function updateSettings(settings: Partial<AppSettings>): void {
  const session = getStorage();
  session.settings = { ...session.settings, ...settings };
  setStorage(session);
}

// Restore apps from IndexedDB if localStorage is empty
export async function restoreFromIndexedDB(): Promise<void> {
  const session = getStorage();
  if (session.apps.length === 0) {
    try {
      const apps = await getAllFromIndexedDB() as GeneratedApp[];
      if (apps.length > 0) {
        session.apps = apps;
        setStorage(session);
      }
    } catch {
      console.warn('Failed to restore apps from IndexedDB');
    }
  }
}
