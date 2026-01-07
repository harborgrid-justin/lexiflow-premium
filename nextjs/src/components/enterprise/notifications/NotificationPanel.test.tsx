/**
 * @module components/enterprise/notifications/NotificationPanel.test
 * @description Unit tests for NotificationPanel component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPanel, NotificationPanelProps } from './NotificationPanel';
import type { UINotification } from '@/types/notifications';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, role, onClick, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} role={role} onClick={onClick} {...props}>
        {children}
      </div>
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
  Bell: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
  Briefcase: ({ className }: { className?: string }) => (
    <svg data-testid="briefcase-icon" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  CheckCheck: ({ className }: { className?: string }) => (
    <svg data-testid="check-check-icon" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <svg data-testid="success-icon" className={className} />
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
  Info: ({ className }: { className?: string }) => (
    <svg data-testid="info-icon" className={className} />
  ),
  Trash2: ({ className }: { className?: string }) => (
    <svg data-testid="trash-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 minutes ago',
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockNotifications: UINotification[] = [
  {
    id: '1',
    title: 'New Case Assignment',
    message: 'You have been assigned to Case #12345',
    type: 'info',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 5,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Document Uploaded',
    message: 'New evidence document uploaded',
    type: 'success',
    read: true,
    timestamp: Date.now() - 1000 * 60 * 30,
    priority: 'normal',
  },
  {
    id: '3',
    title: 'Deadline Alert',
    message: 'Motion filing deadline approaching',
    type: 'warning',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 60,
    priority: 'urgent',
    actions: [
      { label: 'View Details', onClick: jest.fn(), variant: 'primary' },
      { label: 'Dismiss', onClick: jest.fn(), variant: 'secondary' },
    ],
  },
];

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps: NotificationPanelProps = {
  isOpen: true,
  onClose: jest.fn(),
  notifications: mockNotifications,
  onMarkAsRead: jest.fn(),
  onMarkAllAsRead: jest.fn(),
  onDelete: jest.fn(),
  onClearAll: jest.fn(),
};

const renderNotificationPanel = (props: Partial<NotificationPanelProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<NotificationPanel {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('NotificationPanel rendering', () => {
  it('should render when isOpen is true', () => {
    renderNotificationPanel({ isOpen: true });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    renderNotificationPanel({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render all notifications', () => {
    renderNotificationPanel();

    expect(screen.getByText('New Case Assignment')).toBeInTheDocument();
    expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Deadline Alert')).toBeInTheDocument();
  });

  it('should show unread count badge', () => {
    renderNotificationPanel();

    // 2 unread notifications
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

// ============================================================================
// EMPTY STATE TESTS
// ============================================================================

describe('NotificationPanel empty state', () => {
  it('should show empty state when no notifications', () => {
    renderNotificationPanel({ notifications: [] });

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('NotificationPanel loading', () => {
  it('should show loading spinner when isLoading is true', () => {
    renderNotificationPanel({ isLoading: true });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });
});

// ============================================================================
// CLOSE TESTS
// ============================================================================

describe('NotificationPanel close', () => {
  it('should call onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onClose });

    await user.click(screen.getByLabelText('Close notifications panel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onClose });

    // Click the backdrop (first element with aria-hidden)
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });
});

// ============================================================================
// MARK AS READ TESTS
// ============================================================================

describe('NotificationPanel mark as read', () => {
  it('should call onMarkAsRead when unread notification is clicked', async () => {
    const onMarkAsRead = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onMarkAsRead });

    // Click on an unread notification
    const notification = screen.getByText('New Case Assignment').closest('[class*="cursor-pointer"]');
    if (notification) {
      await user.click(notification);
    }

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should not call onMarkAsRead when already read notification is clicked', async () => {
    const onMarkAsRead = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onMarkAsRead });

    // Click on a read notification
    const notification = screen.getByText('Document Uploaded').closest('[class*="cursor-pointer"]');
    if (notification) {
      await user.click(notification);
    }

    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('should call onMarkAllAsRead when mark all read is clicked', async () => {
    const onMarkAllAsRead = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onMarkAllAsRead });

    await user.click(screen.getByLabelText('Mark all as read'));

    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it('should not show mark all read when all are read', () => {
    const allReadNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderNotificationPanel({ notifications: allReadNotifications });

    expect(screen.queryByLabelText('Mark all as read')).not.toBeInTheDocument();
  });
});

// ============================================================================
// DELETE TESTS
// ============================================================================

describe('NotificationPanel delete', () => {
  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onDelete });

    const deleteButtons = screen.getAllByLabelText('Delete notification');
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('should stop propagation when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const onMarkAsRead = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onDelete, onMarkAsRead });

    const deleteButtons = screen.getAllByLabelText('Delete notification');
    await user.click(deleteButtons[0]);

    // Delete should be called, but not markAsRead
    expect(onDelete).toHaveBeenCalled();
    expect(onMarkAsRead).not.toHaveBeenCalled();
  });
});

// ============================================================================
// CLEAR ALL TESTS
// ============================================================================

describe('NotificationPanel clear all', () => {
  it('should call onClearAll when clear all is clicked', async () => {
    const onClearAll = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onClearAll });

    await user.click(screen.getByLabelText('Clear all notifications'));

    expect(onClearAll).toHaveBeenCalled();
  });

  it('should not show footer when no notifications', () => {
    renderNotificationPanel({ notifications: [] });

    expect(screen.queryByLabelText('Clear all notifications')).not.toBeInTheDocument();
  });
});

// ============================================================================
// VIEW ALL TESTS
// ============================================================================

describe('NotificationPanel view all', () => {
  it('should show view all button when onViewAll is provided', () => {
    renderNotificationPanel({ onViewAll: jest.fn() });

    expect(screen.getByText('View all notifications')).toBeInTheDocument();
  });

  it('should call onViewAll when button is clicked', async () => {
    const onViewAll = jest.fn();
    const user = userEvent.setup();
    renderNotificationPanel({ onViewAll });

    await user.click(screen.getByText('View all notifications'));

    expect(onViewAll).toHaveBeenCalled();
  });

  it('should not show view all button when onViewAll is not provided', () => {
    renderNotificationPanel({ onViewAll: undefined });

    expect(screen.queryByText('View all notifications')).not.toBeInTheDocument();
  });
});

// ============================================================================
// ACTION BUTTONS TESTS
// ============================================================================

describe('NotificationPanel action buttons', () => {
  it('should render action buttons when notification has actions', () => {
    renderNotificationPanel();

    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('should call action onClick when action button is clicked', async () => {
    const actionFn = jest.fn();
    const notificationsWithAction: UINotification[] = [
      {
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        read: false,
        timestamp: Date.now(),
        priority: 'normal',
        actions: [{ label: 'Test Action', onClick: actionFn, variant: 'primary' }],
      },
    ];
    const user = userEvent.setup();
    renderNotificationPanel({ notifications: notificationsWithAction });

    await user.click(screen.getByText('Test Action'));

    expect(actionFn).toHaveBeenCalled();
  });

  it('should stop propagation when action button is clicked', async () => {
    const actionFn = jest.fn();
    const onMarkAsRead = jest.fn();
    const notificationsWithAction: UINotification[] = [
      {
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        read: false,
        timestamp: Date.now(),
        priority: 'normal',
        actions: [{ label: 'Test Action', onClick: actionFn, variant: 'primary' }],
      },
    ];
    const user = userEvent.setup();
    renderNotificationPanel({ notifications: notificationsWithAction, onMarkAsRead });

    await user.click(screen.getByText('Test Action'));

    expect(actionFn).toHaveBeenCalled();
    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('should apply correct variant styles to action buttons', () => {
    const notificationsWithActions: UINotification[] = [
      {
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        read: false,
        timestamp: Date.now(),
        priority: 'normal',
        actions: [
          { label: 'Primary', onClick: jest.fn(), variant: 'primary' },
          { label: 'Danger', onClick: jest.fn(), variant: 'danger' },
          { label: 'Secondary', onClick: jest.fn(), variant: 'secondary' },
        ],
      },
    ];
    renderNotificationPanel({ notifications: notificationsWithActions });

    const primaryBtn = screen.getByText('Primary');
    const dangerBtn = screen.getByText('Danger');
    const secondaryBtn = screen.getByText('Secondary');

    expect(primaryBtn).toHaveClass('bg-blue-600');
    expect(dangerBtn).toHaveClass('bg-red-600');
    expect(secondaryBtn).toHaveClass('bg-slate-200');
  });
});

// ============================================================================
// PRIORITY TESTS
// ============================================================================

describe('NotificationPanel priority', () => {
  it('should show priority badge for non-normal priorities', () => {
    renderNotificationPanel();

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should not show priority badge for normal priority', () => {
    const normalPriorityNotifications: UINotification[] = [
      {
        id: '1',
        title: 'Test',
        message: 'Test message',
        type: 'info',
        read: false,
        timestamp: Date.now(),
        priority: 'normal',
      },
    ];
    renderNotificationPanel({ notifications: normalPriorityNotifications });

    expect(screen.queryByText('normal')).not.toBeInTheDocument();
  });
});

// ============================================================================
// UNREAD INDICATOR TESTS
// ============================================================================

describe('NotificationPanel unread indicator', () => {
  it('should show unread indicator for unread notifications', () => {
    renderNotificationPanel();

    // Unread notifications should have aria-label "Unread"
    const unreadIndicators = screen.getAllByLabelText('Unread');
    expect(unreadIndicators.length).toBe(2); // 2 unread notifications
  });

  it('should not show unread indicator for read notifications', () => {
    const allReadNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderNotificationPanel({ notifications: allReadNotifications });

    expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();
  });
});

// ============================================================================
// POSITION TESTS
// ============================================================================

describe('NotificationPanel position', () => {
  it('should apply top-right position classes by default', () => {
    renderNotificationPanel();

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('top-16', 'right-4');
  });

  it('should apply top-left position classes', () => {
    renderNotificationPanel({ position: 'top-left' });

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('top-16', 'left-4');
  });

  it('should apply bottom-right position classes', () => {
    renderNotificationPanel({ position: 'bottom-right' });

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('bottom-4', 'right-4');
  });

  it('should apply bottom-left position classes', () => {
    renderNotificationPanel({ position: 'bottom-left' });

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('bottom-4', 'left-4');
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('NotificationPanel styling', () => {
  it('should apply custom className', () => {
    renderNotificationPanel({ className: 'custom-panel' });

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('custom-panel');
  });

  it('should apply maxHeight style', () => {
    renderNotificationPanel({ maxHeight: '400px' });

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveStyle({ maxHeight: '400px' });
  });

  it('should apply unread styling to unread notifications', () => {
    renderNotificationPanel();

    // Unread notification should have blue background
    const unreadNotification = screen.getByText('New Case Assignment').closest('[class*="bg-blue-50"]');
    expect(unreadNotification).toBeInTheDocument();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('NotificationPanel accessibility', () => {
  it('should have dialog role', () => {
    renderNotificationPanel();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have aria-label', () => {
    renderNotificationPanel();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Notifications panel');
  });

  it('should have aria-modal true', () => {
    renderNotificationPanel();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('should have accessible close button', () => {
    renderNotificationPanel();

    expect(screen.getByLabelText('Close notifications panel')).toBeInTheDocument();
  });

  it('should have accessible delete buttons', () => {
    renderNotificationPanel();

    const deleteButtons = screen.getAllByLabelText('Delete notification');
    expect(deleteButtons.length).toBe(3);
  });
});

// ============================================================================
// MEMO TESTS
// ============================================================================

describe('NotificationPanel memo', () => {
  it('should have correct displayName', () => {
    expect(NotificationPanel.displayName).toBe('NotificationPanel');
  });
});

// ============================================================================
// TIMESTAMP TESTS
// ============================================================================

describe('NotificationPanel timestamp', () => {
  it('should display formatted timestamps', () => {
    renderNotificationPanel();

    // Mock returns "5 minutes ago" for all
    const timestamps = screen.getAllByText('5 minutes ago');
    expect(timestamps.length).toBe(3);
  });
});
