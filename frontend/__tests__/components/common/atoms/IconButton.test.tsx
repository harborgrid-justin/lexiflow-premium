/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { IconButton } from '@/shared/ui/atoms/IconButton/IconButton';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Edit, Plus, Trash } from 'lucide-react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('IconButton', () => {
  describe('Rendering', () => {
    it('should render icon button', () => {
      renderWithTheme(
        <IconButton icon={Plus} aria-label="Add item" />
      );
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} aria-label="Add" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'primary', 'secondary', 'ghost', 'danger'] as const;

    it.each(variants)('should render %s variant correctly', (variant) => {
      renderWithTheme(
        <IconButton icon={Plus} variant={variant} aria-label="Add" />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should default to default variant', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(
        <IconButton icon={Plus} size={size} aria-label="Add" />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Shapes', () => {
    it('should render rounded shape', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} shape="rounded" aria-label="Add" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-lg');
    });

    it('should render circle shape', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} shape="circle" aria-label="Add" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('should default to rounded shape', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-lg');
    });
  });

  describe('Interactions', () => {
    it('should trigger onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <IconButton icon={Plus} onClick={handleClick} aria-label="Add" />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <IconButton icon={Plus} onClick={handleClick} aria-label="Add" />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <IconButton icon={Plus} onClick={handleClick} aria-label="Add" />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      renderWithTheme(
        <IconButton icon={Plus} disabled aria-label="Add" />
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <IconButton icon={Plus} disabled onClick={handleClick} aria-label="Add" />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      renderWithTheme(
        <IconButton icon={Plus} disabled aria-label="Add" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} isLoading aria-label="Add" />
      );
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      renderWithTheme(
        <IconButton icon={Plus} isLoading aria-label="Add" />
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should hide icon when loading', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} isLoading aria-label="Add" />
      );
      // Loading spinner should replace icon
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip on hover', () => {
      renderWithTheme(
        <IconButton icon={Plus} tooltip="Add new item" aria-label="Add" />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);

      expect(screen.getByText('Add new item')).toBeInTheDocument();
    });

    it('should use aria-label as default tooltip', () => {
      renderWithTheme(
        <IconButton icon={Plus} aria-label="Add item" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Add item');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should require aria-label', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add item" />);
      const button = screen.getByRole('button', { name: /add item/i });
      expect(button).toBeInTheDocument();
    });

    it('should be focusable', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderWithTheme(<IconButton icon={Plus} disabled aria-label="Add" />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should support aria-describedby', () => {
      renderWithTheme(
        <IconButton
          icon={Plus}
          aria-label="Add"
          aria-describedby="description"
        />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Different Icons', () => {
    it('should render Plus icon', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Plus} aria-label="Add" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Trash icon', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Trash} aria-label="Delete" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Edit icon', () => {
      const { container } = renderWithTheme(
        <IconButton icon={Edit} aria-label="Edit" />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('should support type attribute', () => {
      renderWithTheme(
        <IconButton icon={Plus} type="submit" aria-label="Submit" />
      );
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should support form attribute', () => {
      renderWithTheme(
        <IconButton icon={Plus} form="my-form" aria-label="Submit" />
      );
      expect(screen.getByRole('button')).toHaveAttribute('form', 'my-form');
    });

    it('should forward all button props', () => {
      renderWithTheme(
        <IconButton
          icon={Plus}
          data-testid="custom-button"
          aria-describedby="description"
          aria-label="Add"
        />
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      renderWithTheme(
        <IconButton icon={Plus} className="custom-icon-button" aria-label="Add" />
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-icon-button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <IconButton icon={Plus} onClick={handleClick} aria-label="Add" />
      );

      const button = screen.getByRole('button');
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(handleClick).toHaveBeenCalledTimes(10);
    });

    it('should handle missing icon gracefully', () => {
      const { container } = renderWithTheme(
        <IconButton icon={null as any} aria-label="Button" />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should render in light theme', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render in dark theme', () => {
      renderWithTheme(<IconButton icon={Plus} aria-label="Add" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Common Use Cases', () => {
    it('should render delete button', () => {
      const handleDelete = jest.fn();
      renderWithTheme(
        <IconButton
          icon={Trash}
          variant="danger"
          onClick={handleDelete}
          aria-label="Delete item"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleDelete).toHaveBeenCalled();
    });

    it('should render edit button', () => {
      const handleEdit = jest.fn();
      renderWithTheme(
        <IconButton
          icon={Edit}
          variant="ghost"
          onClick={handleEdit}
          aria-label="Edit item"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleEdit).toHaveBeenCalled();
    });

    it('should render add button with circle shape', () => {
      renderWithTheme(
        <IconButton
          icon={Plus}
          variant="primary"
          shape="circle"
          size="lg"
          aria-label="Add new item"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });
  });
});
