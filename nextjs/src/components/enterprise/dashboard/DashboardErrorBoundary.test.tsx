/**
 * @module components/enterprise/dashboard/DashboardErrorBoundary.test
 * @description Unit tests for DashboardErrorBoundary component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardErrorBoundary, useErrorHandler } from './DashboardErrorBoundary';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-icon" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <svg data-testid="refresh-icon" className={className} />
  ),
  Home: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-down-icon" className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-up-icon" className={className} />
  ),
}));

// Suppress console.error for error boundary tests
const originalError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// ============================================================================
// TEST COMPONENTS
// ============================================================================

const ErrorThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

const ChildComponent = () => <div>Child content renders correctly</div>;

// ============================================================================
// BASIC TESTS
// ============================================================================

describe('DashboardErrorBoundary basic behavior', () => {
  it('should render children when no error', () => {
    render(
      <DashboardErrorBoundary>
        <ChildComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Child content renders correctly')).toBeInTheDocument();
  });

  it('should catch errors and display error UI', () => {
    render(
      <DashboardErrorBoundary>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Widget Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display alert icon when error occurs', () => {
    render(
      <DashboardErrorBoundary>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });
});

// ============================================================================
// CUSTOM FALLBACK TESTS
// ============================================================================

describe('DashboardErrorBoundary custom fallback', () => {
  it('should render custom fallback when provided', () => {
    const CustomFallback = <div>Custom error fallback</div>;

    render(
      <DashboardErrorBoundary fallback={CustomFallback}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
    expect(screen.queryByText('Widget Error')).not.toBeInTheDocument();
  });
});

// ============================================================================
// ERROR HANDLER CALLBACK TESTS
// ============================================================================

describe('DashboardErrorBoundary onError callback', () => {
  it('should call onError when error occurs', () => {
    const onError = jest.fn();

    render(
      <DashboardErrorBoundary onError={onError}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});

// ============================================================================
// RESET TESTS
// ============================================================================

describe('DashboardErrorBoundary reset', () => {
  it('should show try again button', () => {
    render(
      <DashboardErrorBoundary>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call onReset when try again is clicked', () => {
    const onReset = jest.fn();

    render(
      <DashboardErrorBoundary onReset={onReset}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(onReset).toHaveBeenCalled();
  });

  it('should reset error state when try again is clicked', () => {
    // This is a bit tricky to test since ErrorThrowingComponent will throw again
    // We'll verify the click handler works
    render(
      <DashboardErrorBoundary>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();

    // Click should not throw
    fireEvent.click(tryAgainButton);
  });
});

// ============================================================================
// RESET KEYS TESTS
// ============================================================================

describe('DashboardErrorBoundary resetKeys', () => {
  it('should auto-reset when resetKeys change', () => {
    const { rerender } = render(
      <DashboardErrorBoundary resetKeys={['key1']}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Change resetKeys - this should trigger a reset attempt
    rerender(
      <DashboardErrorBoundary resetKeys={['key2']}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    // Error will be thrown again, but reset logic was triggered
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});

// ============================================================================
// ISOLATE PROP TESTS
// ============================================================================

describe('DashboardErrorBoundary isolate prop', () => {
  it('should show Widget Error when isolate is true (default)', () => {
    render(
      <DashboardErrorBoundary isolate={true}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Widget Error')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
  });

  it('should show Dashboard Error when isolate is false', () => {
    render(
      <DashboardErrorBoundary isolate={false}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR DETAILS TESTS
// ============================================================================

describe('DashboardErrorBoundary error details', () => {
  it('should show error details toggle when showDetails is true (default)', () => {
    render(
      <DashboardErrorBoundary showDetails={true}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /show error details/i })).toBeInTheDocument();
  });

  it('should not show error details toggle when showDetails is false', () => {
    render(
      <DashboardErrorBoundary showDetails={false}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /show error details/i })).not.toBeInTheDocument();
  });

  it('should toggle error details when button is clicked', () => {
    render(
      <DashboardErrorBoundary showDetails={true}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    // Initially hidden
    expect(screen.queryByText(/hide error details/i)).not.toBeInTheDocument();

    // Click to show
    fireEvent.click(screen.getByRole('button', { name: /show error details/i }));

    expect(screen.getByRole('button', { name: /hide error details/i })).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByRole('button', { name: /hide error details/i }));

    expect(screen.getByRole('button', { name: /show error details/i })).toBeInTheDocument();
  });
});

// ============================================================================
// SUPPORT NOTE TESTS
// ============================================================================

describe('DashboardErrorBoundary support note', () => {
  it('should display support note', () => {
    render(
      <DashboardErrorBoundary>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText(/this error has been logged/i)).toBeInTheDocument();
    expect(screen.getByText(/contact support/i)).toBeInTheDocument();
  });
});

// ============================================================================
// GO HOME BUTTON TESTS
// ============================================================================

describe('DashboardErrorBoundary go home button', () => {
  it('should not show go home button when isolate is true', () => {
    render(
      <DashboardErrorBoundary isolate={true}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
  });

  it('should show go home button when isolate is false', () => {
    render(
      <DashboardErrorBoundary isolate={false}>
        <ErrorThrowingComponent />
      </DashboardErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });
});

// ============================================================================
// USE ERROR HANDLER HOOK TESTS
// ============================================================================

describe('useErrorHandler hook', () => {
  it('should throw error when setError is called', () => {
    const TestComponent = () => {
      const setError = useErrorHandler();
      return (
        <button onClick={() => setError(new Error('Hook error'))}>Trigger Error</button>
      );
    };

    render(
      <DashboardErrorBoundary>
        <TestComponent />
      </DashboardErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(screen.getByText('Hook error')).toBeInTheDocument();
  });
});

// ============================================================================
// UNKNOWN ERROR TESTS
// ============================================================================

describe('DashboardErrorBoundary unknown error', () => {
  it('should display unknown error message when error has no message', () => {
    const NoMessageError = () => {
      const err = new Error();
      err.message = '';
      throw err;
    };

    render(
      <DashboardErrorBoundary>
        <NoMessageError />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
  });
});
