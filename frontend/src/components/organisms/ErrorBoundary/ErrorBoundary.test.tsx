import { errorHandler } from '@/utils/errorHandler';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

// Mock errorHandler
jest.mock('@/utils/errorHandler', () => ({
  errorHandler: {
    logError: jest.fn(),
  },
}));

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary scope="TestComponent">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred in TestComponent/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays default scope name when scope prop is not provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/An error occurred in this component/i)).toBeInTheDocument();
  });

  it('logs error with errorHandler when error is caught', () => {
    render(
      <ErrorBoundary scope="TestScope">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(errorHandler.logError).toHaveBeenCalledWith(
      expect.any(Error),
      'TestScope'
    );
  });

  it('renders custom fallback UI when provided', () => {
    const fallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onReset callback and resets error state when Try Again is clicked', async () => {
    const onReset = jest.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await user.click(tryAgainButton);

    expect(onReset).toHaveBeenCalledTimes(1);

    // After reset, re-render with no error
    rerender(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders refresh icon in Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('displays alert triangle icon in error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert.querySelector('svg')).toBeInTheDocument();
  });
});
