/**
 * InvoicePreview Component Tests
 * Enterprise-grade tests for PDF-like invoice preview.
 */

import { render, screen } from '@testing-library/react';
import { InvoicePreview } from './InvoicePreview';
import type { Invoice } from '@/types/financial';

describe('InvoicePreview', () => {
  const mockInvoice: Invoice = {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Acme Corporation',
    matterDescription: 'Patent Litigation - ABC vs XYZ',
    billingAddress: '123 Business Ave, Suite 100, San Francisco, CA 94102',
    status: 'Sent',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    totalAmount: 12500,
    paidAmount: 5000,
    balanceDue: 7500,
    timeCharges: 10000,
    expenseCharges: 2000,
    subtotal: 12000,
    taxAmount: 600,
    taxRate: 5,
    discountAmount: 100,
    billingModel: 'Hourly',
    notes: 'Thank you for your continued business.',
    terms: 'Net 30',
  };

  describe('Rendering', () => {
    it('renders INVOICE heading', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByRole('heading', { name: 'INVOICE' })).toBeInTheDocument();
    });

    it('renders invoice number', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/invoice #: inv-2024-001/i)).toBeInTheDocument();
    });

    it('renders invoice date', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/date:/i)).toBeInTheDocument();
    });

    it('renders due date', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/due date:/i)).toBeInTheDocument();
    });

    it('renders firm information', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('LexiFlow Law Firm')).toBeInTheDocument();
      expect(screen.getByText('123 Legal Avenue, Suite 400')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA 94102')).toBeInTheDocument();
      expect(screen.getByText('(415) 555-0123')).toBeInTheDocument();
      expect(screen.getByText('billing@lexiflow.com')).toBeInTheDocument();
    });
  });

  describe('Bill To Section', () => {
    it('renders Bill To heading', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Bill To')).toBeInTheDocument();
    });

    it('renders client name', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    });

    it('renders billing address when provided', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('123 Business Ave, Suite 100, San Francisco, CA 94102')).toBeInTheDocument();
    });

    it('does not render billing address when not provided', () => {
      const invoiceWithoutAddress = { ...mockInvoice, billingAddress: undefined };
      render(<InvoicePreview invoice={invoiceWithoutAddress} />);

      expect(screen.queryByText('123 Business Ave')).not.toBeInTheDocument();
    });
  });

  describe('Matter Section', () => {
    it('renders matter heading', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Matter')).toBeInTheDocument();
    });

    it('renders matter description', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Patent Litigation - ABC vs XYZ')).toBeInTheDocument();
    });

    it('renders billing model', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/billing model: hourly/i)).toBeInTheDocument();
    });

    it('renders billing period when provided', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/period:/i)).toBeInTheDocument();
    });

    it('does not render period when not provided', () => {
      const invoiceWithoutPeriod = { ...mockInvoice, periodStart: undefined, periodEnd: undefined };
      render(<InvoicePreview invoice={invoiceWithoutPeriod} />);

      expect(screen.queryByText(/period:/i)).not.toBeInTheDocument();
    });
  });

  describe('Line Items Table', () => {
    it('renders table headers', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Rate')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });

    it('renders time charges when present', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Professional Services (Time)')).toBeInTheDocument();
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });

    it('does not render time charges when zero', () => {
      const invoiceNoTime = { ...mockInvoice, timeCharges: 0 };
      render(<InvoicePreview invoice={invoiceNoTime} />);

      expect(screen.queryByText('Professional Services (Time)')).not.toBeInTheDocument();
    });

    it('renders expense charges when present', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Expenses and Disbursements')).toBeInTheDocument();
      expect(screen.getByText('$2,000')).toBeInTheDocument();
    });

    it('does not render expense charges when zero', () => {
      const invoiceNoExpenses = { ...mockInvoice, expenseCharges: 0 };
      render(<InvoicePreview invoice={invoiceNoExpenses} />);

      expect(screen.queryByText('Expenses and Disbursements')).not.toBeInTheDocument();
    });
  });

  describe('Totals Section', () => {
    it('renders subtotal', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$12,000')).toBeInTheDocument();
    });

    it('renders tax when present', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Tax (5%):')).toBeInTheDocument();
      expect(screen.getByText('$600')).toBeInTheDocument();
    });

    it('does not render tax when zero', () => {
      const invoiceNoTax = { ...mockInvoice, taxAmount: 0 };
      render(<InvoicePreview invoice={invoiceNoTax} />);

      expect(screen.queryByText(/tax \(/i)).not.toBeInTheDocument();
    });

    it('renders discount when present', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Discount:')).toBeInTheDocument();
      expect(screen.getByText('-$100')).toBeInTheDocument();
    });

    it('does not render discount when zero', () => {
      const invoiceNoDiscount = { ...mockInvoice, discountAmount: 0 };
      render(<InvoicePreview invoice={invoiceNoDiscount} />);

      expect(screen.queryByText('Discount:')).not.toBeInTheDocument();
    });

    it('renders total amount', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Total:')).toBeInTheDocument();
      expect(screen.getByText('$12,500')).toBeInTheDocument();
    });

    it('renders paid amount when payments exist', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Paid:')).toBeInTheDocument();
      expect(screen.getByText('-$5,000')).toBeInTheDocument();
    });

    it('renders balance due when payments exist', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Balance Due:')).toBeInTheDocument();
      expect(screen.getByText('$7,500')).toBeInTheDocument();
    });

    it('does not render paid section when no payments', () => {
      const invoiceNoPaid = { ...mockInvoice, paidAmount: 0 };
      render(<InvoicePreview invoice={invoiceNoPaid} />);

      expect(screen.queryByText('Paid:')).not.toBeInTheDocument();
      expect(screen.queryByText('Balance Due:')).not.toBeInTheDocument();
    });
  });

  describe('Notes and Terms', () => {
    it('renders notes when provided', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your continued business.')).toBeInTheDocument();
    });

    it('renders terms when provided', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText('Terms')).toBeInTheDocument();
      expect(screen.getByText('Net 30')).toBeInTheDocument();
    });

    it('does not render notes section when not provided', () => {
      const invoiceNoNotes = { ...mockInvoice, notes: undefined };
      render(<InvoicePreview invoice={invoiceNoNotes} />);

      expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    });

    it('does not render terms section when not provided', () => {
      const invoiceNoTerms = { ...mockInvoice, terms: undefined, notes: undefined };
      render(<InvoicePreview invoice={invoiceNoTerms} />);

      // Note: Terms heading should not appear, but footer may show default terms
      const termsHeadings = screen.queryAllByText('Terms');
      expect(termsHeadings.length).toBe(0);
    });
  });

  describe('Footer', () => {
    it('renders thank you message', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/thank you for your business/i)).toBeInTheDocument();
    });

    it('renders payment terms in footer', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/please remit payment within/i)).toBeInTheDocument();
    });

    it('renders contact information', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByText(/contact billing@lexiflow.com/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has proper card styling', () => {
      const { container } = render(<InvoicePreview invoice={mockInvoice} />);

      const card = container.firstChild;
      expect(card).toHaveClass('rounded-lg', 'border', 'p-8', 'shadow-sm');
    });

    it('applies dark mode classes', () => {
      const { container } = render(<InvoicePreview invoice={mockInvoice} />);

      const card = container.firstChild;
      expect(card).toHaveClass('dark:border-gray-700', 'dark:bg-gray-800');
    });
  });

  describe('Edge Cases', () => {
    it('handles invoice with only time charges', () => {
      const timeOnlyInvoice = { ...mockInvoice, expenseCharges: 0 };
      render(<InvoicePreview invoice={timeOnlyInvoice} />);

      expect(screen.getByText('Professional Services (Time)')).toBeInTheDocument();
      expect(screen.queryByText('Expenses and Disbursements')).not.toBeInTheDocument();
    });

    it('handles invoice with only expense charges', () => {
      const expensesOnlyInvoice = { ...mockInvoice, timeCharges: 0 };
      render(<InvoicePreview invoice={expensesOnlyInvoice} />);

      expect(screen.queryByText('Professional Services (Time)')).not.toBeInTheDocument();
      expect(screen.getByText('Expenses and Disbursements')).toBeInTheDocument();
    });

    it('handles fully paid invoice', () => {
      const paidInvoice = { ...mockInvoice, paidAmount: 12500, balanceDue: 0 };
      render(<InvoicePreview invoice={paidInvoice} />);

      expect(screen.getByText('Paid:')).toBeInTheDocument();
      expect(screen.getByText('Balance Due:')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('handles invoice with no charges', () => {
      const noChargesInvoice = { ...mockInvoice, timeCharges: 0, expenseCharges: 0 };
      render(<InvoicePreview invoice={noChargesInvoice} />);

      expect(screen.queryByText('Professional Services (Time)')).not.toBeInTheDocument();
      expect(screen.queryByText('Expenses and Disbursements')).not.toBeInTheDocument();
    });

    it('formats large amounts correctly', () => {
      const largeInvoice = { ...mockInvoice, totalAmount: 1000000, subtotal: 1000000 };
      render(<InvoicePreview invoice={largeInvoice} />);

      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic headings', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      expect(screen.getByRole('heading', { name: 'INVOICE' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'LexiFlow Law Firm' })).toBeInTheDocument();
    });

    it('table has proper structure', () => {
      render(<InvoicePreview invoice={mockInvoice} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });
});
