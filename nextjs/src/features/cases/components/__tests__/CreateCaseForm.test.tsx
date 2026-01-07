/**
 * @fileoverview Enterprise-grade test suite for CreateCaseForm component
 * @module features/cases/components/__tests__/CreateCaseForm.test
 *
 * Tests cover:
 * - Form rendering and initial state
 * - Input field validation
 * - Form submission with React 19 useActionState
 * - Success and error state handling
 * - Loading/pending state
 * - Accessibility compliance
 * - User interaction flows
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCaseForm } from '../CreateCaseForm';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Store mock implementation for useActionState
let mockActionState = {
  success: false,
  message: '',
};
let mockIsPending = false;
let mockFormAction = jest.fn();

// Mock React's useActionState hook
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useActionState: (action: Function, initialState: any) => {
      return [mockActionState, mockFormAction, mockIsPending];
    },
  };
});

// Mock the server action
jest.mock('@/actions/case-actions', () => ({
  createCaseAction: jest.fn(),
}));

// ============================================================================
// TEST HELPERS
// ============================================================================

const resetMocks = () => {
  mockActionState = { success: false, message: '' };
  mockIsPending = false;
  mockFormAction = jest.fn();
};

const setSuccessState = (message: string) => {
  mockActionState = { success: true, message };
};

const setErrorState = (message: string) => {
  mockActionState = { success: false, message };
};

const setPendingState = (pending: boolean) => {
  mockIsPending = pending;
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('CreateCaseForm Component', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the form with all required fields', () => {
      render(<CreateCaseForm />);

      expect(screen.getByLabelText(/case title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/case number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should render submit button with correct text', () => {
      render(<CreateCaseForm />);

      expect(
        screen.getByRole('button', { name: /create case/i })
      ).toBeInTheDocument();
    });

    it('should render form with proper structure', () => {
      const { container } = render(<CreateCaseForm />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-6');
    });

    it('should render with proper styling classes', () => {
      const { container } = render(<CreateCaseForm />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('max-w-lg');
      expect(form).toHaveClass('mx-auto');
      expect(form).toHaveClass('bg-white');
      expect(form).toHaveClass('rounded');
      expect(form).toHaveClass('shadow');
    });
  });

  // ==========================================================================
  // FORM FIELDS TESTS
  // ==========================================================================

  describe('Form Fields', () => {
    describe('Case Title Field', () => {
      it('should render title input with correct attributes', () => {
        render(<CreateCaseForm />);

        const titleInput = screen.getByLabelText(/case title/i);

        expect(titleInput).toHaveAttribute('type', 'text');
        expect(titleInput).toHaveAttribute('name', 'title');
        expect(titleInput).toHaveAttribute('id', 'title');
        expect(titleInput).toBeRequired();
      });

      it('should have correct placeholder text', () => {
        render(<CreateCaseForm />);

        const titleInput = screen.getByLabelText(/case title/i);
        expect(titleInput).toHaveAttribute('placeholder', 'e.g. Smith v. Jones');
      });

      it('should accept user input', async () => {
        const user = userEvent.setup();
        render(<CreateCaseForm />);

        const titleInput = screen.getByLabelText(/case title/i);
        await user.type(titleInput, 'Test Case Title');

        expect(titleInput).toHaveValue('Test Case Title');
      });
    });

    describe('Case Number Field', () => {
      it('should render case number input with correct attributes', () => {
        render(<CreateCaseForm />);

        const caseNumberInput = screen.getByLabelText(/case number/i);

        expect(caseNumberInput).toHaveAttribute('type', 'text');
        expect(caseNumberInput).toHaveAttribute('name', 'caseNumber');
        expect(caseNumberInput).toHaveAttribute('id', 'caseNumber');
        expect(caseNumberInput).toBeRequired();
      });

      it('should have correct placeholder text', () => {
        render(<CreateCaseForm />);

        const caseNumberInput = screen.getByLabelText(/case number/i);
        expect(caseNumberInput).toHaveAttribute(
          'placeholder',
          'e.g. 2024-CV-12345'
        );
      });

      it('should accept user input', async () => {
        const user = userEvent.setup();
        render(<CreateCaseForm />);

        const caseNumberInput = screen.getByLabelText(/case number/i);
        await user.type(caseNumberInput, '2024-CV-99999');

        expect(caseNumberInput).toHaveValue('2024-CV-99999');
      });
    });

    describe('Description Field', () => {
      it('should render description textarea with correct attributes', () => {
        render(<CreateCaseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);

        expect(descriptionInput.tagName).toBe('TEXTAREA');
        expect(descriptionInput).toHaveAttribute('name', 'description');
        expect(descriptionInput).toHaveAttribute('id', 'description');
        expect(descriptionInput).toHaveAttribute('rows', '4');
      });

      it('should not be required', () => {
        render(<CreateCaseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        expect(descriptionInput).not.toBeRequired();
      });

      it('should accept multiline text', async () => {
        const user = userEvent.setup();
        render(<CreateCaseForm />);

        const descriptionInput = screen.getByLabelText(/description/i);
        const multilineText = 'Line 1\nLine 2\nLine 3';

        await user.type(descriptionInput, multilineText);

        expect(descriptionInput).toHaveValue(multilineText);
      });
    });
  });

  // ==========================================================================
  // FORM SUBMISSION TESTS
  // ==========================================================================

  describe('Form Submission', () => {
    it('should have form action attribute', () => {
      render(<CreateCaseForm />);

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('action');
    });

    it('should render submit button of type submit', () => {
      render(<CreateCaseForm />);

      const submitButton = screen.getByRole('button', { name: /create case/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should show loading text when pending', () => {
      setPendingState(true);

      render(<CreateCaseForm />);

      expect(
        screen.getByRole('button', { name: /creating/i })
      ).toBeInTheDocument();
    });

    it('should disable submit button when pending', () => {
      setPendingState(true);

      render(<CreateCaseForm />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    it('should have reduced opacity styling when disabled', () => {
      setPendingState(true);

      render(<CreateCaseForm />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveClass('disabled:opacity-50');
    });
  });

  // ==========================================================================
  // SUCCESS STATE TESTS
  // ==========================================================================

  describe('Success State', () => {
    it('should display success message when form submission succeeds', () => {
      setSuccessState('Case created successfully!');

      render(<CreateCaseForm />);

      expect(screen.getByText('Case created successfully!')).toBeInTheDocument();
    });

    it('should apply success styling to message', () => {
      setSuccessState('Success!');

      render(<CreateCaseForm />);

      const messageElement = screen.getByText('Success!');
      const messageContainer = messageElement.closest('div[class*="bg-green"]');
      expect(messageContainer).toHaveClass('bg-green-100');
      expect(messageContainer).toHaveClass('text-green-800');
    });

    it('should show message in a rounded container', () => {
      setSuccessState('Success!');

      render(<CreateCaseForm />);

      const messageElement = screen.getByText('Success!');
      const messageContainer = messageElement.closest('div[class*="bg-green"]');
      expect(messageContainer).toHaveClass('rounded');
      expect(messageContainer).toHaveClass('p-4');
    });
  });

  // ==========================================================================
  // ERROR STATE TESTS
  // ==========================================================================

  describe('Error State', () => {
    it('should display error message when form submission fails', () => {
      setErrorState('Failed to create case. Please try again.');

      render(<CreateCaseForm />);

      expect(
        screen.getByText('Failed to create case. Please try again.')
      ).toBeInTheDocument();
    });

    it('should apply error styling to message', () => {
      setErrorState('Error occurred!');

      render(<CreateCaseForm />);

      const messageElement = screen.getByText('Error occurred!');
      const messageContainer = messageElement.closest('div[class*="bg-red"]');
      expect(messageContainer).toHaveClass('bg-red-100');
      expect(messageContainer).toHaveClass('text-red-800');
    });

    it('should not show message container when there is no message', () => {
      resetMocks();

      const { container } = render(<CreateCaseForm />);

      const messageContainers = container.querySelectorAll(
        '.bg-green-100, .bg-red-100'
      );
      expect(messageContainers).toHaveLength(0);
    });
  });

  // ==========================================================================
  // USER INTERACTION TESTS
  // ==========================================================================

  describe('User Interactions', () => {
    it('should allow filling out the complete form', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);
      const caseNumberInput = screen.getByLabelText(/case number/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'Johnson v. Smith Corp');
      await user.type(caseNumberInput, '2024-CV-56789');
      await user.type(descriptionInput, 'Commercial dispute regarding breach of contract');

      expect(titleInput).toHaveValue('Johnson v. Smith Corp');
      expect(caseNumberInput).toHaveValue('2024-CV-56789');
      expect(descriptionInput).toHaveValue(
        'Commercial dispute regarding breach of contract'
      );
    });

    it('should support keyboard navigation between fields', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);

      // Focus first field
      await user.click(titleInput);
      expect(titleInput).toHaveFocus();

      // Tab to next field
      await user.tab();
      expect(screen.getByLabelText(/case number/i)).toHaveFocus();

      // Tab to description
      await user.tab();
      expect(screen.getByLabelText(/description/i)).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('should clear and retype in input fields', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);

      await user.type(titleInput, 'Initial Title');
      expect(titleInput).toHaveValue('Initial Title');

      await user.clear(titleInput);
      expect(titleInput).toHaveValue('');

      await user.type(titleInput, 'New Title');
      expect(titleInput).toHaveValue('New Title');
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have properly associated labels', () => {
      render(<CreateCaseForm />);

      const titleLabel = screen.getByText('Case Title');
      const titleInput = screen.getByLabelText(/case title/i);

      expect(titleLabel).toHaveAttribute('for', 'title');
      expect(titleInput).toHaveAttribute('id', 'title');
    });

    it('should have accessible form structure', () => {
      render(<CreateCaseForm />);

      // All inputs should have labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('should have accessible submit button', () => {
      render(<CreateCaseForm />);

      const submitButton = screen.getByRole('button');
      expect(submitButton).toHaveAccessibleName();
    });

    it('should indicate required fields', () => {
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);
      const caseNumberInput = screen.getByLabelText(/case number/i);

      expect(titleInput).toBeRequired();
      expect(caseNumberInput).toBeRequired();
    });

    it('should announce pending state via button text change', () => {
      setPendingState(true);

      render(<CreateCaseForm />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/creating/i);
    });

    it('should show success/error messages in accessible container', () => {
      setErrorState('Validation error');

      render(<CreateCaseForm />);

      const message = screen.getByText('Validation error');
      // Message should be visible and readable
      expect(message).toBeVisible();
    });
  });

  // ==========================================================================
  // STYLING TESTS
  // ==========================================================================

  describe('Styling', () => {
    it('should have proper input styling', () => {
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);

      expect(titleInput).toHaveClass('w-full');
      expect(titleInput).toHaveClass('rounded-md');
      expect(titleInput).toHaveClass('border');
      expect(titleInput).toHaveClass('border-gray-300');
    });

    it('should have focus styling classes', () => {
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);

      expect(titleInput).toHaveClass('focus:border-blue-500');
      expect(titleInput).toHaveClass('focus:ring-blue-500');
    });

    it('should have proper button styling', () => {
      render(<CreateCaseForm />);

      const submitButton = screen.getByRole('button');

      expect(submitButton).toHaveClass('w-full');
      expect(submitButton).toHaveClass('bg-blue-600');
      expect(submitButton).toHaveClass('text-white');
      expect(submitButton).toHaveClass('rounded-md');
      expect(submitButton).toHaveClass('hover:bg-blue-700');
    });

    it('should have proper label styling', () => {
      render(<CreateCaseForm />);

      const labels = screen.getAllByText(/case title|case number|description/i);

      labels.forEach((label) => {
        if (label.tagName === 'LABEL') {
          expect(label).toHaveClass('text-sm');
          expect(label).toHaveClass('font-medium');
          expect(label).toHaveClass('text-gray-700');
        }
      });
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle very long input values', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);
      const longTitle = 'A'.repeat(500);

      await user.type(titleInput, longTitle);

      expect(titleInput).toHaveValue(longTitle);
    });

    it('should handle special characters in input', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);
      const specialChars = 'O\'Brien & Associates v. McDonald\'s Corp.';

      await user.type(titleInput, specialChars);

      expect(titleInput).toHaveValue(specialChars);
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      render(<CreateCaseForm />);

      const titleInput = screen.getByLabelText(/case title/i);
      const unicodeText = '日本語テスト v. 中文测试';

      await user.type(titleInput, unicodeText);

      expect(titleInput).toHaveValue(unicodeText);
    });

    it('should handle empty message gracefully', () => {
      mockActionState = { success: false, message: '' };

      const { container } = render(<CreateCaseForm />);

      // No error/success container should be rendered
      const messageContainers = container.querySelectorAll('.bg-green-100, .bg-red-100');
      expect(messageContainers).toHaveLength(0);
    });

    it('should handle rapid state changes', () => {
      // Simulate rapid changes
      setSuccessState('First message');
      const { rerender } = render(<CreateCaseForm />);

      expect(screen.getByText('First message')).toBeInTheDocument();

      setErrorState('Second message');
      rerender(<CreateCaseForm />);

      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.queryByText('First message')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      resetMocks();
      const { container } = render(<CreateCaseForm />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for pending state', () => {
      setPendingState(true);
      const { container } = render(<CreateCaseForm />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for success state', () => {
      setSuccessState('Case created successfully!');
      const { container } = render(<CreateCaseForm />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state', () => {
      setErrorState('Failed to create case');
      const { container } = render(<CreateCaseForm />);
      expect(container).toMatchSnapshot();
    });
  });
});
