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
    }),
  })),
}));

describe('ChatInterface', () => {
  const mockOnAppGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染初始状态（标题、输入框、发送按钮）', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    expect(screen.getByText('开始创建你的应用')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('描述你想要的应用...')).toBeInTheDocument();
    expect(screen.getByLabelText('发送消息')).toBeInTheDocument();
  });

  it('输入框应该能更新值', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    const input = screen.getByPlaceholderText('描述你想要的应用...');
    fireEvent.change(input, { target: { value: '创建一个待办应用' } });

    expect(input).toHaveValue('创建一个待办应用');
  });

  it('应该显示三个模板快捷按钮', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    expect(screen.getByLabelText('快速选择：待办事项，任务管理应用')).toBeInTheDocument();
    expect(screen.getByLabelText('快速选择：天气查询，实时天气展示')).toBeInTheDocument();
    expect(screen.getByLabelText('快速选择：计算器，科学计算器')).toBeInTheDocument();
  });

  it('点击模板按钮应该填充输入框', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    const templateBtn = screen.getByLabelText('快速选择：待办事项，任务管理应用');
    fireEvent.click(templateBtn);

    const input = screen.getByPlaceholderText('描述你想要的应用...');
    expect(input).toHaveValue('创建一个待办事项应用');
  });

  it('输入为空时发送按钮应该禁用', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    const sendButton = screen.getByLabelText('发送消息');
    expect(sendButton).toBeDisabled();
  });

  it('输入有文字时发送按钮应该启用', () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    const input = screen.getByPlaceholderText('描述你想要的应用...');
    fireEvent.change(input, { target: { value: 'test' } });

    const sendButton = screen.getByLabelText('发送消息');
    expect(sendButton).not.toBeDisabled();
  });

  it('按Enter应该触发生成流程', async () => {
    render(<ChatInterface mode="team" onAppGenerated={mockOnAppGenerated} />);

    const input = screen.getByPlaceholderText('描述你想要的应用...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // 生成开始后应该显示加载状态
    await waitFor(() => {
      expect(screen.getByLabelText('正在生成中')).toBeInTheDocument();
    });
  });
});
