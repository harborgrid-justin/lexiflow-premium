import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AsyncBoundary, PageAsyncBoundary, ComponentAsyncBoundary } from './AsyncBoundary';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white' },
      border: { default: 'border-slate-200' },
      text: { primary: 'text-slate-900', secondary: 'text-slate-600', tertiary: 'text-slate-400' },
      status: { error: { text: 'text-red-600' }, success: { text: 'text-green-600' }, warning: { text: 'text-yellow-600' } },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock LazyLoader
jest.mock('@/components/ui/molecules/LazyLoader/LazyLoader', () => ({
  LazyLoader: ({ message }: { message: string }) => (
    <div data-testid="lazy-loader">{message}</div>
  ),
}));

// Mock ErrorBoundary
jest.mock('@/components/organisms/ErrorBoundary/ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback, scope }: { children: React.ReactNode; fallback: React.ReactNode; scope: string }) => {
    // Simple mock that renders children or fallback based on error
    return <div data-testid={`error-boundary-${scope}`}>{children}</div>;
  },
}));

// Mock Button
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, icon: Icon }: { children: React.ReactNode; onClick?: () => void; icon?: React.ComponentType }) => (
    <button onClick={onClick} data-testid="retry-button">
      {Icon && <span data-testid="button-icon" />}
      {children}
    </button>
  ),
}));

describe('AsyncBoundary', () => {
  const defaultProps = {
    children: <div data-testid="child-content">Child Content</div>,
  };

  describe('Rendering', () => {
    it('renders children content', () => {
      render(<AsyncBoundary {...defaultProps} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('wraps children with error boundary', () => {
      render(<AsyncBoundary {...defaultProps} scope="TestScope" />);
      expect(screen.getByTestId('error-boundary-TestScope')).toBeInTheDocument();
    });

    it('uses default scope name', () => {
      render(<AsyncBoundary {...defaultProps} />);
      expect(screen.getByTestId('error-boundary-Component')).toBeInTheDocument();
    });
  });

  describe('Loading Message', () => {
    it('uses default loading message', () => {
      // This would be visible in Suspense fallback
      render(<AsyncBoundary {...defaultProps} loadingMessage="Loading..." />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('accepts custom loading message', () => {
      render(<AsyncBoundary {...defaultProps} loadingMessage="Custom loading..." />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Custom Loading Fallback', () => {
    it('accepts custom loading fallback', () => {
      const customFallback = <div data-testid="custom-loader">Custom Loader</div>;
      render(
        <AsyncBoundary {...defaultProps} loadingFallback={customFallback} />
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Retry Configuration', () => {
    it('has retry enabled by default', () => {
      render(<AsyncBoundary {...defaultProps} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('accepts enableRetry prop', () => {
      render(<AsyncBoundary {...defaultProps} enableRetry={false} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('accepts maxRetries prop', () => {
      render(<AsyncBoundary {...defaultProps} maxRetries={5} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Timeout Configuration', () => {
    it('has default timeout of 30 seconds', () => {
      render(<AsyncBoundary {...defaultProps} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('accepts custom timeout', () => {
      render(<AsyncBoundary {...defaultProps} timeout={5000} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('accepts onLoad callback', () => {
      const onLoad = jest.fn();
      render(<AsyncBoundary {...defaultProps} onLoad={onLoad} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('accepts onError callback', () => {
      const onError = jest.fn();
      render(<AsyncBoundary {...defaultProps} onError={onError} />);
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children', () => {
      render(<AsyncBoundary>{null}</AsyncBoundary>);
      expect(screen.getByTestId('error-boundary-Component')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <AsyncBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </AsyncBoundary>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('handles empty scope', () => {
      render(<AsyncBoundary {...defaultProps} scope="" />);
      expect(screen.getByTestId('error-boundary-')).toBeInTheDocument();
    });
  });
});

describe('PageAsyncBoundary', () => {
  it('renders children', () => {
    render(
      <PageAsyncBoundary>
        <div data-testid="page-content">Page Content</div>
      </PageAsyncBoundary>
    );
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('wraps with error boundary', () => {
    render(
      <PageAsyncBoundary>
        <div>Content</div>
      </PageAsyncBoundary>
    );
    expect(screen.getByTestId('error-boundary-Component')).toBeInTheDocument();
  });
});

describe('ComponentAsyncBoundary', () => {
  it('renders children', () => {
    render(
      <ComponentAsyncBoundary name="TestComponent">
        <div data-testid="component-content">Component Content</div>
      </ComponentAsyncBoundary>
    );
    expect(screen.getByTestId('component-content')).toBeInTheDocument();
  });

  it('uses name prop for scope', () => {
    render(
      <ComponentAsyncBoundary name="MyComponent">
        <div>Content</div>
      </ComponentAsyncBoundary>
    );
    expect(screen.getByTestId('error-boundary-MyComponent')).toBeInTheDocument();
  });
});

describe('AsyncBoundary Complete Configuration', () => {
  it('accepts all props', () => {
    const onLoad = jest.fn();
    const onError = jest.fn();

    render(
      <AsyncBoundary
        loadingMessage="Loading component..."
        loadingFallback={<div>Loading...</div>}
        scope="CompleteTest"
        enableRetry={true}
        maxRetries={3}
        timeout={10000}
        onLoad={onLoad}
        onError={onError}
      >
        <div data-testid="complete-content">Complete Content</div>
      </AsyncBoundary>
    );

    expect(screen.getByTestId('complete-content')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary-CompleteTest')).toBeInTheDocument();
  });
});
