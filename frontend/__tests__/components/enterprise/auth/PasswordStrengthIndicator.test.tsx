/**
 * PasswordStrengthIndicator Component Tests
 *
 * Tests for password strength calculation, requirements display,
 * and visual feedback.
 */

import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useAuthState } from '@/contexts/auth/AuthProvider';

// Mock the auth hooks
jest.mock('@/contexts/auth/AuthProvider', () => ({
  useAuthState: jest.fn(),
}));

describe('PasswordStrengthIndicator', () => {
  const mockPasswordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    preventReuse: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthState as jest.Mock).mockReturnValue({
      passwordPolicy: mockPasswordPolicy,
    });
  });

  describe('Rendering', () => {
    it('renders nothing when password is empty', () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders strength indicator when password is provided', () => {
      render(<PasswordStrengthIndicator password="Test123!" />);

      expect(screen.getByText('Password Strength:')).toBeInTheDocument();
    });

    it('renders requirements checklist by default', () => {
      render(<PasswordStrengthIndicator password="Test123!" />);

      expect(screen.getByText(/At least 12 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Contains uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/Contains lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/Contains number/i)).toBeInTheDocument();
      expect(screen.getByText(/Contains special character/i)).toBeInTheDocument();
    });

    it('hides requirements when showRequirements is false', () => {
      render(<PasswordStrengthIndicator password="Test123!" showRequirements={false} />);

      expect(screen.queryByText(/At least 12 characters/i)).not.toBeInTheDocument();
      expect(screen.getByText('Password Strength:')).toBeInTheDocument();
    });
  });

  describe('Strength Calculation', () => {
    it('shows "Weak" for password meeting few requirements', () => {
      render(<PasswordStrengthIndicator password="abc" />);

      expect(screen.getByText('Weak')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toHaveClass('text-red-600');
    });

    it('shows "Fair" for password meeting 60-79% of requirements', () => {
      render(<PasswordStrengthIndicator password="abcdefghijk1" />); // 3/5 = 60% (length, lowercase, number)

      expect(screen.getByText('Fair')).toBeInTheDocument();
      expect(screen.getByText('Fair')).toHaveClass('text-yellow-600');
    });

    it('shows "Good" for password meeting 80-99% of requirements', () => {
      render(<PasswordStrengthIndicator password="Abcdefghijk1" />); // 4/5 = 80% (length, uppercase, lowercase, number)

      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Good')).toHaveClass('text-blue-600');
    });

    it('shows "Strong" for password meeting all requirements', () => {
      render(<PasswordStrengthIndicator password="Abcdefghijk1!" />); // 5/5 = 100%

      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toHaveClass('text-green-600');
    });

    it('calculates correct percentage for progress bar', () => {
      const { container } = render(<PasswordStrengthIndicator password="Abcdefghijk1!" />);

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Requirements Validation', () => {
    it('validates minimum length requirement', () => {
      const { container } = render(<PasswordStrengthIndicator password="Short1!" />);

      const requirements = container.querySelectorAll('.flex.items-start.gap-2');
      const lengthReq = Array.from(requirements).find(req =>
        req.textContent?.includes('At least 12 characters')
      );

      // Should show X icon (not met)
      expect(lengthReq?.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('validates uppercase letter requirement', () => {
      render(<PasswordStrengthIndicator password="lowercase123!" />);

      const uppercaseReq = screen.getByText(/Contains uppercase letter/i).parentElement;
      expect(uppercaseReq?.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('validates lowercase letter requirement', () => {
      render(<PasswordStrengthIndicator password="UPPERCASE123!" />);

      const lowercaseReq = screen.getByText(/Contains lowercase letter/i).parentElement;
      expect(lowercaseReq?.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('validates number requirement', () => {
      render(<PasswordStrengthIndicator password="NoNumbers!" />);

      const numberReq = screen.getByText(/Contains number/i).parentElement;
      expect(numberReq?.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('validates special character requirement', () => {
      render(<PasswordStrengthIndicator password="NoSpecialChars123" />);

      const specialReq = screen.getByText(/Contains special character/i).parentElement;
      expect(specialReq?.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('shows check icon when requirement is met', () => {
      render(<PasswordStrengthIndicator password="ValidPassword123!" />);

      const lengthReq = screen.getByText(/At least 12 characters/i).parentElement;
      expect(lengthReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('shows all requirements as met for strong password', () => {
      const { container } = render(<PasswordStrengthIndicator password="SuperSecure123!" />);

      const checkIcons = container.querySelectorAll('.text-green-500');
      expect(checkIcons.length).toBe(5); // All 5 requirements met
    });
  });

  describe('Password Policy Integration', () => {
    it('uses custom minimum length from policy', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        passwordPolicy: { ...mockPasswordPolicy, minLength: 8 },
      });

      render(<PasswordStrengthIndicator password="Test123!" />);

      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('marks uppercase as met when policy does not require it', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        passwordPolicy: { ...mockPasswordPolicy, requireUppercase: false },
      });

      render(<PasswordStrengthIndicator password="lowercase123!" />);

      const uppercaseReq = screen.getByText(/Contains uppercase letter/i).parentElement;
      expect(uppercaseReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('marks lowercase as met when policy does not require it', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        passwordPolicy: { ...mockPasswordPolicy, requireLowercase: false },
      });

      render(<PasswordStrengthIndicator password="UPPERCASE123!" />);

      const lowercaseReq = screen.getByText(/Contains lowercase letter/i).parentElement;
      expect(lowercaseReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('marks numbers as met when policy does not require them', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        passwordPolicy: { ...mockPasswordPolicy, requireNumbers: false },
      });

      render(<PasswordStrengthIndicator password="NoNumbers!" />);

      const numberReq = screen.getByText(/Contains number/i).parentElement;
      expect(numberReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });

    it('marks special chars as met when policy does not require them', () => {
      (useAuthState as jest.Mock).mockReturnValue({
        passwordPolicy: { ...mockPasswordPolicy, requireSpecialChars: false },
      });

      render(<PasswordStrengthIndicator password="NoSpecialChars123" />);

      const specialReq = screen.getByText(/Contains special character/i).parentElement;
      expect(specialReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });
  });

  describe('Progress Bar Colors', () => {
    it('shows red progress bar for weak password', () => {
      const { container } = render(<PasswordStrengthIndicator password="abc" />);

      const progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows yellow progress bar for fair password', () => {
      const { container } = render(<PasswordStrengthIndicator password="abcdefghijk1" />);

      const progressBar = container.querySelector('.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows blue progress bar for good password', () => {
      const { container } = render(<PasswordStrengthIndicator password="Abcdefghijk1" />);

      const progressBar = container.querySelector('.bg-blue-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows green progress bar for strong password', () => {
      const { container } = render(<PasswordStrengthIndicator password="Abcdefghijk1!" />);

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Special Characters Validation', () => {
    it('recognizes common special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '.', ',', '?', '"', ':', '{', '}', '|', '<', '>'];

      specialChars.forEach(char => {
        const { container } = render(
          <PasswordStrengthIndicator password={`Password123${char}`} />
        );

        const specialReq = screen.getByText(/Contains special character/i).parentElement;
        expect(specialReq?.querySelector('.text-green-500')).toBeInTheDocument();

        // Cleanup for next iteration
        container.remove();
      });
    });
  });

  describe('Dynamic Updates', () => {
    it('updates strength when password changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="weak" />);

      expect(screen.getByText('Weak')).toBeInTheDocument();

      rerender(<PasswordStrengthIndicator password="StrongPassword123!" />);

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('updates requirements checklist when password changes', () => {
      const { rerender, container } = render(<PasswordStrengthIndicator password="abc" />);

      let checkIcons = container.querySelectorAll('.text-green-500');
      expect(checkIcons.length).toBeLessThan(5);

      rerender(<PasswordStrengthIndicator password="ValidPassword123!" />);

      checkIcons = container.querySelectorAll('.text-green-500');
      expect(checkIcons.length).toBe(5);
    });

    it('updates progress bar when password changes', () => {
      const { rerender, container } = render(<PasswordStrengthIndicator password="weak" />);

      let progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();

      rerender(<PasswordStrengthIndicator password="StrongPassword123!" />);

      progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML for requirements list', () => {
      const { container } = render(<PasswordStrengthIndicator password="Test123!" />);

      const list = container.querySelector('.space-y-1');
      expect(list).toBeInTheDocument();
    });

    it('has descriptive text for each requirement', () => {
      render(<PasswordStrengthIndicator password="Test123!" />);

      expect(screen.getByText('At least 12 characters')).toBeInTheDocument();
      expect(screen.getByText('Contains uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('Contains lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('Contains number')).toBeInTheDocument();
      expect(screen.getByText('Contains special character (!@#$%^&*)')).toBeInTheDocument();
    });

    it('uses appropriate color contrast for strength label', () => {
      render(<PasswordStrengthIndicator password="StrongPassword123!" />);

      const strengthLabel = screen.getByText('Strong');
      expect(strengthLabel).toHaveClass('text-green-600');
    });

    it('provides visual and text indicators for requirement status', () => {
      const { container } = render(<PasswordStrengthIndicator password="ValidPassword123!" />);

      const requirements = container.querySelectorAll('.flex.items-start.gap-2');
      requirements.forEach(req => {
        // Should have both icon and text
        expect(req.querySelector('svg')).toBeInTheDocument();
        expect(req.textContent).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very short passwords', () => {
      render(<PasswordStrengthIndicator password="A" />);

      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('handles very long passwords', () => {
      const longPassword = 'A'.repeat(100) + 'bcdefgh123!';
      render(<PasswordStrengthIndicator password={longPassword} />);

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('handles passwords with only spaces', () => {
      render(<PasswordStrengthIndicator password="     " />);

      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      render(<PasswordStrengthIndicator password="Pässwörd123!" />);

      // Should still validate based on ASCII character types
      const lengthReq = screen.getByText(/At least 12 characters/i).parentElement;
      expect(lengthReq?.querySelector('.text-green-500')).toBeInTheDocument();
    });
  });
});
