import { Repository, FindManyOptions, FindOneOptions, DeepPartial, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { Logger } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    this.logger.debug(`Finding all entities with options: ${JSON.stringify(options)}`);
    return this.repository.find(options);
  }

  /**
   * Find one entity by ID
   */
  async findById(id: string | number, options?: FindOneOptions<T>): Promise<T | null> {
    this.logger.debug(`Finding entity by ID: ${id}`);
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });
  }

  /**
   * Find one entity with options
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    this.logger.debug(`Finding one entity`);
    return this.repository.findOne(options);
  }

  /**
   * Create a new entity
   */
  async create(data: DeepPartial<T>): Promise<T> {
    this.logger.debug(`Creating new entity`);
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Create multiple entities
   */
  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    this.logger.debug(`Creating ${data.length} entities`);
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  /**
   * Update an entity
   */
  async update(id: string | number, data: QueryDeepPartialEntity<T>): Promise<T> {
    this.logger.debug(`Updating entity with ID: ${id}`);
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Entity with ID ${id} not found after update`);
    }
    return updated;
  }

  /**
   * Delete an entity
   */
  async delete(id: string | number): Promise<boolean> {
    this.logger.debug(`Deleting entity with ID: ${id}`);
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Soft delete an entity (if supported)
   */
  async softDelete(id: string | number): Promise<boolean> {
    this.logger.debug(`Soft deleting entity with ID: ${id}`);
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    this.logger.debug(`Counting entities`);
    return this.repository.count(options);
  }

  /**
   * Check if entity exists
   */
  async exists(id: string | number): Promise<boolean> {
    this.logger.debug(`Checking if entity exists: ${id}`);
    const count = await this.repository.count({ where: { id } as unknown as FindOptionsWhere<T> });
    return count > 0;
  }

  /**
   * Find with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<T>,
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.debug(`Finding with pagination: page=${page}, limit=${limit}`);
    
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
    };
  }

  /**
   * Get repository for advanced queries
   */
  getRepository(): Repository<T> {
    return this.repository;
  }
}
