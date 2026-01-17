/**
 * Account Locked Message Component
 *
 * Displays when a user's account is locked due to failed login attempts
 * or administrative action.
 *
 * @module components/auth/AccountLockedMessage
 */

import { useTheme } from "@/hooks/useTheme";

interface AccountLockedMessageProps {
  reason?: 'failed_attempts' | 'admin_action' | 'security';
  unlockTime?: Date;
  contactEmail?: string;
  contactPhone?: string;
}

export function AccountLockedMessage({
  reason = 'failed_attempts',
  unlockTime,
  contactEmail = 'security@lexiflow.com',
  contactPhone = '1-800-LEXIFLOW',
}: AccountLockedMessageProps) {
  const { theme, tokens } = useTheme();
  const gradientBackground = String(tokens.colors.gradients.primary);
  const accentColor = String(tokens.colors.primaryLight);

  const getReasonText = () => {
    switch (reason) {
      case 'failed_attempts':
        return 'Your account has been locked due to multiple failed login attempts.';
      case 'admin_action':
        return 'Your account has been locked by an administrator.';
      case 'security':
        return 'Your account has been locked due to suspicious activity.';
      default:
        return 'Your account has been locked.';
    }
  };

  const getUnlockInfo = () => {
    if (!unlockTime) return null;

    const now = new Date();
    const diff = unlockTime.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Your account should be unlocked now. Please try logging in again.';
    }

    const minutes = Math.ceil(diff / 1000 / 60);
    if (minutes < 60) {
      return `Your account will be automatically unlocked in ${minutes} minute${minutes !== 1 ? 's' : ''}.`;
    }

    const hours = Math.ceil(minutes / 60);
    return `Your account will be automatically unlocked in ${hours} hour${hours !== 1 ? 's' : ''}.`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gradientBackground, padding: tokens.spacing.normal.md }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing.layout.lg }}>
          <h1 style={{ fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.bold, color: theme.text.primary, marginBottom: tokens.spacing.compact.sm }}>LexiFlow</h1>
          <p style={{ color: theme.text.secondary }}>Account Security</p>
        </div>

        {/* Main Card */}
        <div style={{ backgroundColor: theme.surface.elevated, borderColor: theme.border.default, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.xxl, overflow: 'hidden', borderWidth: '1px' }}>
          {/* Header */}
          <div style={{ backgroundColor: theme.status.error.bg, padding: `${tokens.spacing.normal.md} ${tokens.spacing.normal.lg}` }}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" style={{ color: theme.text.inverse }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{ color: theme.text.inverse }}>
                Account Locked
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Reason */}
            <div style={{ backgroundColor: theme.status.error.bg, borderColor: theme.status.error.border, borderWidth: '1px', borderRadius: tokens.borderRadius.lg, padding: tokens.spacing.normal.lg }}>
              <p style={{ color: theme.status.error.text, fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing.compact.sm }}>
                {getReasonText()}
              </p>
              {unlockTime && (
                <p style={{ color: theme.status.error.text, fontSize: tokens.typography.fontSize.sm }}>
                  {getUnlockInfo()}
                </p>
              )}
            </div>

            {/* What to do */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                What should I do?
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: theme.text.secondary }}>
                {reason === 'failed_attempts' && (
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Wait for the automatic unlock period to expire</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Contact your system administrator for immediate assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>If you believe this is an error, contact our security team</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t" style={{ borderColor: theme.border.default }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text.primary }}>
                Need Help?
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5" style={{ color: theme.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${contactEmail}`} style={{ color: theme.primary.DEFAULT }} className="hover:opacity-80 transition-all">
                    {contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5" style={{ color: theme.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span style={{ color: theme.text.primary }}>{contactPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: theme.surface.raised, borderColor: theme.border.default }} className="px-6 py-4 border-t">
            <a
              href="/login"
              style={{ backgroundColor: theme.surface.raised, color: theme.text.primary }}
              className="block w-full text-center px-4 py-2 hover:opacity-90 rounded-lg transition-all"
            >
              Return to Login
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: theme.text.muted }}>
            This security measure protects your account from unauthorized access.
          </p>
        </div>
      </div>
    </div>
  );
}
