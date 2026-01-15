/**
 * @module components/common/ConnectivityHUD
 * @category Common
 * @description Connectivity status HUD with sync indicators.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Wifi, CloudOff, RefreshCw, AlertTriangle, Activity } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useSync } from '@/hooks/useSync';
import { useTheme } from '@/theme';
import { useInterval } from '@/shared/hooks/useInterval';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================
export const ConnectivityHUD: React.FC = () => {
  const { theme } = useTheme();
  const [latency, setLatency] = useState(24);

  // Safely access sync context - might not be available during initial render
  let isOnline = true;
  let pendingCount = 0;
  let failedCount = 0;
  let syncStatus = 'synced';
  let retryFailed = () => {};

  try {
    const syncContext = useSync();
    isOnline = syncContext.isOnline;
    pendingCount = syncContext.pendingCount;
    failedCount = syncContext.failedCount;
    syncStatus = syncContext.syncStatus;
    retryFailed = syncContext.retryFailed;
  } catch {
    // SyncProvider not yet available - use defaults
    // console.debug('[ConnectivityHUD] SyncProvider not available yet');
  }

  // Simulate network latency fluctuation
  useInterval(() => {
      setLatency(prev => {
          const change = Math.floor(Math.random() * 10) - 5;
          return Math.max(10, Math.min(150, prev + change));
      });
  }, 2000);

  if (failedCount > 0) {
      return (
        <button
            onClick={retryFailed}
            className="relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center group text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 animate-pulse"
            title={`${failedCount} items failed to sync. Click to retry.`}
        >
            <AlertTriangle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                {failedCount}
            </span>
        </button>
      );
  }

  return (
    <div className="flex items-center gap-2">
        <div className={cn("hidden md:flex items-center gap-1 text-[10px] font-mono", latency > 100 ? "text-amber-500" : theme.text.tertiary)}>
             <Activity className="h-3 w-3"/>
             {latency}ms
        </div>
        <button
        className={cn(
            "relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center group",
            !isOnline
            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
            : syncStatus === 'syncing'
                ? cn(theme.colors.info, 'dark:bg-blue-950/50', `hover:${theme.colors.hoverPrimary}`)
                : cn(theme.text.tertiary, `hover:${theme.text.secondary}`, `hover:${theme.surface.highlight}`)
        )}
        title={!isOnline ? "Offline Mode" : syncStatus === 'syncing' ? "Syncing..." : "System Online"}
        >
        {syncStatus === 'syncing' ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
        ) : !isOnline ? (
            <CloudOff className="h-5 w-5" />
        ) : (
            <Wifi className="h-5 w-5" />
        )}

        {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white">
            {pendingCount}
            </span>
        )}
        </button>
    </div>
  );
};
