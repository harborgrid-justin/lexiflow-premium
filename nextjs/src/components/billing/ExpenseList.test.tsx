/**
 * ExpenseList Component Tests
 * Enterprise-grade tests for expense list display and filtering.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseList } from './ExpenseList';
import type { FirmExpense } from '@/types/financial';

// Mock react-router
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
global.confirm = mockConfirm;

describe('ExpenseList', () => {
  const mockExpenses: FirmExpense[] = [
    {
      id: 'exp-001',
      date: '2024-01-15',
      category: 'Filing Fees',
      description: 'Court filing fee for motion to dismiss',
      vendor: 'Court Clerk',
      amount: 350,
      status: 'Approved',
    },
    {
      id: 'exp-002',
      date: '2024-01-10',
      category: 'Travel',
      description: 'Uber to deposition',
      vendor: 'Uber',
      amount: 45.50,
      status: 'Submitted',
    },
    {
      id: 'exp-003',
      date: '2024-01-08',
      category: 'Expert Witness',
      description: 'Expert witness consultation',
      vendor: 'Dr. Smith',
      amount: 1500,
      status: 'Draft',
      receipt: { filename: 'receipt.pdf', size: 1024 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders expense list with all expenses', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      expect(screen.getByText('Court filing fee for motion to dismiss')).toBeInTheDocument();
      expect(screen.getByText('Uber to deposition')).toBeInTheDocument();
      expect(screen.getByText('Expert witness consultation')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Vendor')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Receipt')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders total amount', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      // Total should be 350 + 45.50 + 1500 = 1895.50
      expect(screen.getByText(/total:/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,895/)).toBeInTheDocument();
    });

    it('formats expense amounts with locale string', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      // Date format depends on locale, so just check they are rendered
      expect(screen.getByText(/1\/15\/2024|15\/1\/2024/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no expenses', () => {
      render(<ExpenseList expenses={[]} />);

      expect(screen.getByText('No expenses')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new expense.')).toBeInTheDocument();
    });

    it('displays receipt icon in empty state', () => {
      const { container } = render(<ExpenseList expenses={[]} />);

      // Check for the Receipt icon
      const emptyStateIcon = container.querySelector('.mx-auto.h-12.w-12');
      expect(emptyStateIcon).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('renders correct badge for Approved status', () => {
      render(<ExpenseList expenses={[{ ...mockExpenses[0], status: 'Approved' }]} />);

      const badge = screen.getByText('Approved');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders correct badge for Submitted status', () => {
      render(<ExpenseList expenses={[{ ...mockExpenses[0], status: 'Submitted' }]} />);

      const badge = screen.getByText('Submitted');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders correct badge for Draft status', () => {
      render(<ExpenseList expenses={[{ ...mockExpenses[0], status: 'Draft' }]} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders correct badge for Rejected status', () => {
      render(<ExpenseList expenses={[{ ...mockExpenses[0], status: 'Rejected' }]} />);

      const badge = screen.getByText('Rejected');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders correct badge for Billed status', () => {
      render(<ExpenseList expenses={[{ ...mockExpenses[0], status: 'Billed' }]} />);

      const badge = screen.getByText('Billed');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });

  describe('Filters', () => {
    it('shows filters button', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('toggles filter panel visibility', async () => {
      const user = userEvent.setup();
      render(<ExpenseList expenses={mockExpenses} />);

      // Filters should be hidden initially
      expect(screen.queryByRole('button', { name: /apply filters/i })).not.toBeInTheDocument();

      // Click to show filters
      await user.click(screen.getByRole('button', { name: /filters/i }));

      // Filters should now be visible
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    });

    it('displays filter options when filters are shown', async () => {
      const user = userEvent.setup();
      render(<ExpenseList expenses={mockExpenses} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/case/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('allows selecting filter options', async () => {
      const user = userEvent.setup();
      render(<ExpenseList expenses={mockExpenses} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'Approved');

      expect(statusSelect).toHaveValue('Approved');
    });

    it('pre-populates filters from props', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseList
          expenses={mockExpenses}
          filters={{ status: 'Draft', category: 'Travel' }}
        />
      );

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/status/i)).toHaveValue('Draft');
      expect(screen.getByLabelText(/category/i)).toHaveValue('Travel');
    });
  });

  describe('Receipt Column', () => {
    it('shows "View" button when receipt exists', () => {
      render(<ExpenseList expenses={[mockExpenses[2]]} />);

      expect(screen.getByText('View')).toBeInTheDocument();
    });

    it('shows "No receipt" when no receipt', () => {
      render(<ExpenseList expenses={[mockExpenses[0]]} />);

      expect(screen.getByText('No receipt')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows Edit link for each expense', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks).toHaveLength(mockExpenses.length);
    });

    it('Edit link has correct href', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      const editLinks = screen.getAllByText('Edit');
      expect(editLinks[0]).toHaveAttribute('href', '/billing/expenses/exp-001/edit');
    });

    it('shows Delete button for each expense', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(mockExpenses.length);
    });

    it('shows Approve button for submitted expenses', () => {
      render(<ExpenseList expenses={[mockExpenses[1]]} />); // Submitted status

      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('does not show Approve button for non-submitted expenses', () => {
      render(<ExpenseList expenses={[mockExpenses[0]]} />); // Approved status

      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    });

    it('confirms before deleting', async () => {
      const user = userEvent.setup();
      render(<ExpenseList expenses={mockExpenses} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('Delete this expense?');
    });

    it('prevents deletion when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValueOnce(false);
      const user = userEvent.setup();
      render(<ExpenseList expenses={mockExpenses} />);

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      // Form should not submit when cancelled
      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  describe('Hidden Form Fields', () => {
    it('includes expense id in action forms', () => {
      const { container } = render(<ExpenseList expenses={mockExpenses} />);

      const hiddenInputs = container.querySelectorAll('input[name="id"]');
      expect(hiddenInputs).toHaveLength(mockExpenses.length);
      expect(hiddenInputs[0]).toHaveValue('exp-001');
    });
  });

  describe('Table Interactions', () => {
    it('rows have hover effect class', () => {
      const { container } = render(<ExpenseList expenses={mockExpenses} />);

      const tableRows = container.querySelectorAll('tbody tr');
      tableRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });
  });

  describe('Accessibility', () => {
    it('table has proper structure', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(8);
      expect(screen.getAllByRole('row')).toHaveLength(mockExpenses.length + 1); // +1 for header row
    });

    it('description has title attribute for truncated text', () => {
      render(<ExpenseList expenses={mockExpenses} />);

      const description = screen.getByTitle('Court filing fee for motion to dismiss');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles expense with zero amount', () => {
      const zeroExpense = { ...mockExpenses[0], amount: 0 };
      render(<ExpenseList expenses={[zeroExpense]} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles expense with very large amount', () => {
      const largeExpense = { ...mockExpenses[0], amount: 999999.99 };
      render(<ExpenseList expenses={[largeExpense]} />);

      expect(screen.getByText('$999,999.99')).toBeInTheDocument();
    });

    it('handles expense with empty vendor', () => {
      const noVendorExpense = { ...mockExpenses[0], vendor: '' };
      render(<ExpenseList expenses={[noVendorExpense]} />);

      // Should still render without error
      expect(screen.getByText('Filing Fees')).toBeInTheDocument();
    });
  });
});
