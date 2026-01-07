/**
 * InvoiceList Component Tests
 * Enterprise-grade tests for invoice list display and filtering.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceList } from './InvoiceList';
import type { Invoice } from '@/types/financial';

// Mock react-router
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

describe('InvoiceList', () => {
  const mockInvoices: Invoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      matterDescription: 'Patent Litigation',
      status: 'Sent',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      totalAmount: 10000,
      paidAmount: 0,
      balanceDue: 10000,
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'TechStart Inc',
      matterDescription: 'Series A Funding',
      status: 'Draft',
      invoiceDate: '2024-01-10',
      dueDate: '2024-02-10',
      totalAmount: 5000,
      paidAmount: 0,
      balanceDue: 5000,
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Global Corp',
      matterDescription: 'M&A Advisory',
      status: 'Paid',
      invoiceDate: '2024-01-05',
      dueDate: '2024-02-05',
      totalAmount: 25000,
      paidAmount: 25000,
      balanceDue: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders invoice list with all invoices', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByText('Invoice #')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Matter')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Balance Due')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders client names', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      expect(screen.getByText('TechStart Inc')).toBeInTheDocument();
      expect(screen.getByText('Global Corp')).toBeInTheDocument();
    });

    it('renders matter descriptions', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByText('Patent Litigation')).toBeInTheDocument();
      expect(screen.getByText('Series A Funding')).toBeInTheDocument();
      expect(screen.getByText('M&A Advisory')).toBeInTheDocument();
    });

    it('formats amounts correctly', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByText('$10,000')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no invoices', () => {
      render(<InvoiceList invoices={[]} />);

      expect(screen.getByText('No invoices')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new invoice.')).toBeInTheDocument();
    });

    it('displays file icon in empty state', () => {
      const { container } = render(<InvoiceList invoices={[]} />);

      const emptyStateIcon = container.querySelector('.mx-auto.h-12.w-12');
      expect(emptyStateIcon).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('renders Sent status with blue styling', () => {
      render(<InvoiceList invoices={[mockInvoices[0]]} />);

      const badge = screen.getByText('Sent');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders Draft status with gray styling', () => {
      render(<InvoiceList invoices={[mockInvoices[1]]} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders Paid status with green styling', () => {
      render(<InvoiceList invoices={[mockInvoices[2]]} />);

      const badge = screen.getByText('Paid');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders Overdue status with red styling', () => {
      const overdueInvoice = { ...mockInvoices[0], status: 'Overdue' };
      render(<InvoiceList invoices={[overdueInvoice]} />);

      const badge = screen.getByText('Overdue');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders Partially Paid status with yellow styling', () => {
      const partialInvoice = { ...mockInvoices[0], status: 'Partially Paid' };
      render(<InvoiceList invoices={[partialInvoice]} />);

      const badge = screen.getByText('Partially Paid');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders Cancelled status with gray styling', () => {
      const cancelledInvoice = { ...mockInvoices[0], status: 'Cancelled' };
      render(<InvoiceList invoices={[cancelledInvoice]} />);

      const badge = screen.getByText('Cancelled');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Filters', () => {
    it('shows filters button', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('toggles filter panel visibility', async () => {
      const user = userEvent.setup();
      render(<InvoiceList invoices={mockInvoices} />);

      // Filters should be hidden initially
      expect(screen.queryByRole('button', { name: /apply filters/i })).not.toBeInTheDocument();

      // Click to show filters
      await user.click(screen.getByRole('button', { name: /filters/i }));

      // Filters should now be visible
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    });

    it('displays filter options when filters are shown', async () => {
      const user = userEvent.setup();
      render(<InvoiceList invoices={mockInvoices} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/case/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('allows selecting status filter', async () => {
      const user = userEvent.setup();
      render(<InvoiceList invoices={mockInvoices} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'Paid');

      expect(statusSelect).toHaveValue('Paid');
    });

    it('provides all status options', async () => {
      const user = userEvent.setup();
      render(<InvoiceList invoices={mockInvoices} />);

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByRole('option', { name: 'All Statuses' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Sent' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Paid' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Overdue' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Cancelled' })).toBeInTheDocument();
    });

    it('pre-populates filters from props', async () => {
      const user = userEvent.setup();
      render(
        <InvoiceList
          invoices={mockInvoices}
          filters={{ status: 'Paid', caseId: 'C-2024-001' }}
        />
      );

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByLabelText(/status/i)).toHaveValue('Paid');
      expect(screen.getByLabelText(/case/i)).toHaveValue('C-2024-001');
    });
  });

  describe('Invoice Links', () => {
    it('invoice number links to detail page', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      const invoiceLink = screen.getByRole('link', { name: 'INV-2024-001' });
      expect(invoiceLink).toHaveAttribute('href', '/billing/invoices/inv-001');
    });

    it('View action links to detail page', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      const viewLinks = screen.getAllByRole('link', { name: 'View' });
      expect(viewLinks[0]).toHaveAttribute('href', '/billing/invoices/inv-001');
    });
  });

  describe('Send Action', () => {
    it('shows Send button for draft invoices', () => {
      render(<InvoiceList invoices={[mockInvoices[1]]} />); // Draft invoice

      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('does not show Send button for sent invoices', () => {
      render(<InvoiceList invoices={[mockInvoices[0]]} />); // Sent invoice

      expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
    });

    it('does not show Send button for paid invoices', () => {
      render(<InvoiceList invoices={[mockInvoices[2]]} />); // Paid invoice

      expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
    });

    it('send form includes invoice id', () => {
      const { container } = render(<InvoiceList invoices={[mockInvoices[1]]} />);

      const hiddenInput = container.querySelector('input[name="id"][value="inv-002"]');
      expect(hiddenInput).toBeInTheDocument();
    });
  });

  describe('Table Interactions', () => {
    it('rows have hover effect class', () => {
      const { container } = render(<InvoiceList invoices={mockInvoices} />);

      const tableRows = container.querySelectorAll('tbody tr');
      tableRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50');
      });
    });

    it('matter description shows full text on hover', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      const matterCell = screen.getByTitle('Patent Litigation');
      expect(matterCell).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats invoice date correctly', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      // Check that dates are formatted (format depends on locale)
      expect(screen.getByText(/1\/15\/2024|15\/1\/2024/)).toBeInTheDocument();
    });

    it('formats due date correctly', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      // Check that due dates are formatted
      expect(screen.getByText(/2\/15\/2024|15\/2\/2024/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('table has proper structure', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(9);
      expect(screen.getAllByRole('row')).toHaveLength(mockInvoices.length + 1);
    });

    it('invoice links are accessible', () => {
      render(<InvoiceList invoices={mockInvoices} />);

      const invoiceLinks = screen.getAllByRole('link');
      invoiceLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('buttons are accessible', () => {
      render(<InvoiceList invoices={[mockInvoices[1]]} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles invoice with zero balance', () => {
      render(<InvoiceList invoices={[mockInvoices[2]]} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles invoice with very large amounts', () => {
      const largeInvoice = { ...mockInvoices[0], totalAmount: 1000000, balanceDue: 1000000 };
      render(<InvoiceList invoices={[largeInvoice]} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });

    it('handles long client names', () => {
      const longNameInvoice = {
        ...mockInvoices[0],
        clientName: 'Very Long Client Name That Might Overflow The Table Cell'
      };
      render(<InvoiceList invoices={[longNameInvoice]} />);

      expect(screen.getByText(/Very Long Client Name/)).toBeInTheDocument();
    });

    it('handles long matter descriptions with truncation', () => {
      const longDescInvoice = {
        ...mockInvoices[0],
        matterDescription: 'A very long matter description that should be truncated in the table view for better display'
      };
      render(<InvoiceList invoices={[longDescInvoice]} />);

      const descCell = screen.getByTitle(/A very long matter description/);
      expect(descCell).toHaveClass('truncate');
    });
  });

  describe('Dark Mode Support', () => {
    it('has dark mode classes for table', () => {
      const { container } = render(<InvoiceList invoices={mockInvoices} />);

      const table = container.querySelector('table');
      expect(table?.parentElement).toHaveClass('dark:border-gray-700', 'dark:bg-gray-800');
    });

    it('has dark mode classes for rows', () => {
      const { container } = render(<InvoiceList invoices={mockInvoices} />);

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('dark:hover:bg-gray-700');
      });
    });
  });
});
