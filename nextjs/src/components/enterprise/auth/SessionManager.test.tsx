/**
 * @fileoverview Enterprise-grade tests for SessionManager component
 * Tests session display, revocation, and management functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SessionManager, type Session } from './SessionManager';

expect.extend(toHaveNoViolations);

describe('SessionManager', () => {
  const mockSessions: Session[] = [
    {
      id: 'session-1',
      device: 'Desktop',
      browser: 'Chrome 120',
      os: 'Windows 11',
      ip: '192.168.1.1',
      location: 'New York, US',
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      current: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'session-2',
      device: 'Mobile Phone',
      browser: 'Safari 17',
      os: 'iOS 17',
      ip: '10.0.0.1',
      location: 'Los Angeles, US',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      current: false,
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 'session-3',
      device: 'Tablet',
      browser: 'Firefox 121',
      ip: '172.16.0.1',
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      current: false,
      createdAt: '2024-01-03T00:00:00Z'
    }
  ];

  const mockOnRevokeSession = jest.fn();
  const mockOnRevokeAllOtherSessions = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });

    it('displays description text', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText(/manage devices that are currently signed in/i)).toBeInTheDocument();
    });

    it('renders refresh button', () => {
      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SessionManager sessions={mockSessions} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders security notice', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText(/if you see an unfamiliar device/i)).toBeInTheDocument();
    });
  });

  describe('Current Session Display', () => {
    it('displays current session section', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Current Session')).toBeInTheDocument();
    });

    it('highlights current session', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('displays current session device info', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Chrome 120')).toBeInTheDocument();
    });

    it('displays current session IP and location', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText(/192.168.1.1/)).toBeInTheDocument();
      expect(screen.getByText(/New York, US/)).toBeInTheDocument();
    });

    it('does not show revoke button for current session', () => {
      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      // Current session should not have a revoke button in its section
      const currentSessionSection = screen.getByText('Current Session').parentElement?.parentElement;
      const revokeButton = currentSessionSection?.querySelector('button[aria-label*="Revoke"]');
      expect(revokeButton).not.toBeInTheDocument();
    });
  });

  describe('Other Sessions Display', () => {
    it('displays other sessions section', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Other Sessions')).toBeInTheDocument();
    });

    it('displays other session devices', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Mobile Phone')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
    });

    it('shows revoke button for each other session', () => {
      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
      // Should have revoke buttons for non-current sessions
      expect(revokeButtons.length).toBe(2);
    });
  });

  describe('Device Icons', () => {
    it('shows desktop icon for desktop device', () => {
      const desktopSession: Session[] = [{
        ...mockSessions[0],
        device: 'Desktop Computer'
      }];

      render(<SessionManager sessions={desktopSession} />);

      // Desktop icon should be present (check for SVG)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('shows mobile icon for mobile device', () => {
      const mobileSession: Session[] = [{
        ...mockSessions[0],
        device: 'Mobile Phone',
        current: true
      }];

      render(<SessionManager sessions={mobileSession} />);

      expect(screen.getByText('Mobile Phone')).toBeInTheDocument();
    });

    it('shows tablet icon for tablet device', () => {
      const tabletSession: Session[] = [{
        ...mockSessions[0],
        device: 'iPad Tablet',
        current: true
      }];

      render(<SessionManager sessions={tabletSession} />);

      expect(screen.getByText('iPad Tablet')).toBeInTheDocument();
    });
  });

  describe('Last Active Formatting', () => {
    it('formats just now correctly', () => {
      const recentSession: Session[] = [{
        ...mockSessions[0],
        lastActive: new Date().toISOString()
      }];

      render(<SessionManager sessions={recentSession} />);

      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('formats minutes correctly', () => {
      const session: Session[] = [{
        ...mockSessions[0],
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }];

      render(<SessionManager sessions={session} />);

      expect(screen.getByText(/30 minutes ago/i)).toBeInTheDocument();
    });

    it('formats hours correctly', () => {
      const session: Session[] = [{
        ...mockSessions[0],
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }];

      render(<SessionManager sessions={session} />);

      expect(screen.getByText(/5 hours ago/i)).toBeInTheDocument();
    });

    it('formats days correctly', () => {
      const session: Session[] = [{
        ...mockSessions[0],
        lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }];

      render(<SessionManager sessions={session} />);

      expect(screen.getByText(/5 days ago/i)).toBeInTheDocument();
    });
  });

  describe('Revoke Session', () => {
    it('shows confirmation dialog on revoke click', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      expect(window.confirm).toHaveBeenCalled();
    });

    it('calls onRevokeSession when confirmed', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      expect(mockOnRevokeSession).toHaveBeenCalledWith('session-2');
    });

    it('does not call onRevokeSession when cancelled', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      expect(mockOnRevokeSession).not.toHaveBeenCalled();
    });

    it('removes session from list after revocation', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnRevokeSession.mockResolvedValue(undefined);

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      expect(screen.getByText('Mobile Phone')).toBeInTheDocument();

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Mobile Phone')).not.toBeInTheDocument();
      });
    });

    it('shows revoking state during revocation', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnRevokeSession.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      expect(screen.getByText('Revoking...')).toBeInTheDocument();
    });
  });

  describe('Revoke All Other Sessions', () => {
    it('shows revoke all button when multiple other sessions exist', () => {
      render(
        <SessionManager
          sessions={mockSessions}
          onRevokeAllOtherSessions={mockOnRevokeAllOtherSessions}
        />
      );

      expect(screen.getByText(/revoke all other sessions/i)).toBeInTheDocument();
    });

    it('does not show revoke all button with only one other session', () => {
      const oneOtherSession = mockSessions.slice(0, 2);
      render(
        <SessionManager
          sessions={oneOtherSession}
          onRevokeAllOtherSessions={mockOnRevokeAllOtherSessions}
        />
      );

      expect(screen.queryByText(/revoke all other sessions/i)).not.toBeInTheDocument();
    });

    it('shows confirmation dialog on revoke all click', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <SessionManager
          sessions={mockSessions}
          onRevokeAllOtherSessions={mockOnRevokeAllOtherSessions}
        />
      );

      await user.click(screen.getByText(/revoke all other sessions/i));

      expect(window.confirm).toHaveBeenCalled();
    });

    it('calls onRevokeAllOtherSessions when confirmed', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnRevokeAllOtherSessions.mockResolvedValue(undefined);

      render(
        <SessionManager
          sessions={mockSessions}
          onRevokeAllOtherSessions={mockOnRevokeAllOtherSessions}
        />
      );

      await user.click(screen.getByText(/revoke all other sessions/i));

      expect(mockOnRevokeAllOtherSessions).toHaveBeenCalled();
    });

    it('removes all other sessions after revoke all', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnRevokeAllOtherSessions.mockResolvedValue(undefined);

      render(
        <SessionManager
          sessions={mockSessions}
          onRevokeAllOtherSessions={mockOnRevokeAllOtherSessions}
        />
      );

      await user.click(screen.getByText(/revoke all other sessions/i));

      await waitFor(() => {
        expect(screen.queryByText('Other Sessions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Refresh Sessions', () => {
    it('calls onRefresh when refresh button clicked', async () => {
      const user = userEvent.setup();
      mockOnRefresh.mockResolvedValue(undefined);

      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      expect(mockOnRefresh).toHaveBeenCalled();
    });

    it('shows loading state during refresh', async () => {
      const user = userEvent.setup();
      mockOnRefresh.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables refresh button while loading', async () => {
      const user = userEvent.setup();
      mockOnRefresh.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no sessions', () => {
      render(<SessionManager sessions={[]} />);

      expect(screen.getByText('No active sessions')).toBeInTheDocument();
    });

    it('shows description in empty state', () => {
      render(<SessionManager sessions={[]} />);

      expect(screen.getByText(/there are currently no active sessions/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error on refresh failure', async () => {
      const user = userEvent.setup();
      mockOnRefresh.mockRejectedValue(new Error('Network error'));

      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('displays error on revoke failure', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockOnRevokeSession.mockRejectedValue(new Error('Failed to revoke'));

      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke$/i });
      await user.click(revokeButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/failed to revoke/i)).toBeInTheDocument();
      });
    });

    it('shows error in alert role', async () => {
      const user = userEvent.setup();
      mockOnRefresh.mockRejectedValue(new Error('Network error'));

      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      await user.click(screen.getByRole('button', { name: /refresh/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Props Update', () => {
    it('updates sessions when props change', () => {
      const { rerender } = render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByText('Mobile Phone')).toBeInTheDocument();

      const newSessions = [mockSessions[0]];
      rerender(<SessionManager sessions={newSessions} />);

      expect(screen.queryByText('Mobile Phone')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SessionManager sessions={mockSessions} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<SessionManager sessions={mockSessions} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Active Sessions');
    });

    it('revoke buttons have aria-labels', () => {
      render(<SessionManager sessions={mockSessions} onRevokeSession={mockOnRevokeSession} />);

      const revokeButtons = screen.getAllByRole('button', { name: /revoke session/i });
      expect(revokeButtons.length).toBeGreaterThan(0);
    });

    it('refresh button has aria-label', () => {
      render(<SessionManager sessions={mockSessions} onRefresh={mockOnRefresh} />);

      expect(screen.getByRole('button', { name: /refresh sessions/i })).toBeInTheDocument();
    });
  });
});
