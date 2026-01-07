/**
 * TimeEntryForm Component Tests
 * Enterprise-grade tests for time entry creation/editing form with timer integration.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeEntryForm } from './TimeEntryForm';

// Mock react-router
jest.mock('react-router', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

// Mock RunningTimer component
jest.mock('./RunningTimer', () => ({
  RunningTimer: ({ onComplete, caseId, description }: any) => (
    <div data-testid="running-timer">
      <span>Timer for case: {caseId}</span>
      <button onClick={() => onComplete(1.5)} type="button">
        Complete Timer
      </button>
    </div>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TimeEntryForm', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the form with all required fields', () => {
      render(<TimeEntryForm />);

      expect(screen.getByLabelText(/case\/matter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders optional fields', () => {
      render(<TimeEntryForm />);

      expect(screen.getByLabelText(/ledes task code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/billable/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    });

    it('renders timer toggle', () => {
      render(<TimeEntryForm />);

      expect(screen.getByText(/use timer/i)).toBeInTheDocument();
      expect(screen.getByText(/track time in real-time/i)).toBeInTheDocument();
    });

    it('renders submit button with "Create Time Entry" for new entry', () => {
      render(<TimeEntryForm />);

      expect(screen.getByRole('button', { name: /create time entry/i })).toBeInTheDocument();
    });

    it('renders submit button with "Update Time Entry" for existing entry', () => {
      render(<TimeEntryForm entry={{ id: '123', duration: 1.5 }} />);

      expect(screen.getByRole('button', { name: /update time entry/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel is provided', () => {
      render(<TimeEntryForm onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays action error when provided', () => {
      render(<TimeEntryForm actionError="Failed to save time entry" />);

      expect(screen.getByText('Failed to save time entry')).toBeInTheDocument();
    });

    it('error message has proper styling', () => {
      const { container } = render(<TimeEntryForm actionError="Error message" />);

      const errorDiv = container.querySelector('.bg-red-50');
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    describe('Case Selection', () => {
      it('displays case options', () => {
        render(<TimeEntryForm />);

        expect(screen.getByRole('option', { name: /martinez v. techcorp/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /omniglobal merger/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /startup inc/i })).toBeInTheDocument();
      });

      it('is required', () => {
        render(<TimeEntryForm />);

        const caseSelect = screen.getByLabelText(/case\/matter/i);
        expect(caseSelect).toBeRequired();
      });
    });

    describe('Date Field', () => {
      it('defaults to current date', () => {
        render(<TimeEntryForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput).toHaveValue(today);
      });

      it('sets max date to today', () => {
        render(<TimeEntryForm />);

        const dateInput = screen.getByLabelText(/date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput).toHaveAttribute('max', today);
      });

      it('is required', () => {
        render(<TimeEntryForm />);

        const dateInput = screen.getByLabelText(/date/i);
        expect(dateInput).toBeRequired();
      });
    });

    describe('Hours Field', () => {
      it('accepts numeric input', async () => {
        const user = userEvent.setup();
        render(<TimeEntryForm />);

        const hoursInput = screen.getByLabelText(/hours/i);
        await user.clear(hoursInput);
        await user.type(hoursInput, '2.5');

        expect(hoursInput).toHaveValue(2.5);
      });

      it('has minimum value of 0.1', () => {
        render(<TimeEntryForm />);

        const hoursInput = screen.getByLabelText(/hours/i);
        expect(hoursInput).toHaveAttribute('min', '0.1');
      });

      it('allows 0.1 step increments', () => {
        render(<TimeEntryForm />);

        const hoursInput = screen.getByLabelText(/hours/i);
        expect(hoursInput).toHaveAttribute('step', '0.1');
      });

      it('shows minimum time note', () => {
        render(<TimeEntryForm />);

        expect(screen.getByText(/minimum 0.1 \(6 minutes\)/i)).toBeInTheDocument();
      });
    });

    describe('Rate Field', () => {
      it('defaults to 450', () => {
        render(<TimeEntryForm />);

        const rateInput = screen.getByLabelText(/rate/i);
        expect(rateInput).toHaveValue(450);
      });

      it('accepts custom rate', async () => {
        const user = userEvent.setup();
        render(<TimeEntryForm />);

        const rateInput = screen.getByLabelText(/rate/i);
        await user.clear(rateInput);
        await user.type(rateInput, '550');

        expect(rateInput).toHaveValue(550);
      });
    });

    describe('Total Calculation', () => {
      it('displays calculated total', () => {
        render(<TimeEntryForm />);

        // Default is 0 hours * 450 rate = $0.00
        expect(screen.getByText('$0.00')).toBeInTheDocument();
      });

      it('updates total when hours change', async () => {
        const user = userEvent.setup();
        render(<TimeEntryForm />);

        const hoursInput = screen.getByLabelText(/hours/i);
        await user.clear(hoursInput);
        await user.type(hoursInput, '2');

        // 2 hours * 450 rate = $900.00
        expect(screen.getByText('$900.00')).toBeInTheDocument();
      });

      it('updates total when rate changes', async () => {
        const user = userEvent.setup();
        render(<TimeEntryForm />);

        const hoursInput = screen.getByLabelText(/hours/i);
        const rateInput = screen.getByLabelText(/rate/i);

        await user.clear(hoursInput);
        await user.type(hoursInput, '1');
        await user.clear(rateInput);
        await user.type(rateInput, '500');

        // 1 hour * 500 rate = $500.00
        expect(screen.getByText('$500.00')).toBeInTheDocument();
      });
    });

    describe('Description Field', () => {
      it('is required', () => {
        render(<TimeEntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).toBeRequired();
      });

      it('has placeholder text', () => {
        render(<TimeEntryForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).toHaveAttribute('placeholder', 'Detailed description of work performed...');
      });
    });

    describe('LEDES Codes', () => {
      it('displays LEDES code options', () => {
        render(<TimeEntryForm />);

        expect(screen.getByRole('option', { name: /l100/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /l200/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /l300/i })).toBeInTheDocument();
      });

      it('includes all LEDES codes', () => {
        render(<TimeEntryForm />);

        const ledesSelect = screen.getByLabelText(/ledes task code/i);
        expect(ledesSelect.querySelectorAll('option').length).toBeGreaterThan(5);
      });
    });

    describe('Activity Types', () => {
      it('displays activity type options', () => {
        render(<TimeEntryForm />);

        expect(screen.getByRole('option', { name: 'Research' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Drafting' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Court Appearance' })).toBeInTheDocument();
      });
    });

    describe('Billable Checkbox', () => {
      it('is checked by default', () => {
        render(<TimeEntryForm />);

        const billableCheckbox = screen.getByLabelText(/billable/i);
        expect(billableCheckbox).toBeChecked();
      });

      it('can be unchecked', async () => {
        const user = userEvent.setup();
        render(<TimeEntryForm />);

        const billableCheckbox = screen.getByLabelText(/billable/i);
        await user.click(billableCheckbox);

        expect(billableCheckbox).not.toBeChecked();
      });
    });

    describe('Status Field', () => {
      it('defaults to Draft', () => {
        render(<TimeEntryForm />);

        const statusSelect = screen.getByLabelText(/status/i);
        expect(statusSelect).toHaveValue('Draft');
      });

      it('provides status options', () => {
        render(<TimeEntryForm />);

        expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Submit for Approval' })).toBeInTheDocument();
      });
    });
  });

  describe('Timer Toggle', () => {
    it('shows timer when toggled on', async () => {
      const user = userEvent.setup();
      render(<TimeEntryForm />);

      // Click the timer toggle button
      const toggleButton = screen.getByRole('button', { name: '' }); // Toggle button has no accessible name
      await user.click(toggleButton);

      expect(screen.getByTestId('running-timer')).toBeInTheDocument();
    });

    it('disables hours input when timer is active', async () => {
      const user = userEvent.setup();
      render(<TimeEntryForm />);

      const toggleButton = screen.getByRole('button', { name: '' });
      await user.click(toggleButton);

      const hoursInput = screen.getByLabelText(/hours/i);
      expect(hoursInput).toBeDisabled();
    });

    it('updates hours when timer completes', async () => {
      const user = userEvent.setup();
      render(<TimeEntryForm />);

      // Enable timer
      const toggleButton = screen.getByRole('button', { name: '' });
      await user.click(toggleButton);

      // Complete timer (mock returns 1.5 hours)
      await user.click(screen.getByRole('button', { name: /complete timer/i }));

      const hoursInput = screen.getByLabelText(/hours/i);
      expect(hoursInput).toHaveValue(1.5);
    });

    it('hides timer after completion', async () => {
      const user = userEvent.setup();
      render(<TimeEntryForm />);

      const toggleButton = screen.getByRole('button', { name: '' });
      await user.click(toggleButton);

      await user.click(screen.getByRole('button', { name: /complete timer/i }));

      expect(screen.queryByTestId('running-timer')).not.toBeInTheDocument();
    });
  });

  describe('Pre-populated Form', () => {
    const existingEntry = {
      id: '123',
      caseId: 'C-2024-001',
      date: '2024-01-15',
      duration: 2.5,
      rate: 500,
      description: 'Legal research',
      taskCode: 'L200',
      activityType: 'Research',
      billable: false,
    };

    it('populates fields with existing entry data', () => {
      render(<TimeEntryForm entry={existingEntry} />);

      expect(screen.getByLabelText(/case\/matter/i)).toHaveValue('C-2024-001');
      expect(screen.getByLabelText(/date/i)).toHaveValue('2024-01-15');
      expect(screen.getByLabelText(/hours/i)).toHaveValue(2.5);
      expect(screen.getByLabelText(/rate/i)).toHaveValue(500);
      expect(screen.getByLabelText(/description/i)).toHaveValue('Legal research');
    });

    it('populates LEDES code from entry', () => {
      render(<TimeEntryForm entry={existingEntry} />);

      expect(screen.getByLabelText(/ledes task code/i)).toHaveValue('L200');
    });

    it('populates activity type from entry', () => {
      render(<TimeEntryForm entry={existingEntry} />);

      expect(screen.getByLabelText(/activity type/i)).toHaveValue('Research');
    });

    it('respects billable status from entry', () => {
      render(<TimeEntryForm entry={existingEntry} />);

      const billableCheckbox = screen.getByLabelText(/billable/i);
      expect(billableCheckbox).not.toBeChecked();
    });

    it('calculates correct total from entry values', () => {
      render(<TimeEntryForm entry={existingEntry} />);

      // 2.5 hours * 500 rate = $1250.00
      expect(screen.getByText('$1250.00')).toBeInTheDocument();
    });
  });

  describe('Form Actions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TimeEntryForm onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('form has correct method', () => {
      const { container } = render(<TimeEntryForm />);

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('method', 'post');
    });
  });

  describe('Hidden Fields', () => {
    it('includes hidden userId field', () => {
      const { container } = render(<TimeEntryForm />);

      const hiddenInput = container.querySelector('input[name="userId"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveValue('usr-admin-justin');
    });
  });

  describe('Accessibility', () => {
    it('has required field indicators', () => {
      render(<TimeEntryForm />);

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThan(0);
    });

    it('has proper label associations', () => {
      render(<TimeEntryForm />);

      expect(screen.getByLabelText(/case\/matter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });
});
