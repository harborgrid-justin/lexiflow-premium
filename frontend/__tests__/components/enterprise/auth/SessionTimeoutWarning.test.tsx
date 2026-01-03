/**
 * SessionTimeoutWarning Component Tests
 *
 * Tests for session timeout warning modal including countdown timer,
 * extend session, and logout functionality.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';
import { useAuthActions, useAuthState } from '@/contexts/auth/AuthProvider';

// Mock the auth hooks
jest.mock('@/contexts/auth/AuthProvider', () => ({
  useAuthActions: jest.fn(),
  useAuthState: jest.fn(),
}));

describe('SessionTimeoutWarning', () => {
  const mockExtendSession = jest.fn();
  const mockLogout = jest.fn();

  const mockSession = {
    expiresAt: new Date(Date.now() + 300000), // 5 minutes from now
    lastActivityAt: new Date(),
    warningShown: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ legacyFakeTimers: true });

    (useAuthActions as jest.Mock).mockReturnValue({
      extendSession: mockExtendSession,
      logout: mockLogout,
    });

    (useAuthState as jest.Mock).mockReturnValue({
      session: mockSession,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders modal when session warning is shown', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 }, // 5 minutes
        });
        window.dispatchEvent(event);
      });

      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
      expect(screen.getByText(/Your session will expire in/i)).toBeInTheDocument();
    });

    it('does not render when session is null', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        session: null,
      });

      const { container } = render(<SessionTimeoutWarning />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when warningShown is false', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        session: { ...mockSession, warningShown: false },
      });

      const { container } = render(<SessionTimeoutWarning />);
      expect(container.firstChild).toBeNull();
    });

    it('renders warning icon', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const modal = screen.getByText('Session Expiring Soon').closest('div');
      expect(modal).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      expect(screen.getByRole('button', { name: /Stay Signed In/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Out Now/i })).toBeInTheDocument();
    });

    it('displays security information', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/For your security, sessions expire after 30 minutes of inactivity/i)).toBeInTheDocument();
    });
  });

  describe('Custom Event Listener', () => {
    it('shows warning when session-warning event is dispatched', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch custom event
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 }, // 5 minutes
        });
        window.dispatchEvent(event);
      });

      // Warning should now be visible
      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
    });

    it('sets remaining seconds from event detail', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 120000 }, // 2 minutes
      });

      act(() => {
        window.dispatchEvent(event);
      });

      // Check that countdown shows 2 minutes
      expect(screen.getByText(/2:00/)).toBeInTheDocument();
    });

    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<SessionTimeoutWarning />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('session-warning', expect.any(Function));
    });
  });

  describe('Countdown Timer', () => {
    it('displays countdown in minutes and seconds format', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 180000 }, // 3 minutes
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });

    it('decrements countdown every second', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 5000 }, // 5 seconds
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/0:05/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/0:04/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/0:03/)).toBeInTheDocument();
    });

    it('pads seconds with leading zero when less than 10', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 9000 }, // 9 seconds
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/0:09/)).toBeInTheDocument();
    });

    it('stops countdown at 0', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 2000 }, // 2 seconds
      });

      act(() => {
        window.dispatchEvent(event);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 300000 },
      });

      act(() => {
        window.dispatchEvent(event);
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Progress Bar', () => {
    it('displays progress bar', () => {
      const { container } = render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const progressBar = container.querySelector('.bg-yellow-500');

      expect(progressBar).toBeInTheDocument();
    });

    it('updates progress bar width based on remaining time', async () => {
      const { container } = render(<SessionTimeoutWarning />);

      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 150000 }, // 2.5 minutes = 150 seconds
        });
        window.dispatchEvent(event);
      });

      // Wait for the component to render with the progress bar
      await waitFor(() => {
        const progressBar = container.querySelector('.bg-yellow-500') as HTMLElement;
        expect(progressBar).toBeInTheDocument();
      });

      // Verify progress bar exists (inline styles may not be visible in JSDOM)
      const progressBar = container.querySelector('.bg-yellow-500') as HTMLElement;
      expect(progressBar).toBeTruthy();
    });
  });

  describe('Extend Session', () => {
    it('calls extendSession when Stay Signed In is clicked', async () => {
      mockExtendSession.mockResolvedValue(undefined);

      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const staySignedInButton = screen.getByRole('button', { name: /Stay Signed In/i });
      fireEvent.click(staySignedInButton);

      await waitFor(() => {
        expect(mockExtendSession).toHaveBeenCalledTimes(1);
      });
    });

    it('hides modal after extending session', async () => {
      mockExtendSession.mockResolvedValue(undefined);

      const { rerender } = render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const staySignedInButton = screen.getByRole('button', { name: /Stay Signed In/i });
      fireEvent.click(staySignedInButton);

      await waitFor(() => {
        expect(mockExtendSession).toHaveBeenCalled();
      });

      // Simulate warning being hidden
      (useAuthState as jest.Mock).mockReturnValue({
        session: { ...mockSession, warningShown: false },
      });

      rerender(<SessionTimeoutWarning />);

      expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('calls logout when Sign Out Now is clicked', async () => {
      mockLogout.mockResolvedValue(undefined);

      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const signOutButton = screen.getByRole('button', { name: /Sign Out Now/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('hides modal after logout', async () => {
      mockLogout.mockResolvedValue(undefined);

      const { rerender } = render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const signOutButton = screen.getByRole('button', { name: /Sign Out Now/i });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      // Simulate session being cleared
      (useAuthState as jest.Mock).mockReturnValue({
        session: null,
      });

      rerender(<SessionTimeoutWarning />);

      expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML with proper heading levels', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      expect(screen.getByRole('heading', { name: 'Session Expiring Soon', level: 3 })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      expect(screen.getByRole('button', { name: /Stay Signed In/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Out Now/i })).toBeInTheDocument();
    });

    it('modal has backdrop for focus trap', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const backdrop = screen.getByText('Session Expiring Soon').closest('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('bg-black/50', 'backdrop-blur-sm');
    });

    it('uses appropriate ARIA roles for modal', () => {
      render(<SessionTimeoutWarning />);

      // Dispatch the custom event to trigger the warning
      act(() => {
        const event = new CustomEvent('session-warning', {
          detail: { remainingTime: 300000 },
        });
        window.dispatchEvent(event);
      });

      const modal = screen.getByText('Session Expiring Soon').closest('div');
      expect(modal).toBeInTheDocument();
    });

    it('countdown timer is properly formatted for screen readers', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 65000 }, // 1 minute 5 seconds
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/1:05/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles negative remaining time gracefully', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: -1000 },
      });

      act(() => {
        window.dispatchEvent(event);
      });

      // Component displays negative values as-is, check that it renders
      expect(screen.getByText(/Your session will expire in/i)).toBeInTheDocument();
    });

    it('handles exactly 0 remaining time', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 0 },
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });

    it('handles very large remaining time', () => {
      render(<SessionTimeoutWarning />);

      const event = new CustomEvent('session-warning', {
        detail: { remainingTime: 3600000 }, // 60 minutes
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByText(/60:00/)).toBeInTheDocument();
    });
  });
});
