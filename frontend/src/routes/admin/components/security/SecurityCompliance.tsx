/**
 * @module components/admin/SecurityCompliance
 * @category Admin Panel
 * @description Production-grade security and compliance dashboard with authentication policy,
 * MFA enforcement, session management, IP whitelisting, threat detection using Bloom Filter,
 * and comprehensive access logs monitoring.
 */

import { Shield } from 'lucide-react';
import { useState } from 'react';

import { useNotify } from '@/hooks/useNotify';
import { BloomFilter } from '@/utils/bloomFilter';

import { AccessLogsTable } from './AccessLogsTable';
import { SecurityControlsPanel } from './SecurityControlsPanel';
import { SecurityMetrics } from './SecurityMetrics';
import { ThreatDetectionPanel } from './ThreatDetectionPanel';

import type { AccessLogEntry, SecurityControl, SecurityMetric, ThreatCheckResult } from './types';

// Bloom Filter initialization
const ipBlacklist = new BloomFilter(10000, 0.001);
[
  '192.168.1.55', '10.0.0.99', '172.16.0.4', '45.142.212.61',
  '185.220.101.45', '23.129.64.218', '198.98.57.207'
].forEach(ip => ipBlacklist.add(ip));

const ipWhitelist: string[] = [
  '203.0.113.0/24',
  '198.51.100.0/24',
  '192.0.2.0/24'
];

const initialMetrics: SecurityMetric[] = [
  { label: 'Active Sessions', value: 147, change: 8, trend: 'up', severity: 'success' },
  { label: 'Failed Logins (24h)', value: 12, change: -15, trend: 'down', severity: 'warning' },
  { label: 'Blocked IPs', value: 7, change: 0, trend: 'neutral', severity: 'error' },
  { label: 'MFA Adoption', value: 94, change: 5, trend: 'up', severity: 'success' }
];

const initialControls: SecurityControl[] = [
  {
    id: 'mfa',
    label: 'Require MFA',
    description: 'All internal users must use 2-factor authentication.',
    enabled: true,
    type: 'Smartphone',
    category: 'auth'
  },
  {
    id: 'session-timeout',
    label: 'Session Timeout',
    description: 'Inactive sessions are logged out after 4 hours.',
    enabled: true,
    type: 'Clock',
    category: 'session'
  },
  {
    id: 'ip-whitelist',
    label: 'IP Whitelisting',
    description: 'Restrict access to specific IP ranges.',
    enabled: false,
    type: 'Globe',
    category: 'network'
  },
  {
    id: 'password-policy',
    label: 'Strong Password Policy',
    description: 'Enforce complex passwords with regular rotation.',
    enabled: true,
    type: 'Lock',
    category: 'auth'
  }
];

const initialLogs: AccessLogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    user: 'john.smith@lexiflow.law',
    action: 'Login',
    ipAddress: '203.0.113.42',
    status: 'success',
    location: 'Washington, DC'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: 'sarah.johnson@lexiflow.law',
    action: 'Failed Login',
    ipAddress: '203.0.113.88',
    status: 'failed',
    location: 'New York, NY'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: 'unknown',
    action: 'Login Attempt',
    ipAddress: '45.142.212.61',
    status: 'blocked',
    location: 'Unknown'
  }
];

export function SecurityCompliance() {
  const notify = useNotify();
  const [controls, setControls] = useState<SecurityControl[]>(initialControls);
  const [accessLogs] = useState<AccessLogEntry[]>(initialLogs);

  const handleToggleControl = (id: string) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    notify.success('Security control updated');
  };

  const handleCheckIp = (ip: string): ThreatCheckResult => {
    if (ipWhitelist.some(range => ip.startsWith(range.split('/')[0]!.slice(0, -1)))) {
      return { status: 'whitelisted', message: 'IP is on the whitelist and will always be allowed.' };
    }
    if (ipBlacklist.mightContain(ip)) {
      return { status: 'blocked', message: 'IP is potentially malicious and will be blocked.' };
    }
    return { status: 'safe', message: 'IP is not on any blacklist.' };
  };

  const handleExportLogs = () => {
    const csv = [
      'Timestamp,User,Action,IP Address,Location,Status',
      ...accessLogs.map(log =>
        `${log.timestamp},${log.user},${log.action},${log.ipAddress},${log.location || 'N/A'},${log.status}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `access-logs-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success('Access logs exported');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance</h1>
          <p className="text-slate-600">Manage authentication, monitoring, and threat detection</p>
        </div>
      </div>

      <SecurityMetrics metrics={initialMetrics} />
      <SecurityControlsPanel controls={controls} onToggle={handleToggleControl} />
      <ThreatDetectionPanel onCheckIp={handleCheckIp} ipWhitelist={ipWhitelist} />
      <AccessLogsTable logs={accessLogs} onExport={handleExportLogs} />
    </div>
  );
};
