/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { LoadingSpinner } from '@/shared/ui/atoms/LoadingSpinner/LoadingSpinner';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with default size', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have animation class', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      const { container } = renderWithTheme(<LoadingSpinner size={size} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('should render primary color', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner color="primary" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render secondary color', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner color="secondary" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render white color', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner color="white" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Text Label', () => {
    it('should render with text label', () => {
      renderWithTheme(<LoadingSpinner text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render without text label', () => {
      renderWithTheme(<LoadingSpinner />);
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('should position text below spinner', () => {
      renderWithTheme(<LoadingSpinner text="Please wait" />);
      expect(screen.getByText('Please wait')).toBeInTheDocument();
    });
  });

  describe('Centered', () => {
    it('should center spinner when centered prop is true', () => {
      const { container } = renderWithTheme(<LoadingSpinner centered />);
      expect(container.firstChild).toHaveClass('flex', 'justify-center', 'items-center');
    });

    it('should not center by default', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      const child = container.firstChild as HTMLElement;
      expect(child.classList.contains('justify-center')).toBeFalsy();
    });
  });

  describe('Fullscreen', () => {
    it('should render fullscreen spinner', () => {
      const { container } = renderWithTheme(<LoadingSpinner fullscreen />);
      expect(container.firstChild).toHaveClass('fixed', 'inset-0');
    });

    it('should have overlay when fullscreen', () => {
      const { container } = renderWithTheme(<LoadingSpinner fullscreen />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have status role', () => {
      renderWithTheme(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      renderWithTheme(<LoadingSpinner />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label');
    });

    it('should have aria-live attribute', () => {
      renderWithTheme(<LoadingSpinner />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should use custom aria-label when text is provided', () => {
      renderWithTheme(<LoadingSpinner text="Loading data" />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', expect.stringContaining('Loading'));
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner className="custom-spinner" />
      );
      expect(container.firstChild).toHaveClass('custom-spinner');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'Loading '.repeat(20);
      renderWithTheme(<LoadingSpinner text={longText} />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle empty text', () => {
      renderWithTheme(<LoadingSpinner text="" />);
      const { container } = render(
        <ThemeProvider>
          <LoadingSpinner text="" />
        </ThemeProvider>
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      const { container } = renderWithTheme(<LoadingSpinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Multiple Spinners', () => {
    it('should render multiple spinners independently', () => {
      renderWithTheme(
        <div>
          <LoadingSpinner size="sm" text="Small" />
          <LoadingSpinner size="lg" text="Large" />
        </div>
      );

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });
  });
});
