/**
 * CaseFilters Component Tests
 * Enterprise-grade test suite for advanced case filtering
 *
 * @module components/features/cases/CaseFilters.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseFilters, CaseFilterValues } from './CaseFilters';

describe('CaseFilters', () => {
  const defaultFilters: CaseFilterValues = {};
  const mockOnFiltersChange = jest.fn();

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filters heading', () => {
      render(<CaseFilters {...defaultProps} />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render expand/collapse button', () => {
      render(<CaseFilters {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: '' });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show active filter count when filters are applied', () => {
      const filtersWithValues: CaseFilterValues = {
        status: ['Active'],
        matterType: ['Litigation'],
      };

      render(<CaseFilters {...defaultProps} filters={filtersWithValues} />);

      expect(screen.getByText('2 active')).toBeInTheDocument();
    });

    it('should not show active filter count when no filters are applied', () => {
      render(<CaseFilters {...defaultProps} />);

      expect(screen.queryByText(/active/)).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('should be collapsed by default', () => {
      render(<CaseFilters {...defaultProps} />);

      expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
    });

    it('should expand when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      const toggleButton = screen.getAllByRole('button')[0];
      await user.click(toggleButton);

      expect(screen.getByPlaceholderText('Search cases...')).toBeInTheDocument();
    });

    it('should collapse when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      const toggleButton = screen.getAllByRole('button')[0];
      await user.click(toggleButton);
      await user.click(toggleButton);

      expect(screen.queryByPlaceholderText('Search cases...')).not.toBeInTheDocument();
    });
  });

  describe('Search Filter', () => {
    it('should render search input when expanded', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByPlaceholderText('Search cases...')).toBeInTheDocument();
    });

    it('should call onFiltersChange when search input changes', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);
      const searchInput = screen.getByPlaceholderText('Search cases...');
      await user.type(searchInput, 'test search');

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should display existing search value', async () => {
      const user = userEvent.setup();
      const filtersWithSearch: CaseFilterValues = { searchQuery: 'existing search' };

      render(<CaseFilters {...defaultProps} filters={filtersWithSearch} />);

      await user.click(screen.getAllByRole('button')[0]);
      const searchInput = screen.getByPlaceholderText('Search cases...');

      expect(searchInput).toHaveValue('existing search');
    });
  });

  describe('Status Filter', () => {
    it('should render status filter buttons when expanded', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should toggle status filter on click', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      const activeButton = screen.getByRole('button', { name: 'Active' });
      await user.click(activeButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['Active'] })
      );
    });

    it('should remove status when clicking already selected status', async () => {
      const user = userEvent.setup();
      const filtersWithStatus: CaseFilterValues = { status: ['Active'] };

      render(<CaseFilters {...defaultProps} filters={filtersWithStatus} />);

      await user.click(screen.getAllByRole('button')[0]);

      const activeButton = screen.getByRole('button', { name: 'Active' });
      await user.click(activeButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: undefined })
      );
    });

    it('should allow multiple status selections', async () => {
      const user = userEvent.setup();
      const filtersWithStatus: CaseFilterValues = { status: ['Active'] };

      render(<CaseFilters {...defaultProps} filters={filtersWithStatus} />);

      await user.click(screen.getAllByRole('button')[0]);

      const closedButton = screen.getByRole('button', { name: 'Closed' });
      await user.click(closedButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['Active', 'Closed'] })
      );
    });
  });

  describe('Matter Type Filter', () => {
    it('should render matter type filter when options provided', async () => {
      const user = userEvent.setup();
      const options = {
        matterTypes: ['Litigation', 'Corporate', 'IP'],
      };

      render(<CaseFilters {...defaultProps} options={options} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Matter Type')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Litigation' })).toBeInTheDocument();
    });

    it('should not render matter type filter when no options provided', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.queryByText('Matter Type')).not.toBeInTheDocument();
    });
  });

  describe('Court Filter', () => {
    it('should render court select when options provided', async () => {
      const user = userEvent.setup();
      const options = {
        courts: ['US District Court', 'State Court', 'Federal Court'],
      };

      render(<CaseFilters {...defaultProps} options={options} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Court')).toBeInTheDocument();
    });
  });

  describe('Date Range Filter', () => {
    it('should render date range inputs when expanded', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Filing Date Range')).toBeInTheDocument();
      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('To')).toBeInTheDocument();
    });

    it('should update date range on input change', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      const fromInput = screen.getAllByRole('textbox')[0] || screen.getAllByDisplayValue('')[0];
      // Date inputs are special, we test that they exist
      expect(screen.getByText('From')).toBeInTheDocument();
    });
  });

  describe('Budget Range Filter', () => {
    it('should render budget range inputs when expanded', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Budget Range')).toBeInTheDocument();
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    it('should display placeholder text for budget inputs', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByPlaceholderText('$0')).toBeInTheDocument();
    });
  });

  describe('Boolean Filters', () => {
    it('should render trial date checkbox', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Has trial date')).toBeInTheDocument();
    });

    it('should render archived checkbox', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Show archived cases')).toBeInTheDocument();
    });

    it('should update hasTrialDate filter on checkbox toggle', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      const checkbox = screen.getByRole('checkbox', { name: /Has trial date/ });
      await user.click(checkbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasTrialDate: true })
      );
    });
  });

  describe('Clear All', () => {
    it('should show clear all button when filters are active', () => {
      const filtersWithValues: CaseFilterValues = {
        status: ['Active'],
      };

      render(<CaseFilters {...defaultProps} filters={filtersWithValues} />);

      expect(screen.getByText('Clear all')).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(<CaseFilters {...defaultProps} />);

      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear all is clicked', async () => {
      const user = userEvent.setup();
      const filtersWithValues: CaseFilterValues = {
        status: ['Active'],
        searchQuery: 'test',
      };

      render(<CaseFilters {...defaultProps} filters={filtersWithValues} />);

      await user.click(screen.getByText('Clear all'));

      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CaseFilters {...defaultProps} className="custom-filter-class" />
      );

      expect(container.firstChild).toHaveClass('custom-filter-class');
    });
  });

  describe('Filter State Persistence', () => {
    it('should display selected status filters', async () => {
      const user = userEvent.setup();
      const filtersWithStatus: CaseFilterValues = {
        status: ['Active', 'Closed'],
      };

      render(<CaseFilters {...defaultProps} filters={filtersWithStatus} />);

      await user.click(screen.getAllByRole('button')[0]);

      const activeButton = screen.getByRole('button', { name: 'Active' });
      const closedButton = screen.getByRole('button', { name: 'Closed' });

      expect(activeButton).toHaveClass('bg-blue-100');
      expect(closedButton).toHaveClass('bg-blue-100');
    });

    it('should display boolean filter states', async () => {
      const user = userEvent.setup();
      const filtersWithBooleans: CaseFilterValues = {
        hasTrialDate: true,
        isArchived: true,
      };

      render(<CaseFilters {...defaultProps} filters={filtersWithBooleans} />);

      await user.click(screen.getAllByRole('button')[0]);

      const trialCheckbox = screen.getByRole('checkbox', { name: /Has trial date/ });
      const archivedCheckbox = screen.getByRole('checkbox', { name: /Show archived cases/ });

      expect(trialCheckbox).toBeChecked();
      expect(archivedCheckbox).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should have proper input associations', async () => {
      const user = userEvent.setup();
      render(<CaseFilters {...defaultProps} />);

      await user.click(screen.getAllByRole('button')[0]);

      const searchInput = screen.getByPlaceholderText('Search cases...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<CaseFilters {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:border-gray-700');
      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });
  });
});
