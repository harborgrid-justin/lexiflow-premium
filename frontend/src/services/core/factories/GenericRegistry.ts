/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    GENERIC REGISTRY FACTORY                               ║
 * ║           Eliminates 60+ duplicate registry management lines              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/GenericRegistry
 * @description Generic registry pattern for managing service/repository instances
 * 
 * ELIMINATES DUPLICATES IN:
 * - ServiceRegistry.ts (415-471)
 * - RepositoryRegistry.ts (24-80)
 * 
 * DUPLICATE PATTERNS ELIMINATED:
 * - Service registration (2 registries × 25 lines)
 * - Instance retrieval (2 registries)
 * - Singleton pattern (2 registries)
 * - Registry initialization (2 registries)
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Factory function for creating instances
 */
export type FactoryFunction<T> = () => T;

/**
 * Registry configuration
 */
export interface RegistryConfig {
  /** Registry name for logging */
  name?: string;
  /** Enable lazy instantiation */
  lazy?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// GENERIC REGISTRY
// ============================================================================

/**
 * Generic registry for managing instances.
 * 
 * Eliminates 60+ duplicate registry lines.
 * 
 * @example
 * ```typescript
 * // Before: 25+ duplicate lines per registry
 * class ServiceRegistry {
 *   private services: Map<string, BaseService> = new Map();
 *   
 *   register(name: string, factory: () => BaseService) {
 *     this.services.set(name, factory());
 *   }
 *   
 *   get(name: string): BaseService | undefined {
 *     return this.services.get(name);
 *   }
 *   // ... 15+ more lines
 * }
 * 
 * // After: 1 line
 * const serviceRegistry = new GenericRegistry<BaseService>({ name: 'Service' });
 * ```
 */
export class GenericRegistry<T> {
  private instances: Map<string, T> = new Map();
  private factories: Map<string, FactoryFunction<T>> = new Map();
  private config: Required<RegistryConfig>;

  constructor(config: RegistryConfig = {}) {
    this.config = {
      name: config.name ?? 'Registry',
      lazy: config.lazy ?? false,
      debug: config.debug ?? false,
    };
  }

  // ============================================================================
  // REGISTRATION (eliminates duplicate registration logic)
  // ============================================================================

  /**
   * Register instance or factory
   * 
   * Replaces duplicate registration in 2+ registries
   * 
   * @param key - Unique key for instance
   * @param instanceOrFactory - Instance or factory function
   */
  register(key: string, instanceOrFactory: T | FactoryFunction<T>): void {
    if (typeof instanceOrFactory === 'function') {
      // Register factory
      this.factories.set(key, instanceOrFactory as FactoryFunction<T>);
      
      // Eager instantiation if not lazy
      if (!this.config.lazy) {
        this.instances.set(key, (instanceOrFactory as FactoryFunction<T>)());
      }
    } else {
      // Register instance directly
      this.instances.set(key, instanceOrFactory);
    }

    if (this.config.debug) {
      console.log(
        `[${this.config.name}Registry] Registered: ${key} ` +
        `(${typeof instanceOrFactory === 'function' ? 'factory' : 'instance'})`
      );
    }
  }

  /**
   * Register multiple instances at once
   */
  registerMany(entries: Record<string, T | FactoryFunction<T>>): void {
    Object.entries(entries).forEach(([key, value]) => {
      this.register(key, value);
    });
  }

  // ============================================================================
  // RETRIEVAL (eliminates duplicate get logic)
  // ============================================================================

  /**
   * Get instance by key
   * 
   * Replaces duplicate get() implementations
   * 
   * @param key - Instance key
   * @returns Instance or undefined if not found
   */
  get(key: string): T | undefined {
    // Check if already instantiated
    let instance = this.instances.get(key);
    
    // Lazy instantiation if factory exists
    if (!instance && this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      instance = factory();
      this.instances.set(key, instance);
      
      if (this.config.debug) {
        console.log(`[${this.config.name}Registry] Lazy instantiated: ${key}`);
      }
    }

    return instance;
  }

  /**
   * Get instance or throw if not found
   * 
   * @param key - Instance key
   * @returns Instance (never undefined)
   * @throws Error if instance not found
   */
  getRequired(key: string): T {
    const instance = this.get(key);
    if (!instance) {
      throw new Error(
        `[${this.config.name}Registry] Instance not found: ${key}`
      );
    }
    return instance;
  }

  /**
   * Get all instances
   */
  getAll(): Map<string, T> {
    // Instantiate all lazy factories
    if (this.config.lazy) {
      this.factories.forEach((factory, key) => {
        if (!this.instances.has(key)) {
          this.instances.set(key, factory());
        }
      });
    }
    return new Map(this.instances);
  }

  // ============================================================================
  // MANAGEMENT
  // ============================================================================

  /**
   * Check if key is registered
   */
  has(key: string): boolean {
    return this.instances.has(key) || this.factories.has(key);
  }

  /**
   * Unregister instance
   */
  unregister(key: string): boolean {
    const hadInstance = this.instances.delete(key);
    const hadFactory = this.factories.delete(key);
    
    if ((hadInstance || hadFactory) && this.config.debug) {
      console.log(`[${this.config.name}Registry] Unregistered: ${key}`);
    }
    
    return hadInstance || hadFactory;
  }

  /**
   * Clear all instances
   */
  clear(): void {
    const count = this.instances.size + this.factories.size;
    this.instances.clear();
    this.factories.clear();
    
    if (count > 0) {
      console.log(
        `[${this.config.name}Registry] Cleared ${count} registrations`
      );
    }
  }

  /**
   * Get all registered keys
   */
  keys(): string[] {
    return Array.from(
      new Set([...this.instances.keys(), ...this.factories.keys()])
    );
  }

  /**
   * Get count
   */
  get size(): number {
    return new Set([...this.instances.keys(), ...this.factories.keys()]).size;
  }

  /**
   * Get instantiated count
   */
  get instantiatedSize(): number {
    return this.instances.size;
  }
}

// ============================================================================
// SINGLETON REGISTRY HELPER
// ============================================================================

/**
 * Create singleton registry accessor
 * 
 * Eliminates duplicate singleton pattern implementations
 * 
 * @example
 * ```typescript
 * export const ServiceRegistry = createSingletonRegistry<BaseService>({
 *   name: 'Service'
 * });
 * 
 * // Usage
 * ServiceRegistry.register('auth', authService);
 * const auth = ServiceRegistry.get('auth');
 * ```
 */
export function createSingletonRegistry<T>(
  config?: RegistryConfig
): GenericRegistry<T> {
  let instance: GenericRegistry<T> | null = null;
  
  return new Proxy({} as GenericRegistry<T>, {
    get(target, prop) {
      if (!instance) {
        instance = new GenericRegistry<T>(config);
      }
      return (instance as any)[prop];
    }
  });
}
