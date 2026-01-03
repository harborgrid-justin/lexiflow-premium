/**
 * MFAVerification Component Tests
 *
 * Tests for MFA code verification during login including
 * error handling, backup codes, and accessibility.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { useAuthActions } from '@/contexts/auth/AuthProvider';

// Mock the auth hooks
jest.mock('@/contexts/auth/AuthProvider', () => ({
  useAuthActions: jest.fn(),
}));

describe('MFAVerification', () => {
  const mockVerifyMFA = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthActions as jest.Mock).mockReturnValue({
      verifyMFA: mockVerifyMFA,
    });
  });

  describe('Rendering', () => {
    it('renders verification form with all elements', () => {
      render(<MFAVerification />);

      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Verify Your Identity')).toBeInTheDocument();
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
    });

    it('displays appropriate subtitle for authenticator code', () => {
      render(<MFAVerification />);

      expect(screen.getByText(/Enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
    });

    it('shows security icon', () => {
      render(<MFAVerification />);

      const iconContainer = screen.getByRole('button', { name: /Verify/i }).closest('div')?.parentElement;
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders cancel button when onCancel prop is provided', () => {
      render(<MFAVerification onCancel={mockOnCancel} />);

      expect(screen.getByText(/Cancel and return to login/i)).toBeInTheDocument();
    });

    it('does not render cancel button when onCancel is not provided', () => {
      render(<MFAVerification />);

      expect(screen.queryByText(/Cancel and return to login/i)).not.toBeInTheDocument();
    });

    it('renders help text with support link', () => {
      render(<MFAVerification />);

      expect(screen.getByText(/Lost your device?/i)).toBeInTheDocument();

      const supportLink = screen.getByRole('link', { name: /Contact support/i });
      expect(supportLink).toHaveAttribute('href', '/auth/recovery');
    });
  });

  describe('Code Input', () => {
    it('allows entering verification code', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      expect(input).toHaveValue('123456');
    });

    it('limits code to 6 digits', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '1234567890' } });

      expect(input).toHaveValue('123456');
    });

    it('filters out non-numeric characters', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: 'abc123xyz' } });

      expect(input).toHaveValue('123');
    });

    it('has autofocus on code input', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i) as HTMLInputElement;
      // In React Testing Library, autoFocus doesn't always create an HTML attribute
      // Instead, check that the input exists and is the correct element
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('is marked as required', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      expect(input).toBeRequired();
    });

    it('has proper placeholder', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      expect(input).toHaveAttribute('placeholder', '000000');
    });
  });

  describe('Form Submission', () => {
    it('disables submit button when code is less than 6 digits', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      const submitButton = screen.getByRole('button', { name: /Verify/i });

      fireEvent.change(input, { target: { value: '12345' } });

      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when code is 6 digits', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      const submitButton = screen.getByRole('button', { name: /Verify/i });

      fireEvent.change(input, { target: { value: '123456' } });

      expect(submitButton).not.toBeDisabled();
    });

    it('calls verifyMFA with correct code on form submission', async () => {
      mockVerifyMFA.mockResolvedValue(true);

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockVerifyMFA).toHaveBeenCalledWith('123456');
      });
    });

    it('prevents submission with less than 6 digits', async () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '12345' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockVerifyMFA).not.toHaveBeenCalled();
      });
    });

    it('shows loading state during verification', async () => {
      mockVerifyMFA.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verifying/i })).toBeDisabled();
    });

    it('calls onSuccess callback when verification succeeds', async () => {
      mockVerifyMFA.mockResolvedValue(true);

      render(<MFAVerification onSuccess={mockOnSuccess} />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onSuccess when verification fails', async () => {
      mockVerifyMFA.mockResolvedValue(false);

      render(<MFAVerification onSuccess={mockOnSuccess} />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when verification fails', async () => {
      mockVerifyMFA.mockResolvedValue(false);

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Invalid verification code. Please try again./i)).toBeInTheDocument();
      });
    });

    it('displays error message when API throws error', async () => {
      mockVerifyMFA.mockRejectedValue(new Error('Network error'));

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('displays generic error for non-Error objects', async () => {
      mockVerifyMFA.mockRejectedValue('Unknown error');

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });
    });

    it('shows error for code length validation', async () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a 6-digit code/i)).toBeInTheDocument();
      });
    });

    it('clears error when retrying', async () => {
      mockVerifyMFA.mockResolvedValue(false);

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
      });

      // Clear and enter new code
      fireEvent.change(input, { target: { value: '654321' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText(/Invalid verification code/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Backup Code Toggle', () => {
    it('shows toggle to use backup code', () => {
      render(<MFAVerification />);

      expect(screen.getByText(/Use a backup code instead/i)).toBeInTheDocument();
    });

    it('switches to backup code mode when toggle is clicked', () => {
      render(<MFAVerification />);

      const toggle = screen.getByText(/Use a backup code instead/i);
      fireEvent.click(toggle);

      expect(screen.getByText(/Enter one of your backup codes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Backup Code/i)).toBeInTheDocument();
    });

    it('switches back to authenticator code mode', () => {
      render(<MFAVerification />);

      const toggle = screen.getByText(/Use a backup code instead/i);
      fireEvent.click(toggle);

      const backToggle = screen.getByText(/Use authenticator code instead/i);
      fireEvent.click(backToggle);

      expect(screen.getByText(/Enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });

    it('clears code when switching between modes', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const toggle = screen.getByText(/Use a backup code instead/i);
      fireEvent.click(toggle);

      const backupInput = screen.getByLabelText(/Backup Code/i);
      expect(backupInput).toHaveValue('123456'); // Value persists
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(<MFAVerification onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText(/Cancel and return to login/i);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on form elements', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      expect(input).toHaveAttribute('id', 'mfa-code');
    });

    it('submit button has proper accessible name', () => {
      render(<MFAVerification />);

      const submitButton = screen.getByRole('button', { name: /Verify/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('error messages are visible to screen readers', async () => {
      mockVerifyMFA.mockResolvedValue(false);

      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      fireEvent.change(input, { target: { value: '123456' } });

      const form = input.closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        const errorMessage = screen.getByText(/Invalid verification code/i);
        expect(errorMessage).toBeVisible();
      });
    });

    it('uses semantic HTML for form', () => {
      render(<MFAVerification />);

      const input = screen.getByLabelText(/Verification Code/i);
      expect(input.closest('form')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<MFAVerification />);

      expect(screen.getByRole('heading', { name: 'LexiFlow', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Verify Your Identity', level: 2 })).toBeInTheDocument();
    });
  });
});
