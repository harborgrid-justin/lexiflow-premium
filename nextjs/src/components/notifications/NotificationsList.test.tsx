/**
 * @jest-environment jsdom
 * NotificationsList Component Tests
 * Enterprise-grade tests for client-side notifications list
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsList } from './NotificationsList';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  readStatus: boolean;
}

const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  type: 'info',
  message: 'Test notification message',
  timestamp: new Date().toISOString(),
  readStatus: false,
  ...overrides,
});

describe('NotificationsList', () => {
  describe('Rendering', () => {
    it('renders the Notifications header', () => {
      render(<NotificationsList initialNotifications={[]} />);

      expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    });

    it('renders unread count badge', () => {
      const notifications = [
        createMockNotification({ id: '1', readStatus: false }),
        createMockNotification({ id: '2', readStatus: false }),
        createMockNotification({ id: '3', readStatus: true }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('2 unread')).toBeInTheDocument();
    });

    it('shows 0 unread when all read', () => {
      const notifications = [
        createMockNotification({ id: '1', readStatus: true }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('0 unread')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no notifications', () => {
      render(<NotificationsList initialNotifications={[]} />);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('Notification Display', () => {
    it('displays notification message', () => {
      const notifications = [
        createMockNotification({ message: 'Your case has been updated' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('Your case has been updated')).toBeInTheDocument();
    });

    it('displays notification timestamp', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z').toISOString();
      const notifications = [
        createMockNotification({ timestamp }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      // Should display formatted date
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('displays notification type badge', () => {
      const notifications = [
        createMockNotification({ type: 'error' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  describe('Notification Types', () => {
    it('applies info styling', () => {
      const notifications = [
        createMockNotification({ type: 'info', message: 'Info message' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const badge = screen.getByText('info');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-800');
    });

    it('applies warning styling', () => {
      const notifications = [
        createMockNotification({ type: 'warning', message: 'Warning message' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const badge = screen.getByText('warning');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });

    it('applies error styling', () => {
      const notifications = [
        createMockNotification({ type: 'error', message: 'Error message' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const badge = screen.getByText('error');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });

    it('applies success styling', () => {
      const notifications = [
        createMockNotification({ type: 'success', message: 'Success message' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const badge = screen.getByText('success');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });
  });

  describe('Read Status', () => {
    it('shows unread indicator for unread notifications', () => {
      const notifications = [
        createMockNotification({ readStatus: false }),
      ];

      const { container } = render(
        <NotificationsList initialNotifications={notifications} />
      );

      // Unread notifications have blue highlight background
      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('shows Mark as read button for unread notifications', () => {
      const notifications = [
        createMockNotification({ readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('Mark as read')).toBeInTheDocument();
    });

    it('hides Mark as read button for read notifications', () => {
      const notifications = [
        createMockNotification({ readStatus: true }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.queryByText('Mark as read')).not.toBeInTheDocument();
    });

    it('applies different styling for read vs unread', () => {
      const notifications = [
        createMockNotification({ id: '1', readStatus: false, message: 'Unread' }),
        createMockNotification({ id: '2', readStatus: true, message: 'Read' }),
      ];

      const { container } = render(
        <NotificationsList initialNotifications={notifications} />
      );

      // Unread notification has blue background
      const unreadItem = screen.getByText('Unread').closest('.rounded-lg');
      expect(unreadItem).toHaveClass('bg-blue-50');

      // Read notification has white background
      const readItem = screen.getByText('Read').closest('.rounded-lg');
      expect(readItem).toHaveClass('bg-white');
    });
  });

  describe('Mark as Read', () => {
    it('marks notification as read when button clicked', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('1 unread')).toBeInTheDocument();

      await user.click(screen.getByText('Mark as read'));

      expect(screen.getByText('0 unread')).toBeInTheDocument();
    });

    it('hides Mark as read button after marking', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      await user.click(screen.getByText('Mark as read'));

      expect(screen.queryByText('Mark as read')).not.toBeInTheDocument();
    });

    it('updates unread count after marking as read', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', readStatus: false }),
        createMockNotification({ id: '2', readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('2 unread')).toBeInTheDocument();

      const markAsReadButtons = screen.getAllByText('Mark as read');
      await user.click(markAsReadButtons[0]);

      expect(screen.getByText('1 unread')).toBeInTheDocument();
    });

    it('marks correct notification as read when multiple exist', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', readStatus: false, message: 'First notification' }),
        createMockNotification({ id: '2', readStatus: false, message: 'Second notification' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      // Find the notification item containing "Second notification"
      const secondNotification = screen.getByText('Second notification').closest('.rounded-lg');
      const markAsReadButton = within(secondNotification!).getByText('Mark as read');

      await user.click(markAsReadButton);

      // First notification should still have Mark as read button
      const firstNotification = screen.getByText('First notification').closest('.rounded-lg');
      expect(within(firstNotification!).getByText('Mark as read')).toBeInTheDocument();

      // Second notification should not have the button anymore
      expect(within(secondNotification!).queryByText('Mark as read')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Notifications', () => {
    it('renders all notifications', () => {
      const notifications = [
        createMockNotification({ id: '1', message: 'Notification 1' }),
        createMockNotification({ id: '2', message: 'Notification 2' }),
        createMockNotification({ id: '3', message: 'Notification 3' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      expect(screen.getByText('Notification 3')).toBeInTheDocument();
    });

    it('handles mixed read/unread notifications', () => {
      const notifications = [
        createMockNotification({ id: '1', readStatus: false }),
        createMockNotification({ id: '2', readStatus: true }),
        createMockNotification({ id: '3', readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      expect(screen.getByText('2 unread')).toBeInTheDocument();
      expect(screen.getAllByText('Mark as read')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<NotificationsList initialNotifications={[]} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('notification type badges are visible', () => {
      const notifications = [
        createMockNotification({ type: 'error' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const badge = screen.getByText('error');
      expect(badge).toBeVisible();
    });

    it('Mark as read buttons are focusable', () => {
      const notifications = [
        createMockNotification({ readStatus: false }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      const button = screen.getByText('Mark as read');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('State Management', () => {
    it('maintains state when marking notifications as read', async () => {
      const user = userEvent.setup();
      const notifications = [
        createMockNotification({ id: '1', readStatus: false, message: 'Message 1' }),
        createMockNotification({ id: '2', readStatus: false, message: 'Message 2' }),
      ];

      render(<NotificationsList initialNotifications={notifications} />);

      // Mark first as read
      const firstNotification = screen.getByText('Message 1').closest('.rounded-lg');
      await user.click(within(firstNotification!).getByText('Mark as read'));

      // Both messages should still be visible
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();

      // Unread count should be 1
      expect(screen.getByText('1 unread')).toBeInTheDocument();
    });
  });
});
