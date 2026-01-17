/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        SERVICE REGISTRY                                   ║
 * ║              Enterprise Service Management Pattern                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/ServiceRegistry
 * @description Centralized service registration and lifecycle management
 *
 * GOVERNANCE RULES:
 * 1. NO SERVICE MAY SELF-REGISTER
 * 2. Services are injectable
 * 3. Services are replaceable
 * 4. Services are testable in isolation
 * 5. Services have no implicit state
 *
 * @architecture
 * - Pattern: Service Locator + Registry
 * - Lifecycle: Manages all service instances
 * - Injection: Provides dependency injection
 * - Testing: Supports mock service replacement
 */

import { type IService, ServiceError, ServiceState } from "./ServiceLifecycle";

export { ServiceError };

// ============================================================================
// SERVICE REGISTRY INTERFACE
// ============================================================================

/**
 * Service registration options
 */
export interface ServiceRegistration {
  /** Service instance */
  service: IService;
  /** Singleton (one instance) or factory (new instance per request) */
  lifecycle: "singleton" | "factory";
  /** Dependencies (other service names) */
  dependencies?: string[];
  /** Auto-start on registration */
  autoStart?: boolean;
}

/**
 * Service health status
 */
export interface ServiceHealthStatus {
  name: string;
  state: ServiceState;
  healthy: boolean;
  dependencies: string[];
  startTime?: number;
  uptime?: number;
}

// ============================================================================
// SERVICE REGISTRY IMPLEMENTATION
// ============================================================================

/**
 * Centralized service registry
 * Manages service lifecycle and dependencies
 *
 * @example
 * ```typescript
 * // Register service
 * ServiceRegistry.register({
 *   service: new TelemetryService(),
 *   lifecycle: 'singleton',
 *   autoStart: true
 * });
 *
 * // Get service
 * const telemetry = ServiceRegistry.get<TelemetryService>('telemetry');
 * telemetry.track(event);
 *
 * // Stop all services
 * await ServiceRegistry.stopAll();
 * ```
 */
class ServiceRegistryClass {
  private services = new Map<string, ServiceRegistration>();
  private startTimes = new Map<string, number>();

  /**
   * Register a service
   * Service name must be unique
   *
   * @throws {ServiceError} If service already registered
   */
  register(registration: ServiceRegistration): void {
    const { service } = registration;

    if (this.services.has(service.name)) {
      throw new ServiceError(
        service.name,
        "Service already registered. Use unregister() first."
      );
    }

    // Validate dependencies exist
    if (registration.dependencies) {
      for (const dep of registration.dependencies) {
        if (!this.services.has(dep)) {
          throw new ServiceError(
            service.name,
            `Dependency '${dep}' not registered`
          );
        }
      }
    }

    this.services.set(service.name, registration);

    // Auto-start if requested
    if (registration.autoStart) {
      this.start(service.name).catch((err) => {
        console.error(
          `[ServiceRegistry] Failed to auto-start '${service.name}':`,
          err
        );
      });
    }
  }

  /**
   * Unregister a service
   * Stops service if running before unregistering
   *
   * @throws {ServiceError} If service has dependents
   */
  async unregister(name: string): Promise<void> {
    const registration = this.services.get(name);
    if (!registration) {
      return;
    }

    // Check for dependents
    const dependents = this.getDependents(name);
    if (dependents.length > 0) {
      throw new ServiceError(
        name,
        `Cannot unregister: services depend on it: ${dependents.join(", ")}`
      );
    }

    // Stop and dispose if running
    const { service } = registration;
    if (service.state === ServiceState.RUNNING) {
      await service.stop();
    }
    if (service.state !== ServiceState.DISPOSED) {
      await service.dispose();
    }

    this.services.delete(name);
    this.startTimes.delete(name);
  }

