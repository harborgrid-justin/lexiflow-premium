/**
 * @jest-environment jsdom
 * @module NotificationBadge.test
 * @description Enterprise-grade tests for NotificationBadge component family
 *
 * Test coverage:
 * - NotificationBadge rendering and count display
 * - Overflow handling (99+)
 * - Size variants
 * - Color variants
 * - Dot indicator mode
 * - Pulse animation
 * - NotificationBadgeIcon composition
 * - InlineNotificationBadge composition
 * - AnimatedCounterBadge transitions
 * - NotificationBadgeGroup rendering
 * - Accessibility
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import {
  NotificationBadge,
  NotificationBadgeIcon,
  InlineNotificationBadge,
  AnimatedCounterBadge,
  NotificationBadgeGroup,
} from './NotificationBadge';
import { Bell } from 'lucide-react';

// ============================================================================
// TEST SUITES
// ============================================================================

describe('NotificationBadge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders count when count > 0', () => {
      render(<NotificationBadge count={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not render when count is 0', () => {
      const { container } = render(<NotificationBadge count={0} />);

      expect(container.firstChild).toBeNull();
    });

    it('does not render when count is negative', () => {
      const { container } = render(<NotificationBadge count={-1} />);

      expect(container.firstChild).toBeNull();
    });

    it('displays count as string', () => {
      render(<NotificationBadge count={42} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Count Overflow', () => {
    it('displays 99+ when count exceeds default max', () => {
      render(<NotificationBadge count={100} />);

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('displays exact count when at max', () => {
      render(<NotificationBadge count={99} />);

      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('respects custom max value', () => {
      render(<NotificationBadge count={50} max={49} />);

      expect(screen.getByText('49+')).toBeInTheDocument();
    });

    it('displays exact count when below custom max', () => {
      render(<NotificationBadge count={30} max={50} />);

      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size styling', () => {
      const { container } = render(<NotificationBadge count={5} size="sm" />);

      expect(container.firstChild).toHaveClass('text-[10px]');
    });

    it('applies medium size styling by default', () => {
      const { container } = render(<NotificationBadge count={5} />);

      expect(container.firstChild).toHaveClass('text-xs');
    });

    it('applies large size styling', () => {
      const { container } = render(<NotificationBadge count={5} size="lg" />);

      expect(container.firstChild).toHaveClass('text-sm');
    });
  });

  describe('Color Variants', () => {
    it('applies danger variant by default', () => {
      const { container } = render(<NotificationBadge count={5} />);

      expect(container.firstChild).toHaveClass('bg-red-600');
    });

    it('applies primary variant styling', () => {
      const { container } = render(<NotificationBadge count={5} variant="primary" />);

      expect(container.firstChild).toHaveClass('bg-blue-600');
    });

    it('applies warning variant styling', () => {
      const { container } = render(<NotificationBadge count={5} variant="warning" />);

      expect(container.firstChild).toHaveClass('bg-amber-500');
    });

    it('applies success variant styling', () => {
      const { container } = render(<NotificationBadge count={5} variant="success" />);

      expect(container.firstChild).toHaveClass('bg-green-600');
    });
  });

  describe('Dot Mode', () => {
    it('renders as dot when dot prop is true', () => {
      const { container } = render(<NotificationBadge count={5} dot />);

      // Dot mode should not show the count text
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('applies correct size for dot mode', () => {
      const { container } = render(<NotificationBadge count={5} dot size="sm" />);

      expect(container.firstChild).toHaveClass('w-2');
      expect(container.firstChild).toHaveClass('h-2');
    });

    it('preserves accessibility in dot mode', () => {
      render(<NotificationBadge count={5} dot />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 notifications');
    });
  });

  describe('Pulse Animation', () => {
    it('applies bounce animation when pulse is true', () => {
      const { container } = render(<NotificationBadge count={5} pulse />);

      // Animation should trigger on mount
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(container.firstChild).toHaveClass('animate-bounce');
    });

    it('removes animation after timeout', () => {
      const { container } = render(<NotificationBadge count={5} pulse />);

      act(() => {
        jest.advanceTimersByTime(1100);
      });

      expect(container.firstChild).not.toHaveClass('animate-bounce');
    });

    it('applies ping animation in dot mode with pulse', () => {
      const { container } = render(<NotificationBadge count={5} dot pulse />);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(container.firstChild).toHaveClass('animate-ping');
    });
  });

  describe('Accessibility', () => {
    it('has status role', () => {
      render(<NotificationBadge count={5} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has default aria-label', () => {
      render(<NotificationBadge count={5} />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 notifications');
    });

    it('accepts custom aria-label', () => {
      render(<NotificationBadge count={5} ariaLabel="5 unread messages" />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 unread messages');
    });

    it('provides screen reader text in dot mode', () => {
      render(<NotificationBadge count={5} dot />);

      expect(screen.getByText('5 notifications')).toHaveClass('sr-only');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<NotificationBadge count={5} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('NotificationBadgeIcon', () => {
  it('renders icon with badge', () => {
    render(<NotificationBadgeIcon icon={<Bell data-testid="bell-icon" />} count={5} />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when count is 0', () => {
    render(<NotificationBadgeIcon icon={<Bell data-testid="bell-icon" />} count={0} />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('positions badge correctly', () => {
    const { container } = render(
      <NotificationBadgeIcon icon={<Bell />} count={5} />
    );

    const badgeContainer = container.querySelector('.absolute');
    expect(badgeContainer).toHaveClass('-top-1');
    expect(badgeContainer).toHaveClass('-right-1');
  });

  it('passes badgeProps to NotificationBadge', () => {
    render(
      <NotificationBadgeIcon
        icon={<Bell />}
        count={5}
        badgeProps={{ variant: 'success', size: 'lg' }}
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-green-600');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NotificationBadgeIcon icon={<Bell />} count={5} className="custom-icon-badge" />
    );

    expect(container.firstChild).toHaveClass('custom-icon-badge');
  });
});

describe('InlineNotificationBadge', () => {
  it('renders label with badge', () => {
    render(<InlineNotificationBadge label="Messages" count={5} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when count is 0', () => {
    render(<InlineNotificationBadge label="Messages" count={0} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses small size by default', () => {
    const { container } = render(<InlineNotificationBadge label="Test" count={5} />);

    // Small size class
    expect(container.querySelector('.text-\\[10px\\]')).toBeInTheDocument();
  });

  it('passes badgeProps to NotificationBadge', () => {
    render(
      <InlineNotificationBadge
        label="Test"
        count={5}
        badgeProps={{ variant: 'warning' }}
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-amber-500');
  });

  it('applies custom className', () => {
    const { container } = render(
      <InlineNotificationBadge label="Test" count={5} className="custom-inline" />
    );

    expect(container.firstChild).toHaveClass('custom-inline');
  });
});

describe('AnimatedCounterBadge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial count', () => {
    render(<AnimatedCounterBadge count={5} previousCount={0} />);

    // Should start animation from 0
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('animates from previous count to new count', async () => {
    render(<AnimatedCounterBadge count={10} previousCount={5} />);

    // Let animation run
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('triggers pulse animation during increment', () => {
    const { container } = render(<AnimatedCounterBadge count={10} previousCount={5} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
  });

  it('handles count decrease without animation', () => {
    render(<AnimatedCounterBadge count={3} previousCount={10} />);

    // Should immediately show the new count
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('passes badgeProps to NotificationBadge', () => {
    render(
      <AnimatedCounterBadge
        count={5}
        badgeProps={{ variant: 'primary', size: 'lg' }}
      />
    );

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-blue-600');
  });
});

describe('NotificationBadgeGroup', () => {
  const badges = [
    { label: 'Messages', count: 5, variant: 'primary' as const },
    { label: 'Tasks', count: 3, variant: 'warning' as const },
    { label: 'Alerts', count: 10, variant: 'danger' as const },
  ];

  it('renders all badges', () => {
    render(<NotificationBadgeGroup badges={badges} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });

  it('renders correct counts for each badge', () => {
    render(<NotificationBadgeGroup badges={badges} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies correct variants to each badge', () => {
    render(<NotificationBadgeGroup badges={badges} />);

    const badgeElements = screen.getAllByRole('status');
    expect(badgeElements[0]).toHaveClass('bg-blue-600');
    expect(badgeElements[1]).toHaveClass('bg-amber-500');
    expect(badgeElements[2]).toHaveClass('bg-red-600');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NotificationBadgeGroup badges={badges} className="custom-group" />
    );

    expect(container.firstChild).toHaveClass('custom-group');
  });

  it('handles empty badges array', () => {
    const { container } = render(<NotificationBadgeGroup badges={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('hides badges with count 0', () => {
    const badgesWithZero = [
      { label: 'Active', count: 5 },
      { label: 'Hidden', count: 0 },
    ];

    render(<NotificationBadgeGroup badges={badgesWithZero} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('uses label as unique key for stability', () => {
    const { rerender } = render(<NotificationBadgeGroup badges={badges} />);

    // Rerender with same badges should not cause issues
    rerender(<NotificationBadgeGroup badges={badges} />);

    expect(screen.getByText('Messages')).toBeInTheDocument();
  });
});

describe('Edge Cases', () => {
  it('NotificationBadge handles max of 0', () => {
    render(<NotificationBadge count={5} max={0} />);

    // With max 0, any count > 0 should show +
    expect(screen.getByText('0+')).toBeInTheDocument();
  });

  it('NotificationBadge handles very large counts', () => {
    render(<NotificationBadge count={999999} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('NotificationBadgeIcon handles missing icon gracefully', () => {
    const { container } = render(
      <NotificationBadgeIcon icon={null as unknown as React.ReactNode} count={5} />
    );

    // Should still render container
    expect(container.firstChild).toBeInTheDocument();
  });
});
