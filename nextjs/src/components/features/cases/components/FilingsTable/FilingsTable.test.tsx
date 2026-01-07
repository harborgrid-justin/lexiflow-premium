/**
 * FilingsTable Component Tests
 * Enterprise-grade test suite for court filings table with sorting and actions
 *
 * @module components/features/cases/FilingsTable.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilingsTable } from './FilingsTable';
import type { Filing } from '@/types';

// Mock formatDate utility
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
}));

// Mock react-router Link
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

describe('FilingsTable', () => {
  const mockFilings: Filing[] = [
    {
      id: 'filing-1',
      caseId: 'case-123',
      title: 'Initial Complaint',
      type: 'Complaint',
      filingDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'Filed',
      filedBy: 'John Attorney',
      documentId: 'doc-1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: 'filing-2',
      caseId: 'case-123',
      title: 'Motion for Summary Judgment',
      type: 'Motion',
      filingDate: '2024-02-20',
      dueDate: '2024-03-20',
      status: 'Pending',
      filedBy: 'Jane Attorney',
      documentId: 'doc-2',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20',
    },
    {
      id: 'filing-3',
      caseId: 'case-123',
      title: 'Response to Motion',
      type: 'Response',
      filingDate: '2024-03-01',
      dueDate: '2024-04-01',
      status: 'Draft',
      filedBy: 'John Attorney',
      documentId: 'doc-3',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01',
    },
  ];

  const defaultProps = {
    filings: mockFilings,
    onSelectFiling: jest.fn(),
    onDeleteFiling: jest.fn(),
    onDownloadFiling: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table headers', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Filing Date')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Filed By')).toBeInTheDocument();
    });

    it('should render all filings', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getByText('Initial Complaint')).toBeInTheDocument();
      expect(screen.getByText('Motion for Summary Judgment')).toBeInTheDocument();
      expect(screen.getByText('Response to Motion')).toBeInTheDocument();
    });

    it('should render filing types', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getByText('Complaint')).toBeInTheDocument();
      expect(screen.getByText('Motion')).toBeInTheDocument();
      expect(screen.getByText('Response')).toBeInTheDocument();
    });

    it('should render filing statuses', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getByText('Filed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render filer names', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getAllByText('John Attorney').length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Attorney')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no filings', () => {
      render(<FilingsTable filings={[]} />);

      expect(screen.getByText('No filings')).toBeInTheDocument();
    });

    it('should show helpful empty state message', () => {
      render(<FilingsTable filings={[]} />);

      expect(screen.getByText(/Add filings to track court submissions/)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by title when Title header is clicked', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} />);

      const titleHeader = screen.getByRole('columnheader', { name: /Title/ });
      await user.click(titleHeader);

      const rows = screen.getAllByRole('row');
      // First data row should be alphabetically first
      expect(rows[1]).toHaveTextContent('Initial Complaint');
    });

    it('should toggle sort direction on second click', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} />);

      const titleHeader = screen.getByRole('columnheader', { name: /Title/ });
      await user.click(titleHeader);
      await user.click(titleHeader);

      // Should now be descending
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Response to Motion');
    });

    it('should sort by date', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} />);

      const dateHeader = screen.getByRole('columnheader', { name: /Filing Date/ });
      await user.click(dateHeader);

      const rows = screen.getAllByRole('row');
      // Most recent first by default
      expect(rows[1]).toHaveTextContent('Response to Motion');
    });

    it('should display sort indicator', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} />);

      const titleHeader = screen.getByRole('columnheader', { name: /Title/ });
      await user.click(titleHeader);

      expect(titleHeader.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should call onSelectFiling when row is clicked', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} />);

      const firstRow = screen.getByText('Initial Complaint').closest('tr');
      await user.click(firstRow!);

      expect(defaultProps.onSelectFiling).toHaveBeenCalledWith(mockFilings[0]);
    });

    it('should highlight selected row', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} selectedId="filing-1" />);

      const firstRow = screen.getByText('Initial Complaint').closest('tr');
      expect(firstRow).toHaveClass('bg-blue-50');
    });
  });

  describe('Actions Column', () => {
    it('should show actions column when showActions is true', () => {
      render(<FilingsTable {...defaultProps} showActions />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should not show actions column by default', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('should render action buttons for each row', () => {
      render(<FilingsTable {...defaultProps} showActions />);

      const downloadButtons = screen.getAllByTitle('Download');
      expect(downloadButtons.length).toBe(3);
    });

    it('should call onDownloadFiling when download button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} showActions />);

      const downloadButtons = screen.getAllByTitle('Download');
      await user.click(downloadButtons[0]);

      expect(defaultProps.onDownloadFiling).toHaveBeenCalledWith('filing-1');
    });

    it('should call onDeleteFiling when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} showActions />);

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      expect(defaultProps.onDeleteFiling).toHaveBeenCalledWith('filing-1');
    });

    it('should stop event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup();
      render(<FilingsTable {...defaultProps} showActions />);

      const downloadButtons = screen.getAllByTitle('Download');
      await user.click(downloadButtons[0]);

      // onSelectFiling should NOT be called
      expect(defaultProps.onSelectFiling).not.toHaveBeenCalled();
    });
  });

  describe('Status Badge Colors', () => {
    it('should apply green color for Filed status', () => {
      render(<FilingsTable {...defaultProps} />);

      const filedBadge = screen.getByText('Filed');
      expect(filedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply yellow color for Pending status', () => {
      render(<FilingsTable {...defaultProps} />);

      const pendingBadge = screen.getByText('Pending');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply gray color for Draft status', () => {
      render(<FilingsTable {...defaultProps} />);

      const draftBadge = screen.getByText('Draft');
      expect(draftBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Type Badge Colors', () => {
    it('should apply blue color for Complaint type', () => {
      render(<FilingsTable {...defaultProps} />);

      const complaintBadge = screen.getByText('Complaint');
      expect(complaintBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should apply purple color for Motion type', () => {
      render(<FilingsTable {...defaultProps} />);

      const motionBadge = screen.getByText('Motion');
      expect(motionBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should apply teal color for Response type', () => {
      render(<FilingsTable {...defaultProps} />);

      const responseBadge = screen.getByText('Response');
      expect(responseBadge).toHaveClass('bg-teal-100', 'text-teal-800');
    });
  });

  describe('Due Date Warning', () => {
    it('should show warning icon when due date is approaching', () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 5);

      const filingsWithUpcomingDue = [{
        ...mockFilings[0],
        dueDate: futureDueDate.toISOString(),
        status: 'Pending',
      }];

      render(<FilingsTable filings={filingsWithUpcomingDue} showDueDateWarning />);

      expect(screen.getByTitle(/Due soon/)).toBeInTheDocument();
    });

    it('should not show warning for filed documents', () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 5);

      const filingsWithUpcomingDue = [{
        ...mockFilings[0],
        dueDate: futureDueDate.toISOString(),
        status: 'Filed',
      }];

      render(<FilingsTable filings={filingsWithUpcomingDue} showDueDateWarning />);

      expect(screen.queryByTitle(/Due soon/)).not.toBeInTheDocument();
    });
  });

  describe('Document Link', () => {
    it('should link to document when documentId exists', () => {
      render(<FilingsTable {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Initial Complaint/ });
      expect(link).toHaveAttribute('href', '/documents/doc-1');
    });

    it('should not render link when documentId does not exist', () => {
      const filingsWithoutDoc = [{
        ...mockFilings[0],
        documentId: undefined,
      }];

      render(<FilingsTable filings={filingsWithoutDoc} />);

      const title = screen.getByText('Initial Complaint');
      expect(title.closest('a')).toBeNull();
    });
  });

  describe('Responsive Design', () => {
    it('should have horizontal scroll on small screens', () => {
      const { container } = render(<FilingsTable {...defaultProps} />);

      const tableContainer = container.querySelector('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<FilingsTable {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });

    it('should have dark mode classes on table headers', () => {
      render(<FilingsTable {...defaultProps} />);

      const header = screen.getByRole('columnheader', { name: /Title/ });
      expect(header).toHaveClass('dark:bg-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<FilingsTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('row').length).toBe(4); // Header + 3 data rows
    });

    it('should have clickable rows with cursor pointer', () => {
      render(<FilingsTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1); // Skip header
      rows.forEach(row => {
        expect(row).toHaveClass('cursor-pointer');
      });
    });

    it('should have sr-only text for Actions column header', () => {
      render(<FilingsTable {...defaultProps} showActions />);

      expect(screen.getByText('Actions')).toHaveClass('sr-only');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FilingsTable {...defaultProps} className="custom-table-class" />
      );

      expect(container.firstChild).toHaveClass('custom-table-class');
    });
  });

  describe('Loading State', () => {
    it('should show loading state when loading prop is true', () => {
      render(<FilingsTable {...defaultProps} loading />);

      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });

    it('should hide table content when loading', () => {
      render(<FilingsTable {...defaultProps} loading />);

      expect(screen.queryByText('Initial Complaint')).not.toBeInTheDocument();
    });
  });
});