  /**
   * Get service by name
   *
   * @throws {ServiceError} If service not found
   */
  get<T extends IService>(name: string): T {
    const registration = this.services.get(name);
    if (!registration) {
      throw new ServiceError("ServiceRegistry", `Service '${name}' not found`);
    }

    return registration.service as T;
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  list(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Start a service
   * Automatically starts dependencies first
   *
   * @throws {ServiceError} If service not found or start fails
   */
  async start(name: string): Promise<void> {
    const registration = this.services.get(name);
    if (!registration) {
      throw new ServiceError("ServiceRegistry", `Service '${name}' not found`);
    }

    const { service, dependencies } = registration;

    // Already running
    if (service.state === ServiceState.RUNNING) {
      return;
    }

    // Start dependencies first
    if (dependencies) {
      for (const dep of dependencies) {
        await this.start(dep);
      }
    }

    // Configure if needed
    if (service.state === ServiceState.CREATED) {
      service.configure({ name: service.name });
    }

    // Start service
    await service.start();
    this.startTimes.set(name, Date.now());
  }

  /**
   * Stop a service
   * Automatically stops dependents first
   *
   * @throws {ServiceError} If service not found or stop fails
   */
  async stop(name: string): Promise<void> {
    const registration = this.services.get(name);
    if (!registration) {
      throw new ServiceError("ServiceRegistry", `Service '${name}' not found`);
    }

    const { service } = registration;

    // Not running
    if (service.state !== ServiceState.RUNNING) {
      return;
    }

    // Stop dependents first
    const dependents = this.getDependents(name);
    for (const dependent of dependents) {
      await this.stop(dependent);
    }

    // Stop service
    await service.stop();
    this.startTimes.delete(name);
  }

  /**
   * Start all registered services
   * Respects dependency order
   */
  async startAll(): Promise<void> {
    const sorted = this.topologicalSort();

    for (const name of sorted) {
      const registration = this.services.get(name);
      if (registration && registration.service.state !== ServiceState.RUNNING) {
        await this.start(name);
      }
    }
  }

  /**
   * Stop all running services
   * Stops in reverse dependency order
   */
  async stopAll(): Promise<void> {
    const sorted = this.topologicalSort().reverse();

    for (const name of sorted) {
      const registration = this.services.get(name);
      if (registration && registration.service.state === ServiceState.RUNNING) {
        await this.stop(name);
      }
    }
  }

  /**
   * Get health status of all services
   */
  getHealthStatus(): ServiceHealthStatus[] {
    return Array.from(this.services.entries()).map(([name, registration]) => {
      const { service, dependencies = [] } = registration;
      const startTime = this.startTimes.get(name);
      const uptime = startTime ? Date.now() - startTime : undefined;

      return {
        name,
        state: service.state,
        healthy: service.isHealthy(),
        dependencies,
        startTime,
        uptime,
      };
    });
  }

  /**
   * Get services that depend on this service
   * @private
   */
  private getDependents(name: string): string[] {
    const dependents: string[] = [];

    for (const [serviceName, registration] of this.services.entries()) {
      if (registration.dependencies?.includes(name)) {
        dependents.push(serviceName);
      }
    }

    return dependents;
  }

  /**
   * Topological sort for dependency order
   * @private
   */
  private topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new ServiceError(
          "ServiceRegistry",
          `Circular dependency detected: ${name}`
        );
      }

      visiting.add(name);

      const registration = this.services.get(name);
      if (registration?.dependencies) {
        for (const dep of registration.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    for (const name of this.services.keys()) {
      visit(name);
    }

    return sorted;
  }

  /**
   * Clear all services (testing only)
   * Stops and disposes all services
   */
  async clear(): Promise<void> {
    await this.stopAll();

    for (const [, registration] of this.services.entries()) {
      if (registration.service.state !== ServiceState.DISPOSED) {
        await registration.service.dispose();
      }
    }

    this.services.clear();
    this.startTimes.clear();
  }

  /**
   * Get registry size (for diagnostics)
   */
  size(): number {
    return this.services.size;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Global service registry instance
 * Used throughout the application
 */
export const ServiceRegistry = new ServiceRegistryClass();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Register and configure a service in one call
 * Convenience function for common pattern
 */
export async function registerService<T extends IService>(
  service: T,
  options: {
    lifecycle?: "singleton" | "factory";
    dependencies?: string[];
    autoStart?: boolean;
    config?: Parameters<T["configure"]>[0];
  } = {}
): Promise<T> {
  // Configure if config provided
  if (options.config) {
    service.configure(options.config);
  }

  // Register
  ServiceRegistry.register({
    service,
    lifecycle: options.lifecycle ?? "singleton",
    dependencies: options.dependencies,
    autoStart: options.autoStart,
  });

  return service;
}

/**
 * Get or create service
 * Creates and registers if not exists, returns existing if registered
 */
export function getOrCreateService<T extends IService>(
  name: string,
  factory: () => T,
  options: {
    lifecycle?: "singleton" | "factory";
    dependencies?: string[];
    autoStart?: boolean;
  } = {}
): T {
  if (ServiceRegistry.has(name)) {
    return ServiceRegistry.get<T>(name);
  }

  const service = factory();

  ServiceRegistry.register({
    service,
    lifecycle: options.lifecycle ?? "singleton",
    dependencies: options.dependencies,
    autoStart: options.autoStart,
  });

  return service;
}
