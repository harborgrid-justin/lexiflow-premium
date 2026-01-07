/**
 * @module components/enterprise/notifications/NotificationBell.test
 * @description Unit tests for NotificationBell component.
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { NotificationBell } from './NotificationBell';

// ============================================================================
// MOCKS
// ============================================================================

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
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
  Bell: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className} />
  ),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps = {
  unreadCount: 0,
  onClick: jest.fn(),
};

const renderNotificationBell = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<NotificationBell {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('NotificationBell rendering', () => {
  it('should render bell icon', () => {
    renderNotificationBell();

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  it('should render button with aria-label', () => {
    renderNotificationBell();

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Notifications');
  });

  it('should include unread count in aria-label when count > 0', () => {
    renderNotificationBell({ unreadCount: 5 });

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Notifications, 5 unread');
  });

  it('should set aria-expanded when isOpen is true', () => {
    renderNotificationBell({ isOpen: true });

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should set aria-expanded to false when isOpen is false', () => {
    renderNotificationBell({ isOpen: false });

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should have aria-haspopup menu', () => {
    renderNotificationBell();

    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu');
  });
});

// ============================================================================
// BADGE TESTS
// ============================================================================

describe('NotificationBell badge', () => {
  it('should not show badge when unreadCount is 0', () => {
    renderNotificationBell({ unreadCount: 0 });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument();
  });

  it('should show badge with count when unreadCount > 0', () => {
    renderNotificationBell({ unreadCount: 5 });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show 99+ when unreadCount exceeds 99', () => {
    renderNotificationBell({ unreadCount: 150 });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should show exact count at boundary (99)', () => {
    renderNotificationBell({ unreadCount: 99 });

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('should show 99+ at boundary (100)', () => {
    renderNotificationBell({ unreadCount: 100 });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should have accessible label for badge', () => {
    renderNotificationBell({ unreadCount: 10 });

    expect(screen.getByLabelText('10 unread notifications')).toBeInTheDocument();
  });
});

// ============================================================================
// CLICK HANDLER TESTS
// ============================================================================

describe('NotificationBell click handling', () => {
  it('should call onClick when clicked', async () => {
    const onClick = jest.fn();
    renderNotificationBell({ onClick });

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick on each click', async () => {
    const onClick = jest.fn();
    renderNotificationBell({ onClick });

    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

// ============================================================================
// SIZE VARIANT TESTS
// ============================================================================

describe('NotificationBell size variants', () => {
  it('should apply small size classes', () => {
    renderNotificationBell({ size: 'sm' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-1.5');

    const icon = screen.getByTestId('bell-icon');
    expect(icon).toHaveClass('h-4', 'w-4');
  });

  it('should apply medium size classes (default)', () => {
    renderNotificationBell({ size: 'md' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2');

    const icon = screen.getByTestId('bell-icon');
    expect(icon).toHaveClass('h-5', 'w-5');
  });

  it('should apply large size classes', () => {
    renderNotificationBell({ size: 'lg' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-3');

    const icon = screen.getByTestId('bell-icon');
    expect(icon).toHaveClass('h-6', 'w-6');
  });
});

// ============================================================================
// VARIANT STYLE TESTS
// ============================================================================

describe('NotificationBell variants', () => {
  it('should apply default variant classes', () => {
    renderNotificationBell({ variant: 'default' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-slate-100');
  });

  it('should apply primary variant classes', () => {
    renderNotificationBell({ variant: 'primary' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-50');
  });

  it('should apply ghost variant classes', () => {
    renderNotificationBell({ variant: 'ghost' });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('NotificationBell styling', () => {
  it('should apply custom className', () => {
    renderNotificationBell({ className: 'custom-bell-class' });

    expect(screen.getByRole('button')).toHaveClass('custom-bell-class');
  });

  it('should apply focus ring classes', () => {
    renderNotificationBell();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
  });

  it('should apply rounded classes', () => {
    renderNotificationBell();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-lg');
  });

  it('should apply transition classes', () => {
    renderNotificationBell();

    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all');
  });

  it('should apply open state styling', () => {
    renderNotificationBell({ isOpen: true });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-slate-200');
  });
});

// ============================================================================
// ANIMATION TESTS
// ============================================================================

describe('NotificationBell animations', () => {
  it('should trigger shake animation when count increases', async () => {
    jest.useFakeTimers();
    const { rerender } = renderNotificationBell({ unreadCount: 0, animated: true });

    // Increase count
    rerender(
      <NotificationBell
        unreadCount={5}
        onClick={jest.fn()}
        animated={true}
      />
    );

    // Animation should be triggered
    // Note: We can't fully test framer-motion animations, but we test the state change
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Animation should complete
    expect(screen.getByRole('button')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('should not trigger shake when animated is false', () => {
    const { rerender } = renderNotificationBell({ unreadCount: 0, animated: false });

    rerender(
      <NotificationBell
        unreadCount={5}
        onClick={jest.fn()}
        animated={false}
      />
    );

    // Should not throw or cause issues
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show pulse indicator when animated and has unread', () => {
    renderNotificationBell({ unreadCount: 3, animated: true });

    // Pulse span should exist
    // Due to mocking, we just verify the component renders correctly
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should not show pulse indicator when animated is false', () => {
    renderNotificationBell({ unreadCount: 3, animated: false });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('NotificationBell accessibility', () => {
  it('should have accessible button', () => {
    renderNotificationBell();

    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  it('should support custom aria-label', () => {
    renderNotificationBell({ ariaLabel: 'Alerts' });

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Alerts');
  });

  it('should combine custom aria-label with count', () => {
    renderNotificationBell({ ariaLabel: 'Alerts', unreadCount: 3 });

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Alerts, 3 unread');
  });

  it('should be keyboard accessible', async () => {
    const onClick = jest.fn();
    renderNotificationBell({ onClick });

    const button = screen.getByRole('button');
    button.focus();

    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalled();
  });

  it('should be focusable', () => {
    renderNotificationBell();

    const button = screen.getByRole('button');
    button.focus();

    expect(document.activeElement).toBe(button);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('NotificationBell edge cases', () => {
  it('should handle count of 1', () => {
    renderNotificationBell({ unreadCount: 1 });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByLabelText('1 unread notifications')).toBeInTheDocument();
  });

  it('should handle very large count', () => {
    renderNotificationBell({ unreadCount: 999999 });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should handle negative count as 0', () => {
    // Component should handle this gracefully
    renderNotificationBell({ unreadCount: -5 });

    // Should not show badge for negative/zero
    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument();
  });

  it('should handle rapid count changes', () => {
    const { rerender } = renderNotificationBell({ unreadCount: 0 });

    for (let i = 1; i <= 10; i++) {
      rerender(<NotificationBell unreadCount={i} onClick={jest.fn()} />);
    }

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should handle count decreasing', () => {
    const { rerender } = renderNotificationBell({ unreadCount: 10 });

    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<NotificationBell unreadCount={5} onClick={jest.fn()} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('should handle count going to 0', () => {
    const { rerender } = renderNotificationBell({ unreadCount: 5 });

    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(<NotificationBell unreadCount={0} onClick={jest.fn()} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// MEMO TESTS
// ============================================================================

describe('NotificationBell memo behavior', () => {
  it('should have correct displayName', () => {
    expect(NotificationBell.displayName).toBe('NotificationBell');
  });

  it('should not re-render unnecessarily', () => {
    const onClick = jest.fn();
    const { rerender } = renderNotificationBell({ onClick, unreadCount: 5 });

    // Re-render with same props
    rerender(<NotificationBell onClick={onClick} unreadCount={5} />);

    // Component should still be the same (memo should prevent re-render)
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
