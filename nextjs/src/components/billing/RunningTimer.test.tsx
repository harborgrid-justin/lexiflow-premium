/**
 * RunningTimer Component Tests
 * Enterprise-grade tests for the persistent timer component with localStorage.
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunningTimer } from './RunningTimer';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('RunningTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders timer display with initial 00:00:00', () => {
      render(<RunningTimer />);

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('renders Start button initially', () => {
      render(<RunningTimer />);

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('renders Stop & Apply button', () => {
      render(<RunningTimer />);

      expect(screen.getByRole('button', { name: /stop & apply/i })).toBeInTheDocument();
    });

    it('displays hours in decimal format', () => {
      render(<RunningTimer />);

      expect(screen.getByText('0.00 hours')).toBeInTheDocument();
    });

    it('Stop button is disabled when no time elapsed', () => {
      render(<RunningTimer />);

      const stopButton = screen.getByRole('button', { name: /stop & apply/i });
      expect(stopButton).toBeDisabled();
    });
  });

  describe('Timer Controls', () => {
    it('shows Pause button when timer is running', async () => {
      render(<RunningTimer />);

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
    });

    it('shows Start button when timer is paused', async () => {
      render(<RunningTimer />);

      // Start
      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      // Pause
      fireEvent.click(screen.getByRole('button', { name: /pause/i }));

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('enables Stop button when timer has elapsed time', () => {
      render(<RunningTimer />);

      // Start timer
      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      // Advance time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const stopButton = screen.getByRole('button', { name: /stop & apply/i });
      expect(stopButton).not.toBeDisabled();
    });
  });

  describe('Timer Counting', () => {
    it('increments seconds when running', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });

    it('formats minutes correctly', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(90000); // 1 minute 30 seconds
      });

      expect(screen.getByText('00:01:30')).toBeInTheDocument();
    });

    it('formats hours correctly', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(3661000); // 1 hour, 1 minute, 1 second
      });

      expect(screen.getByText('01:01:01')).toBeInTheDocument();
    });

    it('stops counting when paused', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      fireEvent.click(screen.getByRole('button', { name: /pause/i }));

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:03')).toBeInTheDocument();
    });

    it('resumes counting after pause', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      fireEvent.click(screen.getByRole('button', { name: /pause/i }));
      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });
  });

  describe('Hours Display', () => {
    it('updates decimal hours display', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(3600000); // 1 hour
      });

      expect(screen.getByText('1.00 hours')).toBeInTheDocument();
    });

    it('shows fractional hours', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(5400000); // 1.5 hours
      });

      expect(screen.getByText('1.50 hours')).toBeInTheDocument();
    });
  });

  describe('onComplete Callback', () => {
    it('calls onComplete with elapsed hours when stopped', () => {
      const mockOnComplete = jest.fn();
      render(<RunningTimer onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(7200000); // 2 hours
      });

      fireEvent.click(screen.getByRole('button', { name: /stop & apply/i }));

      expect(mockOnComplete).toHaveBeenCalledWith(2);
    });

    it('calls onComplete with fractional hours', () => {
      const mockOnComplete = jest.fn();
      render(<RunningTimer onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(5400000); // 1.5 hours
      });

      fireEvent.click(screen.getByRole('button', { name: /stop & apply/i }));

      expect(mockOnComplete).toHaveBeenCalledWith(1.5);
    });

    it('resets timer after stop', () => {
      const mockOnComplete = jest.fn();
      render(<RunningTimer onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(3600000);
      });

      fireEvent.click(screen.getByRole('button', { name: /stop & apply/i }));

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('saves timer state to localStorage', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('loads saved timer state from localStorage', () => {
      const savedState = {
        isRunning: false,
        startTime: null,
        elapsedSeconds: 120, // 2 minutes
        caseId: 'case-1',
        description: 'Test',
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

      render(<RunningTimer />);

      expect(screen.getByText('00:02:00')).toBeInTheDocument();
    });

    it('calculates elapsed time for running timer loaded from storage', () => {
      const now = Date.now();
      const savedState = {
        isRunning: true,
        startTime: now - 60000, // Started 60 seconds ago
        elapsedSeconds: 0,
        caseId: 'case-1',
        description: 'Test',
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedState));

      render(<RunningTimer />);

      // Should show approximately 60 seconds (may vary slightly due to timing)
      const timerDisplay = screen.getByText(/00:01:/);
      expect(timerDisplay).toBeInTheDocument();
    });

    it('clears localStorage when timer is stopped', () => {
      render(<RunningTimer onComplete={jest.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      fireEvent.click(screen.getByRole('button', { name: /stop & apply/i }));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('lexiflow_running_timer');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      render(<RunningTimer />);

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
  });

  describe('Note Message', () => {
    it('shows persistence note when timer has elapsed time', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/timer will persist across page reloads/i)).toBeInTheDocument();
    });

    it('does not show note when timer is at zero', () => {
      render(<RunningTimer />);

      expect(screen.queryByText(/timer will persist/i)).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts caseId prop', () => {
      render(<RunningTimer caseId="case-123" />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedState = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedState.caseId).toBe('case-123');
    });

    it('accepts description prop', () => {
      render(<RunningTimer description="Research task" />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedState = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedState.description).toBe('Research task');
    });
  });

  describe('Styling', () => {
    it('has correct container styling', () => {
      const { container } = render(<RunningTimer />);

      const timerContainer = container.firstChild;
      expect(timerContainer).toHaveClass('rounded-lg', 'border-2', 'border-blue-500');
    });

    it('Start button has green styling', () => {
      render(<RunningTimer />);

      const startButton = screen.getByRole('button', { name: /start/i });
      expect(startButton).toHaveClass('bg-green-600');
    });

    it('Pause button has yellow styling', () => {
      render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      expect(pauseButton).toHaveClass('bg-yellow-600');
    });

    it('Stop button has red styling', () => {
      render(<RunningTimer />);

      const stopButton = screen.getByRole('button', { name: /stop & apply/i });
      expect(stopButton).toHaveClass('bg-red-600');
    });

    it('displays timer in monospace font', () => {
      render(<RunningTimer />);

      const timerDisplay = screen.getByText('00:00:00');
      expect(timerDisplay).toHaveClass('font-mono');
    });
  });

  describe('Cleanup', () => {
    it('clears interval on unmount', () => {
      const { unmount } = render(<RunningTimer />);

      fireEvent.click(screen.getByRole('button', { name: /start/i }));

      unmount();

      // Should not throw or cause issues
      act(() => {
        jest.advanceTimersByTime(5000);
      });
    });
  });

  describe('Accessibility', () => {
    it('buttons are keyboard accessible', () => {
      render(<RunningTimer />);

      const startButton = screen.getByRole('button', { name: /start/i });
      startButton.focus();

      expect(document.activeElement).toBe(startButton);
    });

    it('disabled Stop button is properly disabled', () => {
      render(<RunningTimer />);

      const stopButton = screen.getByRole('button', { name: /stop & apply/i });
      expect(stopButton).toHaveAttribute('disabled');
      expect(stopButton).toHaveClass('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
    });
  });
});
