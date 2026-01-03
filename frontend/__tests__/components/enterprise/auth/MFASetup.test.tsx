/**
 * MFASetup Component Tests
 *
 * Tests for the MFA setup wizard including QR code display,
 * verification, and backup codes.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFASetup } from '@/components/auth/MFASetup';
import { useAuthActions, useAuthState } from '@/contexts/auth/AuthProvider';

// Mock the auth hooks
jest.mock('@/contexts/auth/AuthProvider', () => ({
  useAuthActions: jest.fn(),
  useAuthState: jest.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('MFASetup', () => {
  const mockEnableMFA = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'attorney' as const,
    permissions: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthActions as jest.Mock).mockReturnValue({
      enableMFA: mockEnableMFA,
    });
    (useAuthState as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  describe('Initial Step', () => {
    it('renders initial setup screen with instructions', () => {
      render(<MFASetup />);

      expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText(/What you'll need:/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enable MFA/i })).toBeInTheDocument();
    });

    it('shows requirements checklist', () => {
      render(<MFASetup />);

      expect(screen.getByText(/An authenticator app/i)).toBeInTheDocument();
      expect(screen.getByText(/Your mobile device/i)).toBeInTheDocument();
      expect(screen.getByText(/A secure place to store backup codes/i)).toBeInTheDocument();
    });

    it('calls enableMFA when setup button is clicked', async () => {
      mockEnableMFA.mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['code1', 'code2', 'code3'],
      });

      render(<MFASetup />);

      const enableButton = screen.getByRole('button', { name: /Enable MFA/i });
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(mockEnableMFA).toHaveBeenCalledTimes(1);
      });
    });

    it('displays loading state during setup', async () => {
      mockEnableMFA.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<MFASetup />);

      const enableButton = screen.getByRole('button', { name: /Enable MFA/i });
      fireEvent.click(enableButton);

      expect(screen.getByText('Setting up...')).toBeInTheDocument();
      expect(enableButton).toBeDisabled();
    });

    it('shows cancel button when onCancel prop is provided', () => {
      render(<MFASetup onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();

      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('displays error message when setup fails', async () => {
      mockEnableMFA.mockRejectedValue(new Error('Setup failed'));

      render(<MFASetup />);

      const enableButton = screen.getByRole('button', { name: /Enable MFA/i });
      fireEvent.click(enableButton);

      await waitFor(() => {
        expect(screen.getByText('Setup failed')).toBeInTheDocument();
      });
    });

    it('returns null when user is not authenticated', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        user: null,
      });

      const { container } = render(<MFASetup />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('QR Code Scan Step', () => {
    beforeEach(async () => {
      mockEnableMFA.mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['code1', 'code2', 'code3'],
      });
    });

    it('displays QR code after successful setup initiation', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const qrImage = screen.getByAltText('MFA QR Code');
        expect(qrImage).toBeInTheDocument();
        expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,ABC123');
      });
    });

    it('displays secret key for manual entry', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument();
      });
    });

    it('copies secret key to clipboard when copy button is clicked', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /Copy/i });
        fireEvent.click(copyButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('JBSWY3DPEHPK3PXP');
    });

    it('allows entering verification code', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });
        expect(input).toHaveValue('123456');
      });
    });

    it('limits verification code to 6 digits', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '1234567890' } });
        expect(input).toHaveValue('123456');
      });
    });

    it('filters out non-numeric characters from verification code', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: 'abc123def' } });
        expect(input).toHaveValue('123');
      });
    });

    it('disables verify button when code is not 6 digits', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
        expect(verifyButton).toBeDisabled();

        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '12345' } });
        expect(verifyButton).toBeDisabled();
      });
    });

    it('enables verify button when code is 6 digits', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });

        const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
        expect(verifyButton).not.toBeDisabled();
      });
    });

    it('navigates to backup codes step after verification', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });

        const verifyButton = screen.getByRole('button', { name: /Verify & Continue/i });
        fireEvent.click(verifyButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/MFA Successfully Enabled/i)).toBeInTheDocument();
      });
    });

    it('allows going back to initial step', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /Back/i });
        fireEvent.click(backButton);
      });

      expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
    });
  });

  describe('Backup Codes Step', () => {
    beforeEach(async () => {
      mockEnableMFA.mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['CODE001', 'CODE002', 'CODE003', 'CODE004', 'CODE005', 'CODE006'],
      });
    });

    it('displays backup codes after verification', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('CODE001')).toBeInTheDocument();
        expect(screen.getByText('CODE002')).toBeInTheDocument();
        expect(screen.getByText('CODE006')).toBeInTheDocument();
      });
    });

    it('shows success indicator', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/MFA Successfully Enabled/i)).toBeInTheDocument();
      });
    });

    it('copies all backup codes when copy button is clicked', async () => {
      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));
      });

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /Copy All Backup Codes/i });
        fireEvent.click(copyButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'CODE001\nCODE002\nCODE003\nCODE004\nCODE005\nCODE006'
      );
    });

    it('calls onComplete when done button is clicked', async () => {
      render(<MFASetup onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        fireEvent.change(input, { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /Verify & Continue/i }));
      });

      await waitFor(() => {
        const doneButton = screen.getByRole('button', { name: /Done/i });
        fireEvent.click(doneButton);
      });

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels on QR code image', async () => {
      mockEnableMFA.mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: [],
      });

      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const qrImage = screen.getByAltText('MFA QR Code');
        expect(qrImage).toBeInTheDocument();
      });
    });

    it('has proper labels on verification code input', async () => {
      mockEnableMFA.mockResolvedValue({
        qrCode: 'data:image/png;base64,ABC123',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: [],
      });

      render(<MFASetup />);

      fireEvent.click(screen.getByRole('button', { name: /Enable MFA/i }));

      await waitFor(() => {
        const input = screen.getByLabelText(/Enter verification code/i);
        expect(input).toHaveAttribute('id', 'verification-code');
      });
    });

    it('buttons have accessible names', () => {
      render(<MFASetup onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /Enable MFA/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });
});
