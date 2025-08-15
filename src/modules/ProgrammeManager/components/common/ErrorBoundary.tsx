import React, { Component, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  name: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[PP][ErrorBoundary] ${this.props.name} pane crashed:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReloadPane = () => {
    console.log(`[PP][ErrorBoundary] Reloading ${this.props.name} pane`);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleCopyError = () => {
    if (this.state.error && this.state.errorInfo) {
      const errorText = `Planner Pane Error: ${this.props.name}

Error: ${this.state.error.message}
Stack: ${this.state.error.stack}

Component Stack: ${this.state.errorInfo.componentStack}

Timestamp: ${new Date().toISOString()}`;

      navigator.clipboard.writeText(errorText).then(() => {
        console.log('[PP][ErrorBoundary] Error copied to clipboard');
      }).catch((err) => {
        console.error('[PP][ErrorBoundary] Failed to copy error:', err);
        // Fallback: show in alert
        alert('Error copied to clipboard:\n\n' + errorText);
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-header">
              <div className="error-boundary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="error-boundary-title">
                <h3>Planner pane crashed</h3>
                <p className="error-boundary-subtitle">{this.props.name} pane encountered an error</p>
              </div>
            </div>
            
            <div className="error-boundary-actions">
              <button 
                className="error-boundary-button error-boundary-button-primary"
                onClick={this.handleReloadPane}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Reload Pane
              </button>
              
              <button 
                className="error-boundary-button error-boundary-button-secondary"
                onClick={this.handleCopyError}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Error
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details (Development)</summary>
                <div className="error-boundary-error-info">
                  <div className="error-boundary-error-message">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="error-boundary-error-stack">
                      <strong>Stack:</strong>
                      <pre>{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="error-boundary-component-stack">
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
