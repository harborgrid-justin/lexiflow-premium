// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - SERVICE ORCHESTRATION (APPLICATION)
// ================================================================================

/**
 * Service Provider - Application Layer
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Service Health Monitoring
 *
 * RESPONSIBILITIES:
 * • Service health monitoring (API, database, storage)
 * • Online/offline status detection
 * • Data synchronization tracking
 * • Failed operation queue management
 * • Periodic health checks
 *
 * REACT 18 PATTERNS:
 * ✓ Split state/actions contexts
 * ✓ Memoized values and callbacks
 * ✓ Cleanup functions for intervals
 * ✓ StrictMode compatible
 * ✓ SSR-safe (navigator.onLine check)
 *
 * CROSS-CUTTING CAPABILITY:
 * • Can use WebSocketProvider for real-time health updates
 * • Can trigger ToastProvider for health alerts
 * • Exposes service status to all components
 *
 * ENTERPRISE INVARIANTS:
 * • No business logic (no case/document operations)
 * • Infrastructure monitoring only
 * • Observable health state
 * • Automatic reconnection handling
 *
 * @module providers/application/serviceprovider
 */

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { HealthApiService, SyncApiService } from '@/api/admin';
import { adminApi } from '@/lib/frontend-api/admin';
import { ServiceActionsContext, ServiceStateContext } from '@/lib/service/contexts';
import { getServiceHealth } from '@/services/bootstrap';

import type { ServiceActionsValue, ServiceHealth, ServiceProviderProps, ServiceStateValue } from '@/lib/service/types';

const healthApi = new HealthApiService();
const syncApi = new SyncApiService();

