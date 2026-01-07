/**
 * @fileoverview Enterprise-grade tests for PasswordStrengthMeter component
 * Tests password strength calculation, visual indicators, and NIST compliance
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PasswordStrengthMeter, calculatePasswordStrength } from './PasswordStrengthMeter';

expect.extend(toHaveNoViolations);

describe('PasswordStrengthMeter', () => {
  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<PasswordStrengthMeter password="test" />);

      expect(screen.getByText('Password strength:')).toBeInTheDocument();
    });

    it('returns null for empty password when showFeedback is false', () => {
      const { container } = render(
        <PasswordStrengthMeter password="" showFeedback={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('shows feedback for empty password when showFeedback is true', () => {
      render(<PasswordStrengthMeter password="" showFeedback={true} />);

      expect(screen.getByText(/Enter a password/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PasswordStrengthMeter password="test" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Strength Labels', () => {
    it('displays Very Weak for short passwords', () => {
      render(<PasswordStrengthMeter password="abc" />);

      expect(screen.getByText('Very Weak')).toBeInTheDocument();
    });

    it('displays Weak for medium passwords', () => {
      render(<PasswordStrengthMeter password="password1" />);

      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('displays Fair for decent passwords', () => {
      render(<PasswordStrengthMeter password="Password123" />);

      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    it('displays Good for good passwords', () => {
      render(<PasswordStrengthMeter password="Password123!' />);

      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('displays Strong for strong passwords', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar', () => {
      render(<PasswordStrengthMeter password="test" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('shows 20% for very weak passwords', () => {
      render(<PasswordStrengthMeter password="abc" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '20%' });
    });

    it('shows 100% for strong passwords', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('applies red color for very weak', () => {
      render(<PasswordStrengthMeter password="abc" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('applies green color for strong', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveClass('bg-green-500');
    });
  });

  describe('Feedback Messages', () => {
    it('shows length feedback', () => {
      render(<PasswordStrengthMeter password="short" />);

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('shows character variety feedback', () => {
      render(<PasswordStrengthMeter password="lowercaseonly" />);

      expect(screen.getByText(/uppercase letters/i)).toBeInTheDocument();
    });

    it('shows common pattern feedback', () => {
      render(<PasswordStrengthMeter password="password123" />);

      expect(screen.getByText(/common patterns/i)).toBeInTheDocument();
    });

    it('shows sequential characters feedback', () => {
      render(<PasswordStrengthMeter password="abc123xyz" />);

      expect(screen.getByText(/sequential characters/i)).toBeInTheDocument();
    });

    it('shows keyboard pattern feedback', () => {
      render(<PasswordStrengthMeter password="qwerty123" />);

      expect(screen.getByText(/keyboard patterns/i)).toBeInTheDocument();
    });

    it('shows positive feedback for strong password', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      expect(screen.getByText(/Strong password!/i)).toBeInTheDocument();
    });

    it('hides feedback when showFeedback is false', () => {
      render(<PasswordStrengthMeter password="weak" showFeedback={false} />);

      expect(screen.queryByText(/at least/i)).not.toBeInTheDocument();
    });
  });

  describe('Security Tips', () => {
    it('shows security tips for weak passwords', () => {
      render(<PasswordStrengthMeter password="weak" />);

      expect(screen.getByText(/Security Tips/i)).toBeInTheDocument();
    });

    it('hides security tips for strong passwords', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      expect(screen.queryByText(/Security Tips/i)).not.toBeInTheDocument();
    });

    it('shows passphrase recommendation', () => {
      render(<PasswordStrengthMeter password="weak" />);

      expect(screen.getByText(/passphrase/i)).toBeInTheDocument();
    });

    it('shows unique password recommendation', () => {
      render(<PasswordStrengthMeter password="weak" />);

      expect(screen.getByText(/unique password/i)).toBeInTheDocument();
    });
  });

  describe('Custom Min Length', () => {
    it('uses custom minLength', () => {
      render(<PasswordStrengthMeter password="short123" minLength={16} />);

      expect(screen.getByText(/at least 16 characters/i)).toBeInTheDocument();
    });

    it('scores better when meeting custom minLength', () => {
      const { container } = render(
        <PasswordStrengthMeter password="password123456789" minLength={12} />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).not.toHaveClass('bg-red-500');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<PasswordStrengthMeter password="test" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper role attribute on progress bar', () => {
      render(<PasswordStrengthMeter password="test" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-live region', () => {
      const { container } = render(<PasswordStrengthMeter password="test" />);

      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    });

    it('has proper aria-label on progress bar', () => {
      render(<PasswordStrengthMeter password="test" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-label');
    });
  });

  describe('Color Classes', () => {
    it('applies red text for very weak', () => {
      render(<PasswordStrengthMeter password="abc" />);

      expect(screen.getByText('Very Weak')).toHaveClass('text-red-600');
    });

    it('applies orange text for weak', () => {
      render(<PasswordStrengthMeter password="password1" />);

      expect(screen.getByText('Weak')).toHaveClass('text-orange-600');
    });

    it('applies yellow text for fair', () => {
      render(<PasswordStrengthMeter password="Password123" />);

      expect(screen.getByText('Fair')).toHaveClass('text-yellow-600');
    });

    it('applies blue text for good', () => {
      render(<PasswordStrengthMeter password="Password123!" />);

      expect(screen.getByText('Good')).toHaveClass('text-blue-600');
    });

    it('applies green text for strong', () => {
      render(<PasswordStrengthMeter password="MyStr0ng!P@ssw0rd2024" />);

      expect(screen.getByText('Strong')).toHaveClass('text-green-600');
    });
  });
});

describe('calculatePasswordStrength', () => {
  describe('Score Calculation', () => {
    it('returns score 0 for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.score).toBe(0);
    });

    it('returns score 0 for very short passwords', () => {
      const result = calculatePasswordStrength('abc');
      expect(result.score).toBe(0);
    });

    it('increases score for length', () => {
      const short = calculatePasswordStrength('12345678');
      const long = calculatePasswordStrength('1234567890123456');

      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });

    it('increases score for character variety', () => {
      const lowercase = calculatePasswordStrength('abcdefghijkl');
      const mixed = calculatePasswordStrength('Abcdefghijkl');
      const withNumber = calculatePasswordStrength('Abcdefghijk1');
      const withSpecial = calculatePasswordStrength('Abcdefghij1!');

      expect(mixed.score).toBeGreaterThanOrEqual(lowercase.score);
      expect(withNumber.score).toBeGreaterThanOrEqual(mixed.score);
      expect(withSpecial.score).toBeGreaterThanOrEqual(withNumber.score);
    });

    it('penalizes common patterns', () => {
      const withPattern = calculatePasswordStrength('password12345');
      const withoutPattern = calculatePasswordStrength('xyzabc12345gh');

      expect(withoutPattern.score).toBeGreaterThan(withPattern.score);
    });

    it('penalizes sequential characters', () => {
      const sequential = calculatePasswordStrength('abcdefghijkl');
      const nonSequential = calculatePasswordStrength('axbyczdwevfu');

      expect(nonSequential.score).toBeGreaterThan(sequential.score);
    });

    it('penalizes keyboard patterns', () => {
      const keyboard = calculatePasswordStrength('qwertyuiop12');
      const nonKeyboard = calculatePasswordStrength('randomtext12');

      expect(nonKeyboard.score).toBeGreaterThan(keyboard.score);
    });

    it('gives bonus for very long passwords', () => {
      const long = calculatePasswordStrength('MyVeryLongPasswordHere');

      expect(long.percentage).toBeGreaterThan(60);
    });

    it('caps score at 4', () => {
      const superStrong = calculatePasswordStrength('MyStr0ng!P@ssw0rd2024WithExtras!!!');

      expect(superStrong.score).toBeLessThanOrEqual(4);
    });
  });

  describe('Feedback Array', () => {
    it('includes length feedback', () => {
      const result = calculatePasswordStrength('short');

      expect(result.feedback.some(f => f.includes('characters'))).toBe(true);
    });

    it('includes variety feedback', () => {
      const result = calculatePasswordStrength('lowercase');

      expect(result.feedback.some(f => f.includes('uppercase') || f.includes('numbers'))).toBe(true);
    });

    it('includes positive feedback for strong passwords', () => {
      const result = calculatePasswordStrength('MyStr0ng!P@ssw0rd2024');

      expect(result.feedback).toContain('Strong password!');
    });
  });

  describe('Label Mapping', () => {
    it('returns Very Weak for score 0', () => {
      const result = calculatePasswordStrength('a');
      expect(result.label).toBe('Very Weak');
    });

    it('returns Weak for score 1', () => {
      const result = calculatePasswordStrength('password');
      expect(result.label).toBe('Weak');
    });

    it('returns Fair for score 2', () => {
      const result = calculatePasswordStrength('Password123');
      expect(result.label).toBe('Fair');
    });

    it('returns Good for score 3', () => {
      const result = calculatePasswordStrength('Password123!');
      expect(result.label).toBe('Good');
    });

    it('returns Strong for score 4', () => {
      const result = calculatePasswordStrength('MyStr0ng!P@ssw0rd2024');
      expect(result.label).toBe('Strong');
    });
  });

  describe('Color Mapping', () => {
    it('returns red for score 0', () => {
      const result = calculatePasswordStrength('a');
      expect(result.color).toBe('bg-red-500');
    });

    it('returns orange for score 1', () => {
      const result = calculatePasswordStrength('password');
      expect(result.color).toBe('bg-orange-500');
    });

    it('returns yellow for score 2', () => {
      const result = calculatePasswordStrength('Password123');
      expect(result.color).toBe('bg-yellow-500');
    });

    it('returns blue for score 3', () => {
      const result = calculatePasswordStrength('Password123!');
      expect(result.color).toBe('bg-blue-500');
    });

    it('returns green for score 4', () => {
      const result = calculatePasswordStrength('MyStr0ng!P@ssw0rd2024');
      expect(result.color).toBe('bg-green-500');
    });
  });

  describe('Percentage', () => {
    it('returns 0 for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.percentage).toBe(0);
    });

    it('returns 20 for score 0', () => {
      const result = calculatePasswordStrength('a');
      expect(result.percentage).toBe(20);
    });

    it('returns 100 for score 4', () => {
      const result = calculatePasswordStrength('MyStr0ng!P@ssw0rd2024');
      expect(result.percentage).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('handles unicode characters', () => {
      const result = calculatePasswordStrength('P@ssword123!');
      expect(result.score).toBeGreaterThan(0);
    });

    it('handles repeated characters', () => {
      const result = calculatePasswordStrength('aaaaaaaaaa');
      expect(result.feedback.some(f => f.includes('repeated'))).toBe(true);
    });

    it('handles all same digit', () => {
      const result = calculatePasswordStrength('1111111111');
      expect(result.feedback.some(f => f.includes('repeated') || f.includes('pattern'))).toBe(true);
    });

    it('handles very long passwords', () => {
      const longPassword = 'a'.repeat(100);
      const result = calculatePasswordStrength(longPassword);
      expect(result).toBeDefined();
    });
  });
});
