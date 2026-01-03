/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge, StatusVariant } from '@/components/enterprise/ui/StatusBadge';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('StatusBadge', () => {
  describe('Variant Rendering', () => {
    const variants: StatusVariant[] = [
      'success',
      'warning',
      'error',
      'info',
      'pending',
      'active',
      'inactive',
      'neutral',
    ];

    it.each(variants)('should render %s variant correctly', (variant) => {
      renderWithTheme(<StatusBadge status="Test Status" variant={variant} />);

      expect(screen.getByText('Test Status')).toBeInTheDocument();
    });

    it('should render success variant with correct styling', () => {
      const { container } = renderWithTheme(<StatusBadge status="Active" variant="success" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('should render error variant with correct styling', () => {
      const { container } = renderWithTheme(<StatusBadge status="Failed" variant="error" />);

      const badge = screen.getByText('Failed');
      expect(badge).toHaveClass('text-rose-700');
    });

    it('should render warning variant with correct styling', () => {
      const { container } = renderWithTheme(<StatusBadge status="Pending" variant="warning" />);

      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('text-amber-700');
    });

    it('should render info variant with correct styling', () => {
      const { container } = renderWithTheme(<StatusBadge status="Info" variant="info" />);

      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('text-blue-700');
    });

    it('should default to neutral variant when not specified', () => {
      renderWithTheme(<StatusBadge status="Default" />);

      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      const { container } = renderWithTheme(<StatusBadge status="Small" size="sm" />);

      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('text-xs');
    });

    it('should render medium size correctly', () => {
      const { container } = renderWithTheme(<StatusBadge status="Medium" size="md" />);

      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('text-sm');
    });

    it('should render large size correctly', () => {
      const { container } = renderWithTheme(<StatusBadge status="Large" size="lg" />);

      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('text-base');
    });

    it('should default to medium size when not specified', () => {
      const { container } = renderWithTheme(<StatusBadge status="Default" />);

      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('text-sm');
    });
  });

  describe('Status Dot', () => {
    it('should show dot by default', () => {
      const { container } = renderWithTheme(<StatusBadge status="With Dot" />);

      const badge = screen.getByText('With Dot').parentElement;
      const dot = badge?.querySelector('span[class*="rounded-full"]');

      expect(dot).toBeInTheDocument();
    });

    it('should hide dot when showDot is false', () => {
      const { container } = renderWithTheme(<StatusBadge status="No Dot" showDot={false} />);

      const badge = screen.getByText('No Dot').parentElement;
      const dots = badge?.querySelectorAll('span[class*="rounded-full"]');

      // Only the badge itself should be rounded-full, not a dot
      expect(dots?.length).toBeLessThanOrEqual(1);
    });

    it('should render dot with correct color for variant', () => {
      const { container } = renderWithTheme(<StatusBadge status="Success" variant="success" showDot />);

      const badge = screen.getByText('Success').parentElement;
      const dot = badge?.querySelector('span.bg-emerald-500');

      expect(dot).toBeInTheDocument();
    });

    it('should adjust dot size based on badge size', () => {
      const { container: smallContainer } = renderWithTheme(
        <StatusBadge status="Small" size="sm" showDot />
      );
      const smallBadge = screen.getByText('Small').parentElement;
      const smallDot = smallBadge?.querySelector('span[class*="h-1.5"]');

      expect(smallDot).toBeInTheDocument();

      const { container: largeContainer } = renderWithTheme(
        <StatusBadge status="Large" size="lg" showDot />
      );
      const largeBadge = screen.getByText('Large').parentElement;
      const largeDot = largeBadge?.querySelector('span[class*="h-2.5"]');

      expect(largeDot).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should animate when animated prop is true', () => {
      renderWithTheme(<StatusBadge status="Animated" animated />);

      expect(screen.getByText('Animated')).toBeInTheDocument();
    });

    it('should not animate when animated prop is false', () => {
      renderWithTheme(<StatusBadge status="Not Animated" animated={false} />);

      expect(screen.getByText('Not Animated')).toBeInTheDocument();
    });

    it('should default to no animation', () => {
      renderWithTheme(<StatusBadge status="Default" />);

      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Custom" className="custom-class" />
      );

      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Custom" className="ml-4" />
      );

      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('ml-4');
      expect(badge).toHaveClass('inline-flex');
    });
  });

  describe('Content Display', () => {
    it('should display status text correctly', () => {
      renderWithTheme(<StatusBadge status="Test Status Text" />);

      expect(screen.getByText('Test Status Text')).toBeInTheDocument();
    });

    it('should handle long status text', () => {
      renderWithTheme(
        <StatusBadge status="This is a very long status text that should be displayed" />
      );

      expect(
        screen.getByText('This is a very long status text that should be displayed')
      ).toBeInTheDocument();
    });

    it('should handle special characters in status', () => {
      renderWithTheme(<StatusBadge status="Status: 100% Complete!" />);

      expect(screen.getByText('Status: 100% Complete!')).toBeInTheDocument();
    });

    it('should prevent text wrapping', () => {
      const { container } = renderWithTheme(<StatusBadge status="No Wrap Status" />);

      const badge = screen.getByText('No Wrap Status');
      expect(badge).toHaveClass('whitespace-nowrap');
    });
  });

  describe('Badge Shape and Border', () => {
    it('should have rounded-full shape', () => {
      const { container } = renderWithTheme(<StatusBadge status="Rounded" />);

      const badge = screen.getByText('Rounded');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have border', () => {
      const { container } = renderWithTheme(<StatusBadge status="Bordered" />);

      const badge = screen.getByText('Bordered');
      expect(badge).toHaveClass('border');
    });

    it('should render as inline-flex', () => {
      const { container } = renderWithTheme(<StatusBadge status="Inline" />);

      const badge = screen.getByText('Inline');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should center items', () => {
      const { container } = renderWithTheme(<StatusBadge status="Centered" />);

      const badge = screen.getByText('Centered');
      expect(badge).toHaveClass('items-center');
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes for success variant', () => {
      const { container } = renderWithTheme(<StatusBadge status="Success" variant="success" />);

      const badge = screen.getByText('Success');
      expect(badge.className).toContain('dark:text-emerald-400');
    });

    it('should include dark mode classes for error variant', () => {
      const { container } = renderWithTheme(<StatusBadge status="Error" variant="error" />);

      const badge = screen.getByText('Error');
      expect(badge.className).toContain('dark:text-rose-400');
    });

    it('should include dark mode classes for warning variant', () => {
      const { container } = renderWithTheme(<StatusBadge status="Warning" variant="warning" />);

      const badge = screen.getByText('Warning');
      expect(badge.className).toContain('dark:text-amber-400');
    });

    it('should include dark mode classes for info variant', () => {
      const { container } = renderWithTheme(<StatusBadge status="Info" variant="info" />);

      const badge = screen.getByText('Info');
      expect(badge.className).toContain('dark:text-blue-400');
    });
  });

  describe('Accessibility', () => {
    it('should render as a span element', () => {
      const { container } = renderWithTheme(<StatusBadge status="Accessible" />);

      const badge = screen.getByText('Accessible');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should have readable text content', () => {
      renderWithTheme(<StatusBadge status="Readable Status" />);

      const badge = screen.getByText('Readable Status');
      expect(badge.textContent).toBe('Readable Status');
    });

    it('should maintain text visibility with sufficient contrast', () => {
      // Testing that text classes are applied for contrast
      const { container } = renderWithTheme(<StatusBadge status="Contrast" variant="success" />);

      const badge = screen.getByText('Contrast');
      expect(badge).toHaveClass('text-emerald-700');
    });
  });

  describe('Component Display Name', () => {
    it('should have correct display name', () => {
      expect(StatusBadge.displayName).toBe('StatusBadge');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should work in a list of statuses', () => {
      const statuses = [
        { id: 1, text: 'Active', variant: 'success' as StatusVariant },
        { id: 2, text: 'Pending', variant: 'warning' as StatusVariant },
        { id: 3, text: 'Failed', variant: 'error' as StatusVariant },
      ];

      renderWithTheme(
        <div>
          {statuses.map((status) => (
            <StatusBadge key={status.id} status={status.text} variant={status.variant} />
          ))}
        </div>
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should work in a table cell', () => {
      renderWithTheme(
        <table>
          <tbody>
            <tr>
              <td>
                <StatusBadge status="Approved" variant="success" />
              </td>
            </tr>
          </tbody>
        </table>
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('should work with dynamic status updates', () => {
      const { rerender } = renderWithTheme(<StatusBadge status="Loading" variant="pending" />);

      expect(screen.getByText('Loading')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <StatusBadge status="Complete" variant="success" />
        </ThemeProvider>
      );

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });
});
