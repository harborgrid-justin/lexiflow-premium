/**
 * @module components/enterprise/data/DataGridPagination.test
 * @description Unit tests for DataGridPagination component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGridPagination } from './DataGridPagination';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps = {
  currentPage: 0,
  totalPages: 10,
  pageSize: 10,
  totalRows: 100,
  onPageChange: jest.fn(),
};

const renderPagination = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DataGridPagination {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DataGridPagination rendering', () => {
  it('should render pagination controls', () => {
    renderPagination();

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Last page')).toBeInTheDocument();
  });

  it('should display correct row range', () => {
    renderPagination({ currentPage: 0, pageSize: 10, totalRows: 100 });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should display correct row range for middle page', () => {
    renderPagination({ currentPage: 4, pageSize: 10, totalRows: 100 });

    expect(screen.getByText('41')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should display correct row range for last page with partial data', () => {
    renderPagination({ currentPage: 9, pageSize: 10, totalRows: 95 });

    expect(screen.getByText('91')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('should not render when totalRows is 0', () => {
    const { container } = renderPagination({ totalRows: 0 });
    expect(container.firstChild).toBeNull();
  });

  it('should render page size selector when enabled', () => {
    renderPagination({ showPageSizeSelector: true, onPageSizeChange: jest.fn() });

    expect(screen.getByLabelText(/Show:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should not render page size selector when disabled', () => {
    renderPagination({ showPageSizeSelector: false });

    expect(screen.queryByLabelText(/Show:/i)).not.toBeInTheDocument();
  });

  it('should render page jumper when enabled and multiple pages exist', () => {
    renderPagination({ showPageJumper: true, totalPages: 10 });

    expect(screen.getByLabelText(/Go to:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('#')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('should not render page jumper when only one page', () => {
    renderPagination({ showPageJumper: true, totalPages: 1 });

    expect(screen.queryByLabelText(/Go to:/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// PAGE NAVIGATION TESTS
// ============================================================================

describe('DataGridPagination navigation', () => {
  it('should call onPageChange with 0 when clicking first page', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 5, onPageChange });

    await userEvent.click(screen.getByTitle('First page'));

    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it('should call onPageChange with previous page when clicking previous', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 5, onPageChange });

    await userEvent.click(screen.getByTitle('Previous page'));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('should call onPageChange with next page when clicking next', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 5, onPageChange });

    await userEvent.click(screen.getByTitle('Next page'));

    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('should call onPageChange with last page when clicking last', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 5, totalPages: 10, onPageChange });

    await userEvent.click(screen.getByTitle('Last page'));

    expect(onPageChange).toHaveBeenCalledWith(9);
  });

  it('should disable first and previous buttons on first page', () => {
    renderPagination({ currentPage: 0 });

    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
  });

  it('should disable next and last buttons on last page', () => {
    renderPagination({ currentPage: 9, totalPages: 10 });

    expect(screen.getByTitle('Next page')).toBeDisabled();
    expect(screen.getByTitle('Last page')).toBeDisabled();
  });

  it('should enable all navigation buttons on middle page', () => {
    renderPagination({ currentPage: 5, totalPages: 10 });

    expect(screen.getByTitle('First page')).not.toBeDisabled();
    expect(screen.getByTitle('Previous page')).not.toBeDisabled();
    expect(screen.getByTitle('Next page')).not.toBeDisabled();
    expect(screen.getByTitle('Last page')).not.toBeDisabled();
  });
});

// ============================================================================
// PAGE NUMBER TESTS
// ============================================================================

describe('DataGridPagination page numbers', () => {
  it('should display all page numbers when total pages is small', () => {
    renderPagination({ totalPages: 5 });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('should show ellipsis for many pages', () => {
    renderPagination({ currentPage: 5, totalPages: 20 });

    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('should highlight current page', () => {
    renderPagination({ currentPage: 2, totalPages: 5 });

    const currentPageButton = screen.getByRole('button', { name: '3' });
    expect(currentPageButton).toHaveClass('bg-blue-500');
  });

  it('should call onPageChange when clicking page number', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 0, totalPages: 5, onPageChange });

    await userEvent.click(screen.getByRole('button', { name: '3' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should always show first and last page numbers', () => {
    renderPagination({ currentPage: 10, totalPages: 20 });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
  });
});

// ============================================================================
// PAGE SIZE SELECTOR TESTS
// ============================================================================

describe('DataGridPagination page size selector', () => {
  it('should render with default page size options', () => {
    renderPagination({ onPageSizeChange: jest.fn() });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check default options
    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '250' })).toBeInTheDocument();
  });

  it('should render with custom page size options', () => {
    renderPagination({
      onPageSizeChange: jest.fn(),
      pageSizeOptions: [5, 15, 30],
    });

    expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '15' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '30' })).toBeInTheDocument();
  });

  it('should show current page size as selected', () => {
    renderPagination({ pageSize: 25, onPageSizeChange: jest.fn() });

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('25');
  });

  it('should call onPageSizeChange and reset to first page when changing size', async () => {
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();

    renderPagination({
      currentPage: 5,
      onPageChange,
      onPageSizeChange,
    });

    await userEvent.selectOptions(screen.getByRole('combobox'), '50');

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});

// ============================================================================
// PAGE JUMPER TESTS
// ============================================================================

describe('DataGridPagination page jumper', () => {
  it('should allow typing in page number', async () => {
    renderPagination({ showPageJumper: true });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '5');

    expect(input).toHaveValue(5);
  });

  it('should navigate to page when clicking Go button', async () => {
    const onPageChange = jest.fn();
    renderPagination({ showPageJumper: true, totalPages: 10, onPageChange });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(onPageChange).toHaveBeenCalledWith(4); // 0-indexed
  });

  it('should navigate to page when pressing Enter', async () => {
    const onPageChange = jest.fn();
    renderPagination({ showPageJumper: true, totalPages: 10, onPageChange });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '7');
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });

    expect(onPageChange).toHaveBeenCalledWith(6); // 0-indexed
  });

  it('should not navigate for invalid page numbers', async () => {
    const onPageChange = jest.fn();
    renderPagination({ showPageJumper: true, totalPages: 10, onPageChange });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '15');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should not navigate for page 0', async () => {
    const onPageChange = jest.fn();
    renderPagination({ showPageJumper: true, totalPages: 10, onPageChange });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '0');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should clear input after successful navigation', async () => {
    const onPageChange = jest.fn();
    renderPagination({ showPageJumper: true, totalPages: 10, onPageChange });

    const input = screen.getByPlaceholderText('#');
    await userEvent.type(input, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(input).toHaveValue(null);
  });

  it('should have min and max attributes on input', () => {
    renderPagination({ showPageJumper: true, totalPages: 10 });

    const input = screen.getByPlaceholderText('#');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '10');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DataGridPagination accessibility', () => {
  it('should have accessible button titles', () => {
    renderPagination();

    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Last page')).toBeInTheDocument();
  });

  it('should have labeled form controls', () => {
    renderPagination({
      showPageSizeSelector: true,
      showPageJumper: true,
      onPageSizeChange: jest.fn(),
    });

    expect(screen.getByLabelText(/Show:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Go to:/i)).toBeInTheDocument();
  });

  it('should disable buttons appropriately', () => {
    renderPagination({ currentPage: 0, totalPages: 1 });

    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
    expect(screen.getByTitle('Next page')).toBeDisabled();
    expect(screen.getByTitle('Last page')).toBeDisabled();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DataGridPagination edge cases', () => {
  it('should handle single page correctly', () => {
    renderPagination({ currentPage: 0, totalPages: 1, totalRows: 5 });

    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
    expect(screen.getByTitle('Next page')).toBeDisabled();
    expect(screen.getByTitle('Last page')).toBeDisabled();
  });

  it('should handle two pages correctly', () => {
    renderPagination({ currentPage: 0, totalPages: 2, totalRows: 20 });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('should handle large page numbers', () => {
    renderPagination({ currentPage: 999, totalPages: 1000, totalRows: 10000 });

    expect(screen.getByRole('button', { name: '1000' })).toBeInTheDocument();
  });

  it('should prevent previous navigation on first page', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 0, onPageChange });

    // Button is disabled, but test the click anyway
    await userEvent.click(screen.getByTitle('Previous page'));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should prevent next navigation on last page', async () => {
    const onPageChange = jest.fn();
    renderPagination({ currentPage: 9, totalPages: 10, onPageChange });

    // Button is disabled, but test the click anyway
    await userEvent.click(screen.getByTitle('Next page'));

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
