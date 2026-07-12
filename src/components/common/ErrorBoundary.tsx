import { Component, type ReactNode } from 'react';
import { AppErrorState } from './AppErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally avoid logging guest data or questionnaire content.
  }

  render() {
    if (this.state.hasError) {
      return <AppErrorState />;
    }

    return this.props.children;
  }
}
