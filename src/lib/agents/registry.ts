import { BaseAgent } from './baseAgent';
import { MikeAgent } from './mike';
import { EmmaAgent } from './emma';
import { BobAgent } from './bob';
import { AlexAgent } from './alex';
import { DavidAgent } from './david';

// Agent registry: id → Agent instance
const registry = new Map<string, BaseAgent<unknown>>();

function register(agent: BaseAgent<unknown>): void {
  registry.set(agent.id, agent);
}

// Register all agents
register(new MikeAgent());
register(new EmmaAgent());
register(new BobAgent());
register(new AlexAgent());
register(new DavidAgent());

export function getAgent(id: string): BaseAgent<unknown> | undefined {
  return registry.get(id);
}

export function getAllAgents(): BaseAgent<unknown>[] {
  return Array.from(registry.values());
}

export function getAgentMeta(id: string): { id: string; name: string; role: string } | null {
  const agent = getAgent(id);
  if (!agent) return null;
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
  };
}
