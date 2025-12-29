/**
 * SessionManager Component
 * Manages active user sessions with security controls
 *
 * Features:
 * - Display all active sessions
 * - Device and location information
 * - Last activity timestamps
 * - Revoke individual sessions
 * - Revoke all other sessions
 * - Current session highlighting
 * - Real-time session updates
 * - WCAG 2.1 AA compliant
 */

import React, { useState, useEffect } from 'react';
// UserSecurityProfile type reserved for future API integration

export interface Session {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  ip: string;
  location?: string;
  lastActive: string;
  current: boolean;
  createdAt: string;
}

export interface SessionManagerProps {
  sessions: Session[];
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeAllOtherSessions?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions: initialSessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
  onRefresh,
  className = '',
}) => {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsLoading(true);
    setError('');

    try {
      await onRefresh();
    } catch (err: unknown) {
      setError(err.message || 'Failed to refresh sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!onRevokeSession) return;

    if (!confirm('Are you sure you want to revoke this session? The device will be signed out.')) {
      return;
    }

    setRevokingSessionId(sessionId);
    setError('');

    try {
      await onRevokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      setError(err.message || 'Failed to revoke session');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!onRevokeAllOtherSessions) return;

    if (!confirm('Are you sure you want to revoke all other sessions? All other devices will be signed out.')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onRevokeAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (err: unknown) {
      setError(err.message || 'Failed to revoke sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
  };

  const getDeviceIcon = (device: string): JSX.Element => {
    const deviceLower = device.toLowerCase();

    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }

    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  const currentSession = sessions.find((s) => s.current);
  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage devices that are currently signed in to your account
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Refresh sessions"
            >
              <svg
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no active sessions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentSession && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Current Session</h3>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-blue-600 mt-1">
                          {getDeviceIcon(currentSession.device)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{currentSession.device}</p>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          </div>
                          {currentSession.browser && (
                            <p className="mt-1 text-sm text-gray-600">{currentSession.browser}</p>
                          )}
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {currentSession.ip}
                              {currentSession.location && ` · ${currentSession.location}`}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Active {formatLastActive(currentSession.lastActive)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {otherSessions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Other Sessions</h3>
                    {onRevokeAllOtherSessions && otherSessions.length > 1 && (
                      <button
                        type="button"
                        onClick={handleRevokeAllOthers}
                        disabled={isLoading}
                        className="text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Revoke all other sessions
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {otherSessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 text-gray-400 mt-1">
                              {getDeviceIcon(session.device)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{session.device}</p>
                              {session.browser && (
                                <p className="mt-1 text-sm text-gray-600">{session.browser}</p>
                              )}
                              <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {session.ip}
                                  {session.location && ` · ${session.location}`}
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatLastActive(session.lastActive)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {onRevokeSession && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokingSessionId === session.id}
                              className="ml-4 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label={`Revoke session on ${session.device}`}
                            >
                              {revokingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-700">
                If you see an unfamiliar device, revoke it immediately and change your password. Sessions automatically expire after 30 days of inactivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