export function ServiceProvider({ children, healthCheckInterval = 60000 }: ServiceProviderProps) {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState(0);

  const checkHealth = useCallback(async (serviceName?: string): Promise<ServiceHealth[]> => {
    try {
      const now = new Date().toISOString();
      const healthChecks: ServiceHealth[] = [];

      // If specific service requested, check that one
      if (serviceName) {
        const startTime = performance.now();

        switch (serviceName) {
          case 'database': {
            const dbHealth = await healthApi.checkDatabase();
            healthChecks.push({
              name: 'database',
              status: dbHealth.status === 'pass' ? 'healthy' : 'degraded',
              lastCheck: now,
              responseTime: dbHealth.responseTime,
            });
            break;
          }
          case 'redis': {
            const redisHealth = await healthApi.checkRedis();
            healthChecks.push({
              name: 'redis',
              status: redisHealth.status === 'pass' ? 'healthy' : 'degraded',
              lastCheck: now,
              responseTime: redisHealth.responseTime,
            });
            break;
          }
          case 'api': {
            const systemHealthResult = await adminApi.getSystemHealth();
            if (systemHealthResult.ok) {
              healthChecks.push({
                name: 'api',
                status: systemHealthResult.data.status === 'healthy' ? 'healthy' : 'degraded',
                lastCheck: now,
                responseTime: Math.round(performance.now() - startTime),
              });
            }
            break;
          }
          default: {
            // Check frontend services via bootstrap
            const frontendHealth = getServiceHealth();
            const service = frontendHealth.find(s => s.name === serviceName);
            if (service) {
              healthChecks.push({
                name: service.name,
                status: service.healthy ? 'healthy' : 'degraded',
                lastCheck: now,
                responseTime: 0,
              });
            }
          }
        }

        setServices(prev => {
          const updated = [...prev];
          healthChecks.forEach(service => {
            const idx = updated.findIndex(s => s.name === service.name);
            if (idx >= 0) {
              updated[idx] = service;
            } else {
              updated.push(service);
            }
          });
          return updated;
        });
        return healthChecks;
      }

      // Check all services
      const startTime = performance.now();

      // 1. System health (includes database, cache, external services)
      const systemHealthResult = await adminApi.getSystemHealth();
      if (systemHealthResult.ok) {
        const health = systemHealthResult.data;
        healthChecks.push({
          name: 'api',
          status: health.status === 'healthy' ? 'healthy' : 'degraded',
          lastCheck: now,
          responseTime: Math.round(performance.now() - startTime),
        });
        healthChecks.push({
          name: 'database',
          status: health.database === 'connected' ? 'healthy' : 'down',
          lastCheck: now,
          responseTime: 0,
        });
        healthChecks.push({
          name: 'cache',
          status: health.cache === 'connected' ? 'healthy' : 'down',
          lastCheck: now,
          responseTime: 0,
        });
      }

      // 2. Frontend services health
      const frontendHealth = getServiceHealth();
      frontendHealth.forEach(service => {
        healthChecks.push({
          name: service.name,
          status: service.healthy ? 'healthy' : 'degraded',
          lastCheck: now,
          responseTime: 0,
        });
      });

      setServices(healthChecks);
      return healthChecks;
    } catch (err) {
      console.error('[ServiceProvider] Health check failed:', err);
      return [];
    }
  }, []);

  const syncData = useCallback(async () => {
    try {
      // Get sync status from backend
      const status = await syncApi.getStatus();

      setLastSync(status.lastSyncTime);
      setPendingOperations(status.pending + status.failed);

      console.log('[ServiceProvider] Data sync status updated', {
        pending: status.pending,
        failed: status.failed,
        conflicts: status.conflicts,
        healthy: status.isHealthy,
      });
    } catch (err) {
      console.error('[ServiceProvider] Sync status check failed:', err);
      throw err;
    }
  }, []);

  const retryFailedOperations = useCallback(async () => {
    try {
      // Get failed operations from sync queue
      const queueResult = await syncApi.getQueue({ status: 'failed', limit: 100 });
      const failedIds = queueResult.data.map(item => item.id);

      if (failedIds.length === 0) {
        console.log('[ServiceProvider] No failed operations to retry');
        setPendingOperations(0);
        return;
      }

      // Retry all failed operations
      const result = await syncApi.retryFailed(failedIds);

      console.log(`[ServiceProvider] Retried ${result.updated} failed operations`);

      // Update pending count
      const status = await syncApi.getStatus();
      setPendingOperations(status.pending + status.failed);
    } catch (err) {
      console.error('[ServiceProvider] Retry failed:', err);
      throw err;
    }
  }, []);

  const clearQueue = useCallback(async () => {
    try {
      // Clear completed sync items from backend queue
      const result = await syncApi.clearCompleted();
      console.log(`[ServiceProvider] Cleared ${result.deleted} completed operations`);

      // Update pending count
      const status = await syncApi.getStatus();
      setPendingOperations(status.pending + status.failed);
    } catch (err) {
      console.error('[ServiceProvider] Clear queue failed:', err);
      setPendingOperations(0);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[ServiceProvider] Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[ServiceProvider] Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health checks with proper cleanup
  useEffect(() => {
    const abortController = new AbortController();

    // Initial health check
    checkHealth();

    // Periodic checks
    const interval = setInterval(() => {
      if (!abortController.signal.aborted) {
        checkHealth();
      }
    }, healthCheckInterval);

    // Cleanup function (StrictMode compatible)
    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [checkHealth, healthCheckInterval]);

  const stateValue = useMemo<ServiceStateValue>(() => ({
    services,
    isOnline,
    lastSync,
    pendingOperations,
  }), [services, isOnline, lastSync, pendingOperations]);

  const actionsValue = useMemo<ServiceActionsValue>(() => ({
    checkHealth,
    syncData,
    retryFailedOperations,
    clearQueue,
  }), [checkHealth, syncData, retryFailedOperations, clearQueue]);

  return (
    <ServiceStateContext.Provider value={stateValue}>
      <ServiceActionsContext.Provider value={actionsValue}>
        {children}
      </ServiceActionsContext.Provider>
    </ServiceStateContext.Provider>
  );
}

export function useServiceState(): ServiceStateValue {
  const context = useContext(ServiceStateContext);
  if (!context) {
    throw new Error('useServiceState must be used within ServiceProvider');
  }
  return context;
}

export function useServiceActions(): ServiceActionsValue {
  const context = useContext(ServiceActionsContext);
  if (!context) {
    throw new Error('useServiceActions must be used within ServiceProvider');
  }
  return context;
}

export function useService() {
  return {
    state: useServiceState(),
    actions: useServiceActions(),
  };
}
