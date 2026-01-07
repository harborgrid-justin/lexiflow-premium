/**
 * @jest-environment jsdom
 * NotificationBadge Component Tests
 * Enterprise-grade tests for notification badge and icon components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBadge, NotificationIcon } from './NotificationBadge';

describe('NotificationBadge', () => {
  describe('Rendering', () => {
    it('renders badge with count', () => {
      render(<NotificationBadge count={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not render when count is 0 and showZero is false', () => {
      const { container } = render(<NotificationBadge count={0} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('renders when count is 0 and showZero is true', () => {
      render(<NotificationBadge count={0} showZero={true} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Max Count', () => {
    it('displays count when under max', () => {
      render(<NotificationBadge count={50} max={99} />);

      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('displays max+ when count exceeds max', () => {
      render(<NotificationBadge count={150} max={99} />);

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('uses default max of 99', () => {
      render(<NotificationBadge count={100} />);

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('respects custom max value', () => {
      render(<NotificationBadge count={15} max={10} />);

      expect(screen.getByText('10+')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<NotificationBadge count={5} size="sm" />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('h-4');
      expect(badge).toHaveClass('min-w-[1rem]');
    });

    it('applies medium size classes (default)', () => {
      render(<NotificationBadge count={5} />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('h-5');
      expect(badge).toHaveClass('min-w-[1.25rem]');
    });

    it('applies large size classes', () => {
      render(<NotificationBadge count={5} size="lg" />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('h-6');
      expect(badge).toHaveClass('min-w-[1.5rem]');
    });
  });

  describe('Variants', () => {
    it('applies primary variant classes (default)', () => {
      render(<NotificationBadge count={5} />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('bg-blue-600');
      expect(badge).toHaveClass('text-white');
    });

    it('applies danger variant classes', () => {
      render(<NotificationBadge count={5} variant="danger" />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('bg-red-600');
      expect(badge).toHaveClass('text-white');
    });

    it('applies warning variant classes', () => {
      render(<NotificationBadge count={5} variant="warning" />);

      const badge = screen.getByText('5');
      expect(badge).toHaveClass('bg-amber-500');
      expect(badge).toHaveClass('text-white');
    });
  });

  describe('Pulse Animation', () => {
    it('shows pulse animation when pulse is true and count > 0', () => {
      const { container } = render(<NotificationBadge count={5} pulse={true} />);

      expect(container.querySelector('.animate-ping')).toBeInTheDocument();
    });

    it('does not show pulse animation when pulse is false', () => {
      const { container } = render(<NotificationBadge count={5} pulse={false} />);

      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
    });

    it('does not show pulse animation when count is 0', () => {
      const { container } = render(<NotificationBadge count={0} showZero={true} pulse={true} />);

      expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <NotificationBadge count={5} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('NotificationIcon', () => {
  describe('Rendering', () => {
    it('renders notification bell icon', () => {
      render(<NotificationIcon count={0} />);

      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    });

    it('renders as button', () => {
      render(<NotificationIcon count={0} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Badge Integration', () => {
    it('shows badge when count > 0', () => {
      render(<NotificationIcon count={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('hides badge when count is 0', () => {
      render(<NotificationIcon count={0} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('badge has pulse animation', () => {
      const { container } = render(<NotificationIcon count={5} />);

      // NotificationIcon uses NotificationBadge with pulse={true}
      expect(container.querySelector('.animate-ping')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(<NotificationIcon count={5} onClick={onClick} />);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });

    it('works without onClick prop', async () => {
      const user = userEvent.setup();

      render(<NotificationIcon count={5} />);

      // Should not throw
      await user.click(screen.getByRole('button'));
    });
  });

  describe('Sizes', () => {
    it('applies small size to icon', () => {
      const { container } = render(<NotificationIcon count={5} size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-5');
      expect(svg).toHaveClass('w-5');
    });

    it('applies medium size to icon (default)', () => {
      const { container } = render(<NotificationIcon count={5} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-6');
      expect(svg).toHaveClass('w-6');
    });

    it('applies large size to icon', () => {
      const { container } = render(<NotificationIcon count={5} size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8');
      expect(svg).toHaveClass('w-8');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      render(<NotificationIcon count={5} className="custom-icon-class" />);

      expect(screen.getByRole('button')).toHaveClass('custom-icon-class');
    });
  });

  describe('Accessibility', () => {
    it('has accessible title', () => {
      render(<NotificationIcon count={5} />);

      expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    });

    it('button is focusable', () => {
      render(<NotificationIcon count={5} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Badge Positioning', () => {
    it('positions badge in top-right corner', () => {
      const { container } = render(<NotificationIcon count={5} />);

      const badgeContainer = container.querySelector('.absolute');
      expect(badgeContainer).toHaveClass('right-1');
      expect(badgeContainer).toHaveClass('top-1');
    });
  });
});
