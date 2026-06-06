'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center min-h-screen bg-atoms-dark p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-atoms-card border border-atoms-border rounded-xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-atoms-error/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-atoms-error" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-atoms-text mb-2">应用发生错误</h2>
            <p className="text-sm text-atoms-textMuted mb-4">
              很抱歉，应用遇到了意外问题。请尝试刷新页面恢复。
            </p>
            {this.state.error && (
              <div className="bg-atoms-dark rounded-lg p-3 mb-4 text-left overflow-auto">
                <code className="text-xs text-atoms-error block">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-atoms-accent hover:bg-atoms-accentHover text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-atoms-accent focus:ring-offset-2 focus:ring-offset-atoms-card"
            >
              <RefreshCw size={16} aria-hidden="true" />
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
