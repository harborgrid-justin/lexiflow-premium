/**
 * @jest-environment jsdom
 * @module Inputs.test
 * @description Enterprise-grade tests for legacy Inputs re-export module
 *
 * Test coverage:
 * - Module re-exports verification
 * - Input component functionality
 * - TextArea component functionality
 * - Backward compatibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/components/ui/atoms/Input/Input', () => ({
  Input: React.forwardRef<
    HTMLInputElement,
    {
      type?: string;
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      disabled?: boolean;
      error?: boolean;
      'aria-label'?: string;
    }
  >(({ type = 'text', placeholder, value, onChange, disabled, error, 'aria-label': ariaLabel }, ref) => (
    <input
      ref={ref}
      data-testid="input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      data-error={error}
      aria-label={ariaLabel}
    />
  )),
}));

jest.mock('@/components/ui/atoms/TextArea/TextArea', () => ({
  TextArea: React.forwardRef<
    HTMLTextAreaElement,
    {
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      rows?: number;
      disabled?: boolean;
      'aria-label'?: string;
    }
  >(({ placeholder, value, onChange, rows = 3, disabled, 'aria-label': ariaLabel }, ref) => (
    <textarea
      ref={ref}
      data-testid="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  )),
}));

// ============================================================================
// TESTS
// ============================================================================

describe('Inputs Legacy Re-export', () => {
  describe('Module Exports', () => {
    it('re-exports Input component', async () => {
      const { Input } = await import('./Inputs');

      expect(Input).toBeDefined();
    });

    it('re-exports TextArea component', async () => {
      const { TextArea } = await import('./Inputs');

      expect(TextArea).toBeDefined();
    });
  });

  describe('Input Component', () => {
    it('renders Input correctly', async () => {
      const { Input } = await import('./Inputs');

      render(<Input placeholder="Enter text" aria-label="Test input" />);

      expect(screen.getByTestId('input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { Input } = await import('./Inputs');

      render(<Input onChange={onChange} aria-label="Test input" />);

      await user.type(screen.getByTestId('input'), 'test');

      expect(onChange).toHaveBeenCalled();
    });

    it('supports different input types', async () => {
      const { Input } = await import('./Inputs');

      render(<Input type="password" aria-label="Password input" />);

      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('handles disabled state', async () => {
      const { Input } = await import('./Inputs');

      render(<Input disabled aria-label="Disabled input" />);

      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('supports error state', async () => {
      const { Input } = await import('./Inputs');

      render(<Input error aria-label="Error input" />);

      expect(screen.getByTestId('input')).toHaveAttribute('data-error', 'true');
    });
  });

  describe('TextArea Component', () => {
    it('renders TextArea correctly', async () => {
      const { TextArea } = await import('./Inputs');

      render(<TextArea placeholder="Enter description" aria-label="Test textarea" />);

      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { TextArea } = await import('./Inputs');

      render(<TextArea onChange={onChange} aria-label="Test textarea" />);

      await user.type(screen.getByTestId('textarea'), 'test');

      expect(onChange).toHaveBeenCalled();
    });

    it('supports custom rows', async () => {
      const { TextArea } = await import('./Inputs');

      render(<TextArea rows={5} aria-label="Multi-row textarea" />);

      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
    });

    it('handles disabled state', async () => {
      const { TextArea } = await import('./Inputs');

      render(<TextArea disabled aria-label="Disabled textarea" />);

      expect(screen.getByTestId('textarea')).toBeDisabled();
    });
  });

  describe('Type Exports', () => {
    it('exports InputProps type', async () => {
      const { Input } = await import('./Inputs');

      // Type assertion test
      const props: Parameters<typeof Input>[0] = {
        type: 'text',
        placeholder: 'Test',
      };

      expect(props).toBeDefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains original import path', async () => {
      const module = await import('./Inputs');

      expect(module.Input).toBeDefined();
      expect(module.TextArea).toBeDefined();
    });

    it('supports forwarded refs for Input', async () => {
      const { Input } = await import('./Inputs');
      const ref = React.createRef<HTMLInputElement>();

      render(<Input ref={ref} aria-label="Ref input" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('supports forwarded refs for TextArea', async () => {
      const { TextArea } = await import('./Inputs');
      const ref = React.createRef<HTMLTextAreaElement>();

      render(<TextArea ref={ref} aria-label="Ref textarea" />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
  });
});
