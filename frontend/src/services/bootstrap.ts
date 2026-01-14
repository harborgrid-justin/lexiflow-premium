/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                   APPLICATION BOOTSTRAP                                   ║
 * ║          Enterprise Service Initialization & Configuration                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/bootstrap
 * @description Centralized application service initialization
 *
 * ROLE: Application entry point for service layer
 * SCOPE: Service registration and startup orchestration
 * STATE: Application-level lifecycle
 *
 * LIFECYCLE:
 * 1. registerServices() - Register all services with registry
 * 2. initializeServices() - Configure and start services
 * 3. shutdownServices() - Stop and dispose services
 */

import { BrowserClipboardService } from "./clipboard/ClipboardService";
import { ServiceRegistry, registerService } from "./core/ServiceRegistry";
import { WebCryptoService } from "./crypto/CryptoService";
import { EnvironmentFeatureFlagService } from "./featureFlags/FeatureFlagService";
import { BrowserSessionService } from "./session/SessionService";
import { BrowserStorageService } from "./storage/StorageService";
import { ConsoleTelemetryService } from "./telemetry/TelemetryService";

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

/**
 * Service registration manifest
 * Defines all services and their dependencies
 */
const SERVICE_MANIFEST = {
  // Storage Service - No dependencies
  StorageService: {
    factory: () => new BrowserStorageService(),
    dependencies: [],
    autoStart: true,
  },

  // Telemetry Service - No dependencies
  TelemetryService: {
    factory: () => new ConsoleTelemetryService(),
    dependencies: [],
    autoStart: true,
  },

  // Feature Flag Service - No dependencies
  FeatureFlagService: {
    factory: () => new EnvironmentFeatureFlagService(),
    dependencies: [],
    autoStart: true,
  },

  // Session Service - No dependencies
  SessionService: {
    factory: () => new BrowserSessionService(),
    dependencies: [],
    autoStart: true,
  },

  // Clipboard Service - No dependencies
  ClipboardService: {
    factory: () => new BrowserClipboardService(),
    dependencies: [],
    autoStart: true,
  },

  // Crypto Service - No dependencies
  CryptoService: {
    factory: () => new WebCryptoService(),
    dependencies: [],
    autoStart: true,
  },
} as const;

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Register all application services
 * Called once at application startup
 *
 * @throws {ServiceError} If registration fails
 */
export async function registerServices(): Promise<void> {
  console.log("[Bootstrap] Registering services...");

  for (const [name, config] of Object.entries(SERVICE_MANIFEST)) {
    try {
      const service = config.factory();
      await registerService(service, {
        lifecycle: "singleton",
        dependencies: [...config.dependencies],
        autoStart: false, // Manual start in initializeServices
      });
      console.log(`[Bootstrap] ✓ Registered ${name}`);
    } catch (error) {
      console.error(`[Bootstrap] ✗ Failed to register ${name}:`, error);
      throw error;
    }
  }

  console.log(`[Bootstrap] Registered ${ServiceRegistry.size()} services`);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize and start all services
 * Respects dependency order
 *
 * @throws {ServiceError} If initialization fails
 */
export async function initializeServices(): Promise<void> {
  console.log("[Bootstrap] Initializing services...");

  try {
    await ServiceRegistry.startAll();
    console.log("[Bootstrap] ✓ All services started");

    // Log health status
    const health = ServiceRegistry.getHealthStatus();
    const unhealthy = health.filter((s) => !s.healthy);

    if (unhealthy.length > 0) {
      console.warn(
        "[Bootstrap] Unhealthy services:",
        unhealthy.map((s) => s.name)
      );
    } else {
      console.log("[Bootstrap] ✓ All services healthy");
    }
  } catch (error) {
    console.error("[Bootstrap] ✗ Service initialization failed:", error);
    throw error;
  }
}

// ============================================================================
// SHUTDOWN
// ============================================================================

/**
 * Shutdown all services
 * Stops in reverse dependency order
 *
 * Called on application unmount or hot reload
 */
export async function shutdownServices(): Promise<void> {
  console.log("[Bootstrap] Shutting down services...");

  try {
    await ServiceRegistry.stopAll();
    console.log("[Bootstrap] ✓ All services stopped");
  } catch (error) {
    console.error("[Bootstrap] ✗ Service shutdown failed:", error);
    throw error;
  }
}

// ============================================================================
// DIAGNOSTICS
// ============================================================================

/**
 * Get service health report
 * Useful for debugging and monitoring
 */
export function getServiceHealth() {
  return ServiceRegistry.getHealthStatus();
}

/**
 * Check if all services are healthy
 */
export function areServicesHealthy(): boolean {
  const health = ServiceRegistry.getHealthStatus();
  return health.every((s) => s.healthy);
}

/**
 * Get service uptime in milliseconds
 */
export function getServiceUptime(serviceName: string): number | null {
  const health = ServiceRegistry.getHealthStatus().find(
    (s) => s.name === serviceName
  );
  return health?.uptime ?? null;
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Development mode: Expose registry globally
 * Access via window.__LEXIFLOW_SERVICES__ in dev tools
 */
if (import.meta.env.DEV) {
  (
    window as Window & { __LEXIFLOW_SERVICES__?: unknown }
  ).__LEXIFLOW_SERVICES__ = {
    registry: ServiceRegistry,
    health: getServiceHealth,
    shutdown: shutdownServices,
    restart: async () => {
      await shutdownServices();
      await registerServices();
      await initializeServices();
    },
  };
  console.log(
    "[Bootstrap] Dev mode: Services exposed at window.__LEXIFLOW_SERVICES__"
  );
}
