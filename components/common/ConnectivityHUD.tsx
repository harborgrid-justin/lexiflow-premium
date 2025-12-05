
import React from 'react';
import { useSync } from '../../context/SyncContext';
import { Wifi, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export const ConnectivityHUD: React.FC = () => {
  const { isOnline, pendingCount, failedCount, syncStatus, retryFailed } = useSync();
  const { theme } = useTheme();

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
    <button 
      className={cn(
        "relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center group",
        !isOnline 
          ? "text-amber-600 bg-amber-50 hover:bg-amber-100" 
          : syncStatus === 'syncing' 
            ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
            : cn(theme.text.tertiary, `hover:${theme.text.secondary}`, `hover:${theme.surfaceHighlight}`)
      )}
      title={!isOnline ? "Offline Mode - Changes Queued" : syncStatus === 'syncing' ? "Syncing..." : "System Online"}
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
  );
};
