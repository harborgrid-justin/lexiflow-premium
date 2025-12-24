export interface SecurityControl {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  type: 'Smartphone' | 'Lock' | 'Globe' | 'Clock';
  category: 'auth' | 'session' | 'network';
}

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'blocked';
  location?: string;
}

export interface SecurityMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  severity: 'success' | 'warning' | 'error' | 'info';
}

export interface ThreatCheckResult {
  status: 'safe' | 'blocked' | 'whitelisted';
  message: string;
}
