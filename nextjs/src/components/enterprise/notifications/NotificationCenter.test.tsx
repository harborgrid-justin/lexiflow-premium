/**
 * @module components/enterprise/notifications/NotificationCenter.test
 * @description Unit tests for NotificationCenter component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter, NotificationCenterProps } from './NotificationCenter';
import type { UINotification } from '@/types/notifications';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.ComponentProps<'div'>) => (
      <div className={className} {...props}>
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
  Archive: ({ className }: { className?: string }) => (
    <svg data-testid="archive-icon" className={className} />
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
  Search: ({ className }: { className?: string }) => (
    <svg data-testid="search-icon" className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg data-testid="settings-icon" className={className} />
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
    read: false,
    timestamp: Date.now() - 1000 * 60 * 30,
    priority: 'normal',
  },
  {
    id: '3',
    title: 'Deadline Approaching',
    message: 'Motion filing deadline in 2 days',
    type: 'warning',
    read: true,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    priority: 'urgent',
  },
  {
    id: '4',
    title: 'Payment Failed',
    message: 'Subscription payment failed',
    type: 'error',
    read: false,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    priority: 'urgent',
  },
];

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps: NotificationCenterProps = {
  notifications: mockNotifications,
  onMarkAsRead: jest.fn(),
  onMarkAsReadBulk: jest.fn(),
  onMarkAllAsRead: jest.fn(),
  onDelete: jest.fn(),
  onDeleteBulk: jest.fn(),
  onClearAll: jest.fn(),
};

const renderNotificationCenter = (props: Partial<NotificationCenterProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<NotificationCenter {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('NotificationCenter rendering', () => {
  it('should render notification center header', () => {
    renderNotificationCenter();

    expect(screen.getByRole('heading', { name: /notification center/i })).toBeInTheDocument();
  });

  it('should display unread and total counts', () => {
    renderNotificationCenter();

    expect(screen.getByText(/3 unread of 4 total notifications/i)).toBeInTheDocument();
  });

  it('should render all notifications', () => {
    renderNotificationCenter();

    expect(screen.getByText('New Case Assignment')).toBeInTheDocument();
    expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Deadline Approaching')).toBeInTheDocument();
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderNotificationCenter();

    expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
  });

  it('should render filter tabs', () => {
    renderNotificationCenter();

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unread/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /success/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /errors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /warnings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /info/i })).toBeInTheDocument();
  });
});

// ============================================================================
// EMPTY STATE TESTS
// ============================================================================

describe('NotificationCenter empty state', () => {
  it('should show empty state when no notifications', () => {
    renderNotificationCenter({ notifications: [] });

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it('should show filtered empty state', async () => {
    const user = userEvent.setup();
    renderNotificationCenter({ notifications: [] });

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search notifications...');
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No notifications found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('NotificationCenter loading', () => {
  it('should show loading spinner when isLoading is true', () => {
    renderNotificationCenter({ isLoading: true });

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});

// ============================================================================
// SEARCH TESTS
// ============================================================================

describe('NotificationCenter search', () => {
  it('should filter notifications by search query', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const searchInput = screen.getByPlaceholderText('Search notifications...');
    await user.type(searchInput, 'Case');

    await waitFor(() => {
      expect(screen.getByText('New Case Assignment')).toBeInTheDocument();
      expect(screen.queryByText('Document Uploaded')).not.toBeInTheDocument();
    });
  });

  it('should show clear button when search has value', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const searchInput = screen.getByPlaceholderText('Search notifications...');
    await user.type(searchInput, 'Case');

    const clearButton = searchInput.parentElement?.querySelector('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const searchInput = screen.getByPlaceholderText('Search notifications...');
    await user.type(searchInput, 'Case');

    const clearButton = searchInput.parentElement?.querySelector('button');
    if (clearButton) {
      await user.click(clearButton);
    }

    expect(searchInput).toHaveValue('');
  });
});

// ============================================================================
// FILTER TESTS
// ============================================================================

describe('NotificationCenter filters', () => {
  it('should filter by unread', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    await user.click(screen.getByRole('button', { name: /unread/i }));

    await waitFor(() => {
      // Deadline Approaching is read, should not appear
      expect(screen.queryByText('Deadline Approaching')).not.toBeInTheDocument();
      // Others are unread
      expect(screen.getByText('New Case Assignment')).toBeInTheDocument();
    });
  });

  it('should filter by type', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    await user.click(screen.getByRole('button', { name: /errors/i }));

    await waitFor(() => {
      expect(screen.getByText('Payment Failed')).toBeInTheDocument();
      expect(screen.queryByText('New Case Assignment')).not.toBeInTheDocument();
    });
  });

  it('should show count badges on filter tabs', () => {
    renderNotificationCenter();

    // All tab should show total count
    expect(screen.getByText('4')).toBeInTheDocument();
    // Unread tab should show unread count
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

// ============================================================================
// SORT TESTS
// ============================================================================

describe('NotificationCenter sorting', () => {
  it('should toggle sort dropdown', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const sortButton = screen.getByRole('button', { name: /sort/i });
    await user.click(sortButton);

    await waitFor(() => {
      expect(screen.getByText('Newest')).toBeInTheDocument();
      expect(screen.getByText('Oldest')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });
  });

  it('should sort by selected option', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const sortButton = screen.getByRole('button', { name: /sort/i });
    await user.click(sortButton);

    await waitFor(() => {
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Priority'));

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('Newest')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// SELECTION TESTS
// ============================================================================

describe('NotificationCenter selection', () => {
  it('should select notification when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });
  });

  it('should show bulk actions bar when items are selected', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('Mark as read')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Clear selection')).toBeInTheDocument();
    });
  });

  it('should clear selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Clear selection'));

    await waitFor(() => {
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// BULK ACTION TESTS
// ============================================================================

describe('NotificationCenter bulk actions', () => {
  it('should call onMarkAsReadBulk with selected ids', async () => {
    const onMarkAsReadBulk = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onMarkAsReadBulk });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(screen.getByText('Mark as read'));

    expect(onMarkAsReadBulk).toHaveBeenCalledWith(['1', '2']);
  });

  it('should call onDeleteBulk with selected ids', async () => {
    const onDeleteBulk = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onDeleteBulk });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click(screen.getByText('Delete'));

    expect(onDeleteBulk).toHaveBeenCalledWith(['1', '2']);
  });
});

// ============================================================================
// MARK AS READ TESTS
// ============================================================================

describe('NotificationCenter mark as read', () => {
  it('should call onMarkAllAsRead when button is clicked', async () => {
    const onMarkAllAsRead = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onMarkAllAsRead });

    await user.click(screen.getByRole('button', { name: /mark all read/i }));

    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it('should not show mark all read button when all are read', () => {
    const allReadNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderNotificationCenter({ notifications: allReadNotifications });

    expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument();
  });
});

// ============================================================================
// DELETE TESTS
// ============================================================================

describe('NotificationCenter delete', () => {
  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onDelete });

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

// ============================================================================
// ARCHIVE TESTS
// ============================================================================

describe('NotificationCenter archive', () => {
  it('should show archive button when onArchive is provided', () => {
    renderNotificationCenter({ onArchive: jest.fn() });

    const archiveButtons = screen.getAllByTitle('Archive');
    expect(archiveButtons.length).toBeGreaterThan(0);
  });

  it('should call onArchive when archive button is clicked', async () => {
    const onArchive = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onArchive });

    const archiveButtons = screen.getAllByTitle('Archive');
    await user.click(archiveButtons[0]);

    expect(onArchive).toHaveBeenCalledWith('1');
  });

  it('should not show archive button when onArchive is not provided', () => {
    renderNotificationCenter({ onArchive: undefined });

    expect(screen.queryByTitle('Archive')).not.toBeInTheDocument();
  });
});

// ============================================================================
// PREFERENCES BUTTON TESTS
// ============================================================================

describe('NotificationCenter preferences', () => {
  it('should show preferences button when onOpenPreferences is provided', () => {
    renderNotificationCenter({ onOpenPreferences: jest.fn() });

    expect(screen.getByRole('button', { name: /preferences/i })).toBeInTheDocument();
  });

  it('should call onOpenPreferences when button is clicked', async () => {
    const onOpenPreferences = jest.fn();
    const user = userEvent.setup();
    renderNotificationCenter({ onOpenPreferences });

    await user.click(screen.getByRole('button', { name: /preferences/i }));

    expect(onOpenPreferences).toHaveBeenCalled();
  });
});

// ============================================================================
// NOTIFICATION ITEM TESTS
// ============================================================================

describe('NotificationCenter notification items', () => {
  it('should show unread indicator for unread notifications', () => {
    renderNotificationCenter();

    // Unread notifications should have blue indicator dot
    const unreadIndicators = document.querySelectorAll('.bg-blue-500.rounded-full');
    expect(unreadIndicators.length).toBeGreaterThan(0);
  });

  it('should show priority badge for non-normal priorities', () => {
    renderNotificationCenter();

    expect(screen.getAllByText('urgent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('high').length).toBeGreaterThan(0);
  });

  it('should show type badge', () => {
    renderNotificationCenter();

    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('should show timestamp', () => {
    renderNotificationCenter();

    // Multiple timestamps should be present (mocked to "5 minutes ago")
    const timestamps = screen.getAllByText('5 minutes ago');
    expect(timestamps.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('NotificationCenter styling', () => {
  it('should apply custom className', () => {
    const { container } = renderNotificationCenter({ className: 'custom-center' });

    expect(container.firstChild).toHaveClass('custom-center');
  });

  it('should apply selected styling to selected notifications', async () => {
    const user = userEvent.setup();
    renderNotificationCenter();

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Selected notification should have ring styling
    await waitFor(() => {
      const selectedNotification = checkboxes[0].closest('[class*="ring-2"]');
      expect(selectedNotification).toBeInTheDocument();
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('NotificationCenter accessibility', () => {
  it('should have accessible checkboxes with labels', () => {
    renderNotificationCenter();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-label');
    });
  });

  it('should have accessible delete buttons', () => {
    renderNotificationCenter();

    const deleteButtons = screen.getAllByTitle('Delete');
    deleteButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
    });
  });

  it('should have accessible mark as read buttons', () => {
    renderNotificationCenter();

    const markReadButtons = screen.getAllByTitle('Mark as read');
    expect(markReadButtons.length).toBeGreaterThan(0);
  });
});
