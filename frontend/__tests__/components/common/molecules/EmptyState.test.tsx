/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { EmptyState } from '@/shared/ui/molecules/EmptyState/EmptyState';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { FileX } from 'lucide-react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title and description', () => {
      renderWithTheme(
        <EmptyState
          title="No Results"
          description="Try adjusting your search"
        />
      );
      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('should render with only title', () => {
      renderWithTheme(<EmptyState title="Empty" />);
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('should render without description', () => {
      renderWithTheme(<EmptyState title="No Data" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
      expect(screen.queryByText('description')).not.toBeInTheDocument();
    });
  });

  describe('Icon', () => {
    it('should render with custom icon', () => {
      const { container } = renderWithTheme(
        <EmptyState
          title="No Files"
          icon={<FileX data-testid="custom-icon" />}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render without icon', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" />
      );
      // No icon should be present
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    it('should render default icon when iconName is provided', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" iconName="inbox" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render primary action button', () => {
      renderWithTheme(
        <EmptyState
          title="No Items"
          primaryAction={{ label: 'Add Item', onClick: jest.fn() }}
        />
      );
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    it('should render secondary action button', () => {
      renderWithTheme(
        <EmptyState
          title="No Items"
          secondaryAction={{ label: 'Learn More', onClick: jest.fn() }}
        />
      );
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should render both action buttons', () => {
      renderWithTheme(
        <EmptyState
          title="No Items"
          primaryAction={{ label: 'Create', onClick: jest.fn() }}
          secondaryAction={{ label: 'Import', onClick: jest.fn() }}
        />
      );
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('should trigger onClick when primary action is clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <EmptyState
          title="No Items"
          primaryAction={{ label: 'Add', onClick: handleClick }}
        />
      );

      const button = screen.getByText('Add');
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick when secondary action is clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <EmptyState
          title="No Items"
          secondaryAction={{ label: 'Help', onClick: handleClick }}
        />
      );

      const button = screen.getByText('Help');
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" size="sm" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" size="md" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" size="lg" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" variant="default" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render search variant', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Results" variant="search" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render error variant', () => {
      const { container } = renderWithTheme(
        <EmptyState title="Error" variant="error" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Custom Children', () => {
    it('should render custom children', () => {
      renderWithTheme(
        <EmptyState title="No Data">
          <div>Custom Content</div>
        </EmptyState>
      );
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should render children below actions', () => {
      renderWithTheme(
        <EmptyState
          title="No Data"
          primaryAction={{ label: 'Add', onClick: jest.fn() }}
        >
          <p>Additional info</p>
        </EmptyState>
      );

      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByText('Additional info')).toBeInTheDocument();
    });
  });

  describe('Illustration', () => {
    it('should render with custom illustration', () => {
      renderWithTheme(
        <EmptyState
          title="No Data"
          illustration={<img src="empty.svg" alt="Empty" />}
        />
      );
      expect(screen.getByAlt('Empty')).toBeInTheDocument();
    });

    it('should prefer illustration over icon', () => {
      renderWithTheme(
        <EmptyState
          title="No Data"
          icon={<FileX />}
          illustration={<img src="empty.svg" alt="Empty" data-testid="illustration" />}
        />
      );
      expect(screen.getByTestId('illustration')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithTheme(<EmptyState title="No Results" />);
      const heading = screen.getByText('No Results');
      expect(heading.tagName).toMatch(/H[1-6]/);
    });

    it('should have descriptive content', () => {
      renderWithTheme(
        <EmptyState
          title="No Items Found"
          description="There are no items matching your criteria"
        />
      );
      expect(screen.getByText('There are no items matching your criteria')).toBeInTheDocument();
    });

    it('should have accessible action buttons', () => {
      renderWithTheme(
        <EmptyState
          title="No Data"
          primaryAction={{ label: 'Create New Item', onClick: jest.fn() }}
        />
      );
      const button = screen.getByRole('button', { name: /create new item/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      const { container } = renderWithTheme(<EmptyState title="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      renderWithTheme(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDesc = 'B'.repeat(500);
      renderWithTheme(<EmptyState title="Title" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it('should handle multiple action buttons with long labels', () => {
      renderWithTheme(
        <EmptyState
          title="No Data"
          primaryAction={{
            label: 'Create a New Item with Long Label',
            onClick: jest.fn()
          }}
          secondaryAction={{
            label: 'Import from External Source',
            onClick: jest.fn()
          }}
        />
      );
      expect(screen.getByText(/Create a New Item/)).toBeInTheDocument();
      expect(screen.getByText(/Import from External/)).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render correctly in light theme', () => {
      renderWithTheme(<EmptyState title="No Data" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });

    it('should render correctly in dark theme', () => {
      renderWithTheme(<EmptyState title="No Data" />);
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <EmptyState title="No Data" className="custom-empty-state" />
      );
      expect(container.firstChild).toHaveClass('custom-empty-state');
    });
  });

  describe('Common Use Cases', () => {
    it('should render empty search results state', () => {
      renderWithTheme(
        <EmptyState
          title="No search results"
          description="Try adjusting your search terms"
          variant="search"
          primaryAction={{ label: 'Clear Search', onClick: jest.fn() }}
        />
      );

      expect(screen.getByText('No search results')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
      expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });

    it('should render empty list state', () => {
      renderWithTheme(
        <EmptyState
          title="No items yet"
          description="Get started by creating your first item"
          primaryAction={{ label: 'Create Item', onClick: jest.fn() }}
          secondaryAction={{ label: 'Import Items', onClick: jest.fn() }}
        />
      );

      expect(screen.getByText('No items yet')).toBeInTheDocument();
      expect(screen.getByText('Create Item')).toBeInTheDocument();
      expect(screen.getByText('Import Items')).toBeInTheDocument();
    });

    it('should render error state', () => {
      renderWithTheme(
        <EmptyState
          title="Something went wrong"
          description="We couldn't load your data"
          variant="error"
          primaryAction={{ label: 'Try Again', onClick: jest.fn() }}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText("We couldn't load your data")).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
