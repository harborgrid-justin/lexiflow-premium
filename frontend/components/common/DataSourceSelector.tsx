/**
 * DataSourceSelector Component
 * Allows users to switch between IndexedDB (local) and Backend (PostgreSQL) data sources
 * Shows backend availability status and only enables backend option when available
 */

import React, { useState } from 'react';
import { Database, Cloud, HardDrive, Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useDataSource } from '../../context/DataSourceContext';
import { useBackendDiscovery } from '../../hooks/useBackendDiscovery';
import type { DataSourceType } from '../../context/DataSourceContext';

interface DataSourceOption {
  value: DataSourceType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  requiresBackend: boolean;
}

const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    value: 'indexeddb',
    label: 'Local (IndexedDB)',
    description: 'Offline-first with browser storage',
    icon: HardDrive,
    requiresBackend: false,
  },
  {
    value: 'postgresql',
    label: 'Backend (PostgreSQL)',
    description: 'Server-backed with real-time sync',
    icon: Database,
    requiresBackend: true,
  },
  {
    value: 'cloud',
    label: 'Cloud Sync',
    description: 'Hybrid mode with cloud backup',
    icon: Cloud,
    requiresBackend: true,
  },
];

export const DataSourceSelector: React.FC = () => {
  const { currentSource, switchDataSource } = useDataSource();
  const { status, isAvailable, isHealthy, latency, version, error, refresh } = useBackendDiscovery();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSinceCheck, setTimeSinceCheck] = useState(0);
  
  // Update time since last check every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - status.lastChecked.getTime()) / 1000);
      setTimeSinceCheck(seconds);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status.lastChecked]);

  const handleSourceChange = async (source: DataSourceType) => {
    if (source === currentSource) return;

    const option = DATA_SOURCE_OPTIONS.find(opt => opt.value === source);
    
    // Prevent switching to backend sources if backend is not available
    if (option?.requiresBackend && !isAvailable) {
      alert('Backend is not available. Please ensure the backend server is running.');
      return;
    }

    // Confirm the switch (since it will reload the page)
    const confirmMessage = `Switch to ${option?.label}? This will reload the application and clear cached data.`;
    if (!confirm(confirmMessage)) return;

    await switchDataSource(source);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!isAvailable) return <WifiOff className="h-4 w-4 text-rose-500" />;
    if (isHealthy) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  const getStatusText = () => {
    if (!isAvailable) return 'Offline';
    if (isHealthy) return 'Online';
    return 'Degraded';
  };

  const getStatusColor = () => {
    if (!isAvailable) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (isHealthy) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-4">
      {/* Real-Time Monitoring Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <Wifi className="h-5 w-5 text-blue-600 mt-0.5 animate-pulse" />
        <div className="flex-1 text-sm">
          <p className="font-medium text-blue-900 mb-1">Real-Time Backend Monitoring</p>
          <p className="text-blue-700 text-xs">
            Backend status is monitored continuously every 30 seconds, regardless of your current data source. 
            You can switch to the backend at any time when it's available.
          </p>
        </div>
      </div>

      {/* Backend Status Panel */}
      <div className={`rounded-lg border p-4 ${getStatusColor()} relative overflow-hidden`}>
        {isAvailable && (
          <div className="absolute top-0 right-0 w-2 h-2 m-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Backend Status: {getStatusText()}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            title="Refresh backend status now"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="text-sm space-y-1 pl-6">
          {isAvailable && latency !== undefined && (
            <div>Latency: {latency}ms {latency < 100 ? '⚡' : ''}</div>
          )}
          {version && (
            <div>Version: {version}</div>
          )}
          {error && (
            <div className="text-rose-600">Error: {error}</div>
          )}
          <div className="text-xs opacity-75 flex items-center gap-1">
            <span>Last checked: {timeSinceCheck}s ago</span>
            <span className="text-[10px]">(auto-refresh in {30 - (timeSinceCheck % 30)}s)</span>
          </div>
        </div>
      </div>

      {/* Data Source Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Data Source
        </label>

        {DATA_SOURCE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = currentSource === option.value;
          const isDisabled = option.requiresBackend && !isAvailable;

          return (
            <button
              key={option.value}
              onClick={() => handleSourceChange(option.value)}
              disabled={isDisabled}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Active
                      </span>
                    )}
                    {isDisabled && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
        <p className="font-medium mb-1">💡 Data Source Information:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Local:</strong> All data stored in your browser (works offline)</li>
          <li>• <strong>Backend:</strong> Data stored on server (requires connection)</li>
          <li>• <strong>Cloud:</strong> Hybrid approach with local cache and cloud sync</li>
        </ul>
      </div>
    </div>
  );
};
