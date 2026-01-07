/**
 * @fileoverview Enterprise-grade test suite for Step2FormConfiguration component
 * @module features/document-assembly/__tests__/Step2FormConfiguration.test
 *
 * Tests cover:
 * - Form rendering with all fields
 * - Input handling and validation
 * - Form data change callbacks
 * - Generate button state and behavior
 * - Accessibility compliance
 * - Theme integration
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step2FormConfiguration } from '../Step2FormConfiguration';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock theme context
const mockTheme = {
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
  },
  border: { default: 'border-gray-200' },
  surface: { input: 'bg-white' },
};

jest.mock('@/providers', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter((c) => typeof c === 'string').join(' '),
}));

// Mock date utility
jest.mock('@/utils/dateUtils', () => ({
  getTodayString: () => '2024-01-15',
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Sparkles: ({ className }: { className?: string }) => (
    <span data-testid="icon-sparkles" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <span data-testid="icon-calendar" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <span data-testid="icon-user" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <span data-testid="icon-file-text" className={className} />
  ),
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const defaultProps = {
  template: 'Motion to Dismiss',
  formData: {
    recipient: '',
    date: '',
    mainPoint: '',
  },
  onFormDataChange: jest.fn(),
  onGenerate: jest.fn(),
};

const filledFormData = {
  recipient: 'John Smith, Esq.',
  date: '2024-02-15',
  mainPoint: 'The complaint fails to state a claim upon which relief can be granted.',
};

// ============================================================================
// TEST HELPERS
// ============================================================================

const renderWithProps = (overrides = {}) => {
  const props = { ...defaultProps, ...overrides };
  return render(<Step2FormConfiguration {...props} />);
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Step2FormConfiguration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithProps();

      expect(screen.getByText(/configure:/i)).toBeInTheDocument();
    });

    it('should display template name in heading', () => {
      renderWithProps({ template: 'Discovery Request' });

      expect(screen.getByText('Configure: Discovery Request')).toBeInTheDocument();
    });

    it('should render description text', () => {
      renderWithProps();

      expect(
        screen.getByText(/provide the details needed/i)
      ).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderWithProps();

      expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/document date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/main point/i)).toBeInTheDocument();
    });

    it('should render generate button', () => {
      renderWithProps();

      expect(
        screen.getByRole('button', { name: /generate draft/i })
      ).toBeInTheDocument();
    });

    it('should render AI enhancement tips section', () => {
      renderWithProps();

      expect(screen.getByText('AI Enhancement Tips')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // RECIPIENT FIELD TESTS
  // ==========================================================================

  describe('Recipient Field', () => {
    it('should render recipient input', () => {
      renderWithProps();

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      expect(input).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      renderWithProps();

      const label = screen.getByText(/recipient.*opposing party/i);
      const requiredStar = within(label.parentElement!).getByText('*');
      expect(requiredStar).toHaveClass('text-red-500');
    });

    it('should display current value', () => {
      renderWithProps({
        formData: { ...defaultProps.formData, recipient: 'Jane Doe' },
      });

      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    });

    it('should call onFormDataChange when value changes', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      await user.type(input, 'Test Recipient');

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should pass updated recipient value', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      await user.type(input, 'A');

      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ recipient: 'A' })
      );
    });

    it('should have user icon', () => {
      renderWithProps();

      expect(screen.getByTestId('icon-user')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // DATE FIELD TESTS
  // ==========================================================================

  describe('Date Field', () => {
    it('should render date input', () => {
      renderWithProps();

      const input = screen.getByLabelText(/document date/i);
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should default to today when date is empty', () => {
      renderWithProps();

      const input = screen.getByLabelText(/document date/i);
      expect(input).toHaveValue('2024-01-15');
    });

    it('should display provided date', () => {
      renderWithProps({
        formData: { ...defaultProps.formData, date: '2024-03-20' },
      });

      expect(screen.getByDisplayValue('2024-03-20')).toBeInTheDocument();
    });

    it('should call onFormDataChange when date changes', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByLabelText(/document date/i);
      await user.clear(input);
      await user.type(input, '2024-06-15');

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should have calendar icon', () => {
      renderWithProps();

      expect(screen.getByTestId('icon-calendar')).toBeInTheDocument();
    });

    it('should not be required', () => {
      renderWithProps();

      const label = screen.getByText(/document date/i);
      expect(within(label.parentElement!).queryByText('*')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // MAIN POINT FIELD TESTS
  // ==========================================================================

  describe('Main Point Field', () => {
    it('should render textarea', () => {
      renderWithProps();

      const textarea = screen.getByPlaceholderText(
        /describe the key arguments/i
      );
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should have 6 rows', () => {
      renderWithProps();

      const textarea = screen.getByPlaceholderText(
        /describe the key arguments/i
      );
      expect(textarea).toHaveAttribute('rows', '6');
    });

    it('should show required indicator', () => {
      renderWithProps();

      const label = screen.getByText(/main point.*purpose/i);
      const requiredStar = within(label.parentElement!).getByText('*');
      expect(requiredStar).toHaveClass('text-red-500');
    });

    it('should display current value', () => {
      renderWithProps({
        formData: { ...defaultProps.formData, mainPoint: 'Test main point' },
      });

      expect(screen.getByDisplayValue('Test main point')).toBeInTheDocument();
    });

    it('should call onFormDataChange when value changes', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const textarea = screen.getByPlaceholderText(
        /describe the key arguments/i
      );
      await user.type(textarea, 'New content');

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should show helper text', () => {
      renderWithProps();

      expect(screen.getByText(/be specific about legal issues/i)).toBeInTheDocument();
    });

    it('should have file text icon', () => {
      renderWithProps();

      expect(screen.getByTestId('icon-file-text')).toBeInTheDocument();
    });

    it('should not resize', () => {
      renderWithProps();

      const textarea = screen.getByPlaceholderText(
        /describe the key arguments/i
      );
      expect(textarea).toHaveClass('resize-none');
    });
  });

  // ==========================================================================
  // GENERATE BUTTON TESTS
  // ==========================================================================

  describe('Generate Button', () => {
    it('should be disabled when recipient is empty', () => {
      renderWithProps({
        formData: { recipient: '', date: '2024-01-15', mainPoint: 'Content' },
      });

      expect(
        screen.getByRole('button', { name: /generate draft/i })
      ).toBeDisabled();
    });

    it('should be disabled when mainPoint is empty', () => {
      renderWithProps({
        formData: { recipient: 'John', date: '2024-01-15', mainPoint: '' },
      });

      expect(
        screen.getByRole('button', { name: /generate draft/i })
      ).toBeDisabled();
    });

    it('should be enabled when required fields are filled', () => {
      renderWithProps({
        formData: { recipient: 'John', date: '', mainPoint: 'Content' },
      });

      expect(
        screen.getByRole('button', { name: /generate draft/i })
      ).not.toBeDisabled();
    });

    it('should call onGenerate when clicked', async () => {
      const onGenerate = jest.fn();
      const user = userEvent.setup();

      renderWithProps({
        formData: filledFormData,
        onGenerate,
      });

      await user.click(screen.getByRole('button', { name: /generate draft/i }));

      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('should have sparkles icon', () => {
      renderWithProps({ formData: filledFormData });

      const icons = screen.getAllByTestId('icon-sparkles');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have proper styling when enabled', () => {
      renderWithProps({ formData: filledFormData });

      const button = screen.getByRole('button', { name: /generate draft/i });
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should have proper styling when disabled', () => {
      renderWithProps();

      const button = screen.getByRole('button', { name: /generate draft/i });
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  // ==========================================================================
  // AI TIPS SECTION TESTS
  // ==========================================================================

  describe('AI Enhancement Tips', () => {
    it('should render tip header with sparkles icon', () => {
      renderWithProps();

      expect(screen.getByText('AI Enhancement Tips')).toBeInTheDocument();
    });

    it('should render all tips', () => {
      renderWithProps();

      expect(
        screen.getByText(/include relevant case law/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/mention specific statutes/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/provide key facts/i)).toBeInTheDocument();
      expect(
        screen.getByText(/state your legal position/i)
      ).toBeInTheDocument();
    });

    it('should have proper styling', () => {
      const { container } = renderWithProps();

      const tipsSection = container.querySelector('.bg-purple-50');
      expect(tipsSection).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FORM DATA UPDATES TESTS
  // ==========================================================================

  describe('Form Data Updates', () => {
    it('should preserve other fields when one changes', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({
        formData: { recipient: 'John', date: '2024-01-15', mainPoint: 'Content' },
        onFormDataChange,
      });

      const recipientInput = screen.getByDisplayValue('John');
      await user.clear(recipientInput);
      await user.type(recipientInput, 'Jane');

      const lastCall = onFormDataChange.mock.calls[onFormDataChange.mock.calls.length - 1][0];
      expect(lastCall.date).toBe('2024-01-15');
      expect(lastCall.mainPoint).toBe('Content');
    });

    it('should handle clearing fields', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({
        formData: filledFormData,
        onFormDataChange,
      });

      const recipientInput = screen.getByDisplayValue(filledFormData.recipient);
      await user.clear(recipientInput);

      expect(onFormDataChange).toHaveBeenCalledWith(
        expect.objectContaining({ recipient: '' })
      );
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible form fields', () => {
      renderWithProps();

      expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/document date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/main point/i)).toBeInTheDocument();
    });

    it('should have accessible heading', () => {
      renderWithProps();

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should indicate required fields visually', () => {
      renderWithProps();

      const requiredStars = screen.getAllByText('*');
      expect(requiredStars.length).toBe(2); // recipient and mainPoint
    });

    it('should have accessible button', () => {
      renderWithProps({ formData: filledFormData });

      const button = screen.getByRole('button', { name: /generate draft/i });
      expect(button).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProps();

      const recipientInput = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      recipientInput.focus();

      await user.tab();
      expect(screen.getByLabelText(/document date/i)).toHaveFocus();

      await user.tab();
      expect(
        screen.getByPlaceholderText(/describe the key arguments/i)
      ).toHaveFocus();
    });

    it('should have visible focus styles', () => {
      renderWithProps();

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle very long input', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      const longText = 'A'.repeat(500);

      await user.type(input, longText);

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should handle special characters', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      await user.type(input, "O'Brien & Associates, LLC");

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should handle multiline main point', () => {
      renderWithProps({
        formData: {
          recipient: 'John',
          date: '',
          mainPoint: 'Line 1\nLine 2\nLine 3',
        },
      });

      expect(screen.getByDisplayValue(/Line 1/)).toBeInTheDocument();
    });

    it('should handle unicode characters', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      await user.type(input, '株式会社テスト');

      expect(onFormDataChange).toHaveBeenCalled();
    });

    it('should handle rapid input changes', async () => {
      const onFormDataChange = jest.fn();
      const user = userEvent.setup();

      renderWithProps({ onFormDataChange });

      const input = screen.getByPlaceholderText(
        /john smith.*abc corporation/i
      );
      await user.type(input, 'rapid input');

      // Each character should trigger a change
      expect(onFormDataChange.mock.calls.length).toBeGreaterThan(1);
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for empty form', () => {
      const { container } = renderWithProps();
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for filled form', () => {
      const { container } = renderWithProps({ formData: filledFormData });
      expect(container).toMatchSnapshot();
    });
  });
});
