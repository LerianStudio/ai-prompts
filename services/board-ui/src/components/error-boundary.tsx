import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent {...this.state} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#f4f4f5'}}>
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Something went wrong</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                The application encountered an unexpected error. This has been logged and will be investigated.
              </AlertDescription>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-red-100 rounded text-sm font-mono text-red-800 overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default" 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reload Page
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    // Log the error
    console.error('Application Error:', error);
    
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }

    // In a real application, you might want to send this to an error reporting service
    // reportError(error, { info: errorInfo });
  };
}

// Task-specific error boundary with better context
export function TaskErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <Alert className="m-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Task Management Error</AlertTitle>
          <AlertDescription className="text-amber-700">
            There was a problem with the task management system. 
            Your data is safe, but some features may not work correctly.
          </AlertDescription>
          
          <div className="mt-3">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reload Application
            </Button>
          </div>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}