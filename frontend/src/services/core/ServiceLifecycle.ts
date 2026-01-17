/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    SERVICE LIFECYCLE INTERFACES                           ║
 * ║              Enterprise React Services Architecture v1.0                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/ServiceLifecycle
 * @description Formal service lifecycle model for enterprise React services
 *
 * AUTHORITATIVE DEFINITION:
 * A REACT SERVICE IS:
 * A STATELESS, LONG-LIVED, ENVIRONMENT-AWARE MODULE
 * THAT ENCAPSULATES IMPERATIVE CAPABILITIES
 *
 * IT IS NOT:
 * ✗ a component
 * ✗ a hook
 * ✗ a frontend API
 * ✗ a context
 * ✗ a global singleton with hidden state
 *
 * @architecture
 * - Pattern: Lifecycle Management + Dependency Injection
 * - Initialization: Explicit (never implicit)
 * - State: Ephemeral only (no domain state)
 * - Dependencies: Injected via constructor
 * - Lifecycle: configure → start → use → stop → dispose
 */

// ============================================================================
// SERVICE LIFECYCLE INTERFACE
// ============================================================================

/**
 * Service state enumeration
 */
export enum ServiceState {
  /** Service created but not configured */
  CREATED = "created",
  /** Service configured but not started */
  CONFIGURED = "configured",
  /** Service running and ready to use */
  RUNNING = "running",
  /** Service stopped but can be restarted */
  STOPPED = "stopped",
  /** Service disposed and cannot be reused */
  DISPOSED = "disposed",
}

/**
 * Service configuration interface
 * Generic type parameter allows service-specific config
 */
export interface ServiceConfig {
  /** Service identifier for registry */
  readonly name: string;
  /** Service version (semantic versioning) */
  readonly version?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Environment-specific settings */
  environment?: "development" | "staging" | "production";
}

/**
 * Service lifecycle interface
 * All React services MUST implement this interface
 *
 * @template TConfig Service-specific configuration type
 */
export interface IService<TConfig extends ServiceConfig = ServiceConfig> {
  /**
   * Service name (unique identifier)
   * Used for registry lookup and logging
   */
  readonly name: string;

  /**
   * Current service state
   */
  readonly state: ServiceState;

  /**
   * Configure service with options
   * Called once before start()
   *
   * @param config Service configuration
   * @throws {ServiceError} If already configured or in invalid state
   */
  configure(config: TConfig): void;

  /**
   * Start service and initialize resources
   * May set up event listeners, timers, observers
   *
   * @throws {ServiceError} If not configured or already started
   */
  start(): Promise<void> | void;

  /**
   * Stop service and release resources
   * Must clean up all side effects (listeners, timers, etc.)
   * Service can be restarted after stop()
   *
   * @throws {ServiceError} If not running
   */
  stop(): Promise<void> | void;

  /**
   * Dispose service permanently
   * Cannot be restarted after dispose()
   * Must release all resources including config
   *
   * @throws {ServiceError} If already disposed
   */
  dispose(): Promise<void> | void;

  /**
   * Check if service is healthy
   * Used for monitoring and diagnostics
   *
   * @returns Health status
   */
  isHealthy(): boolean;
}

// ============================================================================
// BASE SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Abstract base service implementation
 * Provides default lifecycle management
 *
 * @template TConfig Service-specific configuration type
 *
 * @example
 * ```typescript
 * interface TelemetryConfig extends ServiceConfig {
 *   endpoint: string;
 *   batchSize: number;
 * }
 *
 * class TelemetryService extends BaseService<TelemetryConfig> {
 *   constructor() {
 *     super('telemetry');
 *   }
 *
 *   protected onStart(): void {
 *     // Initialize telemetry connection
 *   }
 *
 *   track(event: TelemetryEvent): void {
 *     this.ensureRunning();
 *     // Track event
 *   }
 * }
 * ```
 */
export abstract class BaseService<
  TConfig extends ServiceConfig = ServiceConfig,
