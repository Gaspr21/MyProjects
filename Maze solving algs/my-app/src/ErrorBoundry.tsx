import React from 'react';
import ErrorPrompt from './ErrorPrompt.tsx'
import { NavigateFunction, useNavigate } from "react-router-dom";


interface ErrorBoundaryProps {
  children: React.ReactNode;
  message?: string;
  navigate?: NavigateFunction;

}

interface ErrorBoundaryState {
  hasError: boolean;
}


class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };

  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error object:", error);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Component stack:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Optional fallback UI (in case navigate fails)
      return <ErrorPrompt message={this.props.message ?? "Something went wrong."} />;
    }

    return;
  }
}

export function ErrorBoundaryWithRouter(props: Omit<ErrorBoundaryProps, "navigate">) {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
}

export default ErrorBoundaryWithRouter