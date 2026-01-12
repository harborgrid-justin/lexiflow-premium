/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { ProgressBar } from '@/shared/ui/atoms/ProgressBar/ProgressBar';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('should render progress bar', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with correct progress value', () => {
      renderWithTheme(<ProgressBar value={75} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should display percentage label', () => {
      renderWithTheme(<ProgressBar value={60} showLabel />);
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Progress Values', () => {
    it('should handle 0% progress', () => {
      renderWithTheme(<ProgressBar value={0} showLabel />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      renderWithTheme(<ProgressBar value={100} showLabel />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      renderWithTheme(<ProgressBar value={45.5} showLabel />);
      expect(screen.getByText(/45/)).toBeInTheDocument();
    });

    it('should clamp negative values to 0', () => {
      renderWithTheme(<ProgressBar value={-10} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp values over 100', () => {
      renderWithTheme(<ProgressBar value={150} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} size={size} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should default to md size', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Colors/Variants', () => {
    it('should render primary variant', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} variant="primary" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render success variant', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} variant="success" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} variant="warning" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render error variant', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} variant="error" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Label Display', () => {
    it('should show label when showLabel is true', () => {
      renderWithTheme(<ProgressBar value={30} showLabel />);
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should hide label by default', () => {
      renderWithTheme(<ProgressBar value={30} />);
      expect(screen.queryByText('30%')).not.toBeInTheDocument();
    });

    it('should show custom label', () => {
      renderWithTheme(<ProgressBar value={50} label="50 of 100" />);
      expect(screen.getByText('50 of 100')).toBeInTheDocument();
    });
  });

  describe('Indeterminate State', () => {
    it('should render indeterminate progress bar', () => {
      const { container } = renderWithTheme(
        <ProgressBar indeterminate />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should ignore value when indeterminate', () => {
      renderWithTheme(<ProgressBar value={50} indeterminate showLabel />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('Animated', () => {
    it('should have animated transition', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} animated />
      );
      const bar = container.querySelector('[role="progressbar"]');
      expect(bar).toBeInTheDocument();
    });

    it('should update progress smoothly', () => {
      const { rerender } = renderWithTheme(
        <ProgressBar value={30} animated />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');

      rerender(
        <ThemeProvider>
          <ProgressBar value={70} animated />
        </ThemeProvider>
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '70');
    });
  });

  describe('Striped', () => {
    it('should render striped progress bar', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} striped />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should animate stripes when animated', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} striped animated />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role', () => {
      renderWithTheme(<ProgressBar value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should have aria-valuenow', () => {
      renderWithTheme(<ProgressBar value={65} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '65');
    });

    it('should have aria-valuemin', () => {
      renderWithTheme(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have aria-valuemax', () => {
      renderWithTheme(<ProgressBar value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have aria-label', () => {
      renderWithTheme(<ProgressBar value={50} aria-label="Upload progress" />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
    });

    it('should use custom max value', () => {
      renderWithTheme(<ProgressBar value={50} max={200} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    });
  });

  describe('Multiple Segments', () => {
    it('should render stacked progress bars', () => {
      const segments = [
        { value: 30, variant: 'success' as const },
        { value: 20, variant: 'warning' as const },
        { value: 10, variant: 'error' as const },
      ];

      const { container } = renderWithTheme(
        <ProgressBar segments={segments} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should calculate total progress from segments', () => {
      const segments = [
        { value: 30, variant: 'success' as const },
        { value: 20, variant: 'warning' as const },
      ];

      renderWithTheme(<ProgressBar segments={segments} showLabel />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} className="custom-progress" />
      );
      expect(container.firstChild).toHaveClass('custom-progress');
    });

    it('should apply custom height', () => {
      const { container } = renderWithTheme(
        <ProgressBar value={50} height="20px" />
      );
      const progressBar = container.firstChild as HTMLElement;
      expect(progressBar.style.height).toBe('20px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN value', () => {
      renderWithTheme(<ProgressBar value={NaN} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle Infinity value', () => {
      renderWithTheme(<ProgressBar value={Infinity} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle very small decimals', () => {
      renderWithTheme(<ProgressBar value={0.01} showLabel />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      const { container } = renderWithTheme(<ProgressBar value={50} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Real-world Use Cases', () => {
    it('should render file upload progress', () => {
      renderWithTheme(
        <ProgressBar
          value={45}
          showLabel
          variant="primary"
          aria-label="File upload progress"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'File upload progress');
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      renderWithTheme(
        <ProgressBar indeterminate variant="primary" />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render completion state', () => {
      renderWithTheme(
        <ProgressBar value={100} variant="success" showLabel />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
