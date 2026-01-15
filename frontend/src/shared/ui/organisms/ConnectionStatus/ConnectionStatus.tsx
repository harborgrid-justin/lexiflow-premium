import { TIMEOUTS } from '@/config/ports.config';
import { useDataSource } from '@/providers';
import { apiClient } from '@/services/infrastructure/apiClient';
import { Activity, AlertCircle, Cloud, Database, Info, WifiOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BackendHealthMonitor } from '../BackendHealthMonitor/BackendHealthMonitor';
import { SystemHealthDisplay } from '../SystemHealthDisplay/SystemHealthDisplay';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { currentSource, isBackendApiEnabled: useBackendApi } = useDataSource();
  const { theme } = useTheme();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    // Exponential backoff: 5s, 10s, 20s, 40s, then 60s max
    const getBackoffDelay = (count: number) => {
      const baseDelay = TIMEOUTS.HEALTH_CHECK;
      const maxDelay = 60000;
      return Math.min(baseDelay * Math.pow(2, count), maxDelay);
    };

    // Check backend connection if API mode is enabled
    const checkBackend = async () => {
      if (!isActive || !useBackendApi) {
        setBackendStatus('disconnected');
        return;
      }

      try {
        await apiClient.healthCheck();
        if (isActive) {
          setBackendStatus('connected');
          setRetryCount(0); // Reset on success
          // Check again in 30 seconds when connected
          timeoutId = setTimeout(checkBackend, 30000);
        }
      } catch {
        if (isActive) {
          setBackendStatus('disconnected');
          const newRetryCount = retryCount + 1;
          setRetryCount(newRetryCount);
          // Use exponential backoff when disconnected
          const delay = getBackoffDelay(newRetryCount);
          console.debug(`[ConnectionStatus] Backend offline, retrying in ${delay / 1000}s...`);
          timeoutId = setTimeout(checkBackend, delay);
        }
      }
    };

    checkBackend();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [useBackendApi, retryCount]);

  useEffect(() => {
    // Listen to network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (!useBackendApi) return cn(theme.colors.info, 'dark:bg-blue-950/50');
    if (backendStatus === 'connected' && isOnline) return 'text-emerald-600 bg-emerald-50';
    if (backendStatus === 'checking') return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getStatusText = () => {
    if (currentSource === 'indexeddb') return 'IndexedDB (Offline)';
    if (backendStatus === 'checking') return 'Checking...';
    // Updated: 35+ core services now integrated with backend
    if (currentSource === 'postgresql' && backendStatus === 'connected' && isOnline) return 'PostgreSQL (35+ Services)';
    if (currentSource === 'cloud' && backendStatus === 'connected' && isOnline) return 'Cloud DB (Not Implemented)';
    if (!isOnline) return 'No Internet';
    return 'Backend Offline';
  };

  const getIcon = () => {
    if (!useBackendApi) return <Database className="w-4 h-4" />;
    if (backendStatus === 'checking') return <AlertCircle className="w-4 h-4 animate-pulse" />;
    if (backendStatus === 'connected' && isOnline) return <Cloud className="w-4 h-4" />;
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}>
          {getIcon()}
          <span>{getStatusText()}</span>
        </div>

        <button
          onClick={() => setShowCoverage(true)}
          style={{ backgroundColor: 'var(--color-surfaceHover)' }}
          className={cn("p-1.5 rounded-full transition-colors", `hover:${theme.surface.hover}`)}
          title="View Service Coverage"
        >
          <Info className={cn("w-4 h-4", theme.text.secondary)} />
        </button>

        {useBackendApi && (
          <button
            onClick={() => setShowHealthMonitor(true)}
            style={{ backgroundColor: 'transparent' }}
            className={cn("p-1.5 rounded-full transition-colors", `hover:${theme.surface.hover}`)}
            title="View Backend Health Monitor"
          >
            <Activity className={cn("w-4 h-4", theme.text.secondary)} />
          </button>
        )}
      </div>

      <SystemHealthDisplay
        isOpen={showCoverage}
        onClose={() => setShowCoverage(false)}
      />

      <BackendHealthMonitor
        isOpen={showHealthMonitor}
        onClose={() => setShowHealthMonitor(false)}
      />
    </>
  );
};
