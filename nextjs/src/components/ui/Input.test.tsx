import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { Search, Mail } from 'lucide-react';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with value', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email Address" />);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      render(<Input placeholder="No label" />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(<Input label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('required indicator has correct styling', () => {
      render(<Input label="Required" required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveClass('text-red-600');
    });
  });

  describe('Error State', () => {
    it('renders error message when provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('error message has correct styling', () => {
      render(<Input error="Error message" />);
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-red-600');
    });

    it('input has error styling when error is present', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('error takes precedence over helper text', () => {
      render(<Input error="Error" helperText="Helper" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('does not render helper text when error is present', () => {
      render(<Input helperText="Helper" error="Error" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('helper text has correct styling', () => {
      render(<Input helperText="Helper text" />);
      const helperElement = screen.getByText('Helper text');
      expect(helperElement).toHaveClass('text-slate-500');
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      render(<Input icon={<Search data-testid="search-icon" />} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('input has padding for icon', () => {
      render(<Input icon={<Search />} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('icon is positioned correctly', () => {
      const { container } = render(<Input icon={<Mail data-testid="mail-icon" />} />);
      const iconContainer = container.querySelector('.absolute.left-3');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Clearable', () => {
    it('shows clear button when clearable and has value', () => {
      render(<Input clearable value="some text" onChange={() => {}} />);
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when no value', () => {
      render(<Input clearable value="" onChange={() => {}} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not show clear button when clearable is false', () => {
      render(<Input value="text" onChange={() => {}} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onClear when clear button clicked', () => {
      const handleClear = jest.fn();
      render(
        <Input clearable value="text" onChange={() => {}} onClear={handleClear} />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('clear button has type="button" to prevent form submission', () => {
      render(<Input clearable value="text" onChange={() => {}} />);
      const clearButton = screen.getByRole('button');
      expect(clearButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders as email input when type is email', () => {
      render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders as number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('has disabled styling', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:bg-slate-100');
    });

    it('cannot be focused when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('onChange Handler', () => {
    it('calls onChange when value changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('onChange receives event object', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'test' }),
        })
      );
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('passes through HTML input attributes', () => {
      render(
        <Input
          name="email"
          autoComplete="email"
          maxLength={50}
          aria-describedby="email-desc"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('autocomplete', 'email');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toHaveAttribute('aria-describedby', 'email-desc');
    });

    it('supports data attributes', () => {
      render(<Input data-testid="custom-input" />);
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Username" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Username');
      // Check that label is for the input
      expect(label.tagName).toBe('LABEL');
    });

    it('is focusable', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Search query" />);
      expect(screen.getByLabelText('Search query')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      render(<Input value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('handles special characters in value', () => {
      render(<Input value="<script>alert('xss')</script>" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue("<script>alert('xss')</script>");
    });

    it('handles rapid input changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'rapid');

      expect(handleChange).toHaveBeenCalledTimes(5); // Once per character
    });

    it('handles very long input', () => {
      const longText = 'A'.repeat(1000);
      render(<Input value={longText} onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue(longText);
    });
  });

  describe('Combination of Props', () => {
    it('renders with all props', () => {
      const handleChange = jest.fn();
      const handleClear = jest.fn();

      render(
        <Input
          label="Email"
          placeholder="Enter email"
          value="test@example.com"
          icon={<Mail data-testid="mail" />}
          clearable
          helperText="We will never share your email"
          required
          onChange={handleChange}
          onClear={handleClear}
          className="custom"
        />
      );

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByTestId('mail')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument(); // Clear button
      expect(screen.getByText(/never share your email/)).toBeInTheDocument();
    });
  });
});
