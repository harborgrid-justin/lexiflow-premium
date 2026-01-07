/**
 * @module components/enterprise/notifications/ToastContainer.test
 * @description Unit tests for ToastContainer component and useToastNotifications hook.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer, useToastNotifications, ToastContext, ToastContextValue } from './ToastContainer';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, role, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} role={role} {...props}>
        {children}
      </div>
    ),
    button: ({ children, className, onClick, ...props }: React.ComponentProps<'button'>) => (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  CheckCircle: ({ className }: { className?: string }) => (
    <svg data-testid="success-icon" className={className} />
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <svg data-testid="error-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="warning-icon" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <svg data-testid="info-icon" className={className} />
  ),
  Volume2: ({ className }: { className?: string }) => (
    <svg data-testid="volume-on-icon" className={className} />
  ),
  VolumeX: ({ className }: { className?: string }) => (
    <svg data-testid="volume-off-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

// Mock AudioContext
const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  frequency: { value: 0 },
  type: 'sine',
};

const mockGainNode = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockAudioContext = {
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
};

(global as unknown as Record<string, unknown>).AudioContext = jest.fn(() => mockAudioContext);

// ============================================================================
// TEST SETUP
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Component to test useToastNotifications hook
const TestConsumer: React.FC = () => {
  const { addToast, removeToast, clearAllToasts, toggleSound, isSoundEnabled } = useToastNotifications();

  return (
    <div>
      <button
        onClick={() =>
          addToast({
            title: 'Test Toast',
            message: 'Test message',
            type: 'success',
            priority: 'normal',
            read: false,
          })
        }
      >
        Add Success Toast
      </button>
      <button
        onClick={() =>
          addToast({
            title: 'Error Toast',
            message: 'Error message',
            type: 'error',
            priority: 'urgent',
            read: false,
          })
        }
      >
        Add Error Toast
      </button>
      <button
        onClick={() =>
          addToast({
            title: 'Warning Toast',
            message: 'Warning message',
            type: 'warning',
            priority: 'high',
            read: false,
          })
        }
      >
        Add Warning Toast
      </button>
      <button
        onClick={() =>
          addToast({
            title: 'Info Toast',
            message: 'Info message',
            type: 'info',
            priority: 'normal',
            read: false,
          })
        }
      >
        Add Info Toast
      </button>
      <button
        onClick={() =>
          addToast({
            title: 'No Auto Dismiss',
            message: 'Persistent toast',
            type: 'info',
            priority: 'normal',
            read: false,
            duration: 0,
          })
        }
      >
        Add Persistent Toast
      </button>
      <button
        onClick={() =>
          addToast({
            title: 'With Actions',
            message: 'Toast with action buttons',
            type: 'info',
            priority: 'normal',
            read: false,
            actions: [
              { label: 'Action 1', onClick: jest.fn(), variant: 'primary' },
              { label: 'Action 2', onClick: jest.fn(), variant: 'secondary' },
            ],
          })
        }
      >
        Add Toast With Actions
      </button>
      <button onClick={clearAllToasts}>Clear All</button>
      <button onClick={toggleSound}>Toggle Sound</button>
      <span data-testid="sound-status">{isSoundEnabled ? 'Sound On' : 'Sound Off'}</span>
    </div>
  );
};

// ============================================================================
// CONTEXT TESTS
// ============================================================================

describe('ToastContainer context', () => {
  it('should throw error when useToastNotifications is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    const ErrorComponent = () => {
      useToastNotifications();
      return null;
    };

    expect(() => render(<ErrorComponent />)).toThrow(
      'useToastNotifications must be used within ToastContainer'
    );

    console.error = originalError;
  });

  it('should provide context to children', () => {
    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    expect(screen.getByText('Add Success Toast')).toBeInTheDocument();
    expect(screen.getByTestId('sound-status')).toHaveTextContent('Sound On');
  });
});

// ============================================================================
// ADD TOAST TESTS
// ============================================================================

describe('ToastContainer addToast', () => {
  it('should add a success toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('should add an error toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Error Toast')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('should add a warning toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Warning Toast'));

    await waitFor(() => {
      expect(screen.getByText('Warning Toast')).toBeInTheDocument();
    });
  });

  it('should add an info toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Info Toast'));

    await waitFor(() => {
      expect(screen.getByText('Info Toast')).toBeInTheDocument();
    });
  });

  it('should render toast with action buttons', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Toast With Actions'));

    await waitFor(() => {
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// MAX VISIBLE TESTS
// ============================================================================

describe('ToastContainer maxVisible', () => {
  it('should limit visible toasts to maxVisible', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer maxVisible={2}>
        <TestConsumer />
      </ToastContainer>
    );

    // Add 3 toasts
    await user.click(screen.getByText('Add Success Toast'));
    await user.click(screen.getByText('Add Error Toast'));
    await user.click(screen.getByText('Add Warning Toast'));

    await waitFor(() => {
      // Only the 2 most recent should be visible
      const toasts = screen.getAllByRole('alert');
      expect(toasts.length).toBeLessThanOrEqual(2);
    });
  });
});

// ============================================================================
// AUTO DISMISS TESTS
// ============================================================================

describe('ToastContainer auto-dismiss', () => {
  it('should auto-dismiss toast after duration', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
    });

    // Advance timers past default duration (5000ms for non-error)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    });
  });

  it('should not auto-dismiss when duration is 0', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Persistent Toast'));

    await waitFor(() => {
      expect(screen.getByText('No Auto Dismiss')).toBeInTheDocument();
    });

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should still be visible
    expect(screen.getByText('No Auto Dismiss')).toBeInTheDocument();
  });

  it('should use longer duration for error toasts', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Error Toast')).toBeInTheDocument();
    });

    // Advance past default success duration but less than error duration
    act(() => {
      jest.advanceTimersByTime(5500);
    });

    // Error toast should still be visible (7000ms default for errors)
    expect(screen.getByText('Error Toast')).toBeInTheDocument();
  });
});

// ============================================================================
// DISMISS TOAST TESTS
// ============================================================================

describe('ToastContainer dismiss', () => {
  it('should dismiss toast when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Dismiss notification');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    });
  });

  it('should clear all toasts', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Success Toast'));
    await user.click(screen.getByText('Add Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
      expect(screen.getByText('Error Toast')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Clear All'));

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
      expect(screen.queryByText('Error Toast')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// SOUND TESTS
// ============================================================================

describe('ToastContainer sound', () => {
  it('should toggle sound on and off', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer enableSound>
        <TestConsumer />
      </ToastContainer>
    );

    expect(screen.getByTestId('sound-status')).toHaveTextContent('Sound On');

    await user.click(screen.getByText('Toggle Sound'));

    await waitFor(() => {
      expect(screen.getByTestId('sound-status')).toHaveTextContent('Sound Off');
    });

    await user.click(screen.getByText('Toggle Sound'));

    await waitFor(() => {
      expect(screen.getByTestId('sound-status')).toHaveTextContent('Sound On');
    });
  });

  it('should start with sound disabled when enableSound is false', () => {
    render(
      <ToastContainer enableSound={false}>
        <TestConsumer />
      </ToastContainer>
    );

    expect(screen.getByTestId('sound-status')).toHaveTextContent('Sound Off');
  });
});

// ============================================================================
// POSITION TESTS
// ============================================================================

describe('ToastContainer position', () => {
  it('should apply bottom-right position classes by default', () => {
    const { container } = render(
      <ToastContainer>
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('bottom-4', 'right-4');
  });

  it('should apply top-left position classes', () => {
    const { container } = render(
      <ToastContainer position="top-left">
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('top-4', 'left-4');
  });

  it('should apply top-center position classes', () => {
    const { container } = render(
      <ToastContainer position="top-center">
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('top-4', '-translate-x-1/2');
  });

  it('should apply bottom-center position classes', () => {
    const { container } = render(
      <ToastContainer position="bottom-center">
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('bottom-4', '-translate-x-1/2');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('ToastContainer accessibility', () => {
  it('should have aria-live polite on container', () => {
    const { container } = render(
      <ToastContainer>
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toBeInTheDocument();
  });

  it('should have aria-atomic true on container', () => {
    const { container } = render(
      <ToastContainer>
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-atomic="true"]');
    expect(toastContainer).toBeInTheDocument();
  });

  it('should render toasts with alert role', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Success Toast'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should have assertive aria-live for urgent priority', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Error Toast')); // urgent priority

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('ToastContainer styling', () => {
  it('should apply custom className', () => {
    const { container } = render(
      <ToastContainer className="custom-toast-container">
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('custom-toast-container');
  });

  it('should apply custom gap between toasts', () => {
    const { container } = render(
      <ToastContainer gap={16}>
        <div>Content</div>
      </ToastContainer>
    );

    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveStyle({ gap: '16px' });
  });
});

// ============================================================================
// ACTION BUTTON TESTS
// ============================================================================

describe('ToastContainer action buttons', () => {
  it('should execute action onClick and dismiss toast', async () => {
    const actionFn = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const ActionTestConsumer = () => {
      const { addToast } = useToastNotifications();

      return (
        <button
          onClick={() =>
            addToast({
              title: 'Test',
              message: 'Message',
              type: 'info',
              priority: 'normal',
              read: false,
              actions: [{ label: 'Click Me', onClick: actionFn, variant: 'primary' }],
            })
          }
        >
          Add Toast
        </button>
      );
    };

    render(
      <ToastContainer>
        <ActionTestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Toast'));

    await waitFor(() => {
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Click Me'));

    expect(actionFn).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  it('should apply correct variant styles to action buttons', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const VariantTestConsumer = () => {
      const { addToast } = useToastNotifications();

      return (
        <button
          onClick={() =>
            addToast({
              title: 'Test',
              message: 'Message',
              type: 'info',
              priority: 'normal',
              read: false,
              actions: [
                { label: 'Primary', onClick: jest.fn(), variant: 'primary' },
                { label: 'Danger', onClick: jest.fn(), variant: 'danger' },
                { label: 'Secondary', onClick: jest.fn(), variant: 'secondary' },
              ],
            })
          }
        >
          Add Toast
        </button>
      );
    };

    render(
      <ToastContainer>
        <VariantTestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Toast'));

    await waitFor(() => {
      const primaryBtn = screen.getByText('Primary');
      const dangerBtn = screen.getByText('Danger');
      const secondaryBtn = screen.getByText('Secondary');

      expect(primaryBtn).toHaveClass('bg-blue-600');
      expect(dangerBtn).toHaveClass('bg-red-600');
      expect(secondaryBtn).toHaveClass('bg-slate-200');
    });
  });
});

// ============================================================================
// URGENT PRIORITY TESTS
// ============================================================================

describe('ToastContainer priority styling', () => {
  it('should apply ring styling for urgent priority', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastContainer>
        <TestConsumer />
      </ToastContainer>
    );

    await user.click(screen.getByText('Add Error Toast')); // urgent priority

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('ring-2', 'ring-red-500');
    });
  });
});

// ============================================================================
// CHILDREN RENDERING TESTS
// ============================================================================

describe('ToastContainer children', () => {
  it('should render children correctly', () => {
    render(
      <ToastContainer>
        <div data-testid="child-content">Child Content</div>
      </ToastContainer>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
