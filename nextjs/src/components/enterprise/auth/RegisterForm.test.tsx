/**
 * @fileoverview Enterprise-grade tests for RegisterForm component
 * Tests user registration, validation, domain restrictions, and terms acceptance
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RegisterForm } from './RegisterForm';

expect.extend(toHaveNoViolations);

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    register: jest.fn().mockResolvedValue({
      user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    })
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

describe('RegisterForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnLoginClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const mockCalcStrength = require('./PasswordStrengthMeter').calculatePasswordStrength;
    mockCalcStrength.mockReturnValue({
      score: 3,
      label: 'Good',
      color: 'bg-blue-500',
      percentage: 75,
      feedback: []
    });
  });

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    });

    it('renders first name input', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });

    it('renders last name input', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    });

    it('renders password input', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    });

    it('renders confirm password input', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders terms checkbox', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders login link when handler provided', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} onLoginClick={mockOnLoginClick} />);

      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it('renders password strength meter', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByTestId('password-strength-meter')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <RegisterForm onSuccess={mockOnSuccess} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders security notice', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/your data is encrypted/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty first name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });

    it('shows error for empty last name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });

    it('shows error for invalid email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'short');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument();
    });

    it('shows error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('shows error for unchecked terms', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/must agree to the terms/i)).toBeInTheDocument();
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
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'weakpassword1');
      await user.type(screen.getByLabelText(/confirm password/i), 'weakpassword1');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
    });

    it('shows error for invalid characters in name', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/invalid characters/i)).toBeInTheDocument();
    });

    it('clears field error on input change', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/first name/i), 'John');
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Domain Validation', () => {
    it('shows allowed domains hint when domain validation is enabled', () => {
      render(
        <RegisterForm
          onSuccess={mockOnSuccess}
          allowedDomains={['company.com', 'corp.com']}
          requireDomainValidation={true}
        />
      );

      expect(screen.getByText(/must be from: company.com, corp.com/i)).toBeInTheDocument();
    });

    it('shows error for unauthorized domain', async () => {
      const user = userEvent.setup();
      render(
        <RegisterForm
          onSuccess={mockOnSuccess}
          allowedDomains={['company.com']}
          requireDomainValidation={true}
        />
      );

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@otherdomain.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/must be from an approved domain/i)).toBeInTheDocument();
    });

    it('accepts email from allowed domain', async () => {
      const user = userEvent.setup();
      render(
        <RegisterForm
          onSuccess={mockOnSuccess}
          allowedDomains={['company.com']}
          requireDomainValidation={true}
        />
      );

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@company.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      const passwordInput = screen.getByLabelText(/^password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
      await user.click(toggleButtons[0]);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('toggles confirm password visibility', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      const confirmInput = screen.getByLabelText(/confirm password/i);
      expect(confirmInput).toHaveAttribute('type', 'password');

      const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
      await user.click(toggleButtons[1]);

      expect(confirmInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Registration Flow', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });

    it('calls onSuccess with user and tokens after successful registration', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'test@example.com' }),
          expect.objectContaining({
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token'
          })
        );
      });
    });

    it('calls onLoginClick when login link clicked', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} onLoginClick={mockOnLoginClick} />);

      await user.click(screen.getByText(/sign in/i));

      expect(mockOnLoginClick).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays registration error message', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        register: jest.fn().mockRejectedValue(new Error('Email already registered'))
      }));

      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Terms and Privacy Links', () => {
    it('renders terms of service link', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    });

    it('renders privacy policy link', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<RegisterForm onSuccess={mockOnSuccess} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('has proper aria-invalid attributes on error', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('has error role for error messages', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles names with hyphens and apostrophes', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), "Mary-Jane O'Brien");
      await user.type(screen.getByLabelText(/last name/i), 'Smith-Jones');
      await user.type(screen.getByLabelText(/work email/i), 'mary@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('handles email with plus sign', async () => {
      const user = userEvent.setup();
      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/work email/i), 'john+test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'StrongPassword123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'StrongPassword123!');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
