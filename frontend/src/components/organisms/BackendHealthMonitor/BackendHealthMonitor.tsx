import React, { useState, useEffect, useId } from 'react';
import { 
  Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, X, 
  TrendingUp, Clock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { apiClient, type SystemHealth, type ServiceHealthStatus } from '@/services/infrastructure/apiClient';

interface BackendHealthMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendHealthMonitor: React.FC<BackendHealthMonitorProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const healthData = await apiClient.checkSystemHealth();
      setHealth(healthData);
      setLastUpdate(new Date());
    } catch () {
      console.error('Failed to check system health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  const getStatusIcon = (status: ServiceHealthStatus) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceHealthStatus) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300';
      case 'degraded':
        return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300';
      case 'offline':
        return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
    }
  };

  const getOverallStatusColor = (status: ServiceHealthStatus) => {
    switch (status) {
      case 'online':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'degraded':
        return 'text-amber-600 dark:text-amber-400';
      case 'offline':
        return 'text-rose-600 dark:text-rose-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn(
            "w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
            theme.surface.default
          )}
        >
          {/* Header */}
          <div className={cn("px-6 py-4 border-b flex items-center justify-between", theme.border.default)}>
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <div>
                <h2 id={titleId} className={cn("text-xl font-bold", theme.text.primary)}>Backend Health Monitor</h2>
                <p id={descriptionId} className={cn("text-xs mt-0.5", theme.text.secondary)}>
                  Real-time service status and performance metrics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors",
                theme.text.secondary
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Overall Status */}
          {health && (
            <div className={cn("px-6 py-4 border-b", theme.border.default)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("text-sm font-medium", theme.text.secondary)}>Overall Status:</div>
                  <div className={cn("text-2xl font-bold flex items-center gap-2", getOverallStatusColor(health.overall))}>
                    {getStatusIcon(health.overall)}
                    {health.overall.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {lastUpdate && (
                    <div className={cn("text-xs flex items-center gap-1", theme.text.secondary)}>
                      <Clock className="h-3 w-3" />
                      {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                  <button
                    onClick={checkHealth}
                    disabled={isLoading}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 transition-colors",
                      theme.border.default,
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && !health ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : health ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(health.services).map(([serviceName, serviceHealth]) => (
                  <motion.div
                    key={serviceName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      getStatusColor(serviceHealth.status)
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(serviceHealth.status)}
                        <h3 className="font-bold text-sm">{serviceName}</h3>
                      </div>
                      <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", getStatusColor(serviceHealth.status))}>
                        {serviceHealth.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {serviceHealth.latency !== undefined && (
                        <div>
                          <div className={cn("flex items-center gap-1 mb-1", theme.text.tertiary)}>
                            <Zap className="h-3 w-3" />
                            <span className="font-semibold">Latency</span>
                          </div>
                          <div className={cn("font-mono font-bold", theme.text.primary)}>
                            {serviceHealth.latency}ms
                          </div>
                        </div>
                      )}
                      <div>
                        <div className={cn("flex items-center gap-1 mb-1", theme.text.tertiary)}>
                          <Clock className="h-3 w-3" />
                          <span className="font-semibold">Last Check</span>
                        </div>
                        <div className={cn("font-mono text-xs", theme.text.primary)}>
                          {new Date(serviceHealth.lastChecked).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {serviceHealth.error && (
                      <div className="mt-3 p-2 rounded bg-white/50 dark:bg-black/20 text-xs font-mono">
                        {serviceHealth.error}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={cn("text-center py-12", theme.text.secondary)}>
                Click "Refresh" to check backend service health
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn("px-6 py-4 border-t", theme.border.default)}>
            <div className={cn("flex items-center gap-2 text-xs", theme.text.tertiary)}>
              <TrendingUp className="h-4 w-4" />
              <span>Health checks run against backend API endpoints to monitor service availability and performance.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

