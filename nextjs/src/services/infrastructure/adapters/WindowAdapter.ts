/**
 * Window Adapter Interface
 * Browser-agnostic window/global object abstractions for service layer portability
 *
 * @module services/infrastructure/adapters/WindowAdapter
 * @description Provides window/document interfaces that services can depend on
 * without direct browser API coupling. Enables:
 * - Server-side rendering (SSR)
 * - Web worker execution
 * - Unit testing with mock window
 * - Environment-agnostic timers and events
 *
 * @architecture
 * - Pattern: Adapter + Interface Segregation
 * - Implementations: BrowserWindowAdapter, SSRWindowAdapter, TestWindowAdapter
 * - Injection: Services receive IWindowAdapter via constructor
 *
 * @usage
 * ```typescript
 * // In service
 * export class WorkerPoolService {
 *   constructor(private readonly windowAdapter: IWindowAdapter) {}
 *
 *   startMonitoring(): void {
 *     this.timerId = this.windowAdapter.setInterval(() => {
 *       this.checkHealth();
 *     }, 5000);
 *   }
 * }
 * ```
 */

import { isBrowser } from "@rendering/utils";

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Timer handle type (matches browser's return type)
 */
export type TimerHandle = number;

/**
 * Event listener type
 */
export type EventListener = (event: Event) => void;

/**
 * Window adapter interface for browser-specific APIs
 * Abstracts window, document, and global timer/event APIs
 */
export interface IWindowAdapter {
  /**
   * Set interval timer
   * @returns Timer handle for clearInterval
   */
  setInterval(callback: () => void, ms: number): TimerHandle;

  /**
   * Clear interval timer
   */
  clearInterval(handle: TimerHandle): void;

  /**
   * Set timeout timer
   * @returns Timer handle for clearTimeout
   */
  setTimeout(callback: () => void, ms: number): TimerHandle;

  /**
   * Clear timeout timer
   */
  clearTimeout(handle: TimerHandle): void;

  /**
   * Add event listener to window
   */
  addEventListener(event: string, listener: EventListener): void;

  /**
   * Remove event listener from window
   */
  removeEventListener(event: string, listener: EventListener): void;

  /**
   * Get current timestamp (performance.now or Date.now fallback)
   */
  now(): number;

  /**
   * Check if running in browser environment
   */
  isBrowser(): boolean;

  /**
   * Request animation frame (for UI updates)
   * @returns Frame handle for cancelAnimationFrame
   */
  requestAnimationFrame(callback: () => void): number;

  /**
   * Cancel animation frame
   */
  cancelAnimationFrame(handle: number): void;
}

// ============================================================================
// BROWSER IMPLEMENTATION
// ============================================================================

/**
 * Browser window adapter implementation
 * Uses native window, document, and performance APIs
 */
export class BrowserWindowAdapter implements IWindowAdapter {
  private readonly isAvailable: boolean;

  constructor() {
    this.isAvailable = isBrowser();
  }

  setInterval(callback: () => void, ms: number): TimerHandle {
    if (!this.isAvailable) {
      throw new EnvironmentError(
        "setInterval not available in non-browser environment"
      );
    }
    return window.setInterval(callback, ms);
  }

  clearInterval(handle: TimerHandle): void {
    if (this.isAvailable) {
      window.clearInterval(handle);
    }
  }

  setTimeout(callback: () => void, ms: number): TimerHandle {
    if (!this.isAvailable) {
      throw new EnvironmentError(
        "setTimeout not available in non-browser environment"
      );
    }
    return window.setTimeout(callback, ms);
  }

  clearTimeout(handle: TimerHandle): void {
    if (this.isAvailable) {
      window.clearTimeout(handle);
    }
  }

  addEventListener(event: string, listener: EventListener): void {
    if (this.isAvailable) {
      window.addEventListener(
        event,
        listener as unknown as globalThis.EventListener
      );
    }
  }

  removeEventListener(event: string, listener: EventListener): void {
    if (this.isAvailable) {
      window.removeEventListener(
        event,
        listener as unknown as globalThis.EventListener
      );
    }
  }

  now(): number {
    if (this.isAvailable && window.performance) {
      return performance.now();
    }
    return Date.now();
  }

  isBrowser(): boolean {
    return this.isAvailable;
  }

  requestAnimationFrame(callback: () => void): number {
    if (!this.isAvailable) {
      throw new EnvironmentError(
        "requestAnimationFrame not available in non-browser environment"
      );
    }
    return window.requestAnimationFrame(callback);
  }

  cancelAnimationFrame(handle: number): void {
    if (this.isAvailable) {
      window.cancelAnimationFrame(handle);
    }
  }
}

// ============================================================================
// TEST IMPLEMENTATION
// ============================================================================

/**
 * Test window adapter for unit testing
 * Mocks all window APIs with controllable behavior
 */
export class TestWindowAdapter implements IWindowAdapter {
  private intervals = new Map<
    TimerHandle,
    { callback: () => void; ms: number }
  >();
  private timeouts = new Map<
    TimerHandle,
    { callback: () => void; ms: number }
  >();
  private nextHandle = 1;
  private listeners = new Map<string, Set<EventListener>>();

  setInterval(callback: () => void, ms: number): TimerHandle {
    const handle = this.nextHandle++;
    this.intervals.set(handle, { callback, ms });
    return handle;
  }

  clearInterval(handle: TimerHandle): void {
    this.intervals.delete(handle);
  }

  setTimeout(callback: () => void, ms: number): TimerHandle {
    const handle = this.nextHandle++;
    this.timeouts.set(handle, { callback, ms });
    return handle;
  }

  clearTimeout(handle: TimerHandle): void {
    this.timeouts.delete(handle);
  }

  addEventListener(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  removeEventListener(event: string, listener: EventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  now(): number {
    return Date.now();
  }

  isBrowser(): boolean {
    return false; // Test environment
  }

  requestAnimationFrame(callback: () => void): number {
    const handle = this.nextHandle++;
    // Execute immediately in tests
    setTimeout(callback, 0);
    return handle;
  }

  cancelAnimationFrame(_handle: number): void {
    // No-op in tests
  }

  /**
   * Test helper: manually trigger interval callbacks
   */
  triggerInterval(handle: TimerHandle): void {
    const interval = this.intervals.get(handle);
    if (interval) {
      interval.callback();
    }
  }

  /**
   * Test helper: manually trigger timeout callbacks
   */
  triggerTimeout(handle: TimerHandle): void {
    const timeout = this.timeouts.get(handle);
    if (timeout) {
      timeout.callback();
      this.timeouts.delete(handle);
    }
  }

  /**
   * Test helper: manually trigger event listeners
   */
  triggerEvent(event: string, eventData: Event): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(eventData));
    }
  }

  /**
   * Test helper: get active interval/timeout count
   */
  getActiveTimerCount(): { intervals: number; timeouts: number } {
    return {
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
    };
  }
}

