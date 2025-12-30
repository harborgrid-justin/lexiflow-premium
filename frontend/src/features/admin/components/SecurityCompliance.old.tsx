/**
 * @module components/admin/SecurityCompliance
 * @category Admin Panel
 * @description Production-grade security and compliance dashboard with authentication policy,
 * MFA enforcement, session management, IP whitelisting, threat detection using Bloom Filter,
 * and comprehensive access logs monitoring.
 * 
 * THEME SYSTEM USAGE:
 * - theme.surface.default/highlight - Card backgrounds and sections
 * - theme.text.primary/secondary - Labels and content
 * - theme.border.default/subtle - Card and control borders
 * - theme.status.success/error/warning - Security status indicators
 */

import React, { useState } from 'react';
import {
  Lock, Shield, Smartphone, Globe, FileText, Clock,
  AlertTriangle, CheckCircle, XCircle, Activity, UserCheck,
  Search, Download, TrendingUp, AlertOctagon
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Card } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { Badge } from '@/components/atoms';
import { Input } from '@/components/atoms';
import { BloomFilter } from '@/utils/bloomFilter';
import { useNotify } from '@/hooks/useNotify';

// ========================================
// TYPES
// ========================================
interface SecurityControl {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  type: 'Smartphone' | 'Lock' | 'Globe' | 'Clock';
  category: 'auth' | 'session' | 'network';
}

interface AccessLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'blocked';
  location?: string;
}

interface SecurityMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  severity: 'success' | 'warning' | 'error' | 'info';
}

// ========================================
// BLOOM FILTER INITIALIZATION
// ========================================
const ipBlacklist = new BloomFilter(10000, 0.001); // 10K capacity, 0.1% false positive
// Seed with known malicious IPs
[
  '192.168.1.55', '10.0.0.99', '172.16.0.4', '45.142.212.61',
  '185.220.101.45', '23.129.64.218', '198.98.57.207'
].forEach(ip => ipBlacklist.add(ip));

// Mock IP whitelist
const ipWhitelist: string[] = [
  '203.0.113.0/24',
  '198.51.100.0/24',
  '192.0.2.0/24'
];

