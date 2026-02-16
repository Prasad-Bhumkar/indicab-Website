import React from 'react';
import './ErrorBoundary.css';
import { getSentry } from '../config/sentry';

/**
 * Error Boundary component to catch and display React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });

    // Send to Sentry if available
    const Sentry = getSentry();
    if (Sentry) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary className="error-summary">Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error}
                  {'\n\n'}
                  {this.state.errorInfo}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button
                className="btn btn-primary error-btn-reset"
                onClick={this.handleReset}
              >
                <i className="bi bi-arrow-clockwise"></i> Try Again
              </button>
              <a href="/" className="btn btn-secondary error-btn-home">
                <i className="bi bi-house"></i> Go to Home
              </a>
            </div>

            <p className="error-support">
              If the problem persists, please contact our support team at{' '}
              <a href="mailto:support@indicab.com">support@indicab.com</a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
