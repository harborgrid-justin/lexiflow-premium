/**
 * BackendStatusIndicator Component
 * Minimal status indicator showing backend availability
 * Can be placed in header or sidebar
 */

import { Server, Database, HardDrive } from 'lucide-react';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useDataSource } from '@/providers';

interface BackendStatusIndicatorProps {
  showLabel?: boolean;
  variant?: 'compact' | 'full';
  showPulse?: boolean; // Show pulse animation when monitoring
}

export function BackendStatusIndicator({
  showLabel = true,
  variant = 'compact',
  showPulse = true
}) => {
  const { isAvailable, isHealthy, latency, lastChecked } = useBackendHealth();
  const { currentSource } = useDataSource();

  const getStatusColor = () => {
    if (currentSource === 'indexeddb') return 'text-slate-500 bg-slate-100';
    if (!isAvailable) return 'text-rose-500 bg-rose-100';
    if (isHealthy) return 'text-emerald-500 bg-emerald-100';
    return 'text-amber-500 bg-amber-100';
  };

  const getIcon = () => {
    if (currentSource === 'indexeddb') return HardDrive;
    return isAvailable ? Database : Server;
  };

  // DETERMINISTIC RENDERING: Memoize computed values to avoid Date.now() on every render
  const getTooltipText = React.useMemo(() => {
    const baseStatus = currentSource === 'indexeddb'
      ? `Local Mode - Backend ${isAvailable ? 'detected' : 'not detected'}`
      : !isAvailable
        ? 'Backend offline'
        : isHealthy
          ? `Backend online${latency ? ` (${latency}ms)` : ''}`
          : 'Backend degraded';

    const lastCheckedDate = typeof lastChecked === 'string' ? new Date(lastChecked) : lastChecked;
    const timeSinceCheck = Math.floor((Date.now() - lastCheckedDate.getTime()) / 1000);
    return `${baseStatus}\nLast checked: ${timeSinceCheck}s ago`;
  }, [currentSource, isAvailable, isHealthy, latency, lastChecked]);

  const Icon = getIcon();

  // Show pulse on icon when backend is being monitored and available
  const shouldPulse = showPulse && isAvailable;

  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded-md ${getStatusColor()} relative`}
        title={getTooltipText}
      >
        {shouldPulse && (
          <span className="absolute inset-0 rounded-md bg-emerald-400 animate-ping opacity-20"></span>
        )}
        <Icon className={`h-3.5 w-3.5 relative z-10 ${shouldPulse ? 'animate-pulse' : ''}`} />
        {showLabel && (
          <span className="text-xs font-medium relative z-10">
            {currentSource === 'indexeddb'
              ? isAvailable ? 'Local (Backend Ready)' : 'Local Only'
              : isAvailable ? 'Online' : 'Offline'
            }
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${getStatusColor()} relative overflow-hidden`}
      title={getTooltipText}
    >
      {shouldPulse && (
        <span className="absolute inset-0 bg-emerald-400 animate-ping opacity-10"></span>
      )}
      <Icon className={`h-4 w-4 relative z-10 ${shouldPulse ? 'animate-pulse' : ''}`} />
      {showLabel && (
        <div className="flex flex-col relative z-10">
          <span className="text-xs font-medium">
            {currentSource === 'indexeddb'
              ? isAvailable ? 'Local Storage (Backend Detected)' : 'Local Storage Only'
              : 'Backend Server'
            }
          </span>
          <span className="text-[10px] opacity-75">
            {currentSource === 'indexeddb'
              ? isAvailable
                ? `Backend ready • ${latency}ms`
                : 'No backend connection'
              : isAvailable
                ? `${isHealthy ? 'Healthy' : 'Degraded'}${latency ? ` • ${latency}ms` : ''}`
                : 'Disconnected'
            }
          </span>
        </div>
      )}
    </div>
  );
};
