import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Fingerprint,
  Monitor,
  Smartphone,
  Activity,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react';

/**
 * Device Trust Panel Component
 * Manages device trust levels and security settings
 */

interface DeviceInfo {
  id: string;
  fingerprint: string;
  deviceType: string;
  browser: string;
  os: string;
  lastSeen: string;
  location: string;
  isTrusted: boolean;
  riskScore: number;
  sessionCount: number;
  firstSeen: string;
}

interface TrustPolicy {
  requireTrustedDevice: boolean;
  autoTrustAfterDays: number;
  maxRiskScore: number;
  enableAnomalyDetection: boolean;
}

interface DeviceTrustPanelProps {
  apiBaseUrl?: string;
  onTrustChanged?: (deviceId: string, trusted: boolean) => void;
  onError?: (error: Error) => void;
}

export const DeviceTrustPanel: React.FC<DeviceTrustPanelProps> = ({
  apiBaseUrl = '/api',
  onTrustChanged,
  onError,
}) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [policy, setPolicy] = useState<TrustPolicy>({
    requireTrustedDevice: false,
    autoTrustAfterDays: 30,
    maxRiskScore: 50,
    enableAnomalyDetection: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch devices');

      const data = await response.json();

      // Transform sessions to devices (group by fingerprint in production)
      const deviceMap = new Map<string, DeviceInfo>();

      data.sessions?.forEach((session: any) => {
        const fingerprint = session.metadata?.fingerprint || session.id;

        if (!deviceMap.has(fingerprint)) {
          deviceMap.set(fingerprint, {
            id: session.id,
            fingerprint,
            deviceType: session.deviceType,
            browser: session.browser,
            os: session.os,
            lastSeen: session.lastActivityAt,
            location: session.location,
            isTrusted: session.isTrusted,
            riskScore: session.riskScore || 0,
            sessionCount: 1,
            firstSeen: session.createdAt,
          });

          if (session.isCurrent) {
            setCurrentDeviceId(session.id);
          }
        } else {
          const device = deviceMap.get(fingerprint)!;
          device.sessionCount += 1;
          if (new Date(session.lastActivityAt) > new Date(device.lastSeen)) {
            device.lastSeen = session.lastActivityAt;
          }
        }
      });

      setDevices(Array.from(deviceMap.values()));
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDeviceTrust = async (deviceId: string, currentlyTrusted: boolean) => {
    setUpdating(deviceId);
    try {
      const endpoint = currentlyTrusted
        ? `${apiBaseUrl}/auth/sessions/${deviceId}/untrust`
        : `${apiBaseUrl}/auth/sessions/trust-device`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ sessionId: deviceId }),
      });

      if (!response.ok) throw new Error('Failed to update device trust');

      setDevices(
        devices.map((d) =>
          d.id === deviceId ? { ...d, isTrusted: !currentlyTrusted } : d
        )
      );

      onTrustChanged?.(deviceId, !currentlyTrusted);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setUpdating(null);
    }
  };

  const updatePolicy = async (updates: Partial<TrustPolicy>) => {
    setPolicy({ ...policy, ...updates });
    // In production, save to backend
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const getTrustIcon = (isTrusted: boolean, riskScore: number) => {
    if (isTrusted && riskScore < 30) return ShieldCheck;
    if (isTrusted && riskScore < 70) return Shield;
    if (!isTrusted && riskScore < 30) return ShieldAlert;
    return ShieldX;
  };

  const getTrustColor = (isTrusted: boolean, riskScore: number) => {
    if (isTrusted && riskScore < 30) return 'green';
    if (isTrusted && riskScore < 70) return 'yellow';
    if (!isTrusted && riskScore < 30) return 'blue';
    return 'red';
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType.toLowerCase() === 'mobile' ? Smartphone : Monitor;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Fingerprint className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Device Trust Management</h2>
            <p className="text-sm text-gray-600">
              Manage trusted devices and security policies
            </p>
          </div>
        </div>

        {/* Trust Policy Settings */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Trust Policy</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Require trusted device for login
              </span>
            </div>
            <button
              onClick={() => updatePolicy({ requireTrustedDevice: !policy.requireTrustedDevice })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                policy.requireTrustedDevice ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  policy.requireTrustedDevice ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Enable anomaly detection
              </span>
            </div>
            <button
              onClick={() => updatePolicy({ enableAnomalyDetection: !policy.enableAnomalyDetection })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                policy.enableAnomalyDetection ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  policy.enableAnomalyDetection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              Maximum allowed risk score: {policy.maxRiskScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={policy.maxRiskScore}
              onChange={(e) => updatePolicy({ maxRiskScore: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recognized Devices</h3>

        <div className="space-y-3">
          {devices.map((device) => {
            const TrustIcon = getTrustIcon(device.isTrusted, device.riskScore);
            const trustColor = getTrustColor(device.isTrusted, device.riskScore);
            const DeviceIcon = getDeviceIcon(device.deviceType);
            const isCurrentDevice = device.id === currentDeviceId;

            return (
              <div
                key={device.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isCurrentDevice
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg bg-${trustColor}-100`}>
                      <DeviceIcon className={`w-6 h-6 text-${trustColor}-600`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {device.browser} on {device.os}
                        </h4>
                        {isCurrentDevice && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            This Device
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">Last seen:</span>{' '}
                          {formatTimeAgo(device.lastSeen)}
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>{' '}
                          {device.location}
                        </div>
                        <div>
                          <span className="text-gray-500">Sessions:</span>{' '}
                          {device.sessionCount}
                        </div>
                        <div>
                          <span className="text-gray-500">Risk:</span>{' '}
                          <span className={`font-medium text-${trustColor}-600`}>
                            {device.riskScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Trust Status */}
                      <div className="mt-3 flex items-center space-x-2">
                        <TrustIcon className={`w-5 h-5 text-${trustColor}-600`} />
                        <span className={`text-sm font-medium text-${trustColor}-700`}>
                          {device.isTrusted ? 'Trusted Device' : 'Untrusted Device'}
                        </span>
                        {device.riskScore > policy.maxRiskScore && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium">High Risk</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trust Toggle */}
                  <button
                    onClick={() => toggleDeviceTrust(device.id, device.isTrusted)}
                    disabled={updating === device.id}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      device.isTrusted
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    } disabled:opacity-50`}
                  >
                    {updating === device.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : device.isTrusted ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span className="text-sm font-medium">Untrust</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Trust</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Risk Score Bar */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">Device Risk Assessment</span>
                    <span className={`font-medium text-${trustColor}-600`}>
                      {device.riskScore < 30
                        ? 'Low Risk'
                        : device.riskScore < 70
                        ? 'Medium Risk'
                        : 'High Risk'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${trustColor}-500 transition-all`}
                      style={{ width: `${device.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No devices found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Device Trust</p>
            <p className="text-blue-700">
              Trusted devices are recognized and can bypass certain security checks.
              Devices with high risk scores may indicate suspicious activity or unfamiliar
              locations. Review regularly and revoke trust if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceTrustPanel;
