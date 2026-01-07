/**
 * @jest-environment jsdom
 */
/**
 * NotificationList Component Tests
 * Enterprise-grade tests for notification list with filtering and grouping
 */

import type { ApiNotification } from '@/api/communications/notifications-api';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationList, NotificationListProps } from './NotificationList';

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

const createMockNotification = (overrides: Partial<ApiNotification> = {}): ApiNotification => ({
  id: 'notif-1',
  title: 'Test Notification',
  message: 'This is a test notification message',
  type: 'info',
  priority: 'medium',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const defaultProps: NotificationListProps = {
  notifications: [],
};

describe('NotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the Notifications header when showFilters is true', () => {
      render(<NotificationList {...defaultProps} notifications={[createMockNotification()]} />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('renders filter buttons', () => {
      render(<NotificationList {...defaultProps} notifications={[createMockNotification()]} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unread/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /high priority/i })).toBeInTheDocument();
    });

    it('renders type filter dropdown', () => {
      render(<NotificationList {...defaultProps} notifications={[createMockNotification()]} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('hides filters when showFilters is false', () => {
      render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
          showFilters={false}
        />
      );

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<NotificationList {...defaultProps} isLoading={true} />);

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no notifications', () => {
      render(<NotificationList {...defaultProps} notifications={[]} />);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    it('shows empty state when filters exclude all notifications', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ read: true }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      await user.click(screen.getByRole('button', { name: /unread/i }));

      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('Notification Display', () => {
    it('displays notification title', () => {
      const notifications = [
        createMockNotification({ title: 'Important Update' }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('Important Update')).toBeInTheDocument();
    });

    it('displays notification message', () => {
      const notifications = [
        createMockNotification({ message: 'Your document has been uploaded.' }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('Your document has been uploaded.')).toBeInTheDocument();
    });

    it('displays timestamp', () => {
      const notifications = [createMockNotification()];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });

    it('shows unread indicator dot for unread notifications', () => {
      const notifications = [
        createMockNotification({ read: false }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-blue-600.rounded-full')).toBeInTheDocument();
    });

    it('shows action link when actionUrl and actionLabel provided', () => {
      const notifications = [
        createMockNotification({
          actionUrl: '/cases/123',
          actionLabel: 'View Case',
        }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      const link = screen.getByText('View Case');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/cases/123');
    });

    it('shows urgent badge for urgent priority', () => {
      const notifications = [
        createMockNotification({ priority: 'urgent' }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  describe('Notification Types', () => {
    it('displays success icon for success type', () => {
      const notifications = [
        createMockNotification({ type: 'success' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    });

    it('displays warning icon for warning type', () => {
      const notifications = [
        createMockNotification({ type: 'warning' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-amber-100')).toBeInTheDocument();
    });

    it('displays error icon for error type', () => {
      const notifications = [
        createMockNotification({ type: 'error' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    });

    it('displays deadline icon for deadline type', () => {
      const notifications = [
        createMockNotification({ type: 'deadline' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-purple-100')).toBeInTheDocument();
    });

    it('displays case icon for case_update type', () => {
      const notifications = [
        createMockNotification({ type: 'case_update' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
    });

    it('displays document icon for document type', () => {
      const notifications = [
        createMockNotification({ type: 'document' }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-indigo-100')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters to show only unread notifications', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', title: 'Unread', read: false }),
        createMockNotification({ id: '2', title: 'Read', read: true }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      await user.click(screen.getByRole('button', { name: /unread/i }));

      expect(screen.getByText('Unread')).toBeInTheDocument();
      expect(screen.queryByText('Read')).not.toBeInTheDocument();
    });

    it('filters to show only high priority notifications', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', title: 'High Priority', priority: 'high' }),
        createMockNotification({ id: '2', title: 'Normal', priority: 'medium' }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      await user.click(screen.getByRole('button', { name: /high priority/i }));

      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.queryByText('Normal')).not.toBeInTheDocument();
    });

    it('filters by type using dropdown', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', title: 'Success Notif', type: 'success' }),
        createMockNotification({ id: '2', title: 'Error Notif', type: 'error' }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      await user.selectOptions(screen.getByRole('combobox'), 'success');

      expect(screen.getByText('Success Notif')).toBeInTheDocument();
      expect(screen.queryByText('Error Notif')).not.toBeInTheDocument();
    });

    it('shows all notifications when all filter selected', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', title: 'Notif 1', read: false }),
        createMockNotification({ id: '2', title: 'Notif 2', read: true }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      // First filter to unread
      await user.click(screen.getByRole('button', { name: /unread/i }));

      // Then back to all
      await user.click(screen.getByRole('button', { name: /^all$/i }));

      expect(screen.getByText('Notif 1')).toBeInTheDocument();
      expect(screen.getByText('Notif 2')).toBeInTheDocument();
    });
  });

  describe('Grouping by Date', () => {
    it('groups notifications by Today', () => {
      const today = new Date();
      const notifications = [
        createMockNotification({ createdAt: today.toISOString() }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('groups notifications by Yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const notifications = [
        createMockNotification({ createdAt: yesterday.toISOString() }),
      ];

      render(<NotificationList {...defaultProps} notifications={notifications} />);

      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onMarkAsRead when mark as read button clicked', async () => {
      const user = userEvent.setup();
      const onMarkAsRead = jest.fn();
      const notification = createMockNotification({ read: false });

      render(
        <NotificationList
          {...defaultProps}
          notifications={[notification]}
          onMarkAsRead={onMarkAsRead}
        />
      );

      // Hover to show action buttons
      const notifElement = screen.getByText('Test Notification').closest('div[class*="group"]');
      fireEvent.mouseEnter(notifElement!);

      await user.click(screen.getByTitle('Mark as read'));

      expect(onMarkAsRead).toHaveBeenCalledWith(notification);
    });

    it('calls onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      const notification = createMockNotification();

      render(
        <NotificationList
          {...defaultProps}
          notifications={[notification]}
          onDelete={onDelete}
        />
      );

      const notifElement = screen.getByText('Test Notification').closest('div[class*="group"]');
      fireEvent.mouseEnter(notifElement!);

      await user.click(screen.getByTitle('Delete'));

      expect(onDelete).toHaveBeenCalledWith(notification);
    });

    it('calls onMarkAllAsRead when clicked', async () => {
      const user = userEvent.setup();
      const onMarkAllAsRead = jest.fn();

      render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      );

      await user.click(screen.getByText('Mark all as read'));

      expect(onMarkAllAsRead).toHaveBeenCalled();
    });

    it('calls onClearAll when clicked', async () => {
      const user = userEvent.setup();
      const onClearAll = jest.fn();

      render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
          onClearAll={onClearAll}
        />
      );

      await user.click(screen.getByText('Clear all'));

      expect(onClearAll).toHaveBeenCalled();
    });

    it('calls onNotificationClick when notification clicked', async () => {
      const user = userEvent.setup();
      const onNotificationClick = jest.fn();
      const notification = createMockNotification();

      render(
        <NotificationList
          {...defaultProps}
          notifications={[notification]}
          onNotificationClick={onNotificationClick}
        />
      );

      await user.click(screen.getByText('Test Notification'));

      expect(onNotificationClick).toHaveBeenCalledWith(notification);
    });
  });

  describe('Styling', () => {
    it('applies different background for unread notifications', () => {
      const notifications = [
        createMockNotification({ read: false }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('applies default background for read notifications', () => {
      const notifications = [
        createMockNotification({ read: true }),
      ];

      const { container } = render(
        <NotificationList {...defaultProps} notifications={notifications} />
      );

      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });
  });

  describe('Action Buttons Visibility', () => {
    it('hides mark as read button for already read notifications', () => {
      const notifications = [
        createMockNotification({ read: true }),
      ];

      render(
        <NotificationList
          {...defaultProps}
          notifications={notifications}
          onMarkAsRead={jest.fn()}
        />
      );

      const notifElement = screen.getByText('Test Notification').closest('div[class*="group"]');
      fireEvent.mouseEnter(notifElement!);

      expect(screen.queryByTitle('Mark as read')).not.toBeInTheDocument();
    });

    it('hides mark all as read button when not provided', () => {
      render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
        />
      );

      expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
    });

    it('hides clear all button when not provided', () => {
      render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
        />
      );

      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <NotificationList
          {...defaultProps}
          notifications={[createMockNotification()]}
          className="custom-list-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-list-class');
    });
  });
});
