'use client';

import { useState, useEffect } from 'react';
import { Atom, Users, Zap, MessageSquare, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (username: string) => void;
}

const slides = [
  {
    icon: <Atom size={48} className="text-atoms-accent" />,
    title: '欢迎来到 Atoms Demo',
    description: 'AI 智能体驱动的应用生成平台。只需描述你的想法，我们的智能体团队将为你生成完整的可运行应用。',
  },
  {
    icon: <Users size={48} className="text-atoms-accent" />,
    title: '多智能体协作',
    description: '团队模式：Mike（负责人）、Emma（产品经理）、Bob（架构师）、Alex（工程师）、David（质检）协同工作，确保应用质量。',
  },
  {
    icon: <Zap size={48} className="text-atoms-accent" />,
    title: '快速原型',
    description: '工程师模式：跳过规划和设计，直接生成代码。适合快速验证想法和制作演示。',
  },
  {
    icon: <MessageSquare size={48} className="text-atoms-accent" />,
    title: '对话式开发',
    description: '你可以与 AI 进行多轮对话，澄清需求、调整功能，直到满意后再生成最终应用。',
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('atoms-onboarding-complete');
    if (hasSeenOnboarding) {
      setShowUsernameInput(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowUsernameInput(true);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const finalUsername = username.trim() || '用户';
    localStorage.setItem('atoms-username', finalUsername);
    localStorage.setItem('atoms-onboarding-complete', 'true');
    onComplete(finalUsername);
  };

  const handleSkip = () => {
    setShowUsernameInput(true);
  };

  if (showUsernameInput) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-md bg-atoms-card border border-atoms-border rounded-xl p-6 m-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-atoms-text">设置你的名称</h2>
          </div>

          <div className="text-center mb-6">
            <Sparkles size={40} className="text-atoms-accent mx-auto mb-3" />
            <p className="text-sm text-atoms-textMuted">
              让我们知道怎么称呼你，这将用于个性化你的体验。
            </p>
          </div>

          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="输入你的名称..."
            className="w-full px-4 py-3 rounded-lg bg-atoms-dark border border-atoms-border text-atoms-text placeholder-atoms-textMuted text-sm focus:outline-none focus:ring-2 focus:ring-atoms-accent mb-4"
            onKeyDown={e => e.key === 'Enter' && handleComplete()}
          />

          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 bg-atoms-accent hover:bg-atoms-accentHover text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
          >
            开始使用
          </button>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-atoms-card border border-atoms-border rounded-xl p-8 m-4">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentSlide ? 'bg-atoms-accent' : 'bg-atoms-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="mb-4">{slide.icon}</div>
          <h2 className="text-2xl font-bold text-atoms-text mb-3">{slide.title}</h2>
          <p className="text-sm text-atoms-textMuted leading-relaxed">{slide.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-atoms-textMuted hover:text-atoms-text transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent rounded px-2 py-1"
          >
            跳过
          </button>

          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-atoms-dark text-atoms-text text-sm transition-colors hover:bg-atoms-border focus:outline-none focus:ring-2 focus:ring-atoms-accent"
              >
                <ChevronLeft size={16} />
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-atoms-accent hover:bg-atoms-accentHover text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent"
            >
              {currentSlide === slides.length - 1 ? '开始设置' : '下一步'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
