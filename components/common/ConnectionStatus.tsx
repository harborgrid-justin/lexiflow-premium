import React, { useState, useEffect } from 'react';
import { Database, Cloud, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { isBackendApiEnabled } from '../../services/apiServices';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const useBackendApi = isBackendApiEnabled();

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
    if (!useBackendApi) return 'text-blue-600 bg-blue-50';
    if (backendStatus === 'connected' && isOnline) return 'text-emerald-600 bg-emerald-50';
    if (backendStatus === 'checking') return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getStatusText = () => {
    if (!useBackendApi) return 'IndexedDB (Offline)';
    if (backendStatus === 'checking') return 'Checking...';
    if (backendStatus === 'connected' && isOnline) return 'PostgreSQL (Online)';
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
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}>
      {getIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};
