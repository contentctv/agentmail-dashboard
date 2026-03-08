/**
 * Error Boundary component for graceful error handling.
 * Catches React errors and displays user-friendly fallback UI.
 */
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = {
      hasError: true,
      error,
      errorInfo
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 max-w-2xl w-full">
            <div className="flex items-start gap-4">
              <svg 
                className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-red-400 mb-2">
                  Application Error
                </h1>
                <p className="text-gray-300 mb-4">
                  The dashboard encountered an unexpected error. Please refresh the page or contact support if the problem persists.
                </p>
                {this.state.error && (
                  <details className="bg-gray-800 rounded p-4 text-sm font-mono">
                    <summary className="cursor-pointer text-gray-400 mb-2">
                      Error Details
                    </summary>
                    <pre className="text-red-400 whitespace-pre-wrap overflow-x-auto">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-gray-500 mt-2 whitespace-pre-wrap overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Reload Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