// ============================================================================
// SSR IMPLEMENTATION
// ============================================================================

/**
 * SSR (Server-Side Rendering) window adapter
 * No-op implementation for Node.js environments
 */
export class SSRWindowAdapter implements IWindowAdapter {
  setInterval(_callback: () => void, _ms: number): TimerHandle {
    throw new EnvironmentError("setInterval not available in SSR environment");
  }

  clearInterval(_handle: TimerHandle): void {
    // No-op
  }

  setTimeout(_callback: () => void, _ms: number): TimerHandle {
    throw new EnvironmentError("setTimeout not available in SSR environment");
  }

  clearTimeout(_handle: TimerHandle): void {
    // No-op
  }

  addEventListener(_event: string, _listener: EventListener): void {
    // No-op - no window events in SSR
  }

  removeEventListener(_event: string, _listener: EventListener): void {
    // No-op
  }

  now(): number {
    return Date.now();
  }

  isBrowser(): boolean {
    return false;
  }

  requestAnimationFrame(_callback: () => void): number {
    throw new EnvironmentError(
      "requestAnimationFrame not available in SSR environment"
    );
  }

  cancelAnimationFrame(_handle: number): void {
    // No-op
  }
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

/**
 * Thrown when browser API is called in non-browser environment
 */
export class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvironmentError";
  }
}

// ============================================================================
// SINGLETON INSTANCES (Convenience)
// ============================================================================

/**
 * Default window adapter instance
 * Auto-detects environment and provides appropriate implementation
 */
export const defaultWindowAdapter: IWindowAdapter = isBrowser()
  ? new BrowserWindowAdapter()
  : new SSRWindowAdapter();
