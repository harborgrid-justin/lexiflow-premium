/**
 * EventEmitter - A lightweight publish/subscribe event system
 *
 * Provides a type-safe way to implement the observer pattern for
 * component communication without tight coupling.
 *
 * Usage:
 * ```typescript
 * const emitter = new EventEmitter<User>();
 *
 * // Subscribe to events
 * const unsubscribe = emitter.subscribe((user) => {
 *   console.log('User updated:', user);
 * });
 *
 * // Emit events
 * emitter.emit(updatedUser);
 *
 * // Unsubscribe
 * unsubscribe();
 * ```
 */
export class EventEmitter<T> {
  private listeners: Set<(data: T) => void> = new Set();

  /**
   * Subscribe to events.
   *
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  subscribe(listener: (data: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param data - Data to send to all listeners
   */
  emit(data: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Remove all listeners.
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get the number of active listeners.
   */
  get listenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Check if there are any listeners.
   */
  get hasListeners(): boolean {
    return this.listeners.size > 0;
  }
}

/**
 * TypedEventEmitter - An event emitter with multiple named event types
 *
 * Provides a type-safe way to handle multiple event types with different
 * payload types in a single emitter.
 *
 * Usage:
 * ```typescript
 * type Events = {
 *   'user:updated': User;
 *   'user:deleted': string;
 *   'user:created': User;
 * };
 *
 * const emitter = new TypedEventEmitter<Events>();
 *
 * emitter.on('user:updated', (user) => {
 *   console.log('User updated:', user);
 * });
 *
 * emitter.emit('user:updated', updatedUser);
 * ```
 */
export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private listeners: Map<keyof TEvents, Set<(data: unknown) => void>> = new Map();

  /**
   * Subscribe to a specific event type.
   *
   * @param event - Event name
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  on<K extends keyof TEvents>(
    event: K,
    listener: (data: TEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Subscribe to an event that will only be called once.
   *
   * @param event - Event name
   * @param listener - Callback function to invoke when event is emitted
   * @returns Unsubscribe function
   */
  once<K extends keyof TEvents>(
    event: K,
    listener: (data: TEvents[K]) => void
  ): () => void {
    const wrappedListener = (data: TEvents[K]) => {
      unsubscribe();
      listener(data);
    };
    const unsubscribe = this.on(event, wrappedListener);
    return unsubscribe;
  }

  /**
   * Emit an event to all subscribers of that event type.
   *
   * @param event - Event name
   * @param data - Data to send to all listeners
   */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    eventListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for a specific event, or all events if no event specified.
   *
   * @param event - Optional event name to clear listeners for
   */
  off<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for a specific event.
   *
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Get all event names that have listeners.
   */
  get eventNames(): (keyof TEvents)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get total number of listeners across all events.
   */
  get totalListenerCount(): number {
    let count = 0;
    this.listeners.forEach(set => {
      count += set.size;
    });
    return count;
  }
}

/**
 * Create a simple event emitter for a specific type.
 *
 * @example
 * ```typescript
 * const userEmitter = createEventEmitter<User>();
 *
 * userEmitter.subscribe((user) => console.log(user));
 * userEmitter.emit(user);
 * ```
 */
export function createEventEmitter<T>(): EventEmitter<T> {
  return new EventEmitter<T>();
}

/**
 * Create a typed event emitter with multiple event types.
 *
 * @example
 * ```typescript
 * type Events = {
 *   'data:updated': DataType;
 *   'data:deleted': string;
 * };
 *
 * const emitter = createTypedEventEmitter<Events>();
 * ```
 */
export function createTypedEventEmitter<
  TEvents extends Record<string, any>
>(): TypedEventEmitter<TEvents> {
  return new TypedEventEmitter<TEvents>();
}
