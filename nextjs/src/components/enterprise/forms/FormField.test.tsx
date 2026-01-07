/**
 * @module components/enterprise/forms/FormField.test
 * @description Unit tests for FormField component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from './FormField';
import type { FieldSchema, SelectFieldSchema, CheckboxFieldSchema, TextAreaFieldSchema } from '@/types/forms';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

const textField: FieldSchema = {
  name: 'username',
  label: 'Username',
  type: 'text',
  placeholder: 'Enter username',
  helpText: 'Your unique username',
  required: true,
};

const emailField: FieldSchema = {
  name: 'email',
  label: 'Email',
  type: 'email',
  placeholder: 'Enter email',
  required: true,
};

const passwordField: FieldSchema = {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter password',
};

const numberField: FieldSchema = {
  name: 'age',
  label: 'Age',
  type: 'number',
  min: 0,
  max: 150,
};

const dateField: FieldSchema = {
  name: 'birthDate',
  label: 'Birth Date',
  type: 'date',
};

const textareaField: TextAreaFieldSchema = {
  name: 'bio',
  label: 'Biography',
  type: 'textarea',
  placeholder: 'Tell us about yourself',
  rows: 4,
};

const selectField: SelectFieldSchema = {
  name: 'country',
  label: 'Country',
  type: 'select',
  options: [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' },
  ],
};

const checkboxField: CheckboxFieldSchema = {
  name: 'agree',
  label: 'I agree to the terms',
  type: 'checkbox',
};

const radioField: SelectFieldSchema = {
  name: 'gender',
  label: 'Gender',
  type: 'radio',
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ],
};

const defaultProps = {
  field: textField,
  value: '',
  onChange: jest.fn(),
  onBlur: jest.fn(),
};

const renderFormField = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<FormField {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// TEXT FIELD TESTS
// ============================================================================

describe('FormField text input', () => {
  it('should render text input with label', () => {
    renderFormField({ field: textField });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should render help text', () => {
    renderFormField({ field: textField });

    expect(screen.getByText('Your unique username')).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const onChange = jest.fn();
    renderFormField({ field: textField, onChange });

    const input = screen.getByLabelText(/username/i);
    await userEvent.type(input, 'john');

    expect(onChange).toHaveBeenCalledWith('j');
    expect(onChange).toHaveBeenCalledWith('jo');
    expect(onChange).toHaveBeenCalledWith('joh');
    expect(onChange).toHaveBeenCalledWith('john');
  });

  it('should call onBlur when losing focus', async () => {
    const onBlur = jest.fn();
    renderFormField({ field: textField, onBlur });

    const input = screen.getByLabelText(/username/i);
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalled();
  });

  it('should show required indicator', () => {
    renderFormField({ field: { ...textField, required: true } });

    const label = screen.getByText(/username/i);
    expect(label).toHaveClass('after:content-["*"]');
  });

  it('should display current value', () => {
    renderFormField({ field: textField, value: 'currentValue' });

    const input = screen.getByLabelText(/username/i) as HTMLInputElement;
    expect(input.value).toBe('currentValue');
  });
});

// ============================================================================
// EMAIL FIELD TESTS
// ============================================================================

describe('FormField email input', () => {
  it('should render email input', () => {
    renderFormField({ field: emailField });

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should accept valid email format', async () => {
    const onChange = jest.fn();
    renderFormField({ field: emailField, onChange });

    const input = screen.getByLabelText(/email/i);
    await userEvent.type(input, 'test@example.com');

    expect(onChange).toHaveBeenCalled();
  });
});

// ============================================================================
// PASSWORD FIELD TESTS
// ============================================================================

describe('FormField password input', () => {
  it('should render password input with masked characters', () => {
    renderFormField({ field: passwordField });

    const input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });
});

// ============================================================================
// NUMBER FIELD TESTS
// ============================================================================

describe('FormField number input', () => {
  it('should render number input', () => {
    renderFormField({ field: numberField });

    const input = screen.getByLabelText(/age/i);
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should have min and max attributes', () => {
    renderFormField({ field: numberField });

    const input = screen.getByLabelText(/age/i);
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '150');
  });

  it('should call onChange with numeric value', async () => {
    const onChange = jest.fn();
    renderFormField({ field: numberField, onChange });

    const input = screen.getByLabelText(/age/i);
    fireEvent.change(input, { target: { value: '25', valueAsNumber: 25 } });

    expect(onChange).toHaveBeenCalledWith(25);
  });
});

// ============================================================================
// DATE FIELD TESTS
// ============================================================================

describe('FormField date input', () => {
  it('should render date input', () => {
    renderFormField({ field: dateField });

    const input = screen.getByLabelText(/birth date/i);
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should call onChange with date string', async () => {
    const onChange = jest.fn();
    renderFormField({ field: dateField, onChange });

    const input = screen.getByLabelText(/birth date/i);
    fireEvent.change(input, { target: { value: '2023-01-15' } });

    expect(onChange).toHaveBeenCalledWith('2023-01-15');
  });
});

// ============================================================================
// TEXTAREA FIELD TESTS
// ============================================================================

describe('FormField textarea', () => {
  it('should render textarea', () => {
    renderFormField({ field: textareaField });

    const textarea = screen.getByLabelText(/biography/i);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should have correct rows attribute', () => {
    renderFormField({ field: textareaField });

    const textarea = screen.getByLabelText(/biography/i);
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('should call onChange when typing', async () => {
    const onChange = jest.fn();
    renderFormField({ field: textareaField, onChange });

    const textarea = screen.getByLabelText(/biography/i);
    await userEvent.type(textarea, 'Hello');

    expect(onChange).toHaveBeenCalled();
  });
});

// ============================================================================
// SELECT FIELD TESTS
// ============================================================================

describe('FormField select', () => {
  it('should render select with options', () => {
    renderFormField({ field: selectField });

    const select = screen.getByLabelText(/country/i);
    expect(select.tagName).toBe('SELECT');

    expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mexico' })).toBeInTheDocument();
  });

  it('should have default empty option when not required', () => {
    renderFormField({ field: { ...selectField, required: false } });

    expect(screen.getByRole('option', { name: 'Select...' })).toBeInTheDocument();
  });

  it('should call onChange when selecting option', async () => {
    const onChange = jest.fn();
    renderFormField({ field: selectField, onChange });

    const select = screen.getByLabelText(/country/i);
    await userEvent.selectOptions(select, 'ca');

    expect(onChange).toHaveBeenCalledWith('ca');
  });

  it('should show selected value', () => {
    renderFormField({ field: selectField, value: 'mx' });

    const select = screen.getByLabelText(/country/i) as HTMLSelectElement;
    expect(select.value).toBe('mx');
  });
});

// ============================================================================
// CHECKBOX FIELD TESTS
// ============================================================================

describe('FormField checkbox', () => {
  it('should render checkbox with label', () => {
    renderFormField({ field: checkboxField });

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('I agree to the terms')).toBeInTheDocument();
  });

  it('should be unchecked by default', () => {
    renderFormField({ field: checkboxField, value: false });

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('should be checked when value is true', () => {
    renderFormField({ field: checkboxField, value: true });

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should call onChange with boolean value', async () => {
    const onChange = jest.fn();
    renderFormField({ field: checkboxField, value: false, onChange });

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });
});

// ============================================================================
// RADIO FIELD TESTS
// ============================================================================

describe('FormField radio', () => {
  it('should render radio group', () => {
    renderFormField({ field: radioField });

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('should render all options', () => {
    renderFormField({ field: radioField });

    expect(screen.getByLabelText('Male')).toBeInTheDocument();
    expect(screen.getByLabelText('Female')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  it('should select correct option based on value', () => {
    renderFormField({ field: radioField, value: 'female' });

    expect(screen.getByLabelText('Female')).toBeChecked();
    expect(screen.getByLabelText('Male')).not.toBeChecked();
  });

  it('should call onChange when selecting option', async () => {
    const onChange = jest.fn();
    renderFormField({ field: radioField, value: 'male', onChange });

    await userEvent.click(screen.getByLabelText('Other'));

    expect(onChange).toHaveBeenCalledWith('other');
  });
});

// ============================================================================
// ERROR STATE TESTS
// ============================================================================

describe('FormField error state', () => {
  it('should display error message', () => {
    renderFormField({ error: 'Username is required' });

    expect(screen.getByRole('alert')).toHaveTextContent('Username is required');
  });

  it('should have error styling on input', () => {
    renderFormField({ error: 'Error message' });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('should set aria-invalid when error exists', () => {
    renderFormField({ error: 'Error message' });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

// ============================================================================
// WARNING STATE TESTS
// ============================================================================

describe('FormField warning state', () => {
  it('should display warning message', () => {
    renderFormField({ warning: 'Password is weak' });

    expect(screen.getByRole('status')).toHaveTextContent('Password is weak');
  });

  it('should have warning styling on input', () => {
    renderFormField({ warning: 'Warning message' });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveClass('border-yellow-500');
  });

  it('should not show warning when error exists', () => {
    renderFormField({
      error: 'Error message',
      warning: 'Warning message',
    });

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Warning message')).not.toBeInTheDocument();
  });
});

// ============================================================================
// DISABLED STATE TESTS
// ============================================================================

describe('FormField disabled state', () => {
  it('should disable input when disabled prop is true', () => {
    renderFormField({ disabled: true });

    const input = screen.getByLabelText(/username/i);
    expect(input).toBeDisabled();
  });

  it('should disable input when field.disabled is true', () => {
    renderFormField({ field: { ...textField, disabled: true } });

    const input = screen.getByLabelText(/username/i);
    expect(input).toBeDisabled();
  });

  it('should apply disabled styling', () => {
    renderFormField({ disabled: true });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});

// ============================================================================
// READ-ONLY STATE TESTS
// ============================================================================

describe('FormField read-only state', () => {
  it('should make input read-only', () => {
    renderFormField({ readOnly: true });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('readonly');
  });

  it('should apply read-only styling', () => {
    renderFormField({ readOnly: true });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveClass('bg-gray-50', 'cursor-default');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('FormField accessibility', () => {
  it('should have proper label association', () => {
    renderFormField();

    const input = screen.getByLabelText(/username/i);
    expect(input).toBeInTheDocument();
  });

  it('should set aria-required for required fields', () => {
    renderFormField({ field: { ...textField, required: true } });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('should have aria-describedby linking to help text', () => {
    renderFormField({ field: textField });

    const input = screen.getByLabelText(/username/i);
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  it('should have aria-describedby linking to error', () => {
    renderFormField({ error: 'Error message' });

    const input = screen.getByLabelText(/username/i);
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  it('should set custom aria-label', () => {
    renderFormField({
      field: { ...textField, ariaLabel: 'Custom aria label' },
    });

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-label', 'Custom aria label');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('FormField edge cases', () => {
  it('should handle null value', () => {
    renderFormField({ value: null });

    const input = screen.getByLabelText(/username/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle undefined value', () => {
    renderFormField({ value: undefined });

    const input = screen.getByLabelText(/username/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should render unsupported field type message', () => {
    const unsupportedField = { ...textField, type: 'unsupported' };
    renderFormField({ field: unsupportedField as FieldSchema });

    expect(screen.getByText(/unsupported field type/i)).toBeInTheDocument();
  });

  it('should handle empty options array for select', () => {
    const emptySelectField = { ...selectField, options: [] } as SelectFieldSchema;
    renderFormField({ field: emptySelectField });

    const select = screen.getByLabelText(/country/i);
    expect(select).toBeInTheDocument();
  });

  it('should handle info message', () => {
    renderFormField({ info: 'Info message' });

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should not show info when error exists', () => {
    renderFormField({
      error: 'Error message',
      info: 'Info message',
    });

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Info message')).not.toBeInTheDocument();
  });

  it('should not show info when warning exists', () => {
    renderFormField({
      warning: 'Warning message',
      info: 'Info message',
    });

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.queryByText('Info message')).not.toBeInTheDocument();
  });
});

// ============================================================================
// SPECIAL INPUT TYPES
// ============================================================================

describe('FormField special types', () => {
  it('should render color input', () => {
    const colorField = { ...textField, type: 'color', name: 'color', label: 'Color' };
    renderFormField({ field: colorField as FieldSchema, value: '#ff0000' });

    const input = screen.getByLabelText(/color/i);
    expect(input).toHaveAttribute('type', 'color');
    expect(input).toHaveValue('#ff0000');
  });

  it('should render tel input', () => {
    const telField = { ...textField, type: 'tel', name: 'phone', label: 'Phone' };
    renderFormField({ field: telField as FieldSchema });

    const input = screen.getByLabelText(/phone/i);
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('should render url input', () => {
    const urlField = { ...textField, type: 'url', name: 'website', label: 'Website' };
    renderFormField({ field: urlField as FieldSchema });

    const input = screen.getByLabelText(/website/i);
    expect(input).toHaveAttribute('type', 'url');
  });

  it('should render search input', () => {
    const searchField = { ...textField, type: 'search', name: 'search', label: 'Search' };
    renderFormField({ field: searchField as FieldSchema });

    const input = screen.getByLabelText(/search/i);
    expect(input).toHaveAttribute('type', 'search');
  });
});
