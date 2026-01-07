/**
 * @module components/enterprise/notifications/NotificationSystemExample.test
 * @description Unit tests for NotificationSystemExample component integration examples.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  HeaderWithNotifications,
  NotificationCenterPage,
  NotificationPreferencesPage,
  ToastExample,
  ConnectionStatusExample,
  CompleteNotificationSystemExample,
} from './NotificationSystemExample';

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, role, onClick, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} role={role} onClick={onClick} {...props}>
        {children}
      </div>
    ),
    button: ({ children, className, onClick, ...props }: React.ComponentProps<'button'>) => (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    ),
    span: ({ children, className, ...props }: React.ComponentProps<'span'>) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <svg data-testid="error-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="warning-icon" className={className} />
  ),
  Archive: ({ className }: { className?: string }) => (
    <svg data-testid="archive-icon" className={className} />
  ),
  Activity: ({ className }: { className?: string }) => (
    <svg data-testid="activity-icon" className={className} />
  ),
  Bell: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
  Briefcase: ({ className }: { className?: string }) => (
    <svg data-testid="briefcase-icon" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  Check: ({ className }: { className?: string }) => (
    <svg data-testid="check-icon" className={className} />
  ),
  CheckCheck: ({ className }: { className?: string }) => (
    <svg data-testid="check-check-icon" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <svg data-testid="success-icon" className={className} />
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-down-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="clock-icon" className={className} />
  ),
  CreditCard: ({ className }: { className?: string }) => (
    <svg data-testid="credit-card-icon" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg data-testid="file-icon" className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
    <svg data-testid="filter-icon" className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
    <svg data-testid="info-icon" className={className} />
  ),
  Mail: ({ className }: { className?: string }) => (
    <svg data-testid="mail-icon" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <svg data-testid="refresh-icon" className={className} />
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <svg data-testid="reset-icon" className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
    <svg data-testid="save-icon" className={className} />
  ),
  Search: ({ className }: { className?: string }) => (
    <svg data-testid="search-icon" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg data-testid="settings-icon" className={className} />
  ),
  Slack: ({ className }: { className?: string }) => (
    <svg data-testid="slack-icon" className={className} />
  ),
  Smartphone: ({ className }: { className?: string }) => (
    <svg data-testid="smartphone-icon" className={className} />
  ),
  Trash2: ({ className }: { className?: string }) => (
    <svg data-testid="trash-icon" className={className} />
  ),
  Volume2: ({ className }: { className?: string }) => (
    <svg data-testid="volume-on-icon" className={className} />
  ),
  VolumeX: ({ className }: { className?: string }) => (
    <svg data-testid="volume-off-icon" className={className} />
  ),
  Wifi: ({ className }: { className?: string }) => (
    <svg data-testid="wifi-icon" className={className} />
  ),
  WifiOff: ({ className }: { className?: string }) => (
    <svg data-testid="wifi-off-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 minutes ago',
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
// HEADER WITH NOTIFICATIONS TESTS
// ============================================================================

describe('HeaderWithNotifications', () => {
  it('should render header with title', () => {
    render(<HeaderWithNotifications />);

    expect(screen.getByText('LexiFlow Premium')).toBeInTheDocument();
  });

  it('should render notification bell', () => {
    render(<HeaderWithNotifications />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should show unread count on bell', () => {
    render(<HeaderWithNotifications />);

    // Mock data has 3 unread notifications
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should toggle notification panel on bell click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    const bell = screen.getByRole('button', { name: /notifications/i });
    await user.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should mark notification as read when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    // Open panel
    const bell = screen.getByRole('button', { name: /notifications/i });
    await user.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find and click on unread notification
    const notification = screen.getByText('New Case Assignment').closest('[class*="cursor-pointer"]');
    if (notification) {
      await user.click(notification);
    }

    // Count should decrease
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should delete notification when delete button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    // Open panel
    const bell = screen.getByRole('button', { name: /notifications/i });
    await user.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click delete on first notification
    const deleteButtons = screen.getAllByLabelText('Delete notification');
    await user.click(deleteButtons[0]);

    // Notification should be removed
    await waitFor(() => {
      expect(screen.queryByText('New Case Assignment')).not.toBeInTheDocument();
    });
  });

  it('should mark all as read when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    // Open panel
    const bell = screen.getByRole('button', { name: /notifications/i });
    await user.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click mark all read
    await user.click(screen.getByLabelText('Mark all as read'));

    // All should be read - mark all read button should disappear
    await waitFor(() => {
      expect(screen.queryByLabelText('Mark all as read')).not.toBeInTheDocument();
    });
  });

  it('should clear all notifications when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    // Open panel
    const bell = screen.getByRole('button', { name: /notifications/i });
    await user.click(bell);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click clear all
    await user.click(screen.getByLabelText('Clear all notifications'));

    // All notifications should be cleared
    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// NOTIFICATION CENTER PAGE TESTS
// ============================================================================

describe('NotificationCenterPage', () => {
  it('should render notification center', () => {
    render(<NotificationCenterPage />);

    expect(screen.getByRole('heading', { name: /notification center/i })).toBeInTheDocument();
  });

  it('should display mock notifications', () => {
    render(<NotificationCenterPage />);

    expect(screen.getByText('New Case Assignment')).toBeInTheDocument();
    expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Deadline Approaching')).toBeInTheDocument();
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
  });

  it('should handle mark as read', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<NotificationCenterPage />);

    // Find mark as read buttons (only visible for unread)
    const markReadButtons = screen.getAllByTitle('Mark as read');
    await user.click(markReadButtons[0]);

    // Button should disappear after marking as read
    await waitFor(() => {
      const updatedButtons = screen.getAllByTitle('Mark as read');
      expect(updatedButtons.length).toBeLessThan(markReadButtons.length);
    });
  });

  it('should handle delete', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<NotificationCenterPage />);

    const deleteButtons = screen.getAllByTitle('Delete');
    const initialCount = deleteButtons.length;

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      const updatedButtons = screen.getAllByTitle('Delete');
      expect(updatedButtons.length).toBe(initialCount - 1);
    });
  });
});

// ============================================================================
// NOTIFICATION PREFERENCES PAGE TESTS
// ============================================================================

describe('NotificationPreferencesPage', () => {
  it('should render preferences page', () => {
    render(<NotificationPreferencesPage />);

    expect(screen.getByRole('heading', { name: /notification preferences/i })).toBeInTheDocument();
  });

  it('should display all preference sections', () => {
    render(<NotificationPreferencesPage />);

    expect(screen.getByText('Notification Channels')).toBeInTheDocument();
    expect(screen.getByText('Notification Categories')).toBeInTheDocument();
    expect(screen.getByText('Email Digest Frequency')).toBeInTheDocument();
    expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
  });

  it('should allow toggling preferences', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<NotificationPreferencesPage />);

    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]);

    // Should show unsaved changes
    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });
  });

  it('should save preferences when save is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<NotificationPreferencesPage />);

    // Make a change
    const toggles = screen.getAllByRole('switch');
    await user.click(toggles[0]);

    // Save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(consoleSpy).toHaveBeenCalledWith('Saving preferences:', expect.any(Object));

    consoleSpy.mockRestore();
  });
});

// ============================================================================
// TOAST EXAMPLE TESTS
// ============================================================================

describe('ToastExample', () => {
  // ToastExample requires ToastContainer context
  const renderWithToastContainer = () => {
    const ToastContainer = require('./ToastContainer').ToastContainer;
    return render(
      <ToastContainer>
        <ToastExample />
      </ToastContainer>
    );
  };

  it('should render toast example buttons', () => {
    renderWithToastContainer();

    expect(screen.getByText('Show Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Show Error Toast')).toBeInTheDocument();
    expect(screen.getByText('Show Info Toast')).toBeInTheDocument();
    expect(screen.getByText('Show Warning Toast')).toBeInTheDocument();
  });

  it('should show success toast when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithToastContainer();

    await user.click(screen.getByText('Show Success Toast'));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your changes have been saved successfully.')).toBeInTheDocument();
    });
  });

  it('should show error toast when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithToastContainer();

    await user.click(screen.getByText('Show Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to save changes. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show error toast with retry action', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithToastContainer();

    await user.click(screen.getByText('Show Error Toast'));

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should show info toast when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithToastContainer();

    await user.click(screen.getByText('Show Info Toast'));

    await waitFor(() => {
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });

  it('should show warning toast when button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithToastContainer();

    await user.click(screen.getByText('Show Warning Toast'));

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Extend Session')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// CONNECTION STATUS EXAMPLE TESTS
// ============================================================================

describe('ConnectionStatusExample', () => {
  it('should render connection status examples', () => {
    render(<ConnectionStatusExample />);

    expect(screen.getByText('Connection Status Examples')).toBeInTheDocument();
  });

  it('should show all variant labels', () => {
    render(<ConnectionStatusExample />);

    expect(screen.getByText('Badge Variant (Bottom Right)')).toBeInTheDocument();
    expect(screen.getByText('Full Variant')).toBeInTheDocument();
    expect(screen.getByText('Minimal Variant')).toBeInTheDocument();
  });

  it('should render full variant with status info', () => {
    render(<ConnectionStatusExample />);

    // Full variant should show Connected status
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});

// ============================================================================
// COMPLETE NOTIFICATION SYSTEM EXAMPLE TESTS
// ============================================================================

describe('CompleteNotificationSystemExample', () => {
  it('should render complete system', () => {
    render(<CompleteNotificationSystemExample />);

    expect(screen.getByText('LexiFlow Premium')).toBeInTheDocument();
    expect(screen.getByText('Toast Notification Examples')).toBeInTheDocument();
    expect(screen.getByText('Connection Status Examples')).toBeInTheDocument();
  });

  it('should have notification bell in header', () => {
    render(<CompleteNotificationSystemExample />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should render toast buttons', () => {
    render(<CompleteNotificationSystemExample />);

    expect(screen.getByText('Show Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Show Error Toast')).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Notification System Integration', () => {
  it('should handle full notification workflow', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<HeaderWithNotifications />);

    // 1. Check initial state
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 unread

    // 2. Open panel
    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // 3. Mark all as read
    await user.click(screen.getByLabelText('Mark all as read'));

    await waitFor(() => {
      expect(screen.queryByLabelText('Mark all as read')).not.toBeInTheDocument();
    });

    // 4. Clear all
    await user.click(screen.getByLabelText('Clear all notifications'));

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });
});
