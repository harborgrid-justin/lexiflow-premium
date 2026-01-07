/**
 * @jest-environment jsdom
 * @module Button.test
 * @description Enterprise-grade tests for legacy Button re-export module
 *
 * Test coverage:
 * - Module re-exports verification
 * - Type export verification
 * - Backward compatibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    type = 'button',
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: string;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
      type={type as 'button' | 'submit' | 'reset'}
    >
      {children}
    </button>
  ),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('Button Legacy Re-export', () => {
  describe('Module Exports', () => {
    it('re-exports Button component from ui/atoms', async () => {
      const { Button } = await import('./Button');

      expect(Button).toBeDefined();
    });

    it('Button component renders correctly', async () => {
      const { Button } = await import('./Button');

      render(<Button>Click Me</Button>);

      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('Button passes variant prop correctly', async () => {
      const { Button } = await import('./Button');

      render(<Button variant="secondary">Secondary</Button>);

      expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'secondary');
    });

    it('Button passes size prop correctly', async () => {
      const { Button } = await import('./Button');

      render(<Button size="lg">Large</Button>);

      expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'lg');
    });

    it('Button handles disabled state', async () => {
      const { Button } = await import('./Button');

      render(<Button disabled>Disabled</Button>);

      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('Button handles click events', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const { Button } = await import('./Button');

      render(<Button onClick={onClick}>Clickable</Button>);

      await user.click(screen.getByTestId('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Type Exports', () => {
    it('exports ButtonProps type', async () => {
      // TypeScript compilation test
      const { Button } = await import('./Button');

      const props: Parameters<typeof Button>[0] = {
        children: 'Test',
        variant: 'primary',
        size: 'md',
        disabled: false,
      };

      expect(props).toBeDefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains original import path', async () => {
      const module = await import('./Button');

      expect(module.Button).toBeDefined();
    });

    it('supports all legacy button types', async () => {
      const { Button } = await import('./Button');

      render(<Button type="submit">Submit Form</Button>);

      expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');
    });
  });
});
