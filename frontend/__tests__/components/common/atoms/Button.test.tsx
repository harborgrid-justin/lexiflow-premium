/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Button } from '@/shared/ui/atoms/Button/Button';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Plus, Trash } from 'lucide-react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      renderWithTheme(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render button without children', () => {
      renderWithTheme(<Button aria-label="icon-only" />);
      expect(screen.getByRole('button', { name: /icon-only/i })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Button className="custom-class">Test</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'] as const;

    it.each(variants)('should render %s variant correctly', (variant) => {
      renderWithTheme(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should default to primary variant', () => {
      renderWithTheme(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'icon'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(<Button size={size}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      renderWithTheme(<Button>Default Size</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render with icon', () => {
      renderWithTheme(<Button icon={Plus}>Add Item</Button>);
      const button = screen.getByRole('button', { name: /add item/i });
      expect(button).toBeInTheDocument();
    });

    it('should render icon without text', () => {
      renderWithTheme(<Button icon={Trash} aria-label="Delete" />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should not render icon when loading', () => {
      const { container } = renderWithTheme(
        <Button icon={Plus} isLoading>Loading</Button>
      );
      // Loading spinner should be present instead of icon
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should render loading spinner when isLoading is true', () => {
      const { container } = renderWithTheme(
        <Button isLoading>Submit</Button>
      );
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      renderWithTheme(<Button isLoading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should hide icon when loading', () => {
      const { container, rerender } = renderWithTheme(
        <Button icon={Plus}>Add</Button>
      );

      // Icon should be present initially
      expect(container.querySelector('svg')).toBeInTheDocument();

      // Rerender with loading state
      rerender(
        <ThemeProvider>
          <Button icon={Plus} isLoading>Add</Button>
        </ThemeProvider>
      );

      // Loading spinner should replace icon
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      renderWithTheme(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button disabled onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be disabled when loading', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button isLoading onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should trigger onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events', () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      renderWithTheme(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(<Button aria-label="Custom Label">Text</Button>);
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    });

    it('should use children as default aria-label', () => {
      renderWithTheme(<Button>Submit Form</Button>);
      expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
    });

    it('should be focusable', () => {
      renderWithTheme(<Button>Focus Me</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderWithTheme(<Button disabled>Cannot Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('HTML Attributes', () => {
    it('should support type attribute', () => {
      renderWithTheme(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should support form attribute', () => {
      renderWithTheme(<Button form="my-form">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('form', 'my-form');
    });

    it('should forward all button props', () => {
      renderWithTheme(
        <Button
          data-testid="custom-button"
          aria-describedby="description"
        >
          Test
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      renderWithTheme(<Button>{null}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      renderWithTheme(<Button>{undefined}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle empty string', () => {
      renderWithTheme(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle numeric children', () => {
      renderWithTheme(<Button>{42}</Button>);
      expect(screen.getByRole('button', { name: '42' })).toBeInTheDocument();
    });
  });
});
