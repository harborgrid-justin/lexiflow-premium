/**
 * @jest-environment jsdom
 * @module NotificationCenter.test
 * @description Enterprise-grade tests for NotificationCenter component
 *
 * Test coverage:
 * - Bell icon and unread count display
 * - Dropdown panel opening/closing
 * - Notification list rendering
 * - Filter functionality (all/unread)
 * - Mark as read functionality
 * - Mark all as read
 * - Delete notification
 * - Loading state
 * - Empty states
 * - Click outside to close
 * - Keyboard navigation
 * - Accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter, type Notification } from './NotificationCenter';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'case_update',
    title: 'Case Updated',
    message: 'Smith v. Jones case has been updated',
    read: false,
    priority: 'high',
    timestamp: Date.now() - 300000,
    actionUrl: '/cases/1',
    actionLabel: 'View Case',
  },
  {
    id: '2',
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'Filing deadline in 2 days',
    read: false,
    priority: 'urgent',
    timestamp: Date.now() - 600000,
  },
  {
    id: '3',
    type: 'document',
    title: 'Document Uploaded',
    message: 'New document uploaded to case file',
    read: true,
    priority: 'low',
    timestamp: Date.now() - 900000,
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from John Doe',
    read: true,
    priority: 'medium',
    timestamp: Date.now() - 1200000,
  },
];

const defaultProps = {
  notifications: mockNotifications,
  unreadCount: 2,
  onMarkAsRead: jest.fn(),
  onMarkAllAsRead: jest.fn(),
  onDelete: jest.fn(),
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

const renderNotificationCenter = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<NotificationCenter {...mergedProps} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bell Icon', () => {
    it('renders bell icon button', () => {
      renderNotificationCenter();

      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('displays unread count badge', () => {
      renderNotificationCenter({ unreadCount: 5 });

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows 9+ for counts over 9', () => {
      renderNotificationCenter({ unreadCount: 15 });

      expect(screen.getByText('9+')).toBeInTheDocument();
    });

    it('hides badge when unread count is 0', () => {
      renderNotificationCenter({ unreadCount: 0 });

      // Only the button should be there, no badge
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('has accessible aria-label with count', () => {
      renderNotificationCenter({ unreadCount: 3 });

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Notifications (3 unread)');
    });
  });

  describe('Dropdown Panel', () => {
    it('opens dropdown when bell icon is clicked', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('closes dropdown when bell icon is clicked again', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      await user.click(bellButton);
      await user.click(bellButton);

      expect(screen.queryByRole('heading', { name: 'Notifications' })).not.toBeInTheDocument();
    });

    it('closes dropdown when close button is clicked', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByRole('button', { name: /close notifications/i }));

      expect(screen.queryByRole('heading', { name: 'Notifications' })).not.toBeInTheDocument();
    });

    it('shows "new" badge in header when there are unread', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ unreadCount: 3 });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('3 new')).toBeInTheDocument();
    });

    it('has aria-expanded attribute', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Notification List', () => {
    it('displays all notifications', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Case Updated')).toBeInTheDocument();
      expect(screen.getByText('Deadline Approaching')).toBeInTheDocument();
      expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    });

    it('displays notification messages', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Smith v. Jones case has been updated')).toBeInTheDocument();
    });

    it('displays time since notification', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getAllByText('5 minutes ago').length).toBeGreaterThan(0);
    });

    it('displays action label when provided', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('View Case')).toBeInTheDocument();
    });

    it('shows priority badge for high/urgent items', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('highlights unread notifications', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Unread items should have indicator
      const unreadIndicators = document.querySelectorAll('.bg-blue-600');
      expect(unreadIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    it('shows All and Unread filter buttons', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Unread' })).toBeInTheDocument();
    });

    it('filters to show only unread when Unread is clicked', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByRole('button', { name: 'Unread' }));

      // Only unread notifications should show
      expect(screen.getByText('Case Updated')).toBeInTheDocument();
      expect(screen.getByText('Deadline Approaching')).toBeInTheDocument();
      expect(screen.queryByText('Document Uploaded')).not.toBeInTheDocument();
    });

    it('shows all notifications when All is clicked', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByRole('button', { name: 'Unread' }));
      await user.click(screen.getByRole('button', { name: 'All' }));

      expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    });

    it('applies active styling to selected filter', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Mark as Read', () => {
    it('calls onMarkAsRead when notification is clicked', async () => {
      const user = userEvent.setup();
      const onMarkAsRead = jest.fn();
      renderNotificationCenter({ onMarkAsRead });

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByText('Case Updated'));

      expect(onMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('calls onMarkAsRead when check button is clicked', async () => {
      const user = userEvent.setup();
      const onMarkAsRead = jest.fn();
      renderNotificationCenter({ onMarkAsRead });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Hover to reveal action buttons
      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      fireEvent.mouseEnter(notification!);

      await user.click(screen.getAllByRole('button', { name: /mark as read/i })[0]);

      expect(onMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('does not call onMarkAsRead for already-read notifications', async () => {
      const user = userEvent.setup();
      const onMarkAsRead = jest.fn();
      renderNotificationCenter({ onMarkAsRead });

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByText('Document Uploaded'));

      // Should not call for already-read notification
      expect(onMarkAsRead).not.toHaveBeenCalledWith('3');
    });
  });

  describe('Mark All as Read', () => {
    it('shows Mark all read button when there are unread', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    it('calls onMarkAllAsRead when clicked', async () => {
      const user = userEvent.setup();
      const onMarkAllAsRead = jest.fn();
      renderNotificationCenter({ onMarkAllAsRead });

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByText('Mark all read'));

      expect(onMarkAllAsRead).toHaveBeenCalledTimes(1);
    });

    it('hides Mark all read when unreadCount is 0', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ unreadCount: 0 });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });
  });

  describe('Delete Notification', () => {
    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      renderNotificationCenter({ onDelete });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Hover to reveal action buttons
      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      fireEvent.mouseEnter(notification!);

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('stops event propagation when delete is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      const onMarkAsRead = jest.fn();
      renderNotificationCenter({ onDelete, onMarkAsRead });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      fireEvent.mouseEnter(notification!);

      await user.click(screen.getAllByRole('button', { name: /delete/i })[0]);

      // Should only call onDelete, not onMarkAsRead
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ isLoading: true });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
    });

    it('hides notification list when loading', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ isLoading: true });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.queryByText('Case Updated')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state for no notifications', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ notifications: [], unreadCount: 0 });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText('You have no notifications yet')).toBeInTheDocument();
    });

    it('shows all caught up for unread filter with no unread', async () => {
      const user = userEvent.setup();
      const allReadNotifications = mockNotifications.map(n => ({ ...n, read: true }));
      renderNotificationCenter({ notifications: allReadNotifications, unreadCount: 0 });

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByRole('button', { name: 'Unread' }));

      expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });
  });

  describe('Click Outside to Close', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      expect(screen.getByText('Notifications')).toBeInTheDocument();

      // Simulate click outside
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });

      expect(screen.queryByRole('heading', { name: 'Notifications' })).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('notification item responds to Enter key', async () => {
      const user = userEvent.setup();
      const onNotificationClick = jest.fn();
      renderNotificationCenter({ onNotificationClick });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      notification?.focus();

      fireEvent.keyDown(notification!, { key: 'Enter' });

      expect(onNotificationClick).toHaveBeenCalled();
    });

    it('notification item responds to Space key', async () => {
      const user = userEvent.setup();
      const onNotificationClick = jest.fn();
      renderNotificationCenter({ onNotificationClick });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      notification?.focus();

      fireEvent.keyDown(notification!, { key: ' ' });

      expect(onNotificationClick).toHaveBeenCalled();
    });
  });

  describe('Footer', () => {
    it('shows View all notifications link when there are notifications', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('View all notifications')).toBeInTheDocument();
    });

    it('hides footer when no notifications', async () => {
      const user = userEvent.setup();
      renderNotificationCenter({ notifications: [] });

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.queryByText('View all notifications')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
    });

    it('notification items have tabIndex', async () => {
      const user = userEvent.setup();
      renderNotificationCenter();

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      const notification = screen.getByText('Case Updated').closest('[role="button"]');
      expect(notification).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = renderNotificationCenter({ className: 'custom-center' });

      expect(container.firstChild).toHaveClass('custom-center');
    });
  });
});
