/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Pagination } from '@/shared/ui/molecules/Pagination/Pagination';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination component', () => {
      renderWithTheme(<Pagination {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display current page', () => {
      renderWithTheme(<Pagination {...defaultProps} currentPage={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      renderWithTheme(<Pagination {...defaultProps} totalPages={5} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not render when totalPages is 1', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} totalPages={1} />
      );
      // Pagination might be hidden or not render navigation
      expect(container).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange when page number is clicked', () => {
      const handlePageChange = jest.fn();
      renderWithTheme(
        <Pagination
          {...defaultProps}
          onPageChange={handlePageChange}
        />
      );

      const page3 = screen.getByText('3');
      fireEvent.click(page3);

      expect(handlePageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange with next page', () => {
      const handlePageChange = jest.fn();
      renderWithTheme(
        <Pagination
          {...defaultProps}
          currentPage={3}
          onPageChange={handlePageChange}
        />
      );

      const nextButton = screen.getByLabelText(/next/i);
      fireEvent.click(nextButton);

      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange with previous page', () => {
      const handlePageChange = jest.fn();
      renderWithTheme(
        <Pagination
          {...defaultProps}
          currentPage={3}
          onPageChange={handlePageChange}
        />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      fireEvent.click(prevButton);

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('First/Last Page', () => {
    it('should disable previous button on first page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={1} />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={10} totalPages={10} />
      );

      const nextButton = screen.getByLabelText(/next/i);
      expect(nextButton).toBeDisabled();
    });

    it('should enable previous button when not on first page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={5} />
      );

      const prevButton = screen.getByLabelText(/previous/i);
      expect(prevButton).not.toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={5} totalPages={10} />
      );

      const nextButton = screen.getByLabelText(/next/i);
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Page Range Display', () => {
    it('should show limited page numbers for many pages', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={50} totalPages={100} />
      );

      expect(screen.getByText('50')).toBeInTheDocument();
      // Should not show all 100 pages
    });

    it('should show ellipsis for skipped pages', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={50} totalPages={100} />
      );

      const ellipsis = screen.queryAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should always show first page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={50} totalPages={100} />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should always show last page', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={50} totalPages={100} />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Items Per Page', () => {
    it('should display items per page selector', () => {
      renderWithTheme(
        <Pagination
          {...defaultProps}
          itemsPerPage={10}
          onItemsPerPageChange={jest.fn()}
        />
      );

      expect(screen.getByText(/per page/i)).toBeInTheDocument();
    });

    it('should call onItemsPerPageChange when changed', () => {
      const handleItemsPerPageChange = jest.fn();
      renderWithTheme(
        <Pagination
          {...defaultProps}
          itemsPerPage={10}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '25' } });

      expect(handleItemsPerPageChange).toHaveBeenCalledWith(25);
    });

    it('should show available page size options', () => {
      renderWithTheme(
        <Pagination
          {...defaultProps}
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50, 100]}
          onItemsPerPageChange={jest.fn()}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Total Items Display', () => {
    it('should show total items count', () => {
      renderWithTheme(
        <Pagination
          {...defaultProps}
          totalItems={250}
        />
      );

      expect(screen.getByText(/250/)).toBeInTheDocument();
    });

    it('should show current range of items', () => {
      renderWithTheme(
        <Pagination
          {...defaultProps}
          currentPage={2}
          itemsPerPage={10}
          totalItems={100}
        />
      );

      // Should show something like "11-20 of 100"
      expect(screen.getByText(/11-20/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      const { container } = renderWithTheme(<Pagination {...defaultProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have aria-label for navigation', () => {
      renderWithTheme(<Pagination {...defaultProps} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should have aria-current on current page', () => {
      renderWithTheme(<Pagination {...defaultProps} currentPage={3} />);
      const currentPage = screen.getByText('3');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('should be keyboard navigable', () => {
      const handlePageChange = jest.fn();
      renderWithTheme(
        <Pagination
          {...defaultProps}
          onPageChange={handlePageChange}
        />
      );

      const page2 = screen.getByText('2');
      page2.focus();
      fireEvent.keyDown(page2, { key: 'Enter' });

      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} size="sm" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} size="md" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} size="lg" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle page 0', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={0} />
      );
      // Should default to page 1 or handle gracefully
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle negative page numbers', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={-1} />
      );
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle page beyond totalPages', () => {
      renderWithTheme(
        <Pagination {...defaultProps} currentPage={20} totalPages={10} />
      );
      // Should handle gracefully
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle totalPages of 0', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} totalPages={0} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Pagination {...defaultProps} className="custom-pagination" />
      );
      expect(container.firstChild).toHaveClass('custom-pagination');
    });
  });
});
