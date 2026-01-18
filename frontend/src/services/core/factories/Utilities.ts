/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    UTILITY FACTORIES                                      ║
 * ║           Eliminates 60+ duplicate utility lines                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/Utilities
 * @description Common utility factories for ID generation, timers, and storage
 * 
 * ELIMINATES DUPLICATES IN:
 * - Timer management (15+ setTimeout/setInterval patterns)
 * - ID generation (4+ UUID generation patterns)
 * - localStorage access (12+ storage patterns)
 */

// ============================================================================
// ID GENERATOR FACTORY
// ============================================================================

/**
 * Generate unique IDs
 * 
 * Eliminates 4+ duplicate ID generation patterns
 * 
 * @example
 * ```typescript
 * const idGen = new IdGenerator('case');
 * const id1 = idGen.next(); // "case_1234567890_abc"
 * const id2 = idGen.uuid(); // "case_550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export class IdGenerator {
  private counter = 0;

  constructor(private prefix?: string) {}

  /**
   * Generate sequential ID
   */
  next(): string {
    this.counter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 5);
    const parts = [timestamp, this.counter, random];
    
    if (this.prefix) {
      parts.unshift(this.prefix);
    }
    
    return parts.join('_');
  }

  /**
   * Generate UUID v4
   */
  uuid(): string {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    
    return this.prefix ? `${this.prefix}_${uuid}` : uuid;
  }

  /**
   * Generate short ID (8 chars)
   */
  short(): string {
    const random = Math.random().toString(36).substring(2, 10);
    return this.prefix ? `${this.prefix}_${random}` : random;
  }
}

// ============================================================================
// TIMER MANAGER FACTORY
// ============================================================================

/**
 * Manage timers with automatic cleanup
 * 
 * Eliminates 15+ duplicate setTimeout/setInterval patterns
 * 
 * @example
 * ```typescript
 * const timers = new TimerManager();
 * 
 * // Auto-cleaning timers
 * timers.setTimeout(() => console.log('tick'), 1000);
 * timers.setInterval(() => console.log('tick'), 1000);
 * 
 * // Clear all on cleanup
 * timers.clearAll();
 * ```
 */
export class TimerManager {
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();

  /**
   * Set timeout with auto-tracking
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Set interval with auto-tracking
   */
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Clear specific timeout
   */
  clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  /**
   * Clear specific interval
   */
  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  /**
   * Clear all timers
   */
  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timeouts.clear();
    this.intervals.clear();
  }

  /**
   * Get active timer counts
   */
  getCounts(): { timeouts: number; intervals: number } {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
    };
  }
}

// ============================================================================
// STORAGE PERSISTENCE FACTORY
// ============================================================================

/**
 * Type-safe localStorage wrapper
 * 
 * Eliminates 12+ duplicate localStorage patterns
 * 
 * @example
 * ```typescript
 * const storage = new StoragePersistence<UserPrefs>('user_prefs');
 * 
 * storage.set({ theme: 'dark', language: 'en' });
 * const prefs = storage.get(); // Type-safe
 * storage.clear();
 * ```
 */
export class StoragePersistence<T> {
  constructor(
    private key: string,
    private storage: Storage = localStorage
  ) {}

  /**
   * Get value from storage
   */
  get(): T | null {
    try {
      const item = this.storage.getItem(this.key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`[Storage] Error reading ${this.key}:`, error);
      return null;
    }
  }

  /**
   * Set value in storage
   */
  set(value: T): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Storage] Error writing ${this.key}:`, error);
    }
  }

  /**
   * Update partial value
   */
  update(partial: Partial<T>): void {
    const current = this.get();
    if (current && typeof current === 'object') {
      this.set({ ...current, ...partial });
    }
  }

  /**
   * Remove from storage
   */
  remove(): void {
    this.storage.removeItem(this.key);
  }

  /**
   * Check if key exists
   */
  has(): boolean {
    return this.storage.getItem(this.key) !== null;
  }

  /**
   * Get with default value
   */
  getOrDefault(defaultValue: T): T {
    return this.get() ?? defaultValue;
  }

  /**
   * Clear storage
   */
  clear(): void {
    this.remove();
  }
}

// ============================================================================
// DEBOUNCE FACTORY
// ============================================================================

/**
 * Create debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching:', query);
 * }, 300);
 * 
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this fires after 300ms
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// ============================================================================
// THROTTLE FACTORY
// ============================================================================

/**
 * Create throttled function
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle((e: Event) => {
 *   console.log('Scroll event');
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// ============================================================================
// RETRY FACTORY
// ============================================================================

/**
 * Retry async operation with exponential backoff
 * 
 * @example
 * ```typescript
 * const data = await retry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
