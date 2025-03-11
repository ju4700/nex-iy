import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    hasError: false 
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could add error reporting service here
    // reportError(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div 
          style={{ 
            padding: '20px', 
            margin: '20px',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            textAlign: 'center',
            maxWidth: '800px'
          }} 
          role="alert"
        >
          <h2 style={{ marginBottom: '15px' }}>Something went wrong</h2>
          
          <p style={{ marginBottom: '10px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          
          {/* Show stack in development only */}
          {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
            <details style={{ 
              marginBottom: '15px', 
              textAlign: 'left', 
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <summary>Error details</summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.8em', 
                margin: '10px 0' 
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ 
                padding: '10px 20px', 
                background: '#dc3545', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;