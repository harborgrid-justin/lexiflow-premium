/**
 * useBackendDiscovery Hook
 * Provides reactive access to backend availability status
 */

import { useState, useEffect } from 'react';
import { backendDiscovery, type BackendStatus } from '../services/backendDiscovery';

export function useBackendDiscovery() {
  const [status, setStatus] = useState<BackendStatus>(() => backendDiscovery.getStatus());

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = backendDiscovery.subscribe(setStatus);

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = async () => {
    return await backendDiscovery.refresh();
  };

  return {
    status,
    isAvailable: status.available,
    isHealthy: status.healthy,
    lastChecked: status.lastChecked,
    latency: status.latency,
    version: status.version,
    error: status.error,
    refresh,
  };
}
