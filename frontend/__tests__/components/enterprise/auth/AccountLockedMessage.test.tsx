/**
 * AccountLockedMessage Component Tests
 *
 * Tests for account locked message display, countdown timer,
 * and contact information.
 */

import { render, screen } from '@testing-library/react';
import { AccountLockedMessage } from '@/components/auth/AccountLockedMessage';

describe('AccountLockedMessage', () => {
  describe('Rendering', () => {
    it('renders account locked message', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText('Account Locked')).toBeInTheDocument();
      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
    });

    it('renders lock icon', () => {
      render(<AccountLockedMessage />);

      const heading = screen.getByText('Account Locked');
      const iconContainer = heading.closest('div');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders return to login link', () => {
      render(<AccountLockedMessage />);

      const loginLink = screen.getByRole('link', { name: /Return to Login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('displays security notice', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/This security measure protects your account from unauthorized access/i)).toBeInTheDocument();
    });
  });

  describe('Lock Reasons', () => {
    it('displays message for failed login attempts', () => {
      render(<AccountLockedMessage reason="failed_attempts" />);

      expect(screen.getByText(/Your account has been locked due to multiple failed login attempts/i)).toBeInTheDocument();
    });

    it('displays message for admin action', () => {
      render(<AccountLockedMessage reason="admin_action" />);

      expect(screen.getByText(/Your account has been locked by an administrator/i)).toBeInTheDocument();
    });

    it('displays message for security reasons', () => {
      render(<AccountLockedMessage reason="security" />);

      expect(screen.getByText(/Your account has been locked due to suspicious activity/i)).toBeInTheDocument();
    });

    it('defaults to failed_attempts reason', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/Your account has been locked due to multiple failed login attempts/i)).toBeInTheDocument();
    });

    it('handles undefined reason gracefully', () => {
      render(<AccountLockedMessage reason={undefined} />);

      expect(screen.getByText(/Your account has been locked due to multiple failed login attempts/i)).toBeInTheDocument();
    });
  });

  describe('Unlock Time Display', () => {
    it('displays unlock time in minutes', () => {
      const unlockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 15 minutes/i)).toBeInTheDocument();
    });

    it('displays unlock time in hours', () => {
      const unlockTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 2 hours/i)).toBeInTheDocument();
    });

    it('uses singular form for 1 minute', () => {
      const unlockTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 1 minute\./i)).toBeInTheDocument();
    });

    it('uses singular form for 1 hour', () => {
      const unlockTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 1 hour\./i)).toBeInTheDocument();
    });

    it('displays message when unlock time has passed', () => {
      const unlockTime = new Date(Date.now() - 1000); // 1 second ago
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account should be unlocked now. Please try logging in again/i)).toBeInTheDocument();
    });

    it('rounds up minutes correctly', () => {
      const unlockTime = new Date(Date.now() + 5.5 * 60 * 1000); // 5.5 minutes
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 6 minutes/i)).toBeInTheDocument();
    });

    it('rounds up hours correctly', () => {
      const unlockTime = new Date(Date.now() + 90 * 60 * 1000); // 90 minutes = 1.5 hours
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/Your account will be automatically unlocked in 2 hours/i)).toBeInTheDocument();
    });

    it('does not show unlock info when unlockTime is not provided', () => {
      render(<AccountLockedMessage />);

      expect(screen.queryByText(/will be automatically unlocked/i)).not.toBeInTheDocument();
    });
  });

  describe('Help Instructions', () => {
    it('displays what to do section', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/What should I do?/i)).toBeInTheDocument();
    });

    it('shows wait instruction for failed attempts', () => {
      render(<AccountLockedMessage reason="failed_attempts" />);

      expect(screen.getByText(/Wait for the automatic unlock period to expire/i)).toBeInTheDocument();
    });

    it('does not show wait instruction for admin action', () => {
      render(<AccountLockedMessage reason="admin_action" />);

      expect(screen.queryByText(/Wait for the automatic unlock period to expire/i)).not.toBeInTheDocument();
    });

    it('does not show wait instruction for security reason', () => {
      render(<AccountLockedMessage reason="security" />);

      expect(screen.queryByText(/Wait for the automatic unlock period to expire/i)).not.toBeInTheDocument();
    });

    it('always shows contact administrator instruction', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/Contact your system administrator for immediate assistance/i)).toBeInTheDocument();
    });

    it('always shows contact security team instruction', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/If you believe this is an error, contact our security team/i)).toBeInTheDocument();
    });

    it('renders checkmark icons for instructions', () => {
      const { container } = render(<AccountLockedMessage reason="failed_attempts" />);

      const checkIcons = container.querySelectorAll('.text-blue-400');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Contact Information', () => {
    it('displays default contact email', () => {
      render(<AccountLockedMessage />);

      const emailLink = screen.getByRole('link', { name: /security@lexiflow.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:security@lexiflow.com');
    });

    it('displays custom contact email', () => {
      render(<AccountLockedMessage contactEmail="support@example.com" />);

      const emailLink = screen.getByRole('link', { name: /support@example.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:support@example.com');
    });

    it('displays default contact phone', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText('1-800-LEXIFLOW')).toBeInTheDocument();
    });

    it('displays custom contact phone', () => {
      render(<AccountLockedMessage contactPhone="1-800-555-0123" />);

      expect(screen.getByText('1-800-555-0123')).toBeInTheDocument();
    });

    it('renders email icon', () => {
      const { container } = render(<AccountLockedMessage />);

      const emailSection = screen.getByText('security@lexiflow.com').closest('div');
      expect(emailSection?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders phone icon', () => {
      const { container } = render(<AccountLockedMessage />);

      const phoneSection = screen.getByText('1-800-LEXIFLOW').closest('div');
      expect(phoneSection?.querySelector('svg')).toBeInTheDocument();
    });

    it('displays need help heading', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText(/Need Help?/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByRole('heading', { name: 'LexiFlow', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Account Locked', level: 2 })).toBeInTheDocument();
    });

    it('has accessible link labels', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByRole('link', { name: /security@lexiflow.com/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Login/i })).toBeInTheDocument();
    });

    it('email link has proper href', () => {
      render(<AccountLockedMessage contactEmail="test@example.com" />);

      const emailLink = screen.getByRole('link', { name: /test@example.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
    });

    it('uses semantic HTML list for instructions', () => {
      const { container } = render(<AccountLockedMessage reason="failed_attempts" />);

      const instructionsList = container.querySelector('ul');
      expect(instructionsList).toBeInTheDocument();
    });

    it('has proper color contrast for text', () => {
      render(<AccountLockedMessage />);

      const reasonText = screen.getByText(/Your account has been locked/i);
      expect(reasonText).toHaveClass('text-red-800');
    });
  });

  describe('Visual Elements', () => {
    it('uses gradient background', () => {
      const { container } = render(<AccountLockedMessage />);

      const backgroundDiv = container.querySelector('.bg-gradient-to-br');
      expect(backgroundDiv).toBeInTheDocument();
    });

    it('has red header for account locked state', () => {
      const { container } = render(<AccountLockedMessage />);

      const header = screen.getByText('Account Locked').closest('.bg-red-600');
      expect(header).toBeInTheDocument();
    });

    it('displays reason in warning box', () => {
      const { container } = render(<AccountLockedMessage />);

      const reasonBox = screen.getByText(/Your account has been locked/i).closest('.bg-red-50');
      expect(reasonBox).toBeInTheDocument();
    });
  });

  describe('Multiple Scenarios', () => {
    it('renders correctly for failed attempts with unlock time', () => {
      const unlockTime = new Date(Date.now() + 30 * 60 * 1000);
      render(<AccountLockedMessage reason="failed_attempts" unlockTime={unlockTime} />);

      expect(screen.getByText(/multiple failed login attempts/i)).toBeInTheDocument();
      expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
      expect(screen.getByText(/Wait for the automatic unlock period/i)).toBeInTheDocument();
    });

    it('renders correctly for admin action without unlock time', () => {
      render(<AccountLockedMessage reason="admin_action" />);

      expect(screen.getByText(/locked by an administrator/i)).toBeInTheDocument();
      expect(screen.queryByText(/will be automatically unlocked/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Wait for the automatic unlock period/i)).not.toBeInTheDocument();
    });

    it('renders correctly for security with custom contact info', () => {
      render(
        <AccountLockedMessage
          reason="security"
          contactEmail="security@company.com"
          contactPhone="1-800-555-HELP"
        />
      );

      expect(screen.getByText(/suspicious activity/i)).toBeInTheDocument();
      expect(screen.getByText('security@company.com')).toBeInTheDocument();
      expect(screen.getByText('1-800-555-HELP')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long unlock times', () => {
      const unlockTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
    });

    it('handles unlock time exactly at current time', () => {
      const unlockTime = new Date();
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/should be unlocked now/i)).toBeInTheDocument();
    });

    it('handles very short unlock times', () => {
      const unlockTime = new Date(Date.now() + 30 * 1000); // 30 seconds
      render(<AccountLockedMessage unlockTime={unlockTime} />);

      expect(screen.getByText(/1 minute/i)).toBeInTheDocument();
    });

    it('handles empty contact email', () => {
      render(<AccountLockedMessage contactEmail="" />);

      const emailLink = screen.getByRole('link', { name: '' });
      expect(emailLink).toHaveAttribute('href', 'mailto:');
    });

    it('handles empty contact phone', () => {
      render(<AccountLockedMessage contactPhone="" />);

      expect(screen.queryByText('1-800-LEXIFLOW')).not.toBeInTheDocument();
    });
  });

  describe('Branding', () => {
    it('displays LexiFlow branding', () => {
      render(<AccountLockedMessage />);

      expect(screen.getByText('LexiFlow')).toBeInTheDocument();
      expect(screen.getByText('Account Security')).toBeInTheDocument();
    });

    it('has consistent styling across all elements', () => {
      const { container } = render(<AccountLockedMessage />);

      // Check for consistent color scheme
      expect(container.querySelector('.bg-slate-800')).toBeInTheDocument();
      expect(container.querySelector('.border-slate-700')).toBeInTheDocument();
    });
  });
});
