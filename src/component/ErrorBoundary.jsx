import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900 p-6">
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-8 max-w-md w-full text-center shadow-card">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-surface-50 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-surface-300 mb-6">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>
            
            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-surface-900 p-4 rounded-lg border border-surface-600">
                <summary className="text-red-400 cursor-pointer mb-2 font-semibold">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-surface-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="border border-surface-600 hover:border-primary-400 text-surface-300 hover:text-primary-300 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;