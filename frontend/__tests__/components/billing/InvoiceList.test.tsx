/**
 * InvoiceList.test.tsx
 * Tests for the InvoiceList component
 */

import { InvoiceList } from '@/components/billing/InvoiceList';
import type { Invoice } from '@/types/financial';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the Form component from react-router
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

// Mock data
const mockInvoice: Invoice = {
  id: 'INV-001',
  invoiceNumber: 'INV-2024-001',
  clientName: 'Acme Corp',
  matterDescription: 'Contract Review Matter',
  invoiceDate: '2024-01-15',
  dueDate: '2024-02-15',
  totalAmount: 5000,
  balanceDue: 5000,
  status: 'Sent',
};

const mockDraftInvoice: Invoice = {
  ...mockInvoice,
  id: 'INV-002',
  invoiceNumber: 'INV-2024-002',
  status: 'Draft',
};

const mockPaidInvoice: Invoice = {
  ...mockInvoice,
  id: 'INV-003',
  invoiceNumber: 'INV-2024-003',
  status: 'Paid',
  balanceDue: 0,
};

const renderInvoiceList = (invoices: Invoice[] = [mockInvoice], filters?: Record<string, unknown>) => {
  return render(
    <BrowserRouter>
      <InvoiceList invoices={invoices} filters={filters} />
    </BrowserRouter>
  );
};

describe('InvoiceList', () => {
  describe('rendering', () => {
    it('should render list of invoices', () => {
      renderInvoiceList([mockInvoice, mockDraftInvoice]);

      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
    });

    it('should render empty state when no invoices', () => {
      renderInvoiceList([]);

      expect(screen.getByText('No invoices')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new invoice.')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      renderInvoiceList();

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
  });

  describe('invoice details', () => {
    it('should display invoice number', () => {
      renderInvoiceList();

      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
    });

    it('should display client name', () => {
      renderInvoiceList();

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    it('should display amount', () => {
      renderInvoiceList();

      const amounts = screen.getAllByText('$5,000');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
      renderInvoiceList();

      // Date format depends on locale, check for presence
      const dueDateElement = screen.getByText((content, element) => {
        return element?.textContent?.includes('2024') || element?.textContent?.includes('15') || false;
      });
      expect(dueDateElement).toBeInTheDocument();
    });

    it('should display matter description', () => {
      renderInvoiceList();

      expect(screen.getByText('Contract Review Matter')).toBeInTheDocument();
    });

    it('should display balance due', () => {
      renderInvoiceList();

      // Should show the same as total for unpaid invoice
      const balanceCells = screen.getAllByText('$5,000');
      expect(balanceCells.length).toBeGreaterThanOrEqual(2); // Amount and Balance Due
    });
  });

  describe('status indicators', () => {
    it('should show draft status', () => {
      renderInvoiceList([mockDraftInvoice]);

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should show sent status', () => {
      renderInvoiceList([mockInvoice]);

      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    it('should show paid status', () => {
      renderInvoiceList([mockPaidInvoice]);

      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('should show overdue status', () => {
      const overdueInvoice = { ...mockInvoice, status: 'Overdue' };
      renderInvoiceList([overdueInvoice]);

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('should style status badges correctly', () => {
      renderInvoiceList([mockPaidInvoice]);

      const statusBadge = screen.getByText('Paid');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('filters', () => {
    it('should show filter button', () => {
      renderInvoiceList();

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should toggle filter panel', async () => {
      const user = userEvent.setup();
      renderInvoiceList();

      const filterButton = screen.getByRole('button', { name: /filters/i });

      // Filters should be hidden initially
      expect(screen.queryByText('All Cases')).not.toBeInTheDocument();

      // Click to show filters
      await user.click(filterButton);

      expect(screen.getByText('All Cases')).toBeInTheDocument();
    });

    it('should render case filter dropdown', async () => {
      const user = userEvent.setup();
      renderInvoiceList();

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('Case')).toBeInTheDocument();
      expect(screen.getByText('All Cases')).toBeInTheDocument();
    });

    it('should render client filter input', async () => {
      const user = userEvent.setup();
      renderInvoiceList();

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Client ID or name')).toBeInTheDocument();
    });

    it('should render status filter dropdown', async () => {
      const user = userEvent.setup();
      renderInvoiceList();

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should have apply filters button', async () => {
      const user = userEvent.setup();
      renderInvoiceList();

      await user.click(screen.getByRole('button', { name: /filters/i }));

      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
    });

    it('should pre-populate filters from props', async () => {
      const user = userEvent.setup();
      renderInvoiceList([mockInvoice], { caseId: 'C-2024-001', status: 'Sent' });

      await user.click(screen.getByRole('button', { name: /filters/i }));

      const caseSelect = screen.getByRole('combobox', { name: /case/i });
      const statusSelect = screen.getByRole('combobox', { name: /status/i });

      expect(caseSelect).toHaveValue('C-2024-001');
      expect(statusSelect).toHaveValue('Sent');
    });
  });

  describe('actions', () => {
    it('should show send button for draft invoices', () => {
      renderInvoiceList([mockDraftInvoice]);

      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should not show send button for sent invoices', () => {
      renderInvoiceList([mockInvoice]);

      expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
    });

    it('should show view link for all invoices', () => {
      renderInvoiceList([mockInvoice, mockDraftInvoice]);

      const viewLinks = screen.getAllByText('View');
      expect(viewLinks.length).toBe(2);
    });

    it('should link to invoice detail page', () => {
      renderInvoiceList();

      const invoiceLink = screen.getByText('INV-2024-001');
      expect(invoiceLink).toHaveAttribute('href', '/billing/invoices/INV-001');
    });
  });

  describe('multiple invoices', () => {
    it('should render multiple invoices correctly', () => {
      const invoices = [mockInvoice, mockDraftInvoice, mockPaidInvoice];
      renderInvoiceList(invoices);

      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-003')).toBeInTheDocument();
    });

    it('should show correct status for each invoice', () => {
      const invoices = [mockInvoice, mockDraftInvoice, mockPaidInvoice];
      renderInvoiceList(invoices);

      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });
});
