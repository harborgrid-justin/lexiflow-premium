/**
 * Backend Health Hook
 * Enterprise-grade React hook for backend service health monitoring with real-time updates
 * 
 * @module hooks/useBackendHealth
 * @category Hooks - Infrastructure & Monitoring
 * @description Provides reactive access to backend service health and availability status including:
 * - Real-time health status monitoring
 * - Service availability detection
 * - Latency measurements
 * - Version information tracking
 * - Error state management
 * - Automatic health check scheduling
 * - Subscription-based updates
 * - Manual refresh capability
 * 
 * @security
 * - No sensitive data exposure in health status
 * - Safe error message handling
 * - Validated status object structure
 * - Secure subscription pattern
 * 
 * @architecture
 * - Subscription-based reactive updates
 * - Singleton backendDiscovery service
 * - React hooks for state management
 * - Type-safe operations throughout
 * - Automatic cleanup on unmount
 * - Minimal re-render optimization
 * 
 * @performance
 * - Efficient subscription mechanism
 * - Lazy initialization of service
 * - Memoized status object
 * - Automatic cleanup to prevent memory leaks
 * - Minimal API calls via shared service
 * 
 * @renamed
 * Previously known as useBackendDiscovery
 * Renamed to useBackendHealth to avoid confusion with legal discovery domain
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { isAvailable, isHealthy, latency } = useBackendHealth();
 * 
 * // Check availability for conditional rendering
 * if (!isAvailable) {
 *   return <OfflineMode />;
 * }
 * 
 * // Display latency information
 * if (isHealthy && latency) {
 *   console.log(`Backend latency: ${latency}ms`);
 * }
 * 
 * // Manual refresh of health status
 * const { refresh } = useBackendHealth();
 * await refresh();
 * 
 * // Access full status object
 * const { status } = useBackendHealth();
 * console.log('Backend version:', status.version);
 * console.log('Last checked:', status.lastChecked);
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services
import { 
  backendDiscovery, 
  type BackendStatus 
} from '@/services';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Return type for useBackendHealth hook
 */
