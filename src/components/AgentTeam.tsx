'use client';

import { agents } from '@/data/agents';

export default function AgentTeam() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3" role="list" aria-label="AI 智能体团队成员">
      {agents.map(agent => (
        <div
          key={agent.id}
          className="flex flex-col items-center p-3 rounded-lg bg-atoms-card border border-atoms-border hover:border-atoms-accent transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-atoms-accent focus:ring-offset-2 focus:ring-offset-atoms-dark"
          role="listitem"
          tabIndex={0}
          aria-label={`${agent.name}，${agent.role}。${agent.description}`}
        >
          <div className={`agent-avatar ${agent.color} mb-2 group-hover:scale-110 transition-transform`} aria-hidden="true">
            {agent.avatar}
          </div>
          <span className="text-sm font-medium text-atoms-text">{agent.name}</span>
          <span className="text-xs text-atoms-textMuted">{agent.role}</span>
        </div>
      ))}
    </div>
  );
}
