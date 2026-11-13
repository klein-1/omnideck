import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('OmniDeck ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="pixel-card bg-deck-dark border-2 border-arcade-coral p-6 my-4 max-w-2xl mx-auto space-y-4 font-mono text-xs shadow-pixel">
          <div className="flex items-center gap-3 text-arcade-coral border-b border-arcade-coral/40 pb-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-pixel text-xs">RUNTIME SYSTEM INTERCEPT</h3>
              <p className="text-[10px] text-arcade-muted mt-0.5">
                The active module encountered an unhandled exception. The core deck remains online.
              </p>
            </div>
          </div>

          <div className="p-3 bg-black border border-deck-border text-arcade-coral text-[11px] overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.toString() || 'Unknown error'}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="btn-pixel btn-pixel-emerald px-4 py-2 font-pixel text-[9px] flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RELOAD MODULE
            </button>
            <button
              onClick={() => {
                this.handleReset();
                if (this.props.onResetToHome) this.props.onResetToHome();
              }}
              className="btn-pixel btn-pixel-surface px-4 py-2 font-pixel text-[9px] flex items-center gap-2 text-white"
            >
              <Home className="w-3.5 h-3.5" />
              RETURN TO DECK
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
