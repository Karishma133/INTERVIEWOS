import React from "react";

/**
 * Without an error boundary, ANY uncaught render error in ANY component
 * shows the user a blank white screen with no explanation — a real risk
 * in production. This catches render errors anywhere below it and shows
 * a friendly recovery screen instead.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught render error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              An unexpected error occurred. This has been logged — try heading back to your dashboard.
            </p>
            <button onClick={this.handleReload} className="btn-primary">Back to Dashboard</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
