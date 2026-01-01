/**
 * PasswordStrengthMeter Component
 * Visual password strength indicator with security recommendations
 *
 * Features:
 * - Real-time strength calculation
 * - Visual progress indicator
 * - Specific feedback for improvements
 * - NIST 800-63B compliant recommendations
 * - Zxcvbn-inspired strength algorithm
 * - WCAG 2.1 AA compliant
 */

import React, { useMemo } from 'react';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  percentage: number;
  feedback: string[];
}

export interface PasswordStrengthMeterProps {
  password: string;
  minLength?: number;
  showFeedback?: boolean;
  className?: string;
}

/**
 * Calculate password strength using multiple criteria
 * Based on NIST SP 800-63B guidelines and common best practices
 */
export const calculatePasswordStrength = (
  password: string,
  minLength: number = 12
): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-gray-300',
      percentage: 0,
      feedback: ['Enter a password to see strength'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check (most important factor)
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else if (password.length < minLength) {
    feedback.push(`Use at least ${minLength} characters for better security`);
    score += 1;
  } else if (password.length >= minLength && password.length < 16) {
    score += 2;
  } else {
    score += 3;
  }

  // Character variety checks
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const varietyCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (varietyCount === 1) {
    feedback.push('Add uppercase letters, numbers, and special characters');
  } else if (varietyCount === 2) {
    feedback.push('Add numbers and special characters for stronger security');
    score += 1;
  } else if (varietyCount === 3) {
    feedback.push('Add special characters for maximum security');
    score += 2;
  } else if (varietyCount === 4) {
    score += 3;
  }

  // Common patterns check
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
    /^letmein/i,
    /(.)\1{2,}/, // Repeated characters
    /^(\d)\1+$/, // All same digit
  ];

  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password));
  if (hasCommonPattern) {
    feedback.push('Avoid common patterns and repeated characters');
    score = Math.max(0, score - 2);
  }

  // Sequential characters check
  const hasSequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    feedback.push('Avoid sequential characters (abc, 123, etc.)');
    score = Math.max(0, score - 1);
  }

  // Keyboard patterns check
  const keyboardPatterns = [
    /qwert/i,
    /asdf/i,
    /zxcv/i,
  ];
  const hasKeyboardPattern = keyboardPatterns.some((pattern) => pattern.test(password));
  if (hasKeyboardPattern) {
    feedback.push('Avoid keyboard patterns (qwerty, asdf, etc.)');
    score = Math.max(0, score - 1);
  }

  // Entropy bonus for very long passwords
  if (password.length >= 20) {
    score = Math.min(4, score + 1);
  }

  // Cap score at 4 and ensure it's a valid literal type
  const clampedScore = Math.min(4, Math.max(0, Math.round(score)));
  if (clampedScore === 0) score = 0;
  else if (clampedScore === 1) score = 1;
  else if (clampedScore === 2) score = 2;
  else if (clampedScore === 3) score = 3;
  else score = 4;

  // If no feedback, password is strong
  if (feedback.length === 0) {
    feedback.push('Strong password!');
  }

  // Map score to label and color
  const strengthMap: Record<number, { label: PasswordStrength['label']; color: string; percentage: number }> = {
    0: { label: 'Very Weak', color: 'bg-red-500', percentage: 20 },
    1: { label: 'Weak', color: 'bg-orange-500', percentage: 40 },
    2: { label: 'Fair', color: 'bg-yellow-500', percentage: 60 },
    3: { label: 'Good', color: 'bg-blue-500', percentage: 80 },
    4: { label: 'Strong', color: 'bg-green-500', percentage: 100 },
  };

  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    ...strengthMap[score],
    feedback,
  };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  minLength = 12,
  showFeedback = true,
  className = '',
}) => {
  const strength = useMemo(
    () => calculatePasswordStrength(password, minLength),
    [password, minLength]
  );

  if (!password && !showFeedback) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-live="polite">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Password strength:</span>
          <span
            className={`font-semibold ${
              strength.score === 0
                ? 'text-red-600'
                : strength.score === 1
                ? 'text-orange-600'
                : strength.score === 2
                ? 'text-yellow-600'
                : strength.score === 3
                ? 'text-blue-600'
                : 'text-green-600'
            }`}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300 ease-out`}
            style={{ width: `${strength.percentage}%` }}
            role="progressbar"
            aria-valuenow={strength.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${strength.label}`}
          />
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && password && (
        <div className="space-y-1">
          {strength.feedback.map((item, index) => (
            <div
              key={index}
              className={`flex items-start text-xs ${
                strength.score >= 4 ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {strength.score >= 4 ? (
                <svg
                  className="w-4 h-4 mr-1.5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Security recommendations */}
      {showFeedback && password && strength.score < 3 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-blue-800 font-medium">Security Tips:</p>
              <ul className="mt-1 text-xs text-blue-700 list-disc list-inside space-y-0.5">
                <li>Use a passphrase with multiple words</li>
                <li>Mix uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid personal information</li>
                <li>Use a unique password for each account</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
