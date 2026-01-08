import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Shield,
} from 'lucide-react';

/**
 * Session Manager Component
 * Displays and manages active user sessions across devices
 */

interface Session {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
  isTrusted: boolean;
  isCurrent: boolean;
  riskScore: number;
}

interface SessionManagerProps {
  apiBaseUrl?: string;
  onSessionRevoked?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  apiBaseUrl = '/api',
  onSessionRevoked,
  onError,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    trustedDevices: 0,
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.sessions || []);

      // Fetch stats
      const statsResponse = await fetch(`${apiBaseUrl}/auth/sessions/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to revoke session');

      setSessions(sessions.filter((s) => s.id !== sessionId));
      onSessionRevoked?.(sessionId);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm('Are you sure you want to sign out all other devices?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/sessions`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to revoke sessions');

      await fetchSessions();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore < 30) return { level: 'low', color: 'green', label: 'Low Risk' };
    if (riskScore < 70) return { level: 'medium', color: 'yellow', label: 'Medium Risk' };
    return { level: 'high', color: 'red', label: 'High Risk' };
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trusted Devices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.trustedDevices}</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Sessions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage where you're signed in
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button
                onClick={revokeAllOtherSessions}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Sign Out All Others</span>
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            const risk = getRiskLevel(session.riskScore);

            return (
              <div
                key={session.id}
                className={`border rounded-lg p-4 transition-colors ${
                  session.isCurrent
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      session.isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <DeviceIcon className={`w-6 h-6 ${
                        session.isCurrent ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {session.browser} on {session.os}
                        </h3>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Current
                          </span>
                        )}
                        {session.isTrusted && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Last active {formatTimeAgo(session.lastActivityAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">IP: {session.ipAddress}</span>
                          {session.riskScore > 0 && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle
                                className={`w-4 h-4 text-${risk.color}-600`}
                              />
                              <span className={`text-${risk.color}-600 font-medium`}>
                                {risk.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {revoking === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Revoke</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Risk Score Bar */}
                {session.riskScore > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Risk Score</span>
                      <span className={`font-medium text-${risk.color}-600`}>
                        {session.riskScore}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${risk.color}-500 transition-all`}
                        style={{ width: `${session.riskScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sessions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No active sessions found</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Tips</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Review your active sessions regularly</li>
              <li>Sign out sessions on devices you no longer use</li>
              <li>Enable MFA for additional security</li>
              <li>Be cautious of suspicious locations or high-risk scores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
