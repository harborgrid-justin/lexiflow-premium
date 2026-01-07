/**
 * ExpenseForm Component Tests
 * Enterprise-grade tests for expense creation/editing form with file upload.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseForm } from './ExpenseForm';

// Mock react-router Form component
jest.mock('react-router', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

describe('ExpenseForm', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the form with all required fields', () => {
      render(<ExpenseForm />);

      expect(screen.getByLabelText(/case\/matter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders optional fields', () => {
      render(<ExpenseForm />);

      expect(screen.getByLabelText(/vendor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/receipt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/billable to client/i)).toBeInTheDocument();
    });

    it('renders submit button with "Create Expense" text for new expense', () => {
      render(<ExpenseForm />);

      expect(screen.getByRole('button', { name: /create expense/i })).toBeInTheDocument();
    });

    it('renders submit button with "Update Expense" text for existing expense', () => {
      render(<ExpenseForm expense={{ id: '123', amount: 100 }} />);

      expect(screen.getByRole('button', { name: /update expense/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel is provided', () => {
      render(<ExpenseForm onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      render(<ExpenseForm />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays action error when provided', () => {
      render(<ExpenseForm actionError="Failed to save expense" />);

      expect(screen.getByText('Failed to save expense')).toBeInTheDocument();
    });

    it('does not display error section when no error', () => {
      const { container } = render(<ExpenseForm />);

      expect(container.querySelector('.bg-red-50')).not.toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    describe('Case Selection', () => {
      it('displays case options', () => {
        render(<ExpenseForm />);

        const caseSelect = screen.getByLabelText(/case\/matter/i);
        expect(caseSelect).toBeInTheDocument();

        expect(screen.getByRole('option', { name: /martinez v. techcorp/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /omniglobal merger/i })).toBeInTheDocument();
      });

      it('allows selecting a case', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm />);

        const caseSelect = screen.getByLabelText(/case\/matter/i);
        await user.selectOptions(caseSelect, 'C-2024-001');

        expect(caseSelect).toHaveValue('C-2024-001');
      });

      it('is required', () => {
        render(<ExpenseForm />);

        const caseSelect = screen.getByLabelText(/case\/matter/i);
        expect(caseSelect).toBeRequired();
      });
    });

    describe('Date Field', () => {
      it('defaults to current date', () => {
        render(<ExpenseForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput).toHaveValue(today);
      });

      it('sets max date to today', () => {
        render(<ExpenseForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput).toHaveAttribute('max', today);
      });

      it('is required', () => {
        render(<ExpenseForm />);

        const dateInput = screen.getByLabelText(/date/i);
        expect(dateInput).toBeRequired();
      });
    });

    describe('Category Field', () => {
      it('displays all expense categories', () => {
        render(<ExpenseForm />);

        const categories = [
          'Filing Fees', 'Court Reporter', 'Expert Witness', 'Travel',
          'Meals', 'Lodging', 'Courier', 'Postage', 'Photocopying',
          'Research', 'Translation', 'Other'
        ];

        categories.forEach(cat => {
          expect(screen.getByRole('option', { name: cat })).toBeInTheDocument();
        });
      });

      it('is required', () => {
        render(<ExpenseForm />);

        const categorySelect = screen.getByLabelText(/category/i);
        expect(categorySelect).toBeRequired();
      });
    });

    describe('Amount Field', () => {
      it('accepts numeric input', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm />);

        const amountInput = screen.getByLabelText(/amount/i);
        await user.type(amountInput, '250.50');

        expect(amountInput).toHaveValue(250.50);
      });

      it('has minimum value of 0', () => {
        render(<ExpenseForm />);

        const amountInput = screen.getByLabelText(/amount/i);
        expect(amountInput).toHaveAttribute('min', '0');
      });

      it('allows decimal values', () => {
        render(<ExpenseForm />);

        const amountInput = screen.getByLabelText(/amount/i);
        expect(amountInput).toHaveAttribute('step', '0.01');
      });

      it('is required', () => {
        render(<ExpenseForm />);

        const amountInput = screen.getByLabelText(/amount/i);
        expect(amountInput).toBeRequired();
      });
    });

    describe('Description Field', () => {
      it('accepts text input', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        await user.type(descriptionInput, 'Court filing fee for motion');

        expect(descriptionInput).toHaveValue('Court filing fee for motion');
      });

      it('is required', () => {
        render(<ExpenseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).toBeRequired();
      });

      it('has placeholder text', () => {
        render(<ExpenseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).toHaveAttribute('placeholder', 'Detailed description of the expense...');
      });
    });

    describe('Payment Method Field', () => {
      it('displays all payment methods', () => {
        render(<ExpenseForm />);

        const methods = [
          'Firm Credit Card', 'Personal Reimbursement', 'Client Advance',
          'Check', 'Wire Transfer', 'Cash'
        ];

        methods.forEach(method => {
          expect(screen.getByRole('option', { name: method })).toBeInTheDocument();
        });
      });
    });

    describe('Billable Checkbox', () => {
      it('is checked by default', () => {
        render(<ExpenseForm />);

        const billableCheckbox = screen.getByLabelText(/billable to client/i);
        expect(billableCheckbox).toBeChecked();
      });

      it('can be unchecked', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm />);

        const billableCheckbox = screen.getByLabelText(/billable to client/i);
        await user.click(billableCheckbox);

        expect(billableCheckbox).not.toBeChecked();
      });
    });
  });

  describe('File Upload', () => {
    it('shows upload area when no file is selected', () => {
      render(<ExpenseForm />);

      expect(screen.getByText(/click to upload receipt/i)).toBeInTheDocument();
      expect(screen.getByText(/png, jpg, pdf up to 10mb/i)).toBeInTheDocument();
    });

    it('handles file selection', async () => {
      render(<ExpenseForm />);

      const file = new File(['test content'], 'receipt.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      });
    });

    it('shows file preview for images', async () => {
      render(<ExpenseForm />);

      // Create a mock image file
      const file = new File(['fake image'], 'receipt.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,fakedata',
        onloadend: null as any,
      };
      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Trigger the onloadend callback
      mockFileReader.onloadend?.();

      await waitFor(() => {
        expect(screen.getByText('receipt.png')).toBeInTheDocument();
      });
    });

    it('shows file size', async () => {
      render(<ExpenseForm />);

      const file = new File(['test content of known size'], 'receipt.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        // File size should be displayed in KB
        const sizeElement = screen.getByText(/KB/);
        expect(sizeElement).toBeInTheDocument();
      });
    });

    it('allows removing selected file', async () => {
      const user = userEvent.setup();
      render(<ExpenseForm />);

      const file = new File(['test content'], 'receipt.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
      });

      // Find and click remove button
      const removeButton = screen.getByRole('button', { name: '' }); // X button
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText(/click to upload receipt/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pre-populated Form', () => {
    const existingExpense = {
      id: '123',
      caseId: 'C-2024-001',
      date: '2024-01-15',
      category: 'Travel',
      amount: 250.50,
      description: 'Travel to courthouse',
      vendor: 'Uber',
      paymentMethod: 'Firm Credit Card',
      billable: false,
    };

    it('populates fields with existing expense data', () => {
      render(<ExpenseForm expense={existingExpense} />);

      expect(screen.getByLabelText(/case\/matter/i)).toHaveValue('C-2024-001');
      expect(screen.getByLabelText(/date/i)).toHaveValue('2024-01-15');
      expect(screen.getByLabelText(/category/i)).toHaveValue('Travel');
      expect(screen.getByLabelText(/amount/i)).toHaveValue(250.50);
      expect(screen.getByLabelText(/description/i)).toHaveValue('Travel to courthouse');
      expect(screen.getByLabelText(/vendor/i)).toHaveValue('Uber');
      expect(screen.getByLabelText(/payment method/i)).toHaveValue('Firm Credit Card');
    });

    it('respects billable status from expense', () => {
      render(<ExpenseForm expense={existingExpense} />);

      const billableCheckbox = screen.getByLabelText(/billable to client/i);
      expect(billableCheckbox).not.toBeChecked();
    });
  });

  describe('Form Actions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExpenseForm onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('form has correct method and enctype for file upload', () => {
      const { container } = render(<ExpenseForm />);

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('method', 'post');
      expect(form).toHaveAttribute('enctype', 'multipart/form-data');
    });
  });

  describe('Accessibility', () => {
    it('has required field indicators', () => {
      render(<ExpenseForm />);

      // Check for asterisks on required fields
      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });

    it('has proper label associations', () => {
      render(<ExpenseForm />);

      expect(screen.getByLabelText(/case\/matter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('file input accepts correct file types', () => {
      render(<ExpenseForm />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf');
    });
  });

  describe('Form Validation', () => {
    it('has required attributes on required fields', () => {
      render(<ExpenseForm />);

      expect(screen.getByLabelText(/case\/matter/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/date/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/category/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/amount/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/description/i)).toHaveAttribute('required');
    });
  });

  describe('Hidden Fields', () => {
    it('includes hidden userId field', () => {
      const { container } = render(<ExpenseForm />);

      const hiddenInput = container.querySelector('input[name="userId"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveValue('usr-admin-justin');
    });
  });
});