> implements IService<TConfig> {
  public readonly name: string;
  protected _state: ServiceState = ServiceState.CREATED;
  protected _config: TConfig | undefined;
  protected _debug: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  public get state(): ServiceState {
    return this._state;
  }

  public configure(config: TConfig): void {
    this.ensureState(ServiceState.CREATED, "configure");

    if (!config.name || config.name !== this.name) {
      throw new ServiceError(
        this.name,
        `Configuration name mismatch: expected '${this.name}', got '${config.name}'`,
      );
    }

    this._config = config;
    this._debug = config.debug ?? false;
    this._state = ServiceState.CONFIGURED;

    if (this._debug) {
      this.log("Configured", config);
    }

    this.onConfigure(config);
  }

  public async start(): Promise<void> {
    this.ensureState(ServiceState.CONFIGURED, "start");

    if (this._debug) {
      this.log("Starting...");
    }

    await this.onStart();

    this._state = ServiceState.RUNNING;

    if (this._debug) {
      this.log("Started successfully");
    }
  }

  public async stop(): Promise<void> {
    this.ensureState(ServiceState.RUNNING, "stop");

    if (this._debug) {
      this.log("Stopping...");
    }

    await this.onStop();

    this._state = ServiceState.STOPPED;

    if (this._debug) {
      this.log("Stopped successfully");
    }
  }

  public async dispose(): Promise<void> {
    if (this._state === ServiceState.DISPOSED) {
      return;
    }

    if (this._state === ServiceState.RUNNING) {
      await this.stop();
    }

    if (this._debug) {
      this.log("Disposing...");
    }

    await this.onDispose();

    this._config = undefined;
    this._state = ServiceState.DISPOSED;

    if (this._debug) {
      this.log("Disposed successfully");
    }
  }

  public isHealthy(): boolean {
    return this._state === ServiceState.RUNNING && this.onHealthCheck();
  }

  // ============================================================================
  // PROTECTED HOOKS (Override in subclasses)
  // ============================================================================

  /**
   * Called after configuration is set
   * Override to perform custom configuration logic
   */
  protected onConfigure(_config: TConfig): void {
    // Default: no-op
  }

  /**
   * Called when service starts
   * Override to initialize resources (listeners, timers, etc.)
   */
  protected onStart(): Promise<void> | void {
    // Default: no-op
  }

  /**
   * Called when service stops
   * Override to clean up resources
   */
  protected onStop(): Promise<void> | void {
    // Default: no-op
  }

  /**
   * Called when service is disposed
   * Override to release all resources permanently
   */
  protected onDispose(): Promise<void> | void {
    // Default: no-op
  }

  /**
   * Health check implementation
   * Override to provide custom health checks
   */
  protected onHealthCheck(): boolean {
    return true;
  }

  // ============================================================================
  // PROTECTED UTILITIES
  // ============================================================================

  /**
   * Ensure service is in expected state
   * @throws {ServiceError} If state mismatch
   */
  protected ensureState(expected: ServiceState, operation: string): void {
    if (this._state !== expected) {
      throw new ServiceError(
        this.name,
        `Cannot ${operation}: expected state '${expected}', current state '${this._state}'`,
      );
    }
  }

  /**
   * Ensure service is running
   * Convenience method for operation methods
   * @throws {ServiceError} If not running
   */
  protected ensureRunning(): void {
    if (this._state !== ServiceState.RUNNING) {
      throw new ServiceError(
        this.name,
        `Service not running (current state: '${this._state}')`,
      );
    }
  }

  /**
   * Get configuration
   * @throws {ServiceError} If not configured
   */
  protected getConfig(): TConfig {
    if (!this._config) {
      throw new ServiceError(this.name, "Service not configured");
    }
    return this._config;
  }

  /**
   * Debug logging
   */
  protected log(message: string, ...args: unknown[]): void {
    if (this._debug) {
      console.log(`[${this.name}] ${message}`, ...args);
    }
  }

  /**
   * Error logging (always enabled)
   */
  protected error(message: string, ...args: unknown[]): void {
    console.error(`[${this.name}] ❌ ${message}`, ...args);
  }
}

// ============================================================================
// SERVICE ERRORS
// ============================================================================

/**
 * Service-specific error class
 * Thrown for lifecycle violations and invalid operations
 */
export class ServiceError extends Error {
  constructor(
    public readonly serviceName: string,
    message: string,
  ) {
    super(`[${serviceName}] ${message}`);
    this.name = "ServiceError";
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if object implements IService interface
 */
export function isService(obj: unknown): obj is IService {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "state" in obj &&
    "configure" in obj &&
    "start" in obj &&
    "stop" in obj &&
    "dispose" in obj &&
    "isHealthy" in obj
  );
}