export interface UseBackendHealthReturn {
  /** Backend availability status */
  isAvailable: boolean;
  /** Backend health status */
  isHealthy: boolean;
  /** Latency in milliseconds */
  latency: number | null;
  /** Backend version */
  version: string | null;
  /** Timestamp of last health check */
  lastChecked: Date | string;
  /** Full status object */
  status: BackendStatus;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh health status */
  refresh: () => Promise<BackendStatus>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Backend health monitoring hook.
 * Provides reactive access to backend service health and availability.
 * 
 * @returns Backend health monitoring interface
 * @throws Never throws - all errors are handled internally with fallbacks
 * 
 * @example
 * ```typescript
 * const {
 *   status,
 *   isAvailable,
 *   isHealthy,
 *   latency,
 *   version,
 *   error,
 *   refresh
 * } = useBackendHealth();
 * 
 * // Check if backend is available
 * if (isAvailable) {
 *   // Proceed with backend operations
 * } else {
 *   // Fallback to offline mode
 * }
 * 
 * // Manual health check
 * await refresh();
 * ```
 */
export function useBackendHealth(): UseBackendHealthReturn {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Backend status state
   * Initialized with current status from singleton service
   * Updates automatically via subscription
   */
  const [status, setStatus] = useState<BackendStatus>(() => {
    try {
      const initialStatus = backendDiscovery.getStatus();
      console.log('[useBackendHealth] Initialized with status:', {
        available: initialStatus.available,
        healthy: initialStatus.healthy,
        lastChecked: initialStatus.lastChecked
      });
      return initialStatus;
    } catch (error) {
      console.error('[useBackendHealth] Error initializing status:', error);
      // Fallback to default offline status - explicit BackendStatus type
      const fallbackStatus: BackendStatus = {
        available: false,
        healthy: false,
        lastChecked: new Date(),
        latency: undefined,
        version: undefined,
        error: 'Failed to initialize backend health monitoring'
      };
      return fallbackStatus;
    }
  });

  /**
   * Loading state
   * Tracks whether a health check is currently in progress
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ============================================================================
  // SUBSCRIPTION & LIFECYCLE
  // ============================================================================

  /**
   * Subscribe to backend health status changes
   * Automatically updates local state on changes
   * Cleans up subscription on unmount
   */
  useEffect(() => {
    try {
      console.log('[useBackendHealth] Setting up status subscription');

      // Subscribe to status changes
      const unsubscribe = backendDiscovery.subscribe((newStatus: BackendStatus) => {
        try {
          // Validate status object structure
          if (!newStatus || typeof newStatus !== 'object') {
            console.error('[useBackendHealth] Invalid status update:', newStatus);
            return;
          }

          // Log significant status changes
          if (status.available !== newStatus.available) {
            console.log(`[useBackendHealth] Availability changed: ${status.available} → ${newStatus.available}`);
          }
          if (status.healthy !== newStatus.healthy) {
            console.log(`[useBackendHealth] Health changed: ${status.healthy} → ${newStatus.healthy}`);
          }

          // Update local state
          setStatus(newStatus);
        } catch (error) {
          console.error('[useBackendHealth] Error processing status update:', error);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        try {
          console.log('[useBackendHealth] Cleaning up status subscription');
          unsubscribe();
        } catch (error) {
          console.error('[useBackendHealth] Error during cleanup:', error);
        }
      };
    } catch (error) {
      console.error('[useBackendHealth] Error setting up subscription:', error);
      // Return empty cleanup function on subscription failure
      return () => {};
    }
  }, [status.available, status.healthy]); // Empty dependency array - subscribe once on mount

  // ============================================================================
  // MANUAL REFRESH
  // ============================================================================

  /**
   * Manually refresh backend health status
   * Triggers immediate health check
   * 
   * @returns Promise<BackendStatus> Updated status after refresh
   * @throws Logs errors but doesn't throw to prevent UI disruption
   * 
   * @example
   * ```typescript
   * const { refresh } = useBackendHealth();
   * 
   * // Manual refresh
   * try {
   *   const updatedStatus = await refresh();
   *   console.log('Backend status refreshed:', updatedStatus);
   * } catch (error) {
   *   console.error('Failed to refresh:', error);
   * }
   * ```
   */
  const refresh = useCallback(async (): Promise<BackendStatus> => {
    try {
      console.log('[useBackendHealth] Manual refresh triggered');
      setIsLoading(true);
      
      // Trigger health check via service
      const updatedStatus = await backendDiscovery.refresh();
      
      // Validate response
      if (!updatedStatus || typeof updatedStatus !== 'object') {
        throw new Error('Invalid status response from refresh');
      }

      console.log('[useBackendHealth] Manual refresh completed:', {
        available: updatedStatus.available,
        healthy: updatedStatus.healthy,
        latency: updatedStatus.latency
      });

      return updatedStatus;
    } catch (error) {
      console.error('[useBackendHealth.refresh] Error:', error);
      
      // Return current status on error
      return status;
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate status object structure
   * Ensures required fields are present and valid
   * @private
   */
  const validateStatus = useCallback((status: BackendStatus): boolean => {
    try {
      if (!status || typeof status !== 'object') {
        console.error('[useBackendHealth] Invalid status object:', status);
        return false;
      }

      // Check required fields
      if (typeof status.available !== 'boolean' || typeof status.healthy !== 'boolean') {
        console.error('[useBackendHealth] Invalid required fields:', status);
        return false;
      }

      // lastChecked can be Date object or ISO string
      if (!status.lastChecked || 
          (!(status.lastChecked instanceof Date) && typeof status.lastChecked !== 'string')) {
        console.error('[useBackendHealth] Invalid lastChecked field:', status.lastChecked);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[useBackendHealth.validateStatus] Error:', error);
      return false;
    }
  }, []);

  // Validate status on each update (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!validateStatus(status)) {
        console.warn('[useBackendHealth] Status validation failed:', status);
      }
    }
  }, [status, validateStatus]);

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  /**
   * Extract convenience properties from status
   * Provides direct access to commonly used fields
   */
  const isAvailable = status.available;
  const isHealthy = status.healthy;
  const lastChecked = status.lastChecked;
  const latency = status.latency ?? null;
  const version = status.version ?? null;
  const error = status.error ? new Error(status.error) : null;

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  /**
   * Return comprehensive backend health monitoring interface
   * All handlers are memoized for optimal performance
   * 
   * @returns {Object} Backend health monitoring interface
   * @property {BackendStatus} status - Complete backend status object
   * @property {boolean} isAvailable - Backend availability flag
   * @property {boolean} isHealthy - Backend health flag
   * @property {string} lastChecked - ISO timestamp of last health check
   * @property {number | null} latency - Backend latency in milliseconds (null if unavailable)
   * @property {string | null} version - Backend version string (null if unavailable)
   * @property {string | undefined} error - Error message if health check failed
   * @property {Function} refresh - Manual refresh handler
   */
  return {
    status,
    isAvailable,
    isHealthy,
    lastChecked,
    latency,
    version,
    error,
    isLoading,
    refresh,
  };
}
