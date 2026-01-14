/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      TELEMETRY SERVICE                                    ║
 * ║          Enterprise Browser Capability - Event Tracking                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/telemetry/TelemetryService
 * @description Browser-based event tracking service
 *
 * COMPLIANCE CHECKLIST:
 * [✓] Is this logic imperative? YES - tracks events via browser APIs
 * [✓] Does it touch browser or SDK APIs? YES - console, performance
 * [✓] Is it stateless? YES - no domain state
 * [✓] Is it injectable? YES - implements IService
 * [✓] Does it avoid domain knowledge? YES - generic events only
 * [✓] Does it avoid React imports? YES - no React dependencies
 *
 * WHAT IT IS:
 * - Browser capability service for event tracking
 * - Logging and performance monitoring
 * - Diagnostic telemetry
 *
 * WHAT IT IS NOT:
 * - Analytics service (domain aware)
 * - API service (data fetching)
 * - State management
 */

import { BaseService, type ServiceConfig } from "../core/ServiceLifecycle";

// ============================================================================
// TYPES
// ============================================================================

export interface TelemetryConfig extends ServiceConfig {
  /** Console logging enabled */
  consoleEnabled?: boolean;
  /** Performance monitoring enabled */
  performanceEnabled?: boolean;
  /** Sample rate (0.0-1.0) */
  sampleRate?: number;
}

export interface TelemetryEvent {
  /** Event name (e.g., 'button_click', 'page_view') */
  name: string;
  /** Event properties */
  properties?: Record<string, string | number | boolean>;
  /** Event timestamp (defaults to Date.now()) */
  timestamp?: number;
}

export interface PerformanceMark {
  name: string;
  startTime: number;
  duration?: number;
}

// ============================================================================
// TELEMETRY SERVICE
// ============================================================================

/**
 * Telemetry service for browser-based event tracking
 *
 * @example
 * ```typescript
 * const telemetry = new TelemetryService();
 * telemetry.configure({
 *   name: 'telemetry',
 *   consoleEnabled: true,
 *   performanceEnabled: true
 * });
 * await telemetry.start();
 *
 * // Track event
 * telemetry.track({
 *   name: 'case_created',
 *   properties: { caseType: 'litigation' }
 * });
 *
 * // Performance monitoring
 * telemetry.startMark('render_dashboard');
 * // ... work ...
 * telemetry.endMark('render_dashboard');
 * ```
 */
export class TelemetryService extends BaseService<TelemetryConfig> {
  private consoleEnabled = true;
  private performanceEnabled = true;
  private sampleRate = 1.0;
  private marks = new Map<string, number>();

  constructor() {
    super("telemetry");
  }

  protected override onConfigure(config: TelemetryConfig): void {
    this.consoleEnabled = config.consoleEnabled ?? true;
    this.performanceEnabled = config.performanceEnabled ?? true;
    this.sampleRate = config.sampleRate ?? 1.0;

    if (this.sampleRate < 0 || this.sampleRate > 1) {
      throw new Error("Sample rate must be between 0.0 and 1.0");
    }
  }

  protected override onStart(): void {
    if (this.performanceEnabled && typeof performance !== "undefined") {
      // Clear any existing marks
      this.marks.clear();
    }
  }

  protected override onStop(): void {
    // Clear marks on stop
    this.marks.clear();
  }

  /**
   * Track an event
   * Uses console.log in development, can be extended for production
   */
  track(event: TelemetryEvent): void {
    this.ensureRunning();

    // Sample rate check
    if (Math.random() > this.sampleRate) {
      return;
    }

    const timestamp = event.timestamp ?? Date.now();
    const eventData = {
      name: event.name,
      properties: event.properties ?? {},
      timestamp,
    };

    if (this.consoleEnabled) {
      console.log("[Telemetry]", eventData);
    }

    // Extension point: Send to analytics backend
    // This service only handles browser-side tracking
  }

  /**
   * Start performance mark
   */
  startMark(name: string): void {
    this.ensureRunning();

    if (!this.performanceEnabled) {
      return;
    }

    const startTime = performance.now();
    this.marks.set(name, startTime);

    if (this._debug) {
      this.log(`Mark started: ${name}`);
    }
  }

  /**
   * End performance mark and calculate duration
   */
  endMark(name: string): PerformanceMark | null {
    this.ensureRunning();

    if (!this.performanceEnabled) {
      return null;
    }

    const startTime = this.marks.get(name);
    if (!startTime) {
      this.error(`Mark not found: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    const mark: PerformanceMark = {
      name,
      startTime,
      duration,
    };

    if (this.consoleEnabled) {
      console.log("[Telemetry] Performance:", mark);
    }

    return mark;
  }

  /**
   * Get all active marks
   */
  getActiveMarks(): string[] {
    this.ensureRunning();
    return Array.from(this.marks.keys());
  }

  /**
   * Clear all marks
   */
  clearMarks(): void {
    this.marks.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE (Optional)
// ============================================================================

// Default instance for convenience
// Applications should register via ServiceRegistry for proper lifecycle management
export const telemetryService = new TelemetryService();
