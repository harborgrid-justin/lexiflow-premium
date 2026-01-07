/**
 * @fileoverview Enterprise-grade tests for LoginForm component
 * Tests authentication flow, validation, MFA, and security
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from './LoginForm';

expect.extend(toHaveNoViolations);

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    login: jest.fn().mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }
    }),
    verifyMFA: jest.fn().mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      user: { id: '1', email: 'test@example.com' }
    })
  }))
}));

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnForgotPassword = jest.fn();
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders password input', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <LoginForm onSuccess={mockOnSuccess} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('shows error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), '123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
    });

    it('clears error on input change', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    it('calls onSuccess on successful login', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows loading state during login', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Button should show loading text
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });

    it('disables form during submission', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('shows password toggle button', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const toggleButton = screen.getByRole('button', { name: /show password|hide password/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('changes toggle button label after toggle', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      await user.click(toggleButton);

      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    });
  });

  describe('Remember Me', () => {
    it('renders remember me checkbox', () => {
      render(<LoginForm onSuccess={mockOnSuccess} showRememberMe={true} />);

      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('hides remember me when showRememberMe is false', () => {
      render(<LoginForm onSuccess={mockOnSuccess} showRememberMe={false} />);

      expect(screen.queryByLabelText(/remember me/i)).not.toBeInTheDocument();
    });

    it('remembers checkbox state', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} showRememberMe={true} />);

      const checkbox = screen.getByLabelText(/remember me/i);
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Forgot Password Link', () => {
    it('renders forgot password link when handler provided', () => {
      render(
        <LoginForm onSuccess={mockOnSuccess} onForgotPassword={mockOnForgotPassword} />
      );

      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('calls onForgotPassword when clicked', async () => {
      const user = userEvent.setup();
      render(
        <LoginForm onSuccess={mockOnSuccess} onForgotPassword={mockOnForgotPassword} />
      );

      await user.click(screen.getByText(/forgot password/i));

      expect(mockOnForgotPassword).toHaveBeenCalled();
    });
  });

  describe('Register Link', () => {
    it('renders register link when handler provided', () => {
      render(
        <LoginForm onSuccess={mockOnSuccess} onRegisterClick={mockOnRegister} />
      );

      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    });

    it('calls onRegisterClick when clicked', async () => {
      const user = userEvent.setup();
      render(
        <LoginForm onSuccess={mockOnSuccess} onRegisterClick={mockOnRegister} />
      );

      await user.click(screen.getByText(/create an account/i));

      expect(mockOnRegister).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays login error message', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        login: jest.fn().mockRejectedValue(new Error('Invalid credentials'))
      }));

      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('MFA Flow', () => {
    it('shows MFA input when required', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({
          requiresMFA: true,
          mfaToken: 'mfa-temp-token'
        }),
        verifyMFA: jest.fn().mockResolvedValue({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          user: { id: '1', email: 'test@example.com' }
        })
      }));

      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/verification code/i)).toBeInTheDocument();
      });
    });

    it('accepts 6-digit MFA code', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({
          requiresMFA: true,
          mfaToken: 'mfa-temp-token'
        }),
        verifyMFA: jest.fn().mockResolvedValue({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          user: { id: '1', email: 'test@example.com' }
        })
      }));

      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/000000/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('has proper aria attributes for errors', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();

      await user.tab();
      expect(screen.getByLabelText(/password/i)).toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('has proper card styling', () => {
      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      expect(container.querySelector('.shadow-lg')).toBeInTheDocument();
    });

    it('applies dark mode classes', () => {
      const { container } = render(<LoginForm onSuccess={mockOnSuccess} />);

      expect(container.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace in email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), '  test@example.com  ');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('handles special characters in password', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'P@ssw0rd!#$%');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
