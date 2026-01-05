/**
 * @module enterprise/dashboard/SystemHealthIndicator
 * @category Enterprise Dashboard
 * @description System health status indicator with real-time monitoring
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Wifi,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export interface SystemService {
  id: string;
  name: string;
  status: HealthStatus;
  uptime?: number;
  latency?: number;
  lastCheck?: Date;
  message?: string;
}

export interface SystemHealthIndicatorProps {
  services: SystemService[];
  overallStatus: HealthStatus;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
  className?: string;
}

/**
 * SystemHealthIndicator - System health monitoring widget
 * Displays real-time system health status with service breakdowns
 */
export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  services,
  overallStatus,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 30000,
  compact = false,
  className,
}) => {
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = useCallback(async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastUpdate(new Date());
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, onRefresh, refreshInterval, handleRefresh]);

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'offline':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusText = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'All Systems Operational';
      case 'warning':
        return 'Minor Issues Detected';
      case 'critical':
        return 'Critical Issues';
      case 'offline':
        return 'System Offline';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('database') || name.includes('db')) {
      return <Database className="h-4 w-4" />;
    }
    if (name.includes('api') || name.includes('server')) {
      return <Server className="h-4 w-4" />;
    }
    if (name.includes('network') || name.includes('connection')) {
      return <Wifi className="h-4 w-4" />;
    }
    if (name.includes('storage') || name.includes('disk')) {
      return <HardDrive className="h-4 w-4" />;
    }
    if (name.includes('cpu') || name.includes('processor')) {
      return <Cpu className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const formatUptime = (uptime?: number): string => {
    if (!uptime) return 'N/A';
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
          getStatusColor(overallStatus),
          className
        )}
      >
        {getStatusIcon(overallStatus)}
        <span className="text-sm font-medium">{getStatusText(overallStatus)}</span>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-colors"
            aria-label="Refresh status"
          >
            <RefreshCw
              className={cn('h-3 w-3', isRefreshing && 'animate-spin')}
            />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className={cn('p-6 border-b', getStatusColor(overallStatus))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {getStatusIcon(overallStatus)}
            </motion.div>
            <div>
              <h3 className="text-lg font-bold">{getStatusText(overallStatus)}</h3>
              <p className="text-xs mt-0.5 opacity-80">
                Last checked: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors',
                'bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30',
                isRefreshing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="p-6">
        <div className="space-y-3">
          <AnimatePresence>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-4 rounded-lg border',
                  theme.surface.raised,
                  theme.border.default,
                  'hover:border-blue-300 dark:hover:border-blue-700 transition-colors'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn('p-2 rounded-lg', getStatusColor(service.status))}>
                      {getServiceIcon(service.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn('font-medium', theme.text.primary)}>
                          {service.name}
                        </p>
                        {getStatusIcon(service.status)}
                      </div>
                      {service.message && (
                        <p className={cn('text-xs', theme.text.tertiary)}>
                          {service.message}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {service.uptime !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className={cn('text-xs', theme.text.tertiary)}>
                              Uptime:
                            </span>
                            <span className={cn('text-xs font-medium', theme.text.secondary)}>
                              {formatUptime(service.uptime)}
                            </span>
                          </div>
                        )}
                        {service.latency !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className={cn('text-xs', theme.text.tertiary)}>
                              Latency:
                            </span>
                            <span
                              className={cn(
                                'text-xs font-medium',
                                service.latency < 100
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : service.latency < 300
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {service.latency}ms
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'px-2 py-1 rounded text-xs font-bold uppercase tracking-wider',
                      getStatusColor(service.status)
                    )}
                  >
                    {service.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Status Summary */}
        <div className={cn('mt-6 p-4 rounded-lg border', theme.border.default)}>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Healthy',
                count: services.filter((s) => s.status === 'healthy').length,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Warning',
                count: services.filter((s) => s.status === 'warning').length,
                color: 'text-amber-600 dark:text-amber-400',
              },
              {
                label: 'Critical',
                count: services.filter((s) => s.status === 'critical').length,
                color: 'text-rose-600 dark:text-rose-400',
              },
              {
                label: 'Offline',
                count: services.filter((s) => s.status === 'offline').length,
                color: 'text-gray-600 dark:text-gray-400',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.count}</p>
                <p className={cn('text-xs', theme.text.tertiary)}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
