/**
 * useBackendHealth Hook
 * 
 * Provides reactive access to backend service health and availability status.
 * Renamed from useBackendDiscovery to avoid confusion with legal discovery domain.
 * 
 * @module hooks/useBackendHealth
 * @category Hooks - Infrastructure
 * @description Monitors backend service health, availability, latency, and version.
 * Uses the backendDiscovery service for health checks and provides reactive updates
 * through subscription pattern.
 * 
 * @example
 * ```typescript
 * const { isAvailable, isHealthy, latency, version, refresh } = useBackendHealth();
 * 
 * if (!isAvailable) {
 *   return <OfflineMode />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { backendDiscovery, type BackendStatus } from '../services/backendDiscovery';

export function useBackendHealth() {
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
