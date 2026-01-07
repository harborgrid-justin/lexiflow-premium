/**
 * DocumentFilters Component Tests
 * Enterprise-grade test suite for document filtering functionality
 *
 * @module components/features/documents/DocumentFilters.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentFilters, DocumentFilterOptions } from './DocumentFilters';

describe('DocumentFilters', () => {
  const defaultFilters: DocumentFilterOptions = {};
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  const defaultProps = {
    filters: defaultFilters,
    onChange: mockOnChange,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<DocumentFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
    });

    it('should render Filters button', () => {
      render(<DocumentFilters {...defaultProps} />);

      expect(screen.getByText(/Filters/)).toBeInTheDocument();
    });

    it('should display active filter count', () => {
      const filtersWithValues: DocumentFilterOptions = {
        type: 'Contract',
        status: 'Final',
      };

      render(<DocumentFilters {...defaultProps} filters={filtersWithValues} />);

      expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('should not display filter count when no filters active', () => {
      render(<DocumentFilters {...defaultProps} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call onChange when search input changes', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search documents...');
      await user.type(searchInput, 'contract');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should display existing search value', () => {
      const filtersWithSearch: DocumentFilterOptions = { search: 'existing query' };
      render(<DocumentFilters {...defaultProps} filters={filtersWithSearch} />);

      const searchInput = screen.getByPlaceholderText('Search documents...');
      expect(searchInput).toHaveValue('existing query');
    });
  });

  describe('Expand/Collapse', () => {
    it('should be collapsed by default', () => {
      render(<DocumentFilters {...defaultProps} />);

      expect(screen.queryByText('Document Type')).not.toBeInTheDocument();
    });

    it('should expand when Filters button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByText('Document Type')).toBeInTheDocument();
    });

    it('should collapse when Filters button is clicked again', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      expect(screen.getByText('Document Type')).toBeInTheDocument();

      await user.click(screen.getByText(/Filters/));
      expect(screen.queryByText('Document Type')).not.toBeInTheDocument();
    });
  });

  describe('Document Type Filter', () => {
    it('should render document type select when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('Document Type')).toBeInTheDocument();
    });

    it('should call onChange when type is selected', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      const typeSelect = screen.getByLabelText('Document Type');
      await user.selectOptions(typeSelect, 'Contract');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Contract' })
      );
    });

    it('should have all document type options', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      const typeSelect = screen.getByLabelText('Document Type');
      expect(within(typeSelect).getByText('All Types')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Contract')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Pleading')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Motion')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Order')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Evidence')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Correspondence')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Form')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Brief')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Exhibit')).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('should render status select when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('should call onChange when status is selected', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'Draft');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Draft' })
      );
    });

    it('should have all status options', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      const statusSelect = screen.getByLabelText('Status');
      expect(within(statusSelect).getByText('All Statuses')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Draft')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Review')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Final')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Filed')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Signed')).toBeInTheDocument();
      expect(within(statusSelect).getByText('Sent')).toBeInTheDocument();
    });
  });

  describe('Case Filter', () => {
    it('should render case select when cases are provided', async () => {
      const user = userEvent.setup();
      const cases = [
        { id: 'case-1', name: 'Smith v. Johnson' },
        { id: 'case-2', name: 'Acme v. Widget' },
      ];

      render(<DocumentFilters {...defaultProps} cases={cases} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('Case')).toBeInTheDocument();
    });

    it('should not render case select when no cases provided', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.queryByLabelText('Case')).not.toBeInTheDocument();
    });

    it('should call onChange when case is selected', async () => {
      const user = userEvent.setup();
      const cases = [{ id: 'case-1', name: 'Smith v. Johnson' }];

      render(<DocumentFilters {...defaultProps} cases={cases} />);

      await user.click(screen.getByText(/Filters/));
      const caseSelect = screen.getByLabelText('Case');
      await user.selectOptions(caseSelect, 'case-1');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ caseId: 'case-1' })
      );
    });
  });

  describe('Date Range Filters', () => {
    it('should render date range inputs when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('From Date')).toBeInTheDocument();
      expect(screen.getByLabelText('To Date')).toBeInTheDocument();
    });

    it('should call onChange when from date changes', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      const fromDate = screen.getByLabelText('From Date');
      await user.type(fromDate, '2024-01-01');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange when to date changes', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      const toDate = screen.getByLabelText('To Date');
      await user.type(toDate, '2024-12-31');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Author Filter', () => {
    it('should render author input when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('Author')).toBeInTheDocument();
    });

    it('should call onChange when author is entered', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      const authorInput = screen.getByLabelText('Author');
      await user.type(authorInput, 'John Attorney');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Special Filters', () => {
    it('should render OCR checkbox when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText(/OCR Processed Only/)).toBeInTheDocument();
    });

    it('should call onChange when OCR checkbox is checked', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      await user.click(screen.getByLabelText(/OCR Processed Only/));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ ocrProcessed: true })
      );
    });

    it('should render Privileged checkbox when expanded', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText(/Privileged Documents Only/)).toBeInTheDocument();
    });

    it('should call onChange when Privileged checkbox is checked', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));
      await user.click(screen.getByLabelText(/Privileged Documents Only/));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ isRedacted: true })
      );
    });
  });

  describe('Clear Button', () => {
    it('should show Clear button when filters are active', () => {
      const filtersWithValues: DocumentFilterOptions = { type: 'Contract' };
      render(<DocumentFilters {...defaultProps} filters={filtersWithValues} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should not show Clear button when no filters are active', () => {
      render(<DocumentFilters {...defaultProps} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('should call onClear when Clear button is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithValues: DocumentFilterOptions = { type: 'Contract' };
      render(<DocumentFilters {...defaultProps} filters={filtersWithValues} />);

      await user.click(screen.getByText('Clear'));

      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(<DocumentFilters {...defaultProps} />);

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('bg-white', 'rounded-lg', 'border');
    });

    it('should have dark mode support', () => {
      const { container } = render(<DocumentFilters {...defaultProps} />);

      const filterContainer = container.firstChild;
      expect(filterContainer).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', async () => {
      const user = userEvent.setup();
      render(<DocumentFilters {...defaultProps} />);

      await user.click(screen.getByText(/Filters/));

      expect(screen.getByLabelText('Document Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('From Date')).toBeInTheDocument();
      expect(screen.getByLabelText('To Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Author')).toBeInTheDocument();
    });
  });
});
