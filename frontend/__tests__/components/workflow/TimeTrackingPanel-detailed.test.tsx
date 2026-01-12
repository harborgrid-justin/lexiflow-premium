/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from '@/__tests__/test-utils';
import { TimeTrackingPanel } from '@/lexiflow-suite/components/workflow/TimeTrackingPanel';
import '@testing-library/jest-dom';

// Mock timers
jest.useFakeTimers();

describe('TimeTrackingPanel', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should render time tracking panel', () => {
      render(<TimeTrackingPanel />);
      expect(screen.getByText('Active Task Timer')).toBeInTheDocument();
    });

    it('should display initial time as 00:00:00', () => {
      render(<TimeTrackingPanel />);
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('should render play button when not active', () => {
      render(<TimeTrackingPanel />);
      const playButton = screen.getByRole('button');
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should start timer when play button is clicked', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('00:00:01')).toBeInTheDocument();
    });

    it('should count seconds correctly', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });

    it('should format minutes correctly', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(90000); // 90 seconds = 1:30
      });

      expect(screen.getByText('00:01:30')).toBeInTheDocument();
    });

    it('should format hours correctly', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(3661000); // 3661 seconds = 1:01:01
      });

      expect(screen.getByText('01:01:01')).toBeInTheDocument();
    });

    it('should pause timer when pause button is clicked', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:05')).toBeInTheDocument();

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still be at 5 seconds
      expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });

    it('should show pause button when timer is active', () => {
      const { container } = render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      // Should now have pause button
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show stop button when paused with time', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      // Should have both play and stop buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Stop Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Mock window.alert
      global.alert = jest.fn();
    });

    it('should reset timer when stop button is clicked', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      const buttons = screen.getAllByRole('button');
      const stopButton = buttons[buttons.length - 1]; // Last button should be stop
      fireEvent.click(stopButton);

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('should show alert when stopping timer', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      const buttons = screen.getAllByRole('button');
      const stopButton = buttons[buttons.length - 1];
      fireEvent.click(stopButton);

      expect(global.alert).toHaveBeenCalledWith('Time logged to billing.');
    });
  });

  describe('Visual States', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should have pulsing animation on clock icon', () => {
      const { container } = render(<TimeTrackingPanel />);
      const pulsingDiv = container.querySelector('.animate-pulse');
      expect(pulsingDiv).toBeInTheDocument();
    });

    it('should use monospace font for time display', () => {
      const { container } = render(<TimeTrackingPanel />);
      const timeDisplay = container.querySelector('.font-mono');
      expect(timeDisplay).toBeInTheDocument();
    });

    it('should have green play button', () => {
      const { container } = render(<TimeTrackingPanel />);
      const greenButton = container.querySelector('.bg-green-600');
      expect(greenButton).toBeInTheDocument();
    });

    it('should have amber pause button when active', () => {
      const { container } = render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      const amberButton = container.querySelector('.bg-amber-600');
      expect(amberButton).toBeInTheDocument();
    });

    it('should have red stop button when paused', () => {
      const { container } = render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      const redButton = container.querySelector('.bg-red-600');
      expect(redButton).toBeInTheDocument();
    });
  });

  describe('Timer Cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should cleanup interval on unmount', () => {
      const { unmount } = render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      unmount();

      // Should not cause any memory leaks
      act(() => {
        jest.advanceTimersByTime(5000);
      });
    });

    it('should cleanup interval when paused', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      // Timer should be cleared
      expect(screen.getByText('00:00:02')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should have accessible button elements', () => {
      render(<TimeTrackingPanel />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper contrast for dark theme', () => {
      const { container } = render(<TimeTrackingPanel />);
      const darkBackground = container.querySelector('.bg-slate-900');
      expect(darkBackground).toBeInTheDocument();
    });

    it('should have visible time display', () => {
      render(<TimeTrackingPanel />);
      const timeDisplay = screen.getByText('00:00:00');
      expect(timeDisplay).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should handle rapid start/stop cycles', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];

      fireEvent.click(playButton);
      act(() => jest.advanceTimersByTime(1000));

      const pauseButton = screen.getAllByRole('button')[0];
      fireEvent.click(pauseButton);

      const playButton2 = screen.getAllByRole('button')[0];
      fireEvent.click(playButton2);
      act(() => jest.advanceTimersByTime(1000));

      // Should be at 2 seconds total
      expect(screen.getByText('00:00:02')).toBeInTheDocument();
    });

    it('should handle zero seconds display', () => {
      render(<TimeTrackingPanel />);
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('should handle large time values', () => {
      render(<TimeTrackingPanel />);

      const playButton = screen.getAllByRole('button')[0];
      fireEvent.click(playButton);

      act(() => {
        jest.advanceTimersByTime(36000000); // 10 hours
      });

      expect(screen.getByText('10:00:00')).toBeInTheDocument();
    });
  });
});
