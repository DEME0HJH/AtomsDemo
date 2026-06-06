import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getApps, addApp, deleteApp, getSettings, updateSettings } from '@/lib/storage';
import { GeneratedApp } from '@/types';

const STORAGE_KEY = 'atoms-demo';

describe('Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return empty apps when localStorage is empty', () => {
    const apps = getApps();
    expect(apps).toEqual([]);
  });

  it('should add an app to storage', () => {
    const app: GeneratedApp = {
      id: 'app_1',
      name: 'Test App',
      description: 'Test description',
      type: 'todo',
      code: { html: '<div></div>', css: '', js: '' },
      createdAt: Date.now(),
      prompt: 'test',
      steps: [],
    };

    addApp(app);
    const apps = getApps();
    expect(apps).toHaveLength(1);
    expect(apps[0].name).toBe('Test App');
  });

  it('should delete an app from storage', () => {
    const app: GeneratedApp = {
      id: 'app_1',
      name: 'Test App',
      description: 'Test description',
      type: 'todo',
      code: { html: '<div></div>', css: '', js: '' },
      createdAt: Date.now(),
      prompt: 'test',
      steps: [],
    };

    addApp(app);
    deleteApp('app_1');
    const apps = getApps();
    expect(apps).toHaveLength(0);
  });

  it('should return default settings', () => {
    const settings = getSettings();
    expect(settings.theme).toBe('dark');
  });

  it('should update settings', () => {
    updateSettings({ theme: 'light' });
    const settings = getSettings();
    expect(settings.theme).toBe('light');
  });

  it('should limit apps to 50', () => {
    for (let i = 0; i < 55; i++) {
      const app: GeneratedApp = {
        id: `app_${i}`,
        name: `App ${i}`,
        description: 'Test',
        type: 'todo',
        code: { html: '', css: '', js: '' },
        createdAt: Date.now(),
        prompt: 'test',
        steps: [],
      };
      addApp(app);
    }

    const apps = getApps();
    expect(apps).toHaveLength(50);
  });
});