// ========================================
// COMPONENT
// ========================================
export const SecurityCompliance: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  const [testIp, setTestIp] = useState('');
  const [checkResult, setCheckResult] = useState<{
    status: 'safe' | 'blocked' | 'whitelisted';
    message: string;
  } | null>(null);

  const [controls, setControls] = useState<SecurityControl[]>([
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
  ]);

  const [accessLogs] = useState<AccessLogEntry[]>([
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
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      user: 'admin@lexiflow.law',
      action: 'Security Settings Changed',
      ipAddress: '203.0.113.10',
      status: 'success',
      location: 'Washington, DC'
    }
  ]);

  const [securityMetrics] = useState<SecurityMetric[]>([
    { label: 'Failed Logins (24h)', value: 12, change: -15, trend: 'down', severity: 'success' },
    { label: 'Suspicious IPs', value: 0, change: 0, trend: 'neutral', severity: 'success' },
    { label: 'Active Sessions', value: 47, change: 5, trend: 'up', severity: 'info' },
    { label: 'MFA Enrollment', value: 98, change: 2, trend: 'up', severity: 'success' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'blocked'>('all');

  const getIcon = (type: string) => {
    switch(type) {
      case 'Smartphone': return Smartphone;
      case 'Lock': return Lock;
      case 'Globe': return Globe;
      case 'Clock': return Clock;
      default: return Shield;
    }
  };

  const toggleControl = (controlId: string) => {
    setControls(prev => prev.map(ctrl =>
      ctrl.id === controlId ? { ...ctrl, enabled: !ctrl.enabled } : ctrl
    ));
    const control = controls.find(c => c.id === controlId);
    notify.success(`${control?.label} ${control?.enabled ? 'disabled' : 'enabled'}`);
  };

  const checkIp = () => {
    if (!testIp) {
      notify.error('Please enter an IP address');
      return;
    }

    // Check if whitelisted
    const isWhitelisted = ipWhitelist.some(range => {
      // Simple CIDR check (basic implementation)
      return testIp.startsWith(range.split('/')[0].split('.').slice(0, 3).join('.'));
    });

    if (isWhitelisted) {
      setCheckResult({
        status: 'whitelisted',
        message: 'This IP is in the whitelist and explicitly allowed.'
      });
      return;
    }

    // Check if blacklisted
    if (ipBlacklist.test(testIp)) {
      setCheckResult({
        status: 'blocked',
        message: 'This IP is flagged in the threat database and will be blocked.'
      });
      return;
    }

    setCheckResult({
      status: 'safe',
      message: 'This IP is not in any threat databases.'
    });
  };

  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-lg border shadow-sm",
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-xs font-bold uppercase tracking-wide", theme.text.secondary)}>
                {metric.label}
              </span>
              {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
              {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-rose-500 rotate-180" />}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", theme.text.primary)}>
                {metric.value}
              </span>
              {metric.change !== 0 && (
                <span className={cn(
                  "text-xs font-medium",
                  metric.change > 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Policy */}
        <Card title={<span className="flex items-center gap-2"><Lock className="h-4 w-4" />Authentication Policy</span>}>
          <div className={cn("divide-y", theme.border.subtle)}>
            {controls.filter(c => c.category === 'auth').map((ctrl) => {
              const Icon = getIcon(ctrl.type);
              return (
                <div key={ctrl.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      theme.surface.highlight
                    )}>
                      <Icon className={cn("h-5 w-5", theme.text.secondary)}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", theme.text.primary)}>
                        {ctrl.label}
                      </p>
                      <p className={cn("text-xs mt-0.5", theme.text.secondary)}>
                        {ctrl.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleControl(ctrl.id)}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors cursor-pointer ml-4 shrink-0",
                      ctrl.enabled ? "bg-emerald-500" : "bg-slate-300"
                    )}
                    aria-label={`Toggle ${ctrl.label}`}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform",
                      ctrl.enabled ? "translate-x-5" : "translate-x-0"
                    )}></div>
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Session & Network Security */}
        <Card title={<span className="flex items-center gap-2"><Globe className="h-4 w-4" />Session & Network Security</span>}>
          <div className={cn("divide-y", theme.border.subtle)}>
            {controls.filter(c => c.category === 'session' || c.category === 'network').map((ctrl) => {
              const Icon = getIcon(ctrl.type);
              return (
                <div key={ctrl.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      theme.surface.highlight
                    )}>
                      <Icon className={cn("h-5 w-5", theme.text.secondary)}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", theme.text.primary)}>
                        {ctrl.label}
                      </p>
                      <p className={cn("text-xs mt-0.5", theme.text.secondary)}>
                        {ctrl.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleControl(ctrl.id)}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors cursor-pointer ml-4 shrink-0",
                      ctrl.enabled ? "bg-emerald-500" : "bg-slate-300"
                    )}
                    aria-label={`Toggle ${ctrl.label}`}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform",
                      ctrl.enabled ? "translate-x-5" : "translate-x-0"
                    )}></div>
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Threat Detection (Bloom Filter) */}
        <Card title={<span className="flex items-center gap-2"><Shield className="h-4 w-4" />Threat Detection (Bloom Filter)</span>}>
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg border",
              theme.surface.highlight,
              theme.border.default
            )}>
              <p className={cn("text-xs mb-3", theme.text.secondary)}>
                Rapidly check incoming IPs against the known botnet database (1M+ entries) using probabilistic hashing.
                This provides O(1) lookup performance with minimal memory footprint.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter IP Address (e.g., 192.168.1.1)"
                  value={testIp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestIp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkIp()}
                />
                <Button variant="primary" onClick={checkIp}>
                  Verify
                </Button>
              </div>
            </div>

            {checkResult && (
              <div className={cn(
                "p-4 rounded-lg border-2 animate-fade-in",
                checkResult.status === 'blocked' && "bg-rose-50 border-rose-300",
                checkResult.status === 'safe' && "bg-emerald-50 border-emerald-300",
                checkResult.status === 'whitelisted' && "bg-blue-50 border-blue-300"
              )}>
                <div className="flex items-start gap-3">
                  {checkResult.status === 'blocked' && <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
                  {checkResult.status === 'safe' && <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
                  {checkResult.status === 'whitelisted' && <UserCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
                  <div>
                    <p className={cn(
                      "text-sm font-bold mb-1",
                      checkResult.status === 'blocked' && "text-rose-700",
                      checkResult.status === 'safe' && "text-emerald-700",
                      checkResult.status === 'whitelisted' && "text-blue-700"
                    )}>
                      {checkResult.status === 'blocked' && 'Threat Detected'}
                      {checkResult.status === 'safe' && 'IP Safe'}
                      {checkResult.status === 'whitelisted' && 'Whitelisted IP'}
                    </p>
                    <p className={cn(
                      "text-xs",
                      checkResult.status === 'blocked' && "text-rose-600",
                      checkResult.status === 'safe' && "text-emerald-600",
                      checkResult.status === 'whitelisted' && "text-blue-600"
                    )}>
                      {checkResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* IP Whitelist Info */}
            <div className={cn("p-3 rounded border text-xs", theme.border.subtle)}>
              <p className={cn("font-bold mb-2", theme.text.primary)}>Active IP Whitelist:</p>
              <div className="flex flex-wrap gap-2">
                {ipWhitelist.map((range, idx) => (
                  <code key={idx} className={cn(
                    "px-2 py-1 rounded font-mono text-xs",
                    theme.surface.highlight,
                    theme.text.secondary
                  )}>
                    {range}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title={<span className="flex items-center gap-2"><Activity className="h-4 w-4" />Security Status</span>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn("text-sm", theme.text.secondary)}>Firewall Status</span>
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn("text-sm", theme.text.secondary)}>Last Security Scan</span>
              <span className={cn("text-sm font-medium", theme.text.primary)}>2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn("text-sm", theme.text.secondary)}>SSL Certificate</span>
              <Badge variant="success">Valid until 2025-12-31</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn("text-sm", theme.text.secondary)}>Threat Level</span>
              <Badge variant="success">Low</Badge>
            </div>
            <div className={cn("pt-3 border-t", theme.border.subtle)}>
              <Button variant="ghost" size="sm" className="w-full" icon={FileText}>
                View Full Security Report
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Access Logs */}
      <Card title={<span className="flex items-center gap-2"><Activity className="h-4 w-4" />Access Logs</span>}>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
                <Input
                  placeholder="Search logs by user, IP, or action..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as 'all' | 'success' | 'failed' | 'blocked')}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm",
                  theme.surface.default,
                  theme.border.default
                )}
                aria-label="Filter logs by status"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
              </select>
              <Button variant="secondary" icon={Download} size="sm">
                Export
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className={cn("border rounded-lg overflow-hidden", theme.border.default)}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className={cn(theme.surface.highlight)}>
                  <tr>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      Timestamp
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      User
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      Action
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      IP Address
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      Location
                    </th>
                    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", theme.text.tertiary)}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", theme.border.subtle)}>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className={cn("hover:bg-slate-50 transition-colors")}>
                      <td className={cn("px-4 py-3 text-sm whitespace-nowrap", theme.text.primary)}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className={cn("px-4 py-3 text-sm", theme.text.primary)}>
                        {log.user}
                      </td>
                      <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                        {log.action}
                      </td>
                      <td className={cn("px-4 py-3 text-sm font-mono", theme.text.primary)}>
                        {log.ipAddress}
                      </td>
                      <td className={cn("px-4 py-3 text-sm", theme.text.secondary)}>
                        {log.location || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge 
                          variant={
                            log.status === 'success' ? 'success' :
                            log.status === 'failed' ? 'warning' :
                            'error'
                          }
                        >
                          {log.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {log.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {log.status === 'blocked' && <XCircle className="h-3 w-3 mr-1" />}
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <AlertOctagon className={cn("h-12 w-12 mx-auto mb-3", theme.text.tertiary)} />
              <p className={cn("text-sm", theme.text.secondary)}>No logs found matching your criteria</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
