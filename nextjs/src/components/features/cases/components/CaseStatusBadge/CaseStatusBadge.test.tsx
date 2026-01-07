/**
 * CaseStatusBadge Component Tests
 * Enterprise-grade test suite for case status display badge
 *
 * @module components/features/cases/CaseStatusBadge.test
 */

import { render, screen } from '@testing-library/react';
import { CaseStatusBadge } from './CaseStatusBadge';
import { CaseStatus } from '@/types';

describe('CaseStatusBadge', () => {
  describe('Rendering', () => {
    it('should render the status text', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Status Colors', () => {
    it('should apply green colors for Active status', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should apply blue colors for Open status', () => {
      render(<CaseStatusBadge status={CaseStatus.Open} />);

      const badge = screen.getByText('Open');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('should apply yellow colors for Discovery status', () => {
      render(<CaseStatusBadge status={CaseStatus.Discovery} />);

      const badge = screen.getByText('Discovery');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply purple colors for Trial status', () => {
      render(<CaseStatusBadge status={CaseStatus.Trial} />);

      const badge = screen.getByText('Trial');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('should apply teal colors for Settled status', () => {
      render(<CaseStatusBadge status={CaseStatus.Settled} />);

      const badge = screen.getByText('Settled');
      expect(badge).toHaveClass('bg-teal-100', 'text-teal-700');
    });

    it('should apply gray colors for Closed status', () => {
      render(<CaseStatusBadge status={CaseStatus.Closed} />);

      const badge = screen.getByText('Closed');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('should apply slate colors for Archived status', () => {
      render(<CaseStatusBadge status={CaseStatus.Archived} />);

      const badge = screen.getByText('Archived');
      expect(badge).toHaveClass('bg-slate-100', 'text-slate-600');
    });

    it('should apply orange colors for On Hold status', () => {
      render(<CaseStatusBadge status={CaseStatus.OnHold} />);

      const badge = screen.getByText('On Hold');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-700');
    });

    it('should apply indigo colors for Pre-Filing status', () => {
      render(<CaseStatusBadge status={CaseStatus.PreFiling} />);

      const badge = screen.getByText('Pre-Filing');
      expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-700');
    });

    it('should apply rose colors for Appeal status', () => {
      render(<CaseStatusBadge status={CaseStatus.Appeal} />);

      const badge = screen.getByText('Appeal');
      expect(badge).toHaveClass('bg-rose-100', 'text-rose-700');
    });

    it('should apply cyan colors for Transferred status', () => {
      render(<CaseStatusBadge status={CaseStatus.Transferred} />);

      const badge = screen.getByText('Transferred');
      expect(badge).toHaveClass('bg-cyan-100', 'text-cyan-700');
    });
  });

  describe('Dark Mode Colors', () => {
    it('should have dark mode classes for Active status', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('dark:bg-green-900/30', 'dark:text-green-400');
    });

    it('should have dark mode classes for Closed status', () => {
      render(<CaseStatusBadge status={CaseStatus.Closed} />);

      const badge = screen.getByText('Closed');
      expect(badge).toHaveClass('dark:bg-gray-700', 'dark:text-gray-300');
    });
  });

  describe('Badge Variants', () => {
    it('should render default size', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-xs');
    });

    it('should render small size when size is sm', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} size="sm" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('should render large size when size is lg', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} size="lg" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
  });

  describe('Icon Display', () => {
    it('should show icon when showIcon is true', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} showIcon />);

      const badge = screen.getByText('Active').closest('span');
      expect(badge?.querySelector('svg')).toBeInTheDocument();
    });

    it('should not show icon by default', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active').closest('span');
      expect(badge?.querySelector('svg')).not.toBeInTheDocument();
    });

    it('should render different icons for different statuses', () => {
      const { rerender } = render(<CaseStatusBadge status={CaseStatus.Active} showIcon />);
      let badge = screen.getByText('Active').closest('span');
      let activeIcon = badge?.querySelector('svg');

      rerender(<CaseStatusBadge status={CaseStatus.Closed} showIcon />);
      badge = screen.getByText('Closed').closest('span');
      const closedIcon = badge?.querySelector('svg');

      // Both should have icons
      expect(activeIcon).not.toBe(closedIcon);
    });
  });

  describe('Rounded Badge', () => {
    it('should be pill-shaped by default', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should render squared corners when rounded is false', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} rounded={false} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('rounded');
      expect(badge).not.toHaveClass('rounded-full');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} className="custom-badge" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('custom-badge');
    });

    it('should merge custom className with default classes', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} className="custom-badge" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('custom-badge', 'bg-green-100');
    });
  });

  describe('All Status Types', () => {
    const allStatuses = Object.values(CaseStatus);

    allStatuses.forEach((status) => {
      it(`should render ${status} status correctly`, () => {
        render(<CaseStatusBadge status={status} />);

        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe('Unknown Status', () => {
    it('should handle unknown status gracefully', () => {
      render(<CaseStatusBadge status={'Unknown' as CaseStatus} />);

      const badge = screen.getByText('Unknown');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
    });

    it('should have appropriate role attribute', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      // Status badges should be readable but not interactive
      expect(badge.getAttribute('role')).toBeFalsy();
    });
  });

  describe('Font Styling', () => {
    it('should have medium font weight', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('font-medium');
    });
  });

  describe('Inline Display', () => {
    it('should display inline with flex', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} showIcon />);

      const badge = screen.getByText('Active').closest('span');
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });
  });

  describe('Icon Spacing', () => {
    it('should have proper spacing between icon and text', () => {
      render(<CaseStatusBadge status={CaseStatus.Active} showIcon />);

      const badge = screen.getByText('Active').closest('span');
      expect(badge).toHaveClass('gap-1');
    });
  });

  describe('Whitespace Handling', () => {
    it('should prevent text wrapping', () => {
      render(<CaseStatusBadge status={CaseStatus.OnHold} />);

      const badge = screen.getByText('On Hold');
      expect(badge).toHaveClass('whitespace-nowrap');
    });
  });
});
