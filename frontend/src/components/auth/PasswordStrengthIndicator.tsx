/**
 * Password Strength Indicator Component
 *
 * Displays password strength and policy compliance feedback
 *
 * @module components/auth/PasswordStrengthIndicator
 */

import { useAuthState } from '@/contexts/auth/AuthProvider';
import { useTheme } from '@/theme';
import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const { passwordPolicy } = useAuthState();
  const { theme, tokens } = useTheme();

  const requirements = useMemo<PasswordRequirement[]>(() => {
    return [
      {
        label: `At least ${passwordPolicy.minLength} characters`,
        met: password.length >= passwordPolicy.minLength,
      },
      {
        label: 'Contains uppercase letter',
        met: !passwordPolicy.requireUppercase || /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        met: !passwordPolicy.requireLowercase || /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        met: !passwordPolicy.requireNumbers || /\d/.test(password),
      },
      {
        label: 'Contains special character (!@#$%^&*)',
        met: !passwordPolicy.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ];
  }, [password, passwordPolicy]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'gray' };

    const metRequirements = requirements.filter(r => r.met).length;
    const percentage = (metRequirements / requirements.length) * 100;

    if (percentage === 100) {
      return { score: 100, label: 'Strong', color: 'green' };
    } else if (percentage >= 80) {
      return { score: percentage, label: 'Good', color: 'blue' };
    } else if (percentage >= 60) {
      return { score: percentage, label: 'Fair', color: 'yellow' };
    } else {
      return { score: percentage, label: 'Weak', color: 'red' };
    }
  }, [password, requirements]);

  const colorStyles = {
    gray: { bg: theme.surface.muted, text: theme.text.secondary },
    red: { bg: theme.status.error.bg, text: theme.status.error.text },
    yellow: { bg: theme.status.warning.bg, text: theme.status.warning.text },
    blue: { bg: tokens.colors.blue500, text: tokens.colors.blue600 },
    green: { bg: theme.status.success.bg, text: theme.status.success.text },
  };
};

if (!password) return null;

return (
  <div className="space-y-3">
    {/* Strength Bar */}
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">Password Strength:</span>
        <span className={`text-xs font-semibold ${textColorClasses[strength.color as keyof typeof textColorClasses]}`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[strength.color as keyof typeof colorClasses]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>

    {/* Requirements Checklist */}
    {showRequirements && (
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {req.met ? (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-xs ${req.met ? 'text-gray-700' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
