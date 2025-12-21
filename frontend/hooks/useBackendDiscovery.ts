/**
 * useBackendDiscovery Hook
 * 
 * @deprecated Use useBackendHealth instead to avoid naming confusion with legal discovery domain.
 * This hook will be removed in v2.0. The functionality is identical.
 * 
 * @example Migration:
 * ```typescript
 * // Before:
 * import { useBackendDiscovery } from '@/hooks/useBackendDiscovery';
 * 
 * // After:
 * import { useBackendHealth } from '@/hooks/useBackendHealth';
 * ```
 */

import { useState, useEffect } from 'react';
import { backendDiscovery, type BackendStatus } from '../services/integration/backendDiscovery';

/**
 * @deprecated Use useBackendHealth instead
 */
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
