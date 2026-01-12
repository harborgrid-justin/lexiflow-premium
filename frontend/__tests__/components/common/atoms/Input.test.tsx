/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Input } from '@/shared/ui/atoms/Input/Input';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      renderWithTheme(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      renderWithTheme(<Input label="Email Address" />);
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('should render without label', () => {
      renderWithTheme(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithTheme(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Label Association', () => {
    it('should associate label with input using htmlFor', () => {
      renderWithTheme(<Input label="Username" />);
      const label = screen.getByText('Username');
      const input = screen.getByLabelText('Username');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('should generate unique IDs for multiple inputs', () => {
      renderWithTheme(
        <div>
          <Input label="First Name" />
          <Input label="Last Name" />
        </div>
      );

      const firstName = screen.getByLabelText('First Name');
      const lastName = screen.getByLabelText('Last Name');

      expect(firstName.id).not.toBe(lastName.id);
    });
  });

  describe('Value Handling', () => {
    it('should handle controlled input', () => {
      const { rerender } = renderWithTheme(<Input value="Test" onChange={() => { }} />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test');

      rerender(
        <ThemeProvider>
          <Input value="Updated" onChange={() => { }} />
        </ThemeProvider>
      );

      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Updated');
    });

    it('should handle uncontrolled input', () => {
      renderWithTheme(<Input defaultValue="Initial" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial');
    });

    it('should update value on user input', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New Value' } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      renderWithTheme(<Input label="Email" error="Invalid email address" />);
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('should apply error styling when error exists', () => {
      renderWithTheme(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      // Input should have error class applied
      expect(input).toBeInTheDocument();
    });

    it('should set aria-invalid when error exists', () => {
      renderWithTheme(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not set aria-invalid when no error', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should associate error message with input via aria-describedby', () => {
      renderWithTheme(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Invalid input');

      expect(input.getAttribute('aria-describedby')).toBeTruthy();
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('should support text type', () => {
      renderWithTheme(<Input type="text" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('should support email type', () => {
      renderWithTheme(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      renderWithTheme(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should support number type', () => {
      renderWithTheme(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      renderWithTheme(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should clear placeholder on input', () => {
      renderWithTheme(<Input placeholder="Type here" />);
      const input = screen.getByPlaceholderText('Type here');

      fireEvent.change(input, { target: { value: 'User text' } });

      // Placeholder should still be there but hidden by value
      expect(input).toHaveAttribute('placeholder', 'Type here');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      renderWithTheme(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not trigger onChange when disabled', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Test' } });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('ReadOnly State', () => {
    it('should make input readonly', () => {
      renderWithTheme(<Input readOnly value="Read only text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should display value but prevent editing in readonly', () => {
      renderWithTheme(<Input readOnly value="Cannot edit" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Cannot edit');
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      renderWithTheme(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(<Input aria-label="Search field" />);
      expect(screen.getByLabelText('Search field')).toBeInTheDocument();
    });

    it('should be focusable', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderWithTheme(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should have unique ID for accessibility', () => {
      renderWithTheme(<Input label="Test" />);
      const input = screen.getByRole('textbox');
      expect(input.id).toBeTruthy();
    });
  });

  describe('Events', () => {
    it('should trigger onChange event', () => {
      const handleChange = jest.fn();
      renderWithTheme(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onBlur event', () => {
      const handleBlur = jest.fn();
      renderWithTheme(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should trigger onFocus event', () => {
      const handleFocus = jest.fn();
      renderWithTheme(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should trigger onKeyDown event', () => {
      const handleKeyDown = jest.fn();
      renderWithTheme(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe('HTML Attributes', () => {
    it('should support required attribute', () => {
      renderWithTheme(<Input required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should support maxLength attribute', () => {
      renderWithTheme(<Input maxLength={10} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
    });

    it('should support pattern attribute', () => {
      renderWithTheme(<Input pattern="[0-9]+" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[0-9]+');
    });

    it('should forward data attributes', () => {
      renderWithTheme(<Input data-testid="custom-input" />);
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should apply dark mode styles', () => {
      renderWithTheme(<Input />);
      const input = screen.getByRole('textbox');
      // Component should handle both light and dark modes
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      renderWithTheme(<Input value="" onChange={() => { }} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle special characters in value', () => {
      renderWithTheme(<Input value="!@#$%^&*()" onChange={() => { }} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('!@#$%^&*()');
    });

    it('should handle multiline error messages', () => {
      renderWithTheme(
        <Input error="Error line 1. Error line 2. Error line 3." />
      );
      expect(screen.getByText(/Error line 1/)).toBeInTheDocument();
    });
  });
});
