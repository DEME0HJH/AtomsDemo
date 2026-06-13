import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/ChatInterface';

// Mock the Toast hook
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock the storage
vi.mock('@/lib/storage', () => ({
  addApp: vi.fn(),
  updateApp: vi.fn(),
}));

// Mock AgentEngine to avoid real async delays
vi.mock('@/lib/agentEngine', () => ({
  AgentEngine: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue({
      id: 'app_test',
      name: '测试应用',
      description: 'Test',
      type: 'todo',
      code: { html: '', css: '', js: '' },
      createdAt: Date.now(),
      prompt: 'test',
      steps: [],
      messages: [],
      usedAI: false,
    }),
  })),
}));

describe('ChatInterface', () => {
  const mockOnAppGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染初始状态（问候语、输入框、生成按钮）', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    // Check greeting
    expect(screen.getByText('你好，测试用户！')).toBeInTheDocument();
    // Check input placeholder
    expect(screen.getByPlaceholderText('描述你想要的应用，例如：帮我做一个番茄钟...')).toBeInTheDocument();
  });

  it('输入框应该能更新值', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    const input = screen.getByPlaceholderText('描述你想要的应用，例如：帮我做一个番茄钟...');
    fireEvent.change(input, { target: { value: '创建一个待办应用' } });

    expect(input).toHaveValue('创建一个待办应用');
  });

  it('输入为空时生成按钮应该禁用', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    const input = screen.getByPlaceholderText('描述你想要的应用，例如：帮我做一个番茄钟...');
    expect(input).toBeInTheDocument();
    // With empty input, the generate button (Wand2 icon) should be disabled
    const buttons = screen.getAllByRole('button');
    const generateButton = buttons[buttons.length - 1]; // Last button is the generate/Wand2 button
    expect(generateButton).toBeDisabled();
  });

  it('输入有文字时生成按钮应该启用', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    const input = screen.getByPlaceholderText('描述你想要的应用，例如：帮我做一个番茄钟...');
    fireEvent.change(input, { target: { value: 'test' } });

    const buttons = screen.getAllByRole('button');
    const generateButton = buttons[buttons.length - 1];
    expect(generateButton).not.toBeDisabled();
  });

  it('按Enter应该触发生成流程', async () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    const input = screen.getByPlaceholderText('描述你想要的应用，例如：帮我做一个番茄钟...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // After generation starts, should show loading state
    await waitFor(() => {
      expect(screen.getByText('AI 正在思考...')).toBeInTheDocument();
    });
  });

  it('应该显示模板快速选择按钮', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} username="测试用户" />);

    // Should show template quick-select buttons from the first 6 templates
    const todoBtn = screen.getByText('待办事项');
    expect(todoBtn).toBeInTheDocument();

    const pomodoroBtn = screen.getByText('番茄钟');
    expect(pomodoroBtn).toBeInTheDocument();
  });
});
