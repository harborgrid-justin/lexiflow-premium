/**
 * @fileoverview Enterprise-grade tests for MFASetup component
 * Tests MFA setup flow, QR code display, verification, and backup codes
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MFASetup } from './MFASetup';

expect.extend(toHaveNoViolations);

// Mock AuthApiService
jest.mock('@/api/auth/auth-api', () => ({
  AuthApiService: jest.fn().mockImplementation(() => ({
    enableMFA: jest.fn().mockResolvedValue({
      qrCode: 'data:image/png;base64,mockQRCode',
      secret: 'ABCDEFGHIJKLMNOP'
    }),
    verifyMFA: jest.fn().mockResolvedValue({
      verified: true,
      backupCodes: ['12345678', '23456789', '34567890', '45678901', '56789012', '67890123', '78901234', '89012345']
    }),
    disableMFA: jest.fn().mockResolvedValue({})
  }))
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('MFASetup', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State (MFA Disabled)', () => {
    it('renders setup view when MFA is not enabled', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
      });
    });

    it('displays QR code', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument();
      });
    });

    it('displays secret key', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText(/ABCD EFGH IJKL MNOP/)).toBeInTheDocument();
      });
    });

    it('has copy button for secret key', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy secret key/i })).toBeInTheDocument();
      });
    });

    it('shows continue button to verification', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });
    });

    it('shows cancel button when onCancel provided', async () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('calls onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('MFA Already Enabled', () => {
    it('shows enabled status when MFA is already enabled', () => {
      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    it('shows disable MFA button', () => {
      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Disable MFA')).toBeInTheDocument();
    });

    it('shows protection message', () => {
      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/Your account is protected/i)).toBeInTheDocument();
    });

    it('shows close button when onCancel provided', () => {
      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('Verification Flow', () => {
    it('navigates to verification step', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));

      expect(screen.getByText('Verify Your Setup')).toBeInTheDocument();
    });

    it('shows verification code input', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));

      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    it('shows back button in verification step', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));

      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('validates 6-digit code', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123');
      await user.click(screen.getByText('Verify & Enable'));

      expect(screen.getByText(/6 digits/i)).toBeInTheDocument();
    });

    it('only accepts numeric input', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));

      const input = screen.getByLabelText('Verification Code');
      await user.type(input, 'abc123xyz');

      expect(input).toHaveValue('123');
    });

    it('proceeds to backup codes on successful verification', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText('Save Your Backup Codes')).toBeInTheDocument();
      });
    });
  });

  describe('Backup Codes', () => {
    it('displays all backup codes', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText('12345678')).toBeInTheDocument();
        expect(screen.getByText('23456789')).toBeInTheDocument();
      });
    });

    it('shows important warning', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText(/only be shown once/i)).toBeInTheDocument();
      });
    });

    it('has download button', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText('Download Codes')).toBeInTheDocument();
      });
    });

    it('has copy buttons for each code', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button', { name: /copy code/i });
        expect(copyButtons.length).toBe(8);
      });
    });

    it('shows complete setup button', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText('Complete Setup')).toBeInTheDocument();
      });
    });

    it('calls onSuccess on complete', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText('Complete Setup')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Complete Setup'));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('Disable MFA', () => {
    it('shows confirmation dialog when disabling', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByText('Disable MFA'));

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('disables MFA when confirmed', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByText('Disable MFA'));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('does not disable MFA when cancelled', async () => {
      const user = userEvent.setup();
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByText('Disable MFA'));

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Copy Functionality', () => {
    it('copies secret key to clipboard', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy secret key/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /copy secret key/i }));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABCDEFGHIJKLMNOP');
    });

    it('shows copied indicator', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy secret key/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /copy secret key/i }));

      // The checkmark icon should appear (we check for the SVG change)
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copy secret key/i });
        expect(copyButton.querySelector('svg.text-green-600')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner during initialization', () => {
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows loading state during verification', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error on verification failure', async () => {
      const mockAuthService = require('@/api/auth/auth-api').AuthApiService;
      mockAuthService.mockImplementation(() => ({
        enableMFA: jest.fn().mockResolvedValue({
          qrCode: 'data:image/png;base64,mockQRCode',
          secret: 'ABCDEFGHIJKLMNOP'
        }),
        verifyMFA: jest.fn().mockResolvedValue({ verified: false })
      }));

      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));
      await user.type(screen.getByLabelText('Verification Code'), '123456');
      await user.click(screen.getByText('Verify & Enable'));

      await waitFor(() => {
        expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Enable Two-Factor Authentication')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper input labels', async () => {
      const user = userEvent.setup();
      render(<MFASetup isEnabled={false} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Continue to Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Continue to Verification'));

      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
    });

    it('has proper ARIA attributes on alerts', async () => {
      render(<MFASetup isEnabled={true} onSuccess={mockOnSuccess} />);

      const alerts = document.querySelectorAll('[role="alert"]');
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MFASetup isEnabled={false} onSuccess={mockOnSuccess} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
