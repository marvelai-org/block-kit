import * as React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { ReactRenderer } from '@storybook/react';
import '../styles.css';

// Simple error boundary for Storybook
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error in story:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorStyle: React.CSSProperties = {
        padding: '1rem',
        border: '1px solid #fca5a5',
        borderRadius: '0.5rem',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
      };

      const preStyle: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        fontSize: '0.875rem',
        overflowX: 'auto',
        backgroundColor: '#fee2e2',
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginTop: '0.5rem',
      };

      return (
        <div style={errorStyle}>
          <h3>Something went wrong in this story.</h3>
          <pre style={preStyle}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}

const withErrorBoundary: Decorator = (Story) => (
  <ErrorBoundary>
    <Story />
  </ErrorBoundary>
);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    withErrorBoundary,
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview; 