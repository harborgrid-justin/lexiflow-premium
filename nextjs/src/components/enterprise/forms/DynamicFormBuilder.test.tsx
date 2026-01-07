/**
 * @module components/enterprise/forms/DynamicFormBuilder.test
 * @description Unit tests for DynamicFormBuilder component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicFormBuilder } from './DynamicFormBuilder';
import type { FormConfig, FormSchema, FieldSchema, FormSection } from '@/types/forms';

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

// Mock form validation hook
const mockSetValue = jest.fn();
const mockSetTouched = jest.fn();
const mockValidateAll = jest.fn().mockResolvedValue(true);
const mockReset = jest.fn();

jest.mock('@/hooks/useEnhancedFormValidation', () => ({
  useEnhancedFormValidation: () => ({
    formState: {
      data: { firstName: '', lastName: '', email: '' },
      isDirty: false,
    },
    setValue: mockSetValue,
    setTouched: mockSetTouched,
    validateAll: mockValidateAll,
    reset: mockReset,
    isFieldVisible: () => true,
    errors: {},
    warnings: {},
    isValid: true,
    isValidating: false,
  }),
}));

// Mock auto-save hook
jest.mock('@/hooks/useEnhancedAutoSave', () => ({
  useEnhancedAutoSave: () => ({
    isSaving: false,
    status: 'idle',
    lastSaved: null,
    error: null,
  }),
}));

// Mock form components
jest.mock('./FormField', () => ({
  FormField: ({ field, value, onChange, error }: { field: FieldSchema; value: unknown; onChange: (v: unknown) => void; error?: string }) => (
    <div data-testid={`field-${field.name}`}>
      <label htmlFor={field.name}>{field.label}</label>
      <input
        id={field.name}
        type={field.type === 'email' ? 'email' : 'text'}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

jest.mock('./FormSection', () => ({
  FormSectionComponent: ({ section, children }: { section: FormSection; children: React.ReactNode }) => (
    <div data-testid={`section-${section.id}`}>
      <h3>{section.title}</h3>
      {children}
    </div>
  ),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const testFields: FieldSchema[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
];

const testSections: FormSection[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: [testFields[0], testFields[1]],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    fields: [testFields[2]],
  },
];

const testSchema: FormSchema<TestFormData> = {
  title: 'Test Form',
  description: 'This is a test form',
  fields: testFields,
};

const testSchemaWithSections: FormSchema<TestFormData> = {
  title: 'Test Form with Sections',
  description: 'This is a test form with sections',
  sections: testSections,
};

const testInitialValues: TestFormData = {
  firstName: '',
  lastName: '',
  email: '',
};

const mockOnSubmit = jest.fn();

const testConfig: FormConfig<TestFormData> = {
  schema: testSchema,
  initialValues: testInitialValues,
  onSubmit: mockOnSubmit,
};

const defaultProps = {
  config: testConfig,
};

const renderFormBuilder = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DynamicFormBuilder {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('DynamicFormBuilder rendering', () => {
  it('should render form title', () => {
    renderFormBuilder();

    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  it('should render form description', () => {
    renderFormBuilder();

    expect(screen.getByText('This is a test form')).toBeInTheDocument();
  });

  it('should render all fields', () => {
    renderFormBuilder();

    expect(screen.getByTestId('field-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('field-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('field-email')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderFormBuilder();

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should render cancel button when onCancel is provided', () => {
    const config = { ...testConfig, onCancel: jest.fn() };
    renderFormBuilder({ config });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should not render cancel button when onCancel is not provided', () => {
    renderFormBuilder();

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should render reset button when showReset is true', () => {
    const schema = { ...testSchema, showReset: true };
    renderFormBuilder({ config: { ...testConfig, schema } });

    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });
});

// ============================================================================
// SECTIONS TESTS
// ============================================================================

describe('DynamicFormBuilder sections', () => {
  it('should render sections when defined', () => {
    const config = {
      ...testConfig,
      schema: testSchemaWithSections,
    };
    renderFormBuilder({ config });

    expect(screen.getByTestId('section-personal')).toBeInTheDocument();
    expect(screen.getByTestId('section-contact')).toBeInTheDocument();
  });

  it('should render section titles', () => {
    const config = {
      ...testConfig,
      schema: testSchemaWithSections,
    };
    renderFormBuilder({ config });

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('should render fields within sections', () => {
    const config = {
      ...testConfig,
      schema: testSchemaWithSections,
    };
    renderFormBuilder({ config });

    const personalSection = screen.getByTestId('section-personal');
    expect(personalSection).toContainElement(screen.getByTestId('field-firstName'));
    expect(personalSection).toContainElement(screen.getByTestId('field-lastName'));

    const contactSection = screen.getByTestId('section-contact');
    expect(contactSection).toContainElement(screen.getByTestId('field-email'));
  });
});

// ============================================================================
// FORM ACTIONS TESTS
// ============================================================================

describe('DynamicFormBuilder form actions', () => {
  it('should not render actions when showActions is false', () => {
    renderFormBuilder({ showActions: false });

    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });

  it('should render custom submit text', () => {
    const schema = { ...testSchema, submitText: 'Save Changes' };
    renderFormBuilder({ config: { ...testConfig, schema } });

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('should render custom cancel text', () => {
    const schema = { ...testSchema, cancelText: 'Discard' };
    const config = { ...testConfig, schema, onCancel: jest.fn() };
    renderFormBuilder({ config });

    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  });
});

// ============================================================================
// FORM SUBMISSION TESTS
// ============================================================================

describe('DynamicFormBuilder submission', () => {
  it('should call validateAll on form submit', async () => {
    renderFormBuilder();

    const form = screen.getByRole('button', { name: /submit/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockValidateAll).toHaveBeenCalled();
    });
  });

  it('should call onSubmit when validation passes', async () => {
    renderFormBuilder();

    const form = screen.getByRole('button', { name: /submit/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should not call onSubmit when validation fails', async () => {
    mockValidateAll.mockResolvedValueOnce(false);
    renderFormBuilder();

    const form = screen.getByRole('button', { name: /submit/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockValidateAll).toHaveBeenCalled();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback on successful submit', async () => {
    const onSuccess = jest.fn();
    const config = { ...testConfig, onSuccess };
    renderFormBuilder({ config });

    const form = screen.getByRole('button', { name: /submit/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should call onError callback on submit error', async () => {
    const error = new Error('Submit failed');
    mockOnSubmit.mockRejectedValueOnce(error);

    const onError = jest.fn();
    const config = { ...testConfig, onError };
    renderFormBuilder({ config });

    const form = screen.getByRole('button', { name: /submit/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

// ============================================================================
// FORM RESET TESTS
// ============================================================================

describe('DynamicFormBuilder reset', () => {
  it('should call reset when clicking reset button', async () => {
    const schema = { ...testSchema, showReset: true };
    renderFormBuilder({ config: { ...testConfig, schema } });

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(mockReset).toHaveBeenCalled();
  });

  it('should disable reset when form is not dirty', () => {
    const schema = { ...testSchema, showReset: true };
    renderFormBuilder({ config: { ...testConfig, schema } });

    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });
});

// ============================================================================
// CANCEL TESTS
// ============================================================================

describe('DynamicFormBuilder cancel', () => {
  it('should call onCancel when clicking cancel button', async () => {
    const onCancel = jest.fn();
    const config = { ...testConfig, onCancel };
    renderFormBuilder({ config });

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('DynamicFormBuilder loading state', () => {
  it('should show loading overlay when isLoading is true', () => {
    renderFormBuilder({ isLoading: true });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should disable form content when loading', () => {
    renderFormBuilder({ isLoading: true });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});

// ============================================================================
// READ-ONLY MODE TESTS
// ============================================================================

describe('DynamicFormBuilder read-only mode', () => {
  it('should disable submit button in read-only mode', () => {
    renderFormBuilder({ readOnly: true });

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
});

// ============================================================================
// AUTO-SAVE TESTS
// ============================================================================

describe('DynamicFormBuilder auto-save', () => {
  it('should show auto-save indicator when enabled', () => {
    const schema: FormSchema<TestFormData> = {
      ...testSchema,
      autoSave: {
        enabled: true,
        showIndicator: true,
      },
    };

    const { useEnhancedAutoSave } = require('@/hooks/useEnhancedAutoSave');
    useEnhancedAutoSave.mockReturnValueOnce({
      isSaving: true,
      status: 'saving',
      lastSaved: null,
      error: null,
    });

    renderFormBuilder({ config: { ...testConfig, schema, enableAutoSave: true } });

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should show saved status', () => {
    const schema: FormSchema<TestFormData> = {
      ...testSchema,
      autoSave: {
        enabled: true,
        showIndicator: true,
      },
    };

    const lastSaved = new Date();
    const { useEnhancedAutoSave } = require('@/hooks/useEnhancedAutoSave');
    useEnhancedAutoSave.mockReturnValueOnce({
      isSaving: false,
      status: 'saved',
      lastSaved,
      error: null,
    });

    renderFormBuilder({ config: { ...testConfig, schema, enableAutoSave: true } });

    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });

  it('should show error status', () => {
    const schema: FormSchema<TestFormData> = {
      ...testSchema,
      autoSave: {
        enabled: true,
        showIndicator: true,
      },
    };

    const { useEnhancedAutoSave } = require('@/hooks/useEnhancedAutoSave');
    useEnhancedAutoSave.mockReturnValueOnce({
      isSaving: false,
      status: 'error',
      lastSaved: null,
      error: 'Network error',
    });

    renderFormBuilder({ config: { ...testConfig, schema, enableAutoSave: true } });

    expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});

// ============================================================================
// CUSTOM RENDERERS TESTS
// ============================================================================

describe('DynamicFormBuilder custom renderers', () => {
  it('should use custom renderer for field type', () => {
    const CustomEmailRenderer = ({ field }: { field: FieldSchema }) => (
      <div data-testid="custom-email-renderer">
        Custom: {field.label}
      </div>
    );

    renderFormBuilder({
      customRenderers: {
        email: CustomEmailRenderer,
      },
    });

    expect(screen.getByTestId('custom-email-renderer')).toBeInTheDocument();
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('DynamicFormBuilder styling', () => {
  it('should apply custom className', () => {
    const { container } = renderFormBuilder({ className: 'custom-form' });

    expect(container.firstChild).toHaveClass('custom-form');
  });

  it('should have full width styling', () => {
    const { container } = renderFormBuilder();

    expect(container.firstChild).toHaveClass('w-full');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('DynamicFormBuilder accessibility', () => {
  it('should have proper heading hierarchy', () => {
    renderFormBuilder();

    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Test Form');
  });

  it('should have form element', () => {
    renderFormBuilder();

    expect(screen.getByRole('button', { name: /submit/i }).closest('form')).toBeInTheDocument();
  });

  it('should have proper button types', () => {
    const schema = { ...testSchema, showReset: true };
    const config = { ...testConfig, schema, onCancel: jest.fn() };
    renderFormBuilder({ config });

    expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('button', { name: /cancel/i })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: /reset/i })).toHaveAttribute('type', 'button');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('DynamicFormBuilder edge cases', () => {
  it('should handle no title', () => {
    const schema = { ...testSchema, title: undefined };
    renderFormBuilder({ config: { ...testConfig, schema } });

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('should handle no description', () => {
    const schema = { ...testSchema, description: undefined };
    renderFormBuilder({ config: { ...testConfig, schema } });

    expect(screen.queryByText('This is a test form')).not.toBeInTheDocument();
  });

  it('should handle no fields', () => {
    const schema = { ...testSchema, fields: undefined, sections: undefined };
    const { container } = renderFormBuilder({ config: { ...testConfig, schema } });

    // Should still render the form structure
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should handle empty fields array', () => {
    const schema = { ...testSchema, fields: [] };
    const { container } = renderFormBuilder({ config: { ...testConfig, schema } });

    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should handle empty sections array', () => {
    const schema = { ...testSchema, fields: undefined, sections: [] };
    const { container } = renderFormBuilder({ config: { ...testConfig, schema } });

    expect(container.querySelector('form')).toBeInTheDocument();
  });
});

// ============================================================================
// VALIDATING STATE TESTS
// ============================================================================

describe('DynamicFormBuilder validating state', () => {
  it('should show validating text when validating', () => {
    const { useEnhancedFormValidation } = require('@/hooks/useEnhancedFormValidation');
    useEnhancedFormValidation.mockReturnValueOnce({
      formState: { data: testInitialValues, isDirty: false },
      setValue: mockSetValue,
      setTouched: mockSetTouched,
      validateAll: mockValidateAll,
      reset: mockReset,
      isFieldVisible: () => true,
      errors: {},
      warnings: {},
      isValid: true,
      isValidating: true,
    });

    renderFormBuilder();

    expect(screen.getByRole('button', { name: /validating/i })).toBeInTheDocument();
  });

  it('should disable submit button when validating', () => {
    const { useEnhancedFormValidation } = require('@/hooks/useEnhancedFormValidation');
    useEnhancedFormValidation.mockReturnValueOnce({
      formState: { data: testInitialValues, isDirty: false },
      setValue: mockSetValue,
      setTouched: mockSetTouched,
      validateAll: mockValidateAll,
      reset: mockReset,
      isFieldVisible: () => true,
      errors: {},
      warnings: {},
      isValid: true,
      isValidating: true,
    });

    renderFormBuilder();

    expect(screen.getByRole('button', { name: /validating/i })).toBeDisabled();
  });
});

// ============================================================================
// INVALID FORM STATE TESTS
// ============================================================================

describe('DynamicFormBuilder invalid state', () => {
  it('should disable submit button when form is invalid', () => {
    const { useEnhancedFormValidation } = require('@/hooks/useEnhancedFormValidation');
    useEnhancedFormValidation.mockReturnValueOnce({
      formState: { data: testInitialValues, isDirty: true },
      setValue: mockSetValue,
      setTouched: mockSetTouched,
      validateAll: mockValidateAll,
      reset: mockReset,
      isFieldVisible: () => true,
      errors: { firstName: 'Required' },
      warnings: {},
      isValid: false,
      isValidating: false,
    });

    renderFormBuilder();

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
});
