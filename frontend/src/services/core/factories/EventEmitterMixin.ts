/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    EVENT EMITTER MIXIN FACTORY                            ║
 * ║           Eliminates 90+ duplicate listener management lines              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/EventEmitterMixin
 * @description Reusable event emitter pattern for services
 * 
 * ELIMINATES DUPLICATES IN:
 * - Repository.ts (55-125)
 * - NotificationService.ts (113-140)
 * - SessionService.ts (116-123)
 * - ModuleRegistry.ts (87-94)
 * - BackendDiscoveryService
 * - IntegrationEventPublisher
 * 
 * DUPLICATE PATTERNS ELIMINATED:
 * - subscribe() method (6+ services)
 * - removeListener() method (6+ services)
 * - clearAllListeners() method (6+ services)
 * - getListenerCount() method (6+ services)
 * - notify() method with error handling (6+ services)
 * - Listener overflow warnings (2+ services)
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Event listener function type
 */
export type EventListener<TEvent = unknown> = (event: TEvent) => void;

/**
 * Unsubscribe function type
 */
export type UnsubscribeFunction = () => void;

/**
 * Event emitter configuration
 */
export interface EventEmitterConfig {
  /** Maximum listeners before warning */
  maxListeners?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Service name for logging */
  serviceName?: string;
}

// ============================================================================
// EVENT EMITTER MIXIN
// ============================================================================

/**
 * Event emitter mixin providing standard listener management.
 * 
 * Eliminates duplicate listener management code across 6+ services.
 * 
 * @example
 * ```typescript
 * // Before: 12 lines of duplicate code
 * class SessionService extends BaseService {
 *   private listeners: Set<SessionListener> = new Set();
 *   addListener(listener: SessionListener) {
 *     this.listeners.add(listener);
 *     return () => this.listeners.delete(listener);
 *   }
 *   // ... 8 more lines
 * }
 * 
 * // After: 1 line
 * class SessionService extends BaseService {
 *   private events = new EventEmitter<SessionEvent>({ serviceName: 'Session' });
 *   
 *   addListener(listener: SessionListener) {
 *     return this.events.subscribe(listener);
 *   }
 *   
 *   protected notifySessionChange(event: SessionEvent) {
 *     this.events.notify(event);
 *   }
 * }
 * ```
 */
export class EventEmitter<TEvent = unknown> {
  private listeners: Set<EventListener<TEvent>> = new Set();
  private listenerWarningLogged = false;
  private config: Required<EventEmitterConfig>;

  constructor(config: EventEmitterConfig = {}) {
    this.config = {
      maxListeners: config.maxListeners ?? 1000,
      debug: config.debug ?? false,
      serviceName: config.serviceName ?? 'EventEmitter',
    };
  }

  /**
   * Subscribe to events
   * 
   * Replaces duplicate subscribe() implementations in 6+ services
   * 
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  subscribe(listener: EventListener<TEvent>): UnsubscribeFunction {
    this.listeners.add(listener);
    this.checkListenerOverflow();
    
    if (this.config.debug) {
      console.log(
        `[${this.config.serviceName}] Listener added (total: ${this.listeners.size})`
      );
    }

    return () => this.removeListener(listener);
  }

  /**
   * Remove specific listener
   * 
   * Replaces duplicate removeListener() implementations
   */
  removeListener(listener: EventListener<TEvent>): void {
    this.listeners.delete(listener);
    
    if (this.config.debug) {
      console.log(
        `[${this.config.serviceName}] Listener removed (total: ${this.listeners.size})`
      );
    }
  }

  /**
   * Clear all listeners
   * 
   * Replaces duplicate clearAllListeners() implementations
   */
  clearAllListeners(): void {
    const count = this.listeners.size;
    this.listeners.clear();
    this.listenerWarningLogged = false;
    
    if (count > 0) {
      console.log(
        `[${this.config.serviceName}] Cleared ${count} listener(s)`
      );
    }
  }

  /**
   * Get listener count
   * 
   * Replaces duplicate getListenerCount() implementations
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Notify all listeners
   * 
   * Replaces duplicate notify() implementations with error handling
   */
  notify(event: TEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(
          `[${this.config.serviceName}] Error in event listener:`,
          error
        );
      }
    });
  }

  /**
   * Check for listener overflow and warn
   * 
   * Replaces duplicate overflow checking
   */
  private checkListenerOverflow(): void {
    if (
      this.listeners.size > this.config.maxListeners &&
      !this.listenerWarningLogged
    ) {
      console.warn(
        `[${this.config.serviceName}] Listener count exceeded ${this.config.maxListeners}. ` +
        `Possible memory leak. Current count: ${this.listeners.size}`
      );
      this.listenerWarningLogged = true;
    }
  }

  /**
   * Subscribe for single event only
   */
  once(listener: EventListener<TEvent>): UnsubscribeFunction {
    const unsubscribe = this.subscribe((event) => {
      unsubscribe();
      listener(event);
    });
    return unsubscribe;
  }

  /**
   * Check if has any listeners
   */
  hasListeners(): boolean {
    return this.listeners.size > 0;
  }
}

// ============================================================================
// TYPED EVENT EMITTER
// ============================================================================

/**
 * Typed event emitter for multiple event types
 * 
 * @example
 * ```typescript
 * interface WorkflowEvents {
 *   started: { workflowId: string };
 *   completed: { workflowId: string; result: unknown };
 *   failed: { workflowId: string; error: Error };
 * }
 * 
 * class WorkflowService {
 *   private events = new TypedEventEmitter<WorkflowEvents>();
 *   
 *   start(workflowId: string) {
 *     this.events.emit('started', { workflowId });
 *   }
 *   
 *   onStarted(listener: (data: { workflowId: string }) => void) {
 *     return this.events.on('started', listener);
 *   }
 * }
 * ```
 */
export class TypedEventEmitter<TEventMap extends Record<string, unknown>> {
  private emitters = new Map<keyof TEventMap, EventEmitter<unknown>>();
  
  constructor(private config: EventEmitterConfig = {}) {}

  /**
   * Get or create emitter for event type
   */
  private getEmitter<K extends keyof TEventMap>(
    eventType: K
  ): EventEmitter<TEventMap[K]> {
    if (!this.emitters.has(eventType)) {
      this.emitters.set(
        eventType,
        new EventEmitter({
          ...this.config,
          serviceName: `${this.config.serviceName}:${String(eventType)}`
        })
      );
    }
    return this.emitters.get(eventType) as EventEmitter<TEventMap[K]>;
  }

  /**
   * Emit typed event
   */
  emit<K extends keyof TEventMap>(eventType: K, data: TEventMap[K]): void {
    this.getEmitter(eventType).notify(data);
  }

  /**
   * Subscribe to typed event
   */
  on<K extends keyof TEventMap>(
    eventType: K,
    listener: EventListener<TEventMap[K]>
  ): UnsubscribeFunction {
    return this.getEmitter(eventType).subscribe(listener);
  }

  /**
   * Subscribe once to typed event
   */
  once<K extends keyof TEventMap>(
    eventType: K,
    listener: EventListener<TEventMap[K]>
  ): UnsubscribeFunction {
    return this.getEmitter(eventType).once(listener);
  }

  /**
   * Remove all listeners for all events
   */
  clearAll(): void {
    this.emitters.forEach(emitter => emitter.clearAllListeners());
    this.emitters.clear();
  }

  /**
   * Get total listener count across all events
   */
  getTotalListenerCount(): number {
    return Array.from(this.emitters.values())
      .reduce((sum, emitter) => sum + emitter.getListenerCount(), 0);
  }
}
