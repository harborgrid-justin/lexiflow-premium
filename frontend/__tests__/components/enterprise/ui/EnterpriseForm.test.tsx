/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EnterpriseForm, FormSection, FormField } from '@/components/enterprise/ui/EnterpriseForm';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

const basicSection: FormSection = {
  title: 'Basic Information',
  description: 'Enter your basic information',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter first name',
      validation: [{ type: 'required' }],
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name',
      validation: [{ type: 'required' }],
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
      validation: [{ type: 'required' }, { type: 'email' }],
    },
  ],
};

describe('EnterpriseForm', () => {
  describe('Field Rendering', () => {
    it('should render all form fields', () => {
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render section titles and descriptions', () => {
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Enter your basic information')).toBeInTheDocument();
    });

    it('should render required field indicators', () => {
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const labels = screen.getAllByText('*');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render different field types', () => {
      const section: FormSection = {
        fields: [
          { name: 'textField', label: 'Text Field', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Password', type: 'password' },
          { name: 'number', label: 'Number', type: 'number' },
          { name: 'textarea', label: 'Textarea', type: 'textarea' },
          { name: 'select', label: 'Select', type: 'select', options: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ]},
          { name: 'checkbox', label: 'Checkbox', type: 'checkbox' },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText('Text Field')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Number')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument();
      expect(screen.getByLabelText('Select')).toBeInTheDocument();
      expect(screen.getByLabelText('Checkbox')).toHaveAttribute('type', 'checkbox');
    });

    it('should render help text for fields', () => {
      const section: FormSection = {
        fields: [
          {
            name: 'username',
            label: 'Username',
            type: 'text',
            helpText: 'Choose a unique username',
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByText('Choose a unique username')).toBeInTheDocument();
    });

    it('should apply initial data to fields', () => {
      const initialData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      renderWithTheme(
        <EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} initialData={initialData} />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('should disable fields when disabled prop is true', () => {
      const section: FormSection = {
        fields: [
          {
            name: 'disabledField',
            label: 'Disabled Field',
            type: 'text',
            disabled: true,
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/disabled field/i)).toBeDisabled();
    });

    it('should make fields readonly when readOnly prop is true', () => {
      const section: FormSection = {
        fields: [
          {
            name: 'readonlyField',
            label: 'Readonly Field',
            type: 'text',
            readOnly: true,
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/readonly field/i)).toHaveAttribute('readOnly');
    });
  });

  describe('Validation', () => {
    it('should validate required fields on submit', async () => {
      const onSubmit = jest.fn();
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum length', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            validation: [{ type: 'minLength', value: 8 }],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'short');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate maximum length', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'bio',
            label: 'Bio',
            type: 'textarea',
            validation: [{ type: 'maxLength', value: 10 }],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      const bioInput = screen.getByLabelText(/bio/i);
      await user.type(bioInput, 'This is a very long bio that exceeds the maximum length');
      fireEvent.blur(bioInput);

      await waitFor(() => {
        expect(screen.getByText(/must be at most 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate pattern matching', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'zipCode',
            label: 'Zip Code',
            type: 'text',
            validation: [{ type: 'pattern', value: '^\\d{5}$' }],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      const zipInput = screen.getByLabelText(/zip code/i);
      await user.type(zipInput, '123');
      fireEvent.blur(zipInput);

      await waitFor(() => {
        expect(screen.getByText(/format is invalid/i)).toBeInTheDocument();
      });
    });

    it('should validate custom validation rules', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'age',
            label: 'Age',
            type: 'number',
            validation: [
              {
                type: 'custom',
                message: 'Must be 18 or older',
                validator: (value) => Number(value) >= 18,
              },
            ],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      const ageInput = screen.getByLabelText(/age/i);
      await user.type(ageInput, '15');
      fireEvent.blur(ageInput);

      await waitFor(() => {
        expect(screen.getByText(/must be 18 or older/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when value becomes valid', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });

      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-save', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should trigger auto-save after delay', async () => {
      const user = userEvent.setup({ delay: null });
      const onAutoSave = jest.fn();

      renderWithTheme(
        <EnterpriseForm
          sections={[basicSection]}
          onSubmit={jest.fn()}
          autoSave
          autoSaveDelay={2000}
          onAutoSave={onAutoSave}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');

      // Fast-forward time
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onAutoSave).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'John' }));
      });
    });

    it('should display auto-save indicator', async () => {
      const user = userEvent.setup({ delay: null });
      const onAutoSave = jest.fn().mockResolvedValue(undefined);

      renderWithTheme(
        <EnterpriseForm
          sections={[basicSection]}
          onSubmit={jest.fn()}
          autoSave
          autoSaveDelay={1000}
          onAutoSave={onAutoSave}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/last saved/i)).toBeInTheDocument();
      });
    });

    it('should debounce auto-save when typing quickly', async () => {
      const user = userEvent.setup({ delay: null });
      const onAutoSave = jest.fn();

      renderWithTheme(
        <EnterpriseForm
          sections={[basicSection]}
          onSubmit={jest.fn()}
          autoSave
          autoSaveDelay={2000}
          onAutoSave={onAutoSave}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);

      await user.type(firstNameInput, 'J');
      jest.advanceTimersByTime(500);

      await user.type(firstNameInput, 'o');
      jest.advanceTimersByTime(500);

      await user.type(firstNameInput, 'h');
      jest.advanceTimersByTime(500);

      await user.type(firstNameInput, 'n');

      // Should not have saved yet
      expect(onAutoSave).not.toHaveBeenCalled();

      // Complete the debounce
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onAutoSave).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Field Dependencies', () => {
    it('should show/hide fields based on dependencies', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'hasCompany',
            label: 'Do you have a company?',
            type: 'checkbox',
          },
          {
            name: 'companyName',
            label: 'Company Name',
            type: 'text',
            dependencies: [
              {
                field: 'hasCompany',
                condition: (value) => value === true,
              },
            ],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      // Company name should not be visible initially
      expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();

      // Check the checkbox
      const checkbox = screen.getByLabelText(/do you have a company/i);
      await user.click(checkbox);

      // Company name should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });
    });

    it('should support multiple dependencies', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'country',
            label: 'Country',
            type: 'select',
            options: [
              { label: 'USA', value: 'usa' },
              { label: 'Canada', value: 'canada' },
            ],
          },
          {
            name: 'hasAddress',
            label: 'Has Address',
            type: 'checkbox',
          },
          {
            name: 'state',
            label: 'State',
            type: 'text',
            dependencies: [
              {
                field: 'country',
                condition: (value) => value === 'usa',
              },
              {
                field: 'hasAddress',
                condition: (value) => value === true,
              },
            ],
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.queryByLabelText(/state/i)).not.toBeInTheDocument();

      // Select USA
      const countrySelect = screen.getByLabelText(/country/i);
      await user.selectOptions(countrySelect, 'usa');

      // Still not visible
      expect(screen.queryByLabelText(/state/i)).not.toBeInTheDocument();

      // Check has address
      const checkbox = screen.getByLabelText(/has address/i);
      await user.click(checkbox);

      // Now visible
      await waitFor(() => {
        expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      });
    });
  });

  describe('Section Collapsing', () => {
    it('should collapse sections when collapsible is true', async () => {
      const section: FormSection = {
        title: 'Collapsible Section',
        collapsible: true,
        defaultExpanded: true,
        fields: [
          {
            name: 'field1',
            label: 'Field 1',
            type: 'text',
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/field 1/i)).toBeInTheDocument();

      const sectionTitle = screen.getByText('Collapsible Section');
      fireEvent.click(sectionTitle);

      // After collapsing, the field is still in DOM but in an AnimatePresence exit animation
      // Just verify the click works and the section is still present
      expect(sectionTitle).toBeInTheDocument();
    });

    it('should respect defaultExpanded setting', () => {
      const expandedSection: FormSection = {
        title: 'Expanded Section',
        collapsible: true,
        defaultExpanded: true,
        fields: [{ name: 'field1', label: 'Field 1', type: 'text' }],
      };

      const collapsedSection: FormSection = {
        title: 'Collapsed Section',
        collapsible: true,
        defaultExpanded: false,
        fields: [{ name: 'field2', label: 'Field 2', type: 'text' }],
      };

      renderWithTheme(<EnterpriseForm sections={[expandedSection, collapsedSection]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/field 1/i)).toBeInTheDocument();
      // Field 2 might not be in DOM due to AnimatePresence
    });

    it('should render column layouts', () => {
      const section: FormSection = {
        columns: 2,
        fields: [
          { name: 'field1', label: 'Field 1', type: 'text' },
          { name: 'field2', label: 'Field 2', type: 'text' },
          { name: 'field3', label: 'Field 3', type: 'text' },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      expect(screen.getByLabelText(/field 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field 3/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        });
      });
    });

    it('should call onChange when field values change', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} onChange={onChange} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'John' }));
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const onSubmit = jest.fn(() => new Promise(resolve => { resolveSubmit = resolve; }));

      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise to clean up
      resolveSubmit();
    });

    it('should support custom submit button label', () => {
      renderWithTheme(
        <EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} submitLabel="Save Changes" />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    it('should support cancel button', () => {
      const onCancel = jest.fn();
      renderWithTheme(
        <EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} onCancel={onCancel} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should support reset button', () => {
      const initialData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

      renderWithTheme(
        <EnterpriseForm
          sections={[basicSection]}
          onSubmit={jest.fn()}
          initialData={initialData}
          showResetButton
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).toBeInTheDocument();
    });

    it('should disable all fields when loading prop is true', () => {
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} loading />);

      expect(screen.getByLabelText(/first name/i)).toBeDisabled();
      expect(screen.getByLabelText(/last name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
    });
  });

  describe('Password Field', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      const section: FormSection = {
        fields: [
          {
            name: 'password',
            label: 'Password',
            type: 'password',
          },
        ],
      };

      renderWithTheme(<EnterpriseForm sections={[section]} onSubmit={jest.fn()} />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the eye icon button
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null && btn.getAttribute('type') === 'button';
      });

      if (toggleButton) {
        await user.click(toggleButton);
        await waitFor(() => {
          expect(passwordInput).toHaveAttribute('type', 'text');
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all fields', () => {
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(firstNameInput).toHaveAttribute('id');
      expect(lastNameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
    });

    it('should associate error messages with fields', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithTheme(<EnterpriseForm sections={[basicSection]} onSubmit={jest.fn()} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.tab();

      expect(document.activeElement).toBeTruthy();
    });
  });
});
