import type { IService } from "../../services/core/ServiceLifecycle";
import { ServiceRegistry } from "../../services/core/ServiceRegistry";

/**
 * HOOK ADAPTER for Service Registry
 *
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to service registry
 *
 * USAGE:
 * ```typescript
 * const telemetry = useService<TelemetryService>('TelemetryService');
 * telemetry.track(event);
 * ```
 */

export function useService<T extends IService>(serviceName: string): T {
  return ServiceRegistry.get<T>(serviceName);
}

/**
 * Check if service is registered
 * Useful for conditional rendering
 */
export function useServiceExists(serviceName: string): boolean {
  return ServiceRegistry.has(serviceName);
}

/**
 * Get all registered services (for debugging)
 */
export function useServiceList(): string[] {
  return ServiceRegistry.list();
}
