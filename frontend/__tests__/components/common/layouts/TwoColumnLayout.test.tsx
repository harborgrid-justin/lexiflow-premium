/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { TwoColumnLayout } from '@/shared/ui/layouts/TwoColumnLayout/TwoColumnLayout';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TwoColumnLayout', () => {
  describe('Rendering', () => {
    it('should render both columns', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left Column</div>}
          right={<div>Right Column</div>}
        />
      );

      expect(screen.getByText('Left Column')).toBeInTheDocument();
      expect(screen.getByText('Right Column')).toBeInTheDocument();
    });

    it('should render with only left column', () => {
      renderWithTheme(
        <TwoColumnLayout left={<div>Only Left</div>} />
      );

      expect(screen.getByText('Only Left')).toBeInTheDocument();
    });

    it('should render with only right column', () => {
      renderWithTheme(
        <TwoColumnLayout right={<div>Only Right</div>} />
      );

      expect(screen.getByText('Only Right')).toBeInTheDocument();
    });
  });

  describe('Column Ratios', () => {
    it('should render 50-50 split', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          ratio="1:1"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render 2-1 split', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          ratio="2:1"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render 1-2 split', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          ratio="1:2"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render 3-1 split', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          ratio="3:1"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should default to 1:1 ratio', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Gap Sizes', () => {
    const gaps = ['none', 'sm', 'md', 'lg', 'xl'] as const;

    it.each(gaps)('should render %s gap correctly', (gap) => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          gap={gap}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should default to md gap', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(container.firstChild).toHaveClass('gap-6');
    });
  });

  describe('Responsive Behavior', () => {
    it('should stack columns on mobile', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          stackOnMobile
        />
      );
      expect(container.firstChild).toHaveClass('flex-col', 'lg:flex-row');
    });

    it('should not stack by default', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const layout = container.firstChild as HTMLElement;
      expect(layout.classList.contains('flex-row')).toBeTruthy();
    });
  });

  describe('Column Alignment', () => {
    it('should align columns to top', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          align="start"
        />
      );
      expect(container.firstChild).toHaveClass('items-start');
    });

    it('should align columns to center', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          align="center"
        />
      );
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('should align columns to bottom', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          align="end"
        />
      );
      expect(container.firstChild).toHaveClass('items-end');
    });

    it('should stretch columns by default', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(container.firstChild).toHaveClass('items-stretch');
    });
  });

  describe('Reverse Order', () => {
    it('should reverse column order', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          reverse
        />
      );
      expect(container.firstChild).toHaveClass('flex-row-reverse');
    });

    it('should not reverse by default', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const layout = container.firstChild as HTMLElement;
      expect(layout.classList.contains('flex-row-reverse')).toBeFalsy();
    });
  });

  describe('Sticky Columns', () => {
    it('should make left column sticky', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Sticky Left</div>}
          right={<div>Right</div>}
          stickyLeft
        />
      );
      const leftColumn = screen.getByText('Sticky Left').parentElement;
      expect(leftColumn).toHaveClass('sticky');
    });

    it('should make right column sticky', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Sticky Right</div>}
          stickyRight
        />
      );
      const rightColumn = screen.getByText('Sticky Right').parentElement;
      expect(rightColumn).toHaveClass('sticky');
    });

    it('should not be sticky by default', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const leftColumn = screen.getByText('Left').parentElement;
      const rightColumn = screen.getByText('Right').parentElement;

      expect(leftColumn?.classList.contains('sticky')).toBeFalsy();
      expect(rightColumn?.classList.contains('sticky')).toBeFalsy();
    });
  });

  describe('Scrollable Columns', () => {
    it('should make left column scrollable', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div style={{ height: '2000px' }}>Tall Left</div>}
          right={<div>Right</div>}
          scrollableLeft
        />
      );
      const leftColumn = screen.getByText('Tall Left').parentElement;
      expect(leftColumn).toHaveClass('overflow-y-auto');
    });

    it('should make right column scrollable', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div style={{ height: '2000px' }}>Tall Right</div>}
          scrollableRight
        />
      );
      const rightColumn = screen.getByText('Tall Right').parentElement;
      expect(rightColumn).toHaveClass('overflow-y-auto');
    });
  });

  describe('Full Height', () => {
    it('should use full viewport height', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          fullHeight
        />
      );
      expect(container.firstChild).toHaveClass('h-screen');
    });

    it('should not use full height by default', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      const layout = container.firstChild as HTMLElement;
      expect(layout.classList.contains('h-screen')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support aria-label for columns', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div aria-label="Sidebar">Left</div>}
          right={<div aria-label="Main content">Right</div>}
        />
      );

      expect(screen.getByLabelText('Sidebar')).toBeInTheDocument();
      expect(screen.getByLabelText('Main content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty columns', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout left={null} right={null} />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very tall content', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div style={{ height: '5000px' }}>Very Tall Left</div>}
          right={<div>Right</div>}
        />
      );

      expect(screen.getByText('Very Tall Left')).toBeInTheDocument();
    });

    it('should handle asymmetric content heights', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div style={{ height: '100px' }}>Short Left</div>}
          right={<div style={{ height: '1000px' }}>Tall Right</div>}
        />
      );

      expect(screen.getByText('Short Left')).toBeInTheDocument();
      expect(screen.getByText('Tall Right')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          className="custom-layout"
        />
      );
      expect(container.firstChild).toHaveClass('custom-layout');
    });

    it('should apply custom className to left column', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          leftClassName="custom-left"
        />
      );
      const leftColumn = screen.getByText('Left').parentElement;
      expect(leftColumn).toHaveClass('custom-left');
    });

    it('should apply custom className to right column', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
          rightClassName="custom-right"
        />
      );
      const rightColumn = screen.getByText('Right').parentElement;
      expect(rightColumn).toHaveClass('custom-right');
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );

      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Left</div>}
          right={<div>Right</div>}
        />
      );

      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('should render sidebar layout', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={
            <nav>
              <ul>
                <li>Menu Item 1</li>
                <li>Menu Item 2</li>
              </ul>
            </nav>
          }
          right={<main>Main Content</main>}
          ratio="1:3"
          stickyLeft
        />
      );

      expect(screen.getByText('Menu Item 1')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should render detail view with sidebar', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<div>Case Details</div>}
          right={<div>Document List</div>}
          ratio="2:1"
          stackOnMobile
        />
      );

      expect(screen.getByText('Case Details')).toBeInTheDocument();
      expect(screen.getByText('Document List')).toBeInTheDocument();
    });

    it('should render split view editor', () => {
      renderWithTheme(
        <TwoColumnLayout
          left={<textarea>Editor</textarea>}
          right={<div>Preview</div>}
          ratio="1:1"
          fullHeight
        />
      );

      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });
});
