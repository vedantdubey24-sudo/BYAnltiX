import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BYAnltiX UI Error Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#101113] text-white flex items-center justify-center p-6 relative">
          <div className="fixed inset-0 pointer-events-none bg-square-pattern z-0 opacity-70" />
          <div className="w-full max-w-lg p-8 rounded-2xl bg-[#16181b]/95 border border-rose-500/20 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
            </div>

            <h2 className="font-space font-bold text-2xl text-white mb-2">
              {this.props.fallbackTitle || 'Rendering Anomaly Detected'}
            </h2>

            <p className="font-sora text-xs text-[#92969E] mb-6">
              A component encountered an unexpected error while rendering data. The system prevented a blank screen and preserved your session state.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-black/50 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                <p className="font-semibold">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-lg bg-white text-[#101113] hover:bg-[#D9DADD] font-medium text-xs font-mono transition-all flex items-center gap-2 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recover &amp; Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
