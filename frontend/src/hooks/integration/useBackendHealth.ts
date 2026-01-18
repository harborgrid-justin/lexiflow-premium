/**
 * @module hooks/integration/useBackendHealth
 * @category Hooks - Backend Integration
 * 
 * Backend health monitoring hooks.
 * Provides real-time health status of backend services and domains.
 * 
 * FEATURES:
 * - Overall backend health check
 * - Domain-specific health monitoring
 * - Automatic polling with configurable interval
 * - Health status change notifications
 * 
 * @example
 * ```typescript
 * // Monitor overall backend health
 * const { isHealthy, status, lastCheck } = useBackendHealth({
 *   pollInterval: 30000 // Check every 30s
 * });
 * 
 * // Monitor specific domain
 * const casesHealth = useDomainHealth('cases');
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

import { apiClient, type SystemHealth, type ServiceHealth } from '@/services/infrastructure/api-client.service';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Health status enum
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Backend health result
 */
export interface BackendHealthResult {
  /** Is backend healthy */
  isHealthy: boolean;
  /** Current health status */
  status: HealthStatus;
  /** Last check timestamp */
  lastCheck: Date | null;
  /** Detailed health data */
  details: SystemHealth | null;
  /** Check health manually */
  checkHealth: () => Promise<void>;
  /** Is currently checking */
  isChecking: boolean;
  /** Error if check failed */
  error: Error | null;
}

/**
 * Domain health result
 */
export interface DomainHealthResult {
  /** Is domain healthy */
  isHealthy: boolean;
  /** Current health status */
  status: HealthStatus;
  /** Service health details */
  details: ServiceHealth | null;
  /** Last check timestamp */
  lastCheck: Date | null;
}

/**
 * Options for useBackendHealth
 */
export interface UseBackendHealthOptions {
  /** Auto-poll interval in ms (0 = disabled) */
  pollInterval?: number;
  /** Callback on health change */
  onHealthChange?: (isHealthy: boolean) => void;
  /** Enable notifications for health changes */
  enableNotifications?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Monitor overall backend health.
 * 
 * @param options - Configuration options
 * @returns Backend health state and controls
 */
export function useBackendHealth({
  pollInterval = 0,
  onHealthChange,
  enableNotifications = false
}: UseBackendHealthOptions = {}): BackendHealthResult {
  const [isHealthy, setIsHealthy] = useState(true);
  const [status, setStatus] = useState<HealthStatus>('unknown');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [details, setDetails] = useState<SystemHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const health = await apiClient.healthCheck();
      const wasHealthy = isHealthy;
      const nowHealthy = health.status === 'ok';

      setIsHealthy(nowHealthy);
      setStatus(determineStatus(health));
      setDetails(health);
      setLastCheck(new Date());

      // Notify on health change
      if (wasHealthy !== nowHealthy) {
        onHealthChange?.(nowHealthy);

        if (enableNotifications) {
          if (nowHealthy) {
            console.log('[Health] Backend is now healthy');
          } else {
            console.warn('[Health] Backend is unhealthy:', health);
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setIsHealthy(false);
      setStatus('unhealthy');
      setError(error);
      setLastCheck(new Date());

      onHealthChange?.(false);

      if (enableNotifications) {
        console.error('[Health] Health check failed:', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isHealthy, onHealthChange, enableNotifications]);

  // Auto-poll
  useEffect(() => {
    if (pollInterval > 0) {
      // Initial check
      checkHealth();

      // Setup polling
      const interval = setInterval(checkHealth, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, checkHealth]);

  return {
    isHealthy,
    status,
    lastCheck,
    details,
    checkHealth,
    isChecking,
    error
  };
}

/**
 * Monitor specific domain health.
 * 
 * @param domain - Domain name to monitor
 * @returns Domain health state
 */
export function useDomainHealth(domain: string): DomainHealthResult {
  const { details, lastCheck } = useBackendHealth({ pollInterval: 30000 });
  
  const serviceHealth = details?.services?.[domain] || null;
  const isHealthy = serviceHealth?.status === 'up';
  const status = serviceHealth ? determineServiceStatus(serviceHealth) : 'unknown';

  return {
    isHealthy,
    status,
    details: serviceHealth,
    lastCheck
  };
}

/**
 * Monitor multiple domains.
 * 
 * @param domains - Array of domain names
 * @returns Map of domain health results
 */
export function useMultiDomainHealth(
  domains: string[]
): Record<string, DomainHealthResult> {
  const { details, lastCheck } = useBackendHealth({ pollInterval: 30000 });

  return domains.reduce((acc, domain) => {
    const serviceHealth = details?.services?.[domain] || null;
    const isHealthy = serviceHealth?.status === 'up';
    const status = serviceHealth ? determineServiceStatus(serviceHealth) : 'unknown';

    acc[domain] = {
      isHealthy,
      status,
      details: serviceHealth,
      lastCheck
    };
    return acc;
  }, {} as Record<string, DomainHealthResult>);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Determine overall health status from SystemHealth
 */
function determineStatus(health: SystemHealth): HealthStatus {
  if (health.status === 'ok') {
    return 'healthy';
  }

  // Check if all services are down
  const services = Object.values(health.services || {});
  const allDown = services.every(s => s.status === 'down');
  
  if (allDown) {
    return 'unhealthy';
  }

  return 'degraded';
}

/**
 * Determine service health status
 */
function determineServiceStatus(service: ServiceHealth): HealthStatus {
  if (service.status === 'up') {
    return 'healthy';
  }
  return 'unhealthy';
}
