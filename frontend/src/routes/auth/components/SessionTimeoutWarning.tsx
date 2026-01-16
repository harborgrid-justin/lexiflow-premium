/**
 * Session Timeout Warning Component
 *
 * Displays a modal warning when the user's session is about to expire.
 * Allows the user to extend their session or logout.
 *
 * @module components/auth/SessionTimeoutWarning
 */

import { useAuthActions, useAuthState } from '@/providers/application/authprovider';
import { useEffect, useState } from 'react';

export function SessionTimeoutWarning() {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-500 px-6 py-4">
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
          <p className="text-gray-700 mb-4">
            Your session will expire in <span className="font-bold text-yellow-600">{minutes}:{seconds.toString().padStart(2, '0')}</span> due to inactivity.
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Would you like to stay signed in? Click "Stay Signed In" to extend your session.
          </p>

          {/* Timer Progress */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(remainingSeconds / 300) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExtend}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Stay Signed In
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Sign Out Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            For your security, sessions expire after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
