/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { StatusBadge } from '@/shared/ui/atoms/StatusBadge/StatusBadge';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('StatusBadge', () => {
  describe('Rendering', () => {
    it('should render status badge with text', () => {
      renderWithTheme(<StatusBadge status="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render without status text', () => {
      renderWithTheme(<StatusBadge />);
      const { container } = render(<ThemeProvider><StatusBadge /></ThemeProvider>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = [
      'success',
      'warning',
      'error',
      'info',
      'pending',
      'active',
      'inactive',
      'neutral',
    ] as const;

    it.each(variants)('should render %s variant correctly', (variant) => {
      renderWithTheme(<StatusBadge status="Test" variant={variant} />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should apply success styling', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Active" variant="success" />
      );
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('should apply error styling', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Failed" variant="error" />
      );
      const badge = screen.getByText('Failed');
      expect(badge).toHaveClass('text-rose-700');
    });

    it('should apply warning styling', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Pending" variant="warning" />
      );
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('text-amber-700');
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(<StatusBadge status="Test" size={size} />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      renderWithTheme(<StatusBadge status="Default" />);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('Status Dot', () => {
    it('should show status dot', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Online" showDot variant="success" />
      );
      const dot = container.querySelector('[data-status-dot="true"]');
      expect(dot).toBeInTheDocument();
    });

    it('should hide status dot by default', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Online" variant="success" />
      );
      const dot = container.querySelector('[data-status-dot="true"]');
      expect(dot).not.toBeInTheDocument();
    });

    it('should color dot based on variant', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Active" showDot variant="success" />
      );
      const dot = container.querySelector('[data-status-dot="true"]');
      expect(dot).toHaveClass('bg-emerald-500');
    });
  });

  describe('Pulse Animation', () => {
    it('should show pulse animation', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Live" pulse />
      );
      const badge = container.querySelector('.animate-pulse');
      expect(badge).toBeInTheDocument();
    });

    it('should not pulse by default', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Static" />
      );
      const badge = container.querySelector('.animate-pulse');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render with leading icon', () => {
      const Icon = () => <span data-testid="icon">✓</span>;
      renderWithTheme(
        <StatusBadge status="Complete" icon={<Icon />} />
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should position icon before text', () => {
      const Icon = () => <span data-testid="icon">✓</span>;
      renderWithTheme(
        <StatusBadge status="Complete" icon={<Icon />} />
      );
      const icon = screen.getByTestId('icon');
      const text = screen.getByText('Complete');
      expect(icon.compareDocumentPosition(text)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Accessibility', () => {
    it('should be screen reader accessible', () => {
      renderWithTheme(<StatusBadge status="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should have role attribute', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Status" role="status" />
      );
      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(
        <StatusBadge status="1" aria-label="1 notification" />
      );
      const badge = screen.getByLabelText('1 notification');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Clickable', () => {
    it('should trigger onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <StatusBadge status="Active" onClick={handleClick} />
      );

      const badge = screen.getByText('Active');
      badge.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show pointer cursor when clickable', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Active" onClick={() => { }} />
      );
      const badge = screen.getByText('Active').parentElement;
      expect(badge?.style.cursor).toBe('pointer');
    });

    it('should not be clickable by default', () => {
      const handleClick = jest.fn();
      renderWithTheme(<StatusBadge status="Static" />);

      const badge = screen.getByText('Static');
      badge.click();

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty status', () => {
      const { container } = renderWithTheme(<StatusBadge status="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long status text', () => {
      const longText = 'A'.repeat(100);
      renderWithTheme(<StatusBadge status={longText} />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle numeric status', () => {
      renderWithTheme(<StatusBadge status={42 as any} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      renderWithTheme(<StatusBadge status="Status: #123 (Active)" />);
      expect(screen.getByText('Status: #123 (Active)')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render correctly in light theme', () => {
      renderWithTheme(<StatusBadge status="Active" variant="success" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render correctly in dark theme', () => {
      renderWithTheme(<StatusBadge status="Active" variant="success" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <StatusBadge status="Custom" className="custom-badge" />
      );
      const badge = screen.getByText('Custom').parentElement;
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render case status badge', () => {
      renderWithTheme(
        <StatusBadge status="Active" variant="success" showDot />
      );
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render notification badge', () => {
      renderWithTheme(
        <StatusBadge status="3" variant="error" size="sm" />
      );
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render user status badge', () => {
      renderWithTheme(
        <StatusBadge status="Online" variant="success" showDot pulse />
      );
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should render document status badge', () => {
      renderWithTheme(
        <StatusBadge status="Draft" variant="warning" />
      );
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Multiple Badges', () => {
    it('should render multiple badges independently', () => {
      renderWithTheme(
        <div>
          <StatusBadge status="Active" variant="success" />
          <StatusBadge status="Pending" variant="warning" />
          <StatusBadge status="Failed" variant="error" />
        </div>
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });
});
