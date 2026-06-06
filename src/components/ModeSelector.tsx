'use client';

import { AppMode } from '@/types';
import { Users, Code2 } from 'lucide-react';

interface ModeSelectorProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const modes: { id: AppMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'engineer',
      label: '工程师模式',
      icon: <Code2 size={16} aria-hidden="true" />,
      desc: '仅激活 Alex，快速生成代码',
    },
    {
      id: 'team',
      label: '团队模式',
      icon: <Users size={16} aria-hidden="true" />,
      desc: '多智能体协作，完整工作流',
    },
  ];

  return (
    <div
      className="flex items-center gap-2"
      role="radiogroup"
      aria-label="选择工作模式"
    >
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          role="radio"
          aria-checked={mode === m.id}
          aria-label={m.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-atoms-accent focus:ring-offset-2 focus:ring-offset-atoms-dark ${
            mode === m.id
              ? 'bg-atoms-accent text-white'
              : 'bg-atoms-card text-atoms-textMuted hover:text-atoms-text border border-atoms-border'
          }`}
          title={m.desc}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
