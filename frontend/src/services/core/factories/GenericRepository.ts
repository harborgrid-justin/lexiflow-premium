/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    GENERIC REPOSITORY FACTORY                             ║
 * ║           Eliminates 100+ duplicate CRUD implementations                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/core/factories/GenericRepository
 * @description Base repository class providing common CRUD operations
 * 
 * ELIMINATES DUPLICATES IN:
 * - ClientRepository, UserRepository, DocumentRepository, TaskRepository,
 * - WitnessRepository, MatterRepository, EntityRepository, MotionRepository,
 * - TemplateRepository, CitationRepository, PleadingRepository, EvidenceRepository
 * - ... and 8+ more repositories
 *
 * DUPLICATE PATTERNS ELIMINATED:
 * - getAll() implementation (20+ repos)
 * - getById() implementation (20+ repos)
 * - add() implementation (20+ repos)
 * - update() implementation (20+ repos)
 * - delete() implementation (20+ repos)
 * - ID validation (18+ repos)
 * - Error handling (100+ console.error calls)
 */

import { ValidationError } from '../errors';
import { Repository } from '../Repository';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Base entity with required ID field
 */
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API service interface that all domain APIs must implement
 */
export interface IApiService<T extends BaseEntity> {
  getAll(options?: Record<string, unknown>): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ============================================================================
// GENERIC REPOSITORY
// ============================================================================

/**
 * Generic repository providing standard CRUD operations.
 * 
 * Eliminates code duplication across 20+ domain repositories.
 * 
 * @example
 * ```typescript
 * export class ClientRepository extends GenericRepository<Client> {
 *   constructor() {
 *     super('clients', new ClientApiService());
 *   }
 *   
 *   // Only add custom methods, CRUD is inherited
 *   async getByType(type: string): Promise<Client[]> {
 *     return this.getAll({ type });
 *   }
 * }
 * ```
 */
export abstract class GenericRepository<T extends BaseEntity> extends Repository<T> {
  protected abstract apiService: IApiService<T>;
  protected abstract repositoryName: string;

  /**
   * Execute operation with standardized error handling
   */
  protected async executeWithErrorHandling<R>(
    operation: () => Promise<R>,
    methodName: string
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      console.error(`[${this.repositoryName}.${methodName}] Error:`, error);
      throw error;
    }
  }

  /**
   * Validate ID parameter (eliminates 18+ duplicate implementations)
   */
  protected validateIdParameter(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new ValidationError(
        `[${this.repositoryName}.${methodName}] Invalid id parameter`
      );
    }
  }

  /**
   * Validate item data
   */
  protected validateItemData<D>(
    item: D,
    methodName: string
  ): void {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(
        `[${this.repositoryName}.${methodName}] Invalid item data`
      );
    }
  }

  // ============================================================================
  // CRUD OPERATIONS (eliminates 100+ duplicate implementations)
  // ============================================================================

  /**
   * Get all items
   * 
   * Replaces duplicate implementations in 20+ repositories
   */
  override async getAll(options?: Record<string, unknown>): Promise<T[]> {
    return this.executeWithErrorHandling(
      () => this.apiService.getAll(options),
      'getAll'
    );
  }

  /**
   * Get item by ID
   * 
   * Replaces duplicate implementations in 20+ repositories
   */
  override async getById(id: string): Promise<T | undefined> {
    this.validateIdParameter(id, 'getById');
    return this.executeWithErrorHandling(
      () => this.apiService.getById(id),
      'getById'
    );
  }

  /**
   * Add new item
   * 
   * Replaces duplicate implementations in 20+ repositories
   */
  override async add(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    this.validateItemData(item, 'add');
    return this.executeWithErrorHandling(
      () => this.apiService.create(item),
      'add'
    );
  }

  /**
   * Update existing item
   * 
   * Replaces duplicate implementations in 20+ repositories
   */
  override async update(id: string, updates: Partial<T>): Promise<T> {
    this.validateIdParameter(id, 'update');
    this.validateItemData(updates, 'update');
    return this.executeWithErrorHandling(
      () => this.apiService.update(id, updates),
      'update'
    );
  }

  /**
   * Delete item by ID
   * 
   * Replaces duplicate implementations in 20+ repositories
   */
  override async delete(id: string): Promise<void> {
    this.validateIdParameter(id, 'delete');
    return this.executeWithErrorHandling(
      () => this.apiService.delete(id),
      'delete'
    );
  }

  /**
   * Search items (optional - override in subclass if needed)
   */
  async search(query: string, searchFields: (keyof T)[]): Promise<T[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    try {
      const allItems = await this.getAll();
      const lowerQuery = query.toLowerCase();
      
      return allItems.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(lowerQuery);
        })
      );
    } catch (error) {
      console.error(`[${this.repositoryName}.search] Error:`, error);
      throw error;
    }
  }
}

// ============================================================================
// HELPER: Query Keys Factory (eliminates 17+ duplicate query key objects)
// ============================================================================

/**
 * Create standardized query keys for a domain entity.
 * 
 * Eliminates 17+ duplicate query key definitions.
 * 
 * @example
 * ```typescript
 * export const CLIENT_QUERY_KEYS = createQueryKeys('clients');
 * 
 * // Usage:
 * CLIENT_QUERY_KEYS.all() // ['clients']
 * CLIENT_QUERY_KEYS.byId('123') // ['clients', '123']
 * CLIENT_QUERY_KEYS.byField('type', 'corporate') // ['clients', 'type', 'corporate']
 * ```
 */
export function createQueryKeys<T extends string>(entityName: T) {
  return {
    all: () => [entityName] as const,
    byId: (id: string) => [entityName, id] as const,
    byField: (fieldName: string, value: string) => 
      [entityName, fieldName, value] as const,
    byRelation: (relation: string, id: string) => 
      [entityName, relation, id] as const,
    search: (query: string) => [entityName, 'search', query] as const,
  } as const;
}
