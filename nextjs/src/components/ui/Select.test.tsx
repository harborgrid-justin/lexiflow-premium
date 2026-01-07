import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';
import { Star, Circle } from 'lucide-react';

describe('Select', () => {
  const defaultOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Select options={defaultOptions} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders placeholder when no value selected', () => {
      render(<Select options={defaultOptions} />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('renders custom placeholder', () => {
      render(<Select options={defaultOptions} placeholder="Choose one" />);
      expect(screen.getByText('Choose one')).toBeInTheDocument();
    });

    it('renders selected option label', () => {
      render(<Select options={defaultOptions} value="2" />);
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Select options={defaultOptions} label="Select Category" />);
      expect(screen.getByText('Select Category')).toBeInTheDocument();
    });

    it('label has proper styling', () => {
      render(<Select options={defaultOptions} label="Styled Label" />);
      const label = screen.getByText('Styled Label');
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('text-sm', 'font-medium');
    });
  });

  describe('Dropdown', () => {
    it('opens dropdown when clicked', () => {
      render(<Select options={defaultOptions} />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('closes dropdown when option is selected', () => {
      const handleChange = jest.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 1'));

      expect(handleChange).toHaveBeenCalledWith('1');
      // Dropdown should close - only the button should remain
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('toggles dropdown on button click', () => {
      render(<Select options={defaultOptions} />);
      const button = screen.getByRole('button');

      // Open
      fireEvent.click(button);
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      // Close
      fireEvent.click(button);
      // Options should not be visible (only the main button text)
      const optionButtons = screen.queryAllByRole('button');
      expect(optionButtons).toHaveLength(1);
    });
  });

  describe('onChange', () => {
    it('calls onChange with string value', () => {
      const handleChange = jest.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 2'));

      expect(handleChange).toHaveBeenCalledWith('2');
    });

    it('calls onChange with number value', () => {
      const handleChange = jest.fn();
      const numericOptions = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
      ];
      render(<Select options={numericOptions} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Two'));

      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Error State', () => {
    it('renders error message when provided', () => {
      render(<Select options={defaultOptions} error="Selection required" />);
      expect(screen.getByText('Selection required')).toBeInTheDocument();
    });

    it('error message has correct styling', () => {
      render(<Select options={defaultOptions} error="Error message" />);
      const error = screen.getByText('Error message');
      expect(error).toHaveClass('text-red-600');
    });

    it('button has error styling when error is present', () => {
      render(<Select options={defaultOptions} error="Error" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-red-500');
    });
  });

  describe('Option Icons', () => {
    it('renders option icons when provided', () => {
      const optionsWithIcons = [
        { value: '1', label: 'Star', icon: <Star data-testid="star-icon" /> },
        { value: '2', label: 'Circle', icon: <Circle data-testid="circle-icon" /> },
      ];
      render(<Select options={optionsWithIcons} />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
    });
  });

  describe('Selected State', () => {
    it('highlights selected option in dropdown', () => {
      render(<Select options={defaultOptions} value="2" />);

      fireEvent.click(screen.getByRole('button'));

      // Find the option with value 2 and check for selected styling
      const selectedOption = screen.getByText('Option 2').closest('button');
      expect(selectedOption).toHaveClass('bg-blue-50');
    });

    it('shows selected option label in button', () => {
      render(<Select options={defaultOptions} value="3" />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Option 3');
    });
  });

  describe('Styling', () => {
    it('button has proper base styling', () => {
      render(<Select options={defaultOptions} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full', 'px-4', 'py-2', 'rounded-lg');
    });

    it('chevron icon rotates when open', () => {
      const { container } = render(<Select options={defaultOptions} />);

      fireEvent.click(screen.getByRole('button'));

      const chevron = container.querySelector('.rotate-180');
      expect(chevron).toBeInTheDocument();
    });

    it('dropdown has proper positioning', () => {
      const { container } = render(<Select options={defaultOptions} />);

      fireEvent.click(screen.getByRole('button'));

      const dropdown = container.querySelector('.absolute.top-full');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty options array', () => {
      render(<Select options={[]} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      // Should not crash
      expect(button).toBeInTheDocument();
    });

    it('handles options with long labels', () => {
      const longOptions = [
        { value: '1', label: 'This is a very long option label that might overflow' },
      ];
      render(<Select options={longOptions} value="1" />);
      expect(screen.getByText(/This is a very long option/)).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialOptions = [
        { value: '1', label: 'Option <with> & "special" chars' },
      ];
      render(<Select options={specialOptions} />);

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText(/Option <with> & "special" chars/)).toBeInTheDocument();
    });

    it('handles rapid option selection', () => {
      const handleChange = jest.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 1'));

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Option 2'));

      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('handles undefined value', () => {
      render(<Select options={defaultOptions} value={undefined} />);
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('button is focusable', () => {
      render(<Select options={defaultOptions} />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('dropdown options are focusable', () => {
      render(<Select options={defaultOptions} />);

      fireEvent.click(screen.getByRole('button'));

      const options = screen.getAllByRole('button').slice(1); // Exclude main button
      options.forEach((option) => {
        expect(option).not.toBeDisabled();
      });
    });

    it('has proper focus styling', () => {
      render(<Select options={defaultOptions} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Complete Select', () => {
    it('renders with all props', () => {
      const handleChange = jest.fn();
      const optionsWithIcons = [
        { value: 'star', label: 'Starred', icon: <Star data-testid="star" /> },
        { value: 'circle', label: 'Circled', icon: <Circle data-testid="circle" /> },
      ];

      render(
        <Select
          options={optionsWithIcons}
          value="star"
          onChange={handleChange}
          placeholder="Choose option"
          label="Category"
          error="Please select a valid option"
        />
      );

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Starred')).toBeInTheDocument();
      expect(screen.getByText('Please select a valid option')).toBeInTheDocument();
    });
  });

  describe('Dropdown Z-Index', () => {
    it('dropdown has z-index for proper layering', () => {
      const { container } = render(<Select options={defaultOptions} />);

      fireEvent.click(screen.getByRole('button'));

      const dropdown = container.querySelector('.z-10');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
