/**
 * Session Timeout Warning Component
 *
 * Displays a modal warning when the user's session is about to expire.
 * Allows the user to extend their session or logout.
 *
 * @module components/auth/SessionTimeoutWarning
 */

import { useAuthActions, useAuthState } from '@/contexts/auth/AuthProvider';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export function SessionTimeoutWarning() {
  const { theme, tokens } = useTheme();
  const { session } = useAuthState();
  const { extendSession, logout } = useAuthActions();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor(event.detail.remainingTime / 1000));
    };

    window.addEventListener('session-warning', handleSessionWarning as EventListener);

    return () => {
      window.removeEventListener('session-warning', handleSessionWarning as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!showWarning || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, remainingSeconds]);

  const handleExtend = async () => {
    await extendSession();
    setShowWarning(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowWarning(false);
  };

  if (!showWarning || !session?.warningShown) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: tokens.semantic.overlay, zIndex: tokens.zIndex.modal }}>
      <div className="max-w-md w-full mx-4 overflow-hidden" style={{ backgroundColor: theme.surface.default, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.xxl }}>
        {/* Header */}
        <div style={{ backgroundColor: tokens.colors.warning, padding: `${tokens.spacing.normal.lg} ${tokens.spacing.normal.xl}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Session Expiring Soon
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="mb-4" style={{ color: tokens.colors.text }}>
            Your session will expire in <span className="font-bold" style={{ color: tokens.colors.warning }}>{minutes}:{seconds.toString().padStart(2, '0')}</span> due to inactivity.
          </p>
          <p className="text-sm mb-6" style={{ color: tokens.colors.textMuted }}>
            Would you like to stay signed in? Click "Stay Signed In" to extend your session.
          </p>

          {/* Timer Progress */}
          <div className="mb-6">
            <div className="w-full h-2" style={{ backgroundColor: tokens.colors.border, borderRadius: tokens.borderRadius.full }}>
              <div
                className="h-2 transition-all duration-1000"
                style={{
                  width: `${(remainingSeconds / 300) * 100}%`,
                  backgroundColor: tokens.colors.warning,
                  borderRadius: tokens.borderRadius.full
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExtend}
              className="flex-1 px-4 py-2 font-medium transition-colors"
              style={{
                backgroundColor: tokens.colors.primary,
                color: tokens.colors.textInverse,
                borderRadius: tokens.borderRadius.lg
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.hoverPrimary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.primary}
            >
              Stay Signed In
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 font-medium transition-colors"
              style={{
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.text,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: tokens.borderRadius.lg
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surface}
            >
              Sign Out Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3" style={{
          backgroundColor: tokens.colors.backgroundSecondary,
          borderTop: `1px solid ${tokens.colors.border}`
        }}>
          <p className="text-xs" style={{ color: tokens.colors.textMuted }}>
            For your security, sessions expire after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
