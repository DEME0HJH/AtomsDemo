import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentEngine } from '@/lib/agentEngine';
import { AppMode, GenerationConfig } from '@/types';

describe('AgentEngine', () => {
  const onMessage = vi.fn();
  const onStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate app in team mode', async () => {
    const engine = new AgentEngine('team', onMessage, onStep);
    const config: GenerationConfig = {
      prompt: 'Create a todo app',
      templateType: 'todo',
      mode: 'team',
    };

    const promise = engine.generate(config);
    await vi.runAllTimersAsync();
    const app = await promise;

    expect(app).toBeDefined();
    expect(app.name).toBe('待办事项');
    expect(app.type).toBe('todo');
    expect(app.code.html).toContain('todoInput');
    expect(app.steps).toHaveLength(5);
    expect(onMessage).toHaveBeenCalled();
    expect(onStep).toHaveBeenCalled();
  });

  it('should generate app in engineer mode', async () => {
    const engine = new AgentEngine('engineer', onMessage, onStep);
    const config: GenerationConfig = {
      prompt: 'Create a weather app',
      templateType: 'weather',
      mode: 'engineer',
    };

    const promise = engine.generate(config);
    await vi.runAllTimersAsync();
    const app = await promise;

    expect(app).toBeDefined();
    expect(app.name).toBe('天气查询');
    expect(app.type).toBe('weather');
    expect(app.code.html).toContain('cityInput');
    expect(app.steps).toHaveLength(2);
    expect(onMessage).toHaveBeenCalled();
    expect(onStep).toHaveBeenCalled();
  });

  it('should use custom name when provided', async () => {
    const engine = new AgentEngine('team', onMessage, onStep);
    const config: GenerationConfig = {
      prompt: 'Create a calculator',
      templateType: 'calculator',
      mode: 'team',
      name: 'My Calculator',
    };

    const promise = engine.generate(config);
    await vi.runAllTimersAsync();
    const app = await promise;

    expect(app.name).toBe('My Calculator');
  });

  it('should fallback to first template for unknown type', async () => {
    const engine = new AgentEngine('team', onMessage, onStep);
    const config: GenerationConfig = {
      prompt: 'Create something',
      templateType: 'custom' as 'todo',
      mode: 'team',
    };

    const promise = engine.generate(config);
    await vi.runAllTimersAsync();
    const app = await promise;

    expect(app).toBeDefined();
    expect(app.code).toBeDefined();
  });
});
