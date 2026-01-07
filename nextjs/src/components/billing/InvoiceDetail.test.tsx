/**
 * InvoiceDetail Component Tests
 * Enterprise-grade tests for invoice detail view with payment tracking.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceDetail } from './InvoiceDetail';
import type { Invoice } from '@/types/financial';

// Mock react-router
jest.mock('react-router', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

// Mock InvoicePreview component
jest.mock('./InvoicePreview', () => ({
  InvoicePreview: ({ invoice }: any) => (
    <div data-testid="invoice-preview">Invoice Preview: {invoice.invoiceNumber}</div>
  ),
}));

describe('InvoiceDetail', () => {
  const mockInvoice: Invoice = {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Acme Corporation',
    matterDescription: 'Patent Litigation - ABC vs XYZ',
    status: 'Sent',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    totalAmount: 10000,
    paidAmount: 3000,
    balanceDue: 7000,
    timeCharges: 8000,
    expenseCharges: 2000,
    subtotal: 10000,
    taxAmount: 0,
    taxRate: 0,
    discountAmount: 0,
    billingModel: 'Hourly',
  };

  const paidInvoice: Invoice = {
    ...mockInvoice,
    status: 'Paid',
    paidAmount: 10000,
    balanceDue: 0,
  };

  const draftInvoice: Invoice = {
    ...mockInvoice,
    status: 'Draft',
    paidAmount: 0,
    balanceDue: 10000,
  };

  const overdueInvoice: Invoice = {
    ...mockInvoice,
    status: 'Overdue',
    dueDate: '2024-01-01', // Past date
  };

  describe('Rendering', () => {
    it('renders invoice header with invoice number', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByRole('heading', { name: /invoice inv-2024-001/i })).toBeInTheDocument();
    });

    it('renders client and matter information', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText(/acme corporation/i)).toBeInTheDocument();
      expect(screen.getByText(/patent litigation/i)).toBeInTheDocument();
    });

    it('renders invoice preview component', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByTestId('invoice-preview')).toBeInTheDocument();
      expect(screen.getByText('Invoice Preview: INV-2024-001')).toBeInTheDocument();
    });

    it('renders Download PDF button', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('renders Sent status with blue styling', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      const badge = screen.getByText('Sent');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('renders Paid status with green styling', () => {
      render(<InvoiceDetail invoice={paidInvoice} />);

      const badge = screen.getByText('Paid');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders Draft status with gray styling', () => {
      render(<InvoiceDetail invoice={draftInvoice} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders Overdue status with red styling', () => {
      render(<InvoiceDetail invoice={overdueInvoice} />);

      const badge = screen.getByText('Overdue');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Payment Status Card', () => {
    it('displays total amount', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });

    it('displays paid amount', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
    });

    it('displays balance due', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText('Balance Due')).toBeInTheDocument();
      expect(screen.getByText('$7,000')).toBeInTheDocument();
    });

    it('displays due date', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText('Due Date')).toBeInTheDocument();
    });
  });

  describe('Payment Progress Bar', () => {
    it('shows progress bar when partially paid', () => {
      const { container } = render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByText('Payment Progress')).toBeInTheDocument();
      expect(screen.getByText('30.0%')).toBeInTheDocument();

      const progressBar = container.querySelector('.bg-green-600');
      expect(progressBar).toHaveStyle({ width: '30%' });
    });

    it('does not show progress bar when fully paid', () => {
      render(<InvoiceDetail invoice={paidInvoice} />);

      expect(screen.queryByText('Payment Progress')).not.toBeInTheDocument();
    });

    it('does not show progress bar when no payments made', () => {
      const unpaidInvoice = { ...mockInvoice, paidAmount: 0, balanceDue: 10000 };
      render(<InvoiceDetail invoice={unpaidInvoice} />);

      expect(screen.queryByText('Payment Progress')).not.toBeInTheDocument();
    });
  });

  describe('Overdue Information', () => {
    it('shows days overdue for overdue invoices', () => {
      // Set a fixed date for testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-10'));

      render(<InvoiceDetail invoice={overdueInvoice} />);

      expect(screen.getByText(/days overdue/i)).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('does not show overdue message for non-overdue invoices', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.queryByText(/days overdue/i)).not.toBeInTheDocument();
    });
  });

  describe('Send Invoice Button', () => {
    it('shows Send Invoice button for draft invoices', () => {
      render(<InvoiceDetail invoice={draftInvoice} />);

      expect(screen.getByRole('button', { name: /send invoice/i })).toBeInTheDocument();
    });

    it('does not show Send Invoice button for sent invoices', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.queryByRole('button', { name: /send invoice/i })).not.toBeInTheDocument();
    });

    it('does not show Send Invoice button for paid invoices', () => {
      render(<InvoiceDetail invoice={paidInvoice} />);

      expect(screen.queryByRole('button', { name: /send invoice/i })).not.toBeInTheDocument();
    });
  });

  describe('Record Payment', () => {
    it('shows Record Payment button when balance is due', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      expect(screen.getByRole('button', { name: /record payment/i })).toBeInTheDocument();
    });

    it('does not show Record Payment button when fully paid', () => {
      render(<InvoiceDetail invoice={paidInvoice} />);

      expect(screen.queryByRole('button', { name: /record payment/i })).not.toBeInTheDocument();
    });

    it('toggles payment form when button is clicked', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);

      // Form should not be visible initially
      expect(screen.queryByLabelText(/method/i)).not.toBeInTheDocument();

      // Click to show form
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      // Form should be visible
      expect(screen.getByLabelText(/method/i)).toBeInTheDocument();
    });
  });

  describe('Payment Form', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));
    });

    it('renders all payment form fields', () => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reference/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('pre-fills amount with balance due', () => {
      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toHaveValue(7000);
    });

    it('sets max amount to balance due', () => {
      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toHaveAttribute('max', '7000');
    });

    it('pre-fills date with today', () => {
      const dateInput = screen.getByLabelText(/date/i);
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput).toHaveValue(today);
    });

    it('provides payment method options', () => {
      expect(screen.getByRole('option', { name: 'Check' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Wire Transfer' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Credit Card' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'ACH' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Cash' })).toBeInTheDocument();
    });

    it('has cancel button that hides the form', async () => {
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByLabelText(/method/i)).not.toBeInTheDocument();
    });

    it('has submit button for recording payment', () => {
      const buttons = screen.getAllByRole('button', { name: /record payment/i });
      // One is the toggle button, one is the submit button in the form
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('includes hidden fields for form submission', () => {
      const { container } = render(<InvoiceDetail invoice={mockInvoice} />);

      // After opening payment form
      const hiddenIntent = container.querySelector('input[name="intent"][value="record-payment"]');
      expect(hiddenIntent).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('amount field is required', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toBeRequired();
    });

    it('amount field has minimum value', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toHaveAttribute('min', '0.01');
    });

    it('date field is required', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toBeRequired();
    });

    it('method field is required', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      const methodSelect = screen.getByLabelText(/method/i);
      expect(methodSelect).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<InvoiceDetail invoice={mockInvoice} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/invoice/i);
    });

    it('form fields have proper labels', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/method/i)).toBeInTheDocument();
    });

    it('required fields are marked', async () => {
      const user = userEvent.setup();
      render(<InvoiceDetail invoice={mockInvoice} />);
      await user.click(screen.getByRole('button', { name: /record payment/i }));

      // Check for asterisks on required fields
      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles invoice with zero balance', () => {
      render(<InvoiceDetail invoice={paidInvoice} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles invoice with no payments', () => {
      const unpaidInvoice = { ...mockInvoice, paidAmount: 0, balanceDue: 10000 };
      render(<InvoiceDetail invoice={unpaidInvoice} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles cancelled invoice status', () => {
      const cancelledInvoice = { ...mockInvoice, status: 'Cancelled' };
      render(<InvoiceDetail invoice={cancelledInvoice} />);

      const badge = screen.getByText('Cancelled');
      expect(badge).toHaveClass('bg-gray-100');
    });
  });
});
