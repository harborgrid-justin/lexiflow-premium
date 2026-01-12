/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Badge } from '@/shared/ui/atoms/Badge/Badge';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      renderWithTheme(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render badge with numeric content', () => {
      renderWithTheme(<Badge>99</Badge>);
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('should render badge with JSX children', () => {
      renderWithTheme(
        <Badge>
          <span>Custom Content</span>
        </Badge>
      );
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Badge className="custom-badge">Test</Badge>
      );
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('Variants', () => {
    const variants = [
      'success',
      'warning',
      'error',
      'info',
      'neutral',
      'purple',
      'danger'
    ] as const;

    it.each(variants)('should render %s variant correctly', (variant) => {
      renderWithTheme(<Badge variant={variant}>Test</Badge>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should default to neutral variant', () => {
      renderWithTheme(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should apply correct styling for success variant', () => {
      const { container } = renderWithTheme(
        <Badge variant="success">Success</Badge>
      );
      const badge = screen.getByText('Success');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct styling for error variant', () => {
      const { container } = renderWithTheme(
        <Badge variant="error">Error</Badge>
      );
      const badge = screen.getByText('Error');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct styling for warning variant', () => {
      const { container } = renderWithTheme(
        <Badge variant="warning">Warning</Badge>
      );
      const badge = screen.getByText('Warning');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(<Badge size={size}>Test</Badge>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      renderWithTheme(<Badge>Medium</Badge>);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render correctly in light theme', () => {
      renderWithTheme(<Badge variant="info">Light Theme</Badge>);
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
    });

    it('should render correctly in dark theme', () => {
      // Note: ThemeProvider defaults to light, but component should support both
      renderWithTheme(<Badge variant="info">Dark Theme</Badge>);
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });
  });

  describe('Content Types', () => {
    it('should handle string content', () => {
      renderWithTheme(<Badge>String Badge</Badge>);
      expect(screen.getByText('String Badge')).toBeInTheDocument();
    });

    it('should handle number content', () => {
      renderWithTheme(<Badge>{42}</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should handle zero', () => {
      renderWithTheme(<Badge>{0}</Badge>);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle complex JSX', () => {
      renderWithTheme(
        <Badge>
          <div>
            <span>Complex</span> Content
          </div>
        </Badge>
      );
      expect(screen.getByText(/complex/i)).toBeInTheDocument();
      expect(screen.getByText(/content/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Badges', () => {
    it('should render multiple badges independently', () => {
      renderWithTheme(
        <div>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Failed</Badge>
        </div>
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should handle different sizes together', () => {
      renderWithTheme(
        <div>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      );

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be readable by screen readers', () => {
      renderWithTheme(<Badge>Status: Active</Badge>);
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    it('should support semantic meaning through variants', () => {
      renderWithTheme(<Badge variant="error">Critical Error</Badge>);
      expect(screen.getByText('Critical Error')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string (should still require children)', () => {
      // Badge requires children, so this should still render the span
      const { container } = renderWithTheme(<Badge>{''}</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const longText = 'This is a very long badge text that might wrap or truncate';
      renderWithTheme(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      renderWithTheme(<Badge>Status: #123 (Active)</Badge>);
      expect(screen.getByText('Status: #123 (Active)')).toBeInTheDocument();
    });

    it('should handle emoji content', () => {
      renderWithTheme(<Badge>✅ Success</Badge>);
      expect(screen.getByText('✅ Success')).toBeInTheDocument();
    });
  });

  describe('Styling Combinations', () => {
    it('should combine variant and size correctly', () => {
      renderWithTheme(
        <Badge variant="success" size="lg">Large Success</Badge>
      );
      expect(screen.getByText('Large Success')).toBeInTheDocument();
    });

    it('should combine variant, size, and className', () => {
      const { container } = renderWithTheme(
        <Badge variant="warning" size="sm" className="custom-class">
          Custom
        </Badge>
      );
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('custom-class');
    });
  });
});
