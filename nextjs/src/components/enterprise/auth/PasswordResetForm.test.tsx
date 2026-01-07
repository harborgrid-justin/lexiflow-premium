/**
 * @fileoverview Enterprise-grade tests for PasswordResetForm component
 * Tests password reset flow, token validation, and multi-step transitions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PasswordResetForm } from './PasswordResetForm';

expect.extend(toHaveNoViolations);

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    resetPassword: jest.fn().mockResolvedValue({})
  }))
}));

// Mock PasswordStrengthMeter
jest.mock('./PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: ({ password }: { password: string }) => (
    <div data-testid="password-strength-meter">{password ? 'Strength meter' : ''}</div>
  ),
  calculatePasswordStrength: jest.fn().mockReturnValue({
    score: 3,
    label: 'Good',
    color: 'bg-blue-500',
    percentage: 75,
    feedback: []
  })
}));

describe('PasswordResetForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnExpiredToken = jest.fn();
  const validToken = 'valid-reset-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default implementation
    const mockCalcStrength = require('./PasswordStrengthMeter').calculatePasswordStrength;
    mockCalcStrength.mockReturnValue({
      score: 3,
      label: 'Good',
      color: 'bg-blue-500',
      percentage: 75,
      feedback: []
    });
  });

  describe('Rendering - Reset Step', () => {
    it('renders with required props', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByText('Create New Password')).toBeInTheDocument();
    });

    it('renders password input', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    it('renders confirm password input', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('renders password strength meter', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByTestId('password-strength-meter')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PasswordResetForm token={validToken} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders security tip', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByText(/security tip/i)).toBeInTheDocument();
    });
  });

  describe('Expired Token Step', () => {
    it('shows expired state when token is empty', () => {
      render(<PasswordResetForm token="" onExpiredToken={mockOnExpiredToken} />);

      expect(screen.getByText('Link Expired')).toBeInTheDocument();
    });

    it('calls onExpiredToken when token is empty', () => {
      render(<PasswordResetForm token="" onExpiredToken={mockOnExpiredToken} />);

      expect(mockOnExpiredToken).toHaveBeenCalled();
    });

    it('shows request new link button in expired view', () => {
      render(<PasswordResetForm token="" />);

      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });

    it('shows what to do next in expired view', () => {
      render(<PasswordResetForm token="" />);

      expect(screen.getByText(/what to do next/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.type(screen.getByLabelText(/confirm new password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument();
    });

    it('shows error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'DifferentPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('shows error for weak password', async () => {
      const mockCalcStrength = require('./PasswordStrengthMeter').calculatePasswordStrength;
      mockCalcStrength.mockReturnValue({
        score: 1,
        label: 'Weak',
        color: 'bg-orange-500',
        percentage: 40,
        feedback: ['Add more characters']
      });

      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'weakpassword1');
      await user.type(screen.getByLabelText(/confirm new password/i), 'weakpassword1');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
    });

    it('clears error on input change', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/new password/i), 'MoreCharacters');

      expect(screen.queryByText(/at least 12 characters/i)).not.toBeInTheDocument();
    });

    it('shows passwords match indicator', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');

      expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles new password visibility', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      const passwordInput = screen.getByLabelText(/new password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
      await user.click(toggleButtons[0]);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('toggles confirm password visibility', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      const confirmInput = screen.getByLabelText(/confirm new password/i);
      expect(confirmInput).toHaveAttribute('type', 'password');

      const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
      await user.click(toggleButtons[1]);

      expect(confirmInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Reset Flow', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/resetting password/i)).toBeInTheDocument();
    });

    it('transitions to success step after successful reset', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      });
    });

    it('calls onSuccess callback after successful reset', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows continue to login button in success view', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue to login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows expired state on expired token error', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        resetPassword: jest.fn().mockRejectedValue(new Error('Token expired'))
      }));

      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onExpiredToken={mockOnExpiredToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Link Expired')).toBeInTheDocument();
      });
    });

    it('shows expired state on invalid token error', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        resetPassword: jest.fn().mockRejectedValue(new Error('Invalid token'))
      }));

      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onExpiredToken={mockOnExpiredToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockOnExpiredToken).toHaveBeenCalled();
      });
    });

    it('shows general error for other errors', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        resetPassword: jest.fn().mockRejectedValue(new Error('Network error'))
      }));

      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations on reset step', async () => {
      const { container } = render(<PasswordResetForm token={validToken} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations on expired step', async () => {
      const { container } = render(<PasswordResetForm token="" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<PasswordResetForm token={validToken} />);

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('has proper aria-invalid attributes on error', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      const passwordInput = screen.getByLabelText(/new password/i);
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('has error role for error messages', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long passwords', async () => {
      const longPassword = 'A'.repeat(200);
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} />);

      await user.type(screen.getByLabelText(/new password/i), longPassword);
      await user.type(screen.getByLabelText(/confirm new password/i), longPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByText(/too long/i)).toBeInTheDocument();
    });

    it('handles special characters in password', async () => {
      const user = userEvent.setup();
      render(<PasswordResetForm token={validToken} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/new password/i), 'P@$$w0rd!#$%^&*()');
      await user.type(screen.getByLabelText(/confirm new password/i), 'P@$$w0rd!#$%^&*()');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
