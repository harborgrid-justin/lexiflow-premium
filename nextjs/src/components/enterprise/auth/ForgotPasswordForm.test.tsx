/**
 * @fileoverview Enterprise-grade tests for ForgotPasswordForm component
 * Tests password reset request flow, email validation, and step transitions
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ForgotPasswordForm } from './ForgotPasswordForm';

expect.extend(toHaveNoViolations);

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    forgotPassword: jest.fn().mockResolvedValue({})
  }))
}));

describe('ForgotPasswordForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('renders back to login button when handler provided', () => {
      render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

      expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<ForgotPasswordForm className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders security notice', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByText(/security note/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('clears error on input change', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText(/email address/i), 'invalid');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();

      await user.clear(screen.getByLabelText(/email address/i));
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');

      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
    });

    it('disables submit button when email is empty', () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Email Step', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('disables form during submission', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      let resolveSubmission: (value: unknown) => void;

      mockAuthService.mockImplementation(() => ({
        forgotPassword: jest.fn().mockReturnValue(new Promise((resolve) => {
          resolveSubmission = resolve;
        }))
      }));

      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

      // Start submission but don't resolve yet
      fireEvent.click(submitButton);

      // Wait for disabled state to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      });

      // Finish up
      resolveSubmission!({});
    });

    it('calls onBackToLogin when back button clicked', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onBackToLogin={mockOnBackToLogin} />);

      await user.click(screen.getByRole('button', { name: /back to login/i }));

      expect(mockOnBackToLogin).toHaveBeenCalled();
    });
  });

  describe('Success Step', () => {
    it('transitions to success step after submission', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
      });
    });

    it('displays submitted email in success message', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('shows next steps in success view', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByText(/what to do next/i)).toBeInTheDocument();
      });
    });

    it('calls onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('allows trying different email from success view', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByText(/try a different email/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/try a different email/i));

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    });

    it('shows back to login button in success view when handler provided', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} onBackToLogin={mockOnBackToLogin} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Security Behavior', () => {
    it('shows success even on API error to prevent email enumeration', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        forgotPassword: jest.fn().mockRejectedValue(new Error('User not found'))
      }));

      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'nonexistent@example.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations on email step', async () => {
      const { container } = render(<ForgotPasswordForm />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('has proper aria-invalid attribute on error', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText(/email address/i), 'invalid');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('has error role for error messages', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await user.type(screen.getByLabelText(/email address/i), 'invalid');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0]).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace in email', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), '  test@example.com  ');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('handles rapid form submissions', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only process once due to loading state
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
      });
    });
  });
});
