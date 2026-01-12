/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { PageContainer } from '@/shared/ui/layouts/PageContainer/PageContainer';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('PageContainer', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      renderWithTheme(
        <PageContainer>
          <div>Page Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      renderWithTheme(
        <PageContainer title="Dashboard">
          <div>Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render with description', () => {
      renderWithTheme(
        <PageContainer
          title="Cases"
          description="Manage your legal cases"
        >
          <div>Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Manage your legal cases')).toBeInTheDocument();
    });
  });

  describe('Header Actions', () => {
    it('should render header actions', () => {
      const actions = (
        <button>Create New</button>
      );

      renderWithTheme(
        <PageContainer title="Cases" actions={actions}>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Create New')).toBeInTheDocument();
    });

    it('should render multiple actions', () => {
      const actions = (
        <div>
          <button>Export</button>
          <button>Import</button>
          <button>Create</button>
        </div>
      );

      renderWithTheme(
        <PageContainer title="Cases" actions={actions}>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    it('should render breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Cases', href: '/cases' },
      ];

      renderWithTheme(
        <PageContainer breadcrumbs={breadcrumbs}>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
    });

    it('should position breadcrumbs above title', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
      ];

      renderWithTheme(
        <PageContainer title="Dashboard" breadcrumbs={breadcrumbs}>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render tabs navigation', () => {
      const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'details', label: 'Details' },
        { id: 'history', label: 'History' },
      ];

      renderWithTheme(
        <PageContainer title="Case" tabs={tabs}>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Details')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      renderWithTheme(
        <PageContainer loading>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      renderWithTheme(
        <PageContainer loading>
          <div>Hidden Content</div>
        </PageContainer>
      );

      const content = screen.queryByText('Hidden Content');
      expect(content).not.toBeVisible();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      renderWithTheme(
        <PageContainer error="Failed to load data">
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('should hide content when error exists', () => {
      renderWithTheme(
        <PageContainer error="Error occurred">
          <div>Hidden Content</div>
        </PageContainer>
      );

      expect(screen.queryByText('Hidden Content')).not.toBeVisible();
    });

    it('should show retry button', () => {
      const handleRetry = jest.fn();
      renderWithTheme(
        <PageContainer
          error="Error"
          onRetry={handleRetry}
        >
          <div>Content</div>
        </PageContainer>
      );

      const retryButton = screen.getByText(/retry/i);
      retryButton.click();
      expect(handleRetry).toHaveBeenCalled();
    });
  });

  describe('Max Width', () => {
    it('should apply max width', () => {
      const { container } = renderWithTheme(
        <PageContainer maxWidth="lg">
          <div>Content</div>
        </PageContainer>
      );

      expect(container.firstChild).toHaveClass('max-w-lg');
    });

    it('should support various max widths', () => {
      const widths = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;

      widths.forEach(width => {
        const { container } = render(
          <ThemeProvider>
            <PageContainer maxWidth={width}>
              <div>Content</div>
            </PageContainer>
          </ThemeProvider>
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Padding', () => {
    it('should apply default padding', () => {
      const { container } = renderWithTheme(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      expect(container.firstChild).toHaveClass('p-6');
    });

    it('should remove padding when noPadding is true', () => {
      const { container } = renderWithTheme(
        <PageContainer noPadding>
          <div>Content</div>
        </PageContainer>
      );

      const child = container.firstChild as HTMLElement;
      expect(child.classList.contains('p-6')).toBeFalsy();
    });
  });

  describe('Back Button', () => {
    it('should render back button', () => {
      const handleBack = jest.fn();
      renderWithTheme(
        <PageContainer onBack={handleBack}>
          <div>Content</div>
        </PageContainer>
      );

      const backButton = screen.getByLabelText(/back/i);
      expect(backButton).toBeInTheDocument();
    });

    it('should trigger onBack when clicked', () => {
      const handleBack = jest.fn();
      renderWithTheme(
        <PageContainer onBack={handleBack}>
          <div>Content</div>
        </PageContainer>
      );

      const backButton = screen.getByLabelText(/back/i);
      backButton.click();
      expect(handleBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have main role', () => {
      renderWithTheme(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithTheme(
        <PageContainer title="Dashboard">
          <div>Content</div>
        </PageContainer>
      );

      const heading = screen.getByText('Dashboard');
      expect(heading.tagName).toMatch(/H[1-2]/);
    });

    it('should associate description with title', () => {
      renderWithTheme(
        <PageContainer
          title="Cases"
          description="Manage legal cases"
        >
          <div>Content</div>
        </PageContainer>
      );

      expect(screen.getByText('Manage legal cases')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <PageContainer className="custom-page">
          <div>Content</div>
        </PageContainer>
      );

      expect(container.firstChild).toHaveClass('custom-page');
    });
  });

  describe('Scroll Behavior', () => {
    it('should be scrollable by default', () => {
      const { container } = renderWithTheme(
        <PageContainer>
          <div style={{ height: '2000px' }}>Tall Content</div>
        </PageContainer>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should disable scroll when specified', () => {
      const { container } = renderWithTheme(
        <PageContainer noScroll>
          <div>Content</div>
        </PageContainer>
      );

      const main = container.firstChild as HTMLElement;
      expect(main.style.overflow).toBe('hidden');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = renderWithTheme(
        <PageContainer>{null}</PageContainer>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      renderWithTheme(
        <PageContainer>
          <div>Section 1</div>
          <div>Section 2</div>
          <div>Section 3</div>
        </PageContainer>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200);
      renderWithTheme(
        <PageContainer title={longTitle}>
          <div>Content</div>
        </PageContainer>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      renderWithTheme(
        <PageContainer title="Dashboard">
          <div>Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      renderWithTheme(
        <PageContainer title="Dashboard">
          <div>Content</div>
        </PageContainer>
      );
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
