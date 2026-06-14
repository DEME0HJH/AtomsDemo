import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppPreview from '@/components/AppPreview';
import { GeneratedApp } from '@/types';

// Mock the Toast hook
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('AppPreview', () => {
  const mockOnClose = vi.fn();

  const mockApp: GeneratedApp = {
    id: 'app_1',
    name: 'Test App',
    description: 'Test description',
    type: 'todo',
    code: {
      html: '<div>Hello</div>',
      css: 'div { color: red; }',
      js: 'console.log("hello");',
    },
    createdAt: Date.now(),
    prompt: 'test',
    steps: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render app preview', () => {
    render(<AppPreview app={mockApp} onClose={mockOnClose} />);

    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByLabelText('预览应用')).toBeInTheDocument();
    expect(screen.getByLabelText('查看代码')).toBeInTheDocument();
  });

  it('should switch to code tab', () => {
    render(<AppPreview app={mockApp} onClose={mockOnClose} />);

    const codeTab = screen.getByLabelText('查看代码');
    fireEvent.click(codeTab);

    expect(screen.getByLabelText('源代码')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<AppPreview app={mockApp} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('关闭预览');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should render download button', () => {
    render(<AppPreview app={mockApp} onClose={mockOnClose} />);

    expect(screen.getByLabelText('下载 ZIP 文件')).toBeInTheDocument();
  });

  it('should show mode info in footer', () => {
    render(<AppPreview app={mockApp} onClose={mockOnClose} />);

    expect(screen.getByText(/模式:/)).toBeInTheDocument();
  });

  it('should return null when app is null', () => {
    const { container } = render(<AppPreview app={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });
});
