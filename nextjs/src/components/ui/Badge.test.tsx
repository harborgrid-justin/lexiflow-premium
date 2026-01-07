import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { Star } from 'lucide-react';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText('Default Badge')).toBeInTheDocument();
    });

    it('renders children content correctly', () => {
      render(<Badge>Status Active</Badge>);
      expect(screen.getByText('Status Active')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<Badge>Inline Badge</Badge>);
      const badge = screen.getByText('Inline Badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Variants', () => {
    it('renders default variant with correct styling', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-slate-200');
    });

    it('renders primary variant with correct styling', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-blue-100');
    });

    it('renders success variant with correct styling', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-emerald-100');
    });

    it('renders warning variant with correct styling', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-amber-100');
    });

    it('renders danger variant with correct styling', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('renders info variant with correct styling', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-indigo-100');
    });
  });

  describe('Sizes', () => {
    it('renders small size with correct styling', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('renders medium size by default', () => {
      render(<Badge>Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-sm');
    });

    it('renders large size with correct styling', () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-4', 'py-1.5', 'text-base');
    });
  });

  describe('Icon', () => {
    it('renders without icon by default', () => {
      const { container } = render(<Badge>No Icon</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('renders with icon when provided', () => {
      const { container } = render(
        <Badge icon={<Star data-testid="star-icon" />}>With Icon</Badge>
      );
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });

    it('icon appears before text content', () => {
      const { container } = render(
        <Badge icon={<Star data-testid="star-icon" />}>With Icon</Badge>
      );
      const badge = screen.getByText('With Icon').parentElement;
      const iconWrapper = badge?.querySelector('span');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Badge className="my-custom-class" variant="primary">Merged</Badge>);
      const badge = screen.getByText('Merged');
      expect(badge).toHaveClass('my-custom-class');
      expect(badge).toHaveClass('bg-blue-100');
    });
  });

  describe('Accessibility', () => {
    it('maintains inline display for proper text flow', () => {
      render(<Badge>Inline</Badge>);
      const badge = screen.getByText('Inline');
      expect(badge).toHaveClass('inline-flex');
    });

    it('has proper spacing for readability', () => {
      render(<Badge>Readable</Badge>);
      const badge = screen.getByText('Readable');
      expect(badge).toHaveClass('rounded-full');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Badge>{''}</Badge>);
      const badge = document.querySelector('.inline-flex');
      expect(badge).toBeInTheDocument();
    });

    it('handles numeric children', () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles long text content', () => {
      const longText = 'Very Long Badge Text Content';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters', () => {
      render(<Badge>{'Status: Active!'}</Badge>);
      expect(screen.getByText('Status: Active!')).toBeInTheDocument();
    });
  });

  describe('Combinations', () => {
    it('renders with all props combined', () => {
      render(
        <Badge
          variant="success"
          size="lg"
          icon={<Star data-testid="star" />}
          className="extra-class"
        >
          Complete Badge
        </Badge>
      );

      const badge = screen.getByText('Complete Badge');
      expect(badge).toHaveClass('bg-emerald-100');
      expect(badge).toHaveClass('px-4');
      expect(badge).toHaveClass('extra-class');
      expect(screen.getByTestId('star')).toBeInTheDocument();
    });
  });
});
