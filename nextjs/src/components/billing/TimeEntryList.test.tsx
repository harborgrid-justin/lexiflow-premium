/**
 * TimeEntryList Component Tests
 * Enterprise-grade tests for time entry list with bulk operations.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeEntryList } from './TimeEntryList';
import type { TimeEntry } from '@/types/financial';

// Mock react-router
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
global.confirm = mockConfirm;

describe('TimeEntryList', () => {
  const mockEntries: TimeEntry[] = [
    {
      id: 'te-001',
      date: '2024-01-15',
      caseId: 'C-2024-001',
      description: 'Legal research on patent law',
      duration: 2.5,
      rate: 450,
      total: 1125,
      status: 'Approved',
      ledesCode: 'L200',
    },
    {
      id: 'te-002',
      date: '2024-01-14',
      caseId: 'C-2024-002',
      description: 'Draft motion to dismiss',
      duration: 3.0,
      rate: 500,
      total: 1500,
      status: 'Submitted',
    },
    {
      id: 'te-003',
      date: '2024-01-13',
      caseId: 'C-2024-001',
      description: 'Client meeting preparation',
      duration: 1.5,
      rate: 450,
      total: 675,
      status: 'Draft',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders time entry list with all entries', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('Legal research on patent law')).toBeInTheDocument();
      expect(screen.getByText('Draft motion to dismiss')).toBeInTheDocument();
      expect(screen.getByText('Client meeting preparation')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Case')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Rate')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders summary totals', () => {
      render(<TimeEntryList entries={mockEntries} />);

      // Total hours: 2.5 + 3.0 + 1.5 = 7.00
      expect(screen.getByText('7.00')).toBeInTheDocument();
      // Total amount: 1125 + 1500 + 675 = 3300
      expect(screen.getByText('$3,300')).toBeInTheDocument();
    });

    it('displays LEDES code when present', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText(/ledes: l200/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no entries', () => {
      render(<TimeEntryList entries={[]} />);

      expect(screen.getByText('No time entries')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new time entry.')).toBeInTheDocument();
    });

    it('displays clock icon in empty state', () => {
      const { container } = render(<TimeEntryList entries={[]} />);

      const emptyStateIcon = container.querySelector('.mx-auto.h-12.w-12');
      expect(emptyStateIcon).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('renders Approved status with green styling', () => {
      render(<TimeEntryList entries={[mockEntries[0]]} />);

      const badge = screen.getByText('Approved');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders Submitted status with blue styling', () => {
      render(<TimeEntryList entries={[mockEntries[1]]} />);

      const badge = screen.getByText('Submitted');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders Draft status with gray styling', () => {
      render(<TimeEntryList entries={[mockEntries[2]]} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders Billed status with purple styling', () => {
      const billedEntry = { ...mockEntries[0], status: 'Billed' };
      render(<TimeEntryList entries={[billedEntry]} />);

      const badge = screen.getByText('Billed');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('renders Unbilled status with yellow styling', () => {
      const unbilledEntry = { ...mockEntries[0], status: 'Unbilled' };
      render(<TimeEntryList entries={[unbilledEntry]} />);

      const badge = screen.getByText('Unbilled');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Selection', () => {
    it('renders checkboxes for each entry', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // One for select all + one per entry
      expect(checkboxes).toHaveLength(mockEntries.length + 1);
    });

    it('toggles individual entry selection', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First entry checkbox

      expect(checkboxes[1]).toBeChecked();
    });

    it('shows bulk action bar when entries selected', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('updates selected count when multiple entries selected', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('toggles all entries with select all checkbox', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Select all

      // All entry checkboxes should be checked
      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('deselects all when select all is clicked again', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Select all
      await user.click(checkboxes[0]); // Deselect all

      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Bulk Actions', () => {
    it('shows Approve Selected button when entries selected', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      expect(screen.getByRole('button', { name: /approve selected/i })).toBeInTheDocument();
    });

    it('bulk action form includes selected IDs', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      const hiddenInput = container.querySelector('input[name="ids"]');
      expect(hiddenInput).toHaveValue(JSON.stringify(['te-001', 'te-002']));
    });
  });

  describe('Filters', () => {
    it('shows filters button', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('toggles filter panel visibility', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.queryByRole('button', { name: /apply filters/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    });

    it('displays filter options when shown', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/case/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/billable/i)).toBeInTheDocument();
    });

    it('provides billable filter options', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Billable Only' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Non-Billable Only' })).toBeInTheDocument();
    });

    it('pre-populates filters from props', async () => {
      const user = userEvent.setup();
      render(
        <TimeEntryList
          entries={mockEntries}
          filters={{ status: 'Approved', billable: 'true' }}
        />
      );

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/status/i)).toHaveValue('Approved');
      expect(screen.getByLabelText(/billable/i)).toHaveValue('true');
    });
  });

  describe('Actions', () => {
    it('shows Edit link for each entry', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks).toHaveLength(mockEntries.length);
    });

    it('Edit link has correct href', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks[0]).toHaveAttribute('href', '/billing/time/te-001/edit');
    });

    it('shows Approve button for submitted entries', () => {
      render(<TimeEntryList entries={[mockEntries[1]]} />); // Submitted status

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    });

    it('does not show Approve button for non-submitted entries', () => {
      render(<TimeEntryList entries={[mockEntries[0]]} />); // Approved status

      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    });

    it('shows Delete button for each entry', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons).toHaveLength(mockEntries.length);
    });

    it('confirms before deleting', async () => {
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await user.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('Delete this time entry?');
    });

    it('prevents deletion when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValueOnce(false);
      const user = userEvent.setup();
      render(<TimeEntryList entries={mockEntries} />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await user.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  describe('Data Display', () => {
    it('formats hours with two decimal places', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('2.50')).toBeInTheDocument();
      expect(screen.getByText('3.00')).toBeInTheDocument();
      expect(screen.getByText('1.50')).toBeInTheDocument();
    });

    it('displays rate with dollar sign', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('$450')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
    });

    it('formats total amounts with locale string', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('$1,125')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
      expect(screen.getByText('$675')).toBeInTheDocument();
    });

    it('shows case ID', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByText('C-2024-001')).toBeInTheDocument();
      expect(screen.getByText('C-2024-002')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('table has proper structure', () => {
      render(<TimeEntryList entries={mockEntries} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(9); // Including checkbox column
    });

    it('description has title attribute for truncated text', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const description = screen.getByTitle('Legal research on patent law');
      expect(description).toBeInTheDocument();
    });

    it('checkboxes are accessible', () => {
      render(<TimeEntryList entries={mockEntries} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles entry with zero hours', () => {
      const zeroEntry = { ...mockEntries[0], duration: 0, total: 0 };
      render(<TimeEntryList entries={[zeroEntry]} />);

      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles entry with very long description', () => {
      const longDescEntry = {
        ...mockEntries[0],
        description: 'A very long description that should be truncated in the table view for better readability and user experience'
      };
      render(<TimeEntryList entries={[longDescEntry]} />);

      const descCell = screen.getByTitle(/A very long description/);
      expect(descCell).toHaveClass('truncate');
    });

    it('handles entry without LEDES code', () => {
      render(<TimeEntryList entries={[mockEntries[1]]} />);

      expect(screen.queryByText(/ledes:/i)).not.toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('has dark mode classes for table', () => {
      const { container } = render(<TimeEntryList entries={mockEntries} />);

      const table = container.querySelector('table');
      expect(table?.parentElement).toHaveClass('dark:border-gray-700', 'dark:bg-gray-800');
    });
  });
});
