import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertOctagon size={32} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded uppercase tracking-wider">
                  Error System 500
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                  Terjadi Kesalahan pada Aplikasi
                </h2>
                <p className="text-xs text-slate-400">
                  SIPEKA AI menemukan runtime exception tak terduga.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 font-mono space-y-2">
              <p className="font-bold text-rose-400">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error occurred.'}
              </p>
            </div>

            {/* Error Details Accordion */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full px-4 py-3 bg-slate-900/60 hover:bg-slate-900 text-xs font-semibold text-slate-400 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-slate-500" />
                  <span>Detail Technical Stack Trace (Developer Info)</span>
                </div>
                {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {this.state.showDetails && (
                <div className="p-4 bg-slate-950 max-h-60 overflow-y-auto text-[11px] font-mono text-slate-400 space-y-2 border-t border-slate-800">
                  <p className="text-rose-300 font-bold">{this.state.error?.stack}</p>
                  {this.state.errorInfo && (
                    <p className="text-slate-500">{this.state.errorInfo.componentStack}</p>
                  )}
                </div>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="h-11 px-5 rounded-2xl gap-2 text-xs font-semibold border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <RefreshCw size={16} />
                <span>Muat Ulang Halaman</span>
              </Button>

              <Button
                onClick={this.handleReset}
                className="h-11 px-5 rounded-2xl gap-2 text-xs font-semibold bg-pupr-blue hover:bg-pupr-blue/90 text-white shadow-lg shadow-pupr-blue/20"
              >
                <Home size={16} />
                <span>Kembali ke Dashboard</span>
              </Button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
