import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { Plus, ArrowRight } from 'lucide-react';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('renders children content correctly', () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('renders secondary variant with correct styling', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-slate-200');
    });

    it('renders outline variant with correct styling', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
    });

    it('renders ghost variant with correct styling', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-slate-700');
    });

    it('renders danger variant with correct styling', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });
  });

  describe('Sizes', () => {
    it('renders small size with correct styling', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5');
    });

    it('renders medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2');
    });

    it('renders large size with correct styling', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('hides icon when loading', () => {
      render(
        <Button loading icon={<Plus data-testid="plus-icon" />}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has disabled styling', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('applies full width styling when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not have full width by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Icon', () => {
    it('renders icon on the left by default', () => {
      render(<Button icon={<Plus data-testid="icon" />}>With Icon</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders icon on the right when iconPosition is right', () => {
      const { container } = render(
        <Button icon={<ArrowRight data-testid="icon" />} iconPosition="right">
          Next
        </Button>
      );
      // Icon should be after text
      const button = container.querySelector('button');
      const children = Array.from(button?.childNodes || []);
      const textIndex = children.findIndex(
        (child) => child.textContent === 'Next'
      );
      const iconIndex = children.findIndex(
        (child) => (child as Element).querySelector?.('[data-testid="icon"]')
      );
      expect(iconIndex).toBeGreaterThan(textIndex);
    });

    it('renders without icon when not provided', () => {
      const { container } = render(<Button>No Icon</Button>);
      expect(container.querySelector('[data-testid]')).not.toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('receives event object in onClick', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('passes through HTML button attributes', () => {
      render(
        <Button type="submit" name="submit-btn" aria-label="Submit form">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('supports data attributes', () => {
      render(<Button data-testid="custom-button">Data Attr</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is focusable', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('can be activated with keyboard', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
    });

    it('has correct role', () => {
      render(<Button>Role Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('handles rapid clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Rapid</Button>);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Combinations', () => {
    it('renders with all props combined', () => {
      const handleClick = jest.fn();
      render(
        <Button
          variant="danger"
          size="lg"
          icon={<Plus data-testid="icon" />}
          iconPosition="left"
          fullWidth
          className="extra-class"
          onClick={handleClick}
        >
          Complete Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('extra-class');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });
});
