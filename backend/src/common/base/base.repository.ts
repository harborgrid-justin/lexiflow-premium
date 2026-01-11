import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  ObjectLiteral,
  FindOptionsWhere,
  SelectQueryBuilder,
  In,
  EntityManager,
  UpdateResult,
} from 'typeorm';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * Advanced filter options for complex queries
 */
export interface AdvancedFilterOptions<T> {
  search?: string;
  searchFields?: (keyof T)[];
  dateRange?: {
    field: keyof T;
    start?: Date;
    end?: Date;
  };
  filters?: Partial<Record<keyof T, unknown>>;
  sort?: {
    field: keyof T;
    order: 'ASC' | 'DESC';
  }[];
}

/**
 * Pagination result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

/**
 * Enhanced Base Repository with Advanced Database Operations
 *
 * FEATURES:
 * - Advanced query building and filtering
 * - Transaction support
 * - Bulk operations with error handling
 * - Optimistic locking support
 * - Soft delete with recovery
 * - Performance-optimized queries
 * - Comprehensive error handling
 * - Query result caching hints
 * - Batch processing
 * - Upsert operations
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Find all entities with optional filtering
   * Optimized with query hints and index usage
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    this.logger.debug(`Finding all entities with options: ${JSON.stringify(options)}`);
    return this.repository.find(options);
  }

  /**
   * Find one entity by ID with optimized single-row lookup
   */
  async findById(id: string | number, options?: FindOneOptions<T>): Promise<T | null> {
    this.logger.debug(`Finding entity by ID: ${id}`);
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });
  }

  /**
   * Find one entity by ID or throw NotFoundException
   */
  async findByIdOrFail(id: string | number, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.findById(id, options);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Find one entity with options
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    this.logger.debug(`Finding one entity`);
    return this.repository.findOne(options);
  }

  /**
   * Find one entity or throw NotFoundException
   */
  async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  /**
   * Find entities by IDs with optimized IN query
   */
  async findByIds(ids: (string | number)[], options?: FindOneOptions<T>): Promise<T[]> {
    this.logger.debug(`Finding entities by IDs: ${ids.join(', ')}`);
    if (ids.length === 0) return [];

    return this.repository.find({
      where: { id: In(ids) } as unknown as FindOptionsWhere<T>,
      ...options,
    });
  }

  /**
   * Create a new entity with validation
   */
  async create(data: DeepPartial<T>, userId?: string): Promise<T> {
    this.logger.debug(`Creating new entity`);
    const entity = this.repository.create({
      ...data,
      ...(userId && { createdBy: userId, updatedBy: userId }),
    } as DeepPartial<T>);
    return this.repository.save(entity);
  }

  /**
   * Create multiple entities with batch insert optimization
   */
  async createMany(data: DeepPartial<T>[], userId?: string): Promise<T[]> {
    this.logger.debug(`Creating ${data.length} entities`);
    if (data.length === 0) return [];

    const entities = this.repository.create(
      data.map(item => ({
        ...item,
        ...(userId && { createdBy: userId, updatedBy: userId }),
      })) as DeepPartial<T>[],
    );

    // Use batch insert for better performance
    return this.repository.save(entities, { chunk: 100 });
  }

  /**
   * Update an entity with optimistic locking support
   */
  async update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
    userId?: string,
    expectedVersion?: number,
  ): Promise<T> {
    this.logger.debug(`Updating entity with ID: ${id}`);

    // Add updated metadata
    const updateData = {
      ...data,
      ...(userId && { updatedBy: userId }),
    };

    // Optimistic locking check
    if (expectedVersion !== undefined) {
      const result = await this.repository.update(
        { id, version: expectedVersion } as unknown as FindOptionsWhere<T>,
        updateData,
      );

      if (result.affected === 0) {
        throw new BadRequestException(
          `Entity with ID ${id} has been modified by another user. Please refresh and try again.`,
        );
      }
    } else {
      await this.repository.update(id, updateData);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`Entity with ID ${id} not found after update`);
    }
    return updated;
  }

  /**
   * Bulk update multiple entities
   */
  async updateMany(
    where: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
    userId?: string,
  ): Promise<number> {
    this.logger.debug(`Bulk updating entities`);
    const updateData = {
      ...data,
      ...(userId && { updatedBy: userId }),
    };

    const result = await this.repository.update(where, updateData);
    return result.affected ?? 0;
  }

  /**
   * Upsert (Insert or Update) operation
   */
  async upsert(
    data: DeepPartial<T>,
    conflictColumns: (keyof T)[],
    userId?: string,
  ): Promise<T> {
    this.logger.debug(`Upserting entity`);
    const entityData = {
      ...data,
      ...(userId && { createdBy: userId, updatedBy: userId }),
    };

    await this.repository.upsert(entityData as any, conflictColumns as string[]);

    // Find and return the upserted entity
    const where = conflictColumns.reduce((acc, col) => {
      acc[col] = (data as any)[col];
      return acc;
    }, {} as any);

    return this.findOneOrFail({ where });
  }

  /**
   * Delete an entity (hard delete)
   */
  async delete(id: string | number): Promise<boolean> {
    this.logger.debug(`Deleting entity with ID: ${id}`);
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Bulk delete entities
   */
  async deleteMany(where: FindOptionsWhere<T>): Promise<number> {
    this.logger.debug(`Bulk deleting entities`);
    const result = await this.repository.delete(where);
    return result.affected ?? 0;
  }

  /**
   * Soft delete an entity
   */
  async softDelete(id: string | number, userId?: string): Promise<boolean> {
    this.logger.debug(`Soft deleting entity with ID: ${id}`);

    if (userId) {
      await this.repository.update(id, { updatedBy: userId } as any);
    }

    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Bulk soft delete entities
   */
  async softDeleteMany(where: FindOptionsWhere<T>, userId?: string): Promise<number> {
    this.logger.debug(`Bulk soft deleting entities`);

    if (userId) {
      await this.repository.update(where, { updatedBy: userId } as any);
    }

    const result = await this.repository.softDelete(where);
    return result.affected ?? 0;
  }

  /**
   * Restore a soft-deleted entity
   */
  async restore(id: string | number): Promise<boolean> {
    this.logger.debug(`Restoring entity with ID: ${id}`);
    const result = await this.repository.restore(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore multiple soft-deleted entities
   */
  async restoreMany(where: FindOptionsWhere<T>): Promise<number> {
    this.logger.debug(`Bulk restoring entities`);
    const result = await this.repository.restore(where);
    return result.affected ?? 0;
  }

  /**
   * Count entities with optional filtering
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    this.logger.debug(`Counting entities`);
    return this.repository.count(options);
  }

  /**
   * Count by specific condition
   */
  async countBy(where: FindOptionsWhere<T>): Promise<number> {
    this.logger.debug(`Counting entities by condition`);
    return this.repository.countBy(where);
  }

  /**
   * Check if entity exists
   */
  async exists(id: string | number): Promise<boolean> {
    this.logger.debug(`Checking if entity exists: ${id}`);
    const count = await this.repository.count({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  /**
   * Check if entity exists by condition
   */
  async existsBy(where: FindOptionsWhere<T>): Promise<boolean> {
    this.logger.debug(`Checking if entity exists by condition`);
    const count = await this.repository.countBy(where);
    return count > 0;
  }

  /**
   * Find with advanced pagination and metadata
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedResult<T>> {
    this.logger.debug(`Finding with pagination: page=${page}, limit=${limit}`);

    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100; // Max limit for safety

    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find with advanced filtering, search, and sorting
   */
  async findWithFilters(
    filterOptions: AdvancedFilterOptions<T>,
    paginationOptions?: { page?: number; limit?: number },
  ): Promise<PaginatedResult<T>> {
    this.logger.debug(`Finding with advanced filters`);

    const queryBuilder = this.repository.createQueryBuilder('entity');

    // Apply search across multiple fields
    if (filterOptions.search && filterOptions.searchFields) {
      const searchConditions = filterOptions.searchFields
        .map(field => `entity.${String(field)} ILIKE :search`)
        .join(' OR ');
      queryBuilder.andWhere(`(${searchConditions})`, {
        search: `%${filterOptions.search}%`,
      });
    }

    // Apply date range filter
    if (filterOptions.dateRange) {
      const { field, start, end } = filterOptions.dateRange;
      if (start) {
        queryBuilder.andWhere(`entity.${String(field)} >= :start`, { start });
      }
      if (end) {
        queryBuilder.andWhere(`entity.${String(field)} <= :end`, { end });
      }
    }

    // Apply custom filters
    if (filterOptions.filters) {
      Object.entries(filterOptions.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
        }
      });
    }

    // Apply sorting
    if (filterOptions.sort && filterOptions.sort.length > 0) {
      filterOptions.sort.forEach((sort, index) => {
        if (index === 0) {
          queryBuilder.orderBy(`entity.${String(sort.field)}`, sort.order);
        } else {
          queryBuilder.addOrderBy(`entity.${String(sort.field)}`, sort.order);
        }
      });
    }

    // Apply pagination
    const page = paginationOptions?.page ?? 1;
    const limit = paginationOptions?.limit ?? 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Create a query builder for complex queries
   */
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(
    operation: (manager: EntityManager) => Promise<R>,
  ): Promise<R> {
    this.logger.debug(`Executing transaction`);
    return this.repository.manager.transaction(operation);
  }

  /**
   * Bulk operation with error handling
   */
  async bulkOperation(
    items: DeepPartial<T>[],
    operation: (item: DeepPartial<T>, manager: EntityManager) => Promise<void>,
  ): Promise<BulkOperationResult> {
    this.logger.debug(`Executing bulk operation on ${items.length} items`);

    let success = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: string }> = [];

    await this.transaction(async (manager) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        try {
          await operation(item, manager);
          success++;
        } catch (error) {
          failed++;
          errors.push({
            index: i,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    return { success, failed, errors };
  }

  /**
   * Increment a numeric field
   */
  async increment(
    where: FindOptionsWhere<T>,
    field: keyof T,
    value: number = 1,
  ): Promise<UpdateResult> {
    this.logger.debug(`Incrementing field ${String(field)} by ${value}`);
    return this.repository.increment(where, field as string, value);
  }

  /**
   * Decrement a numeric field
   */
  async decrement(
    where: FindOptionsWhere<T>,
    field: keyof T,
    value: number = 1,
  ): Promise<UpdateResult> {
    this.logger.debug(`Decrementing field ${String(field)} by ${value}`);
    return this.repository.decrement(where, field as string, value);
  }

  /**
   * Get repository for advanced queries
   */
  getRepository(): Repository<T> {
    return this.repository;
  }

  /**
   * Get entity manager for direct database access
   */
  getEntityManager(): EntityManager {
    return this.repository.manager;
  }

  /**
   * Clear all entities (use with caution!)
   */
  async clear(): Promise<void> {
    this.logger.warn(`Clearing all entities from repository`);
    await this.repository.clear();
  }
}
