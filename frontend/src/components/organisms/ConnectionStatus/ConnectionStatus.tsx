import { useDataSource } from '@/providers';
import { apiClient } from '@/services/infrastructure/apiClient';
import { BackendHealthMonitor } from '@/shared/ui/organisms/BackendHealthMonitor/BackendHealthMonitor';
import { SystemHealthDisplay } from '@/shared/ui/organisms/SystemHealthDisplay/SystemHealthDisplay';
import { useTheme } from '@/theme';
import { Activity, AlertCircle, Cloud, Database, Info, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const { theme, tokens } = useTheme();
  // HYDRATION-SAFE: Track mounted state for browser-only APIs
  const [isMounted, setIsMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const { currentSource, isBackendApiEnabled: useBackendApi } = useDataSource();

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check backend connection if API mode is enabled
    const checkBackend = async () => {
      if (!useBackendApi) {
        setBackendStatus('disconnected');
        return;
      }

      try {
        await apiClient.healthCheck();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();

    // Check periodically
    const interval = setInterval(checkBackend, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [useBackendApi]);

  useEffect(() => {
    // HYDRATION-SAFE: Only attach browser listeners after mount
    if (!isMounted || typeof window === 'undefined') return;

    // Listen to network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMounted]);

  const getStatusColor = () => {
    if (!useBackendApi) return { color: theme.primary.DEFAULT, backgroundColor: theme.primary.DEFAULT + '20' };
    if (backendStatus === 'connected' && isOnline) return { color: theme.status.success.text, backgroundColor: theme.status.success.bg };
    if (backendStatus === 'checking') return { color: theme.status.warning.text, backgroundColor: theme.status.warning.bg };
    return { color: theme.status.error.text, backgroundColor: theme.status.error.bg };
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

  const statusStyle = getStatusColor();

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.compact.xs,
            padding: `${tokens.spacing.compact.xs} ${tokens.spacing.normal.md}`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            ...statusStyle
          }}
          className={className}
        >
          {getIcon()}
          <span>{getStatusText()}</span>
        </div>

        <button
          onClick={() => setShowCoverage(true)}
          style={{
            padding: tokens.spacing.compact.xs,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: theme.surface.elevated,
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.elevated}
          title="View Service Coverage"
        >
          <Info style={{ width: '1rem', height: '1rem', color: theme.text.secondary }} />
        </button>

        {useBackendApi && (
          <button
            onClick={() => setShowHealthMonitor(true)}
            style={{
              padding: tokens.spacing.compact.xs,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: theme.surface.elevated,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.elevated}
            title="View Backend Health Monitor"
          >
            <Activity style={{ width: '1rem', height: '1rem', color: theme.text.secondary }} />
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
