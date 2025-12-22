import { Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EventBusService, DomainEvent } from '../services/event-bus.service';

import { ObjectLiteral } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral, R extends BaseRepository<T>> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: R,
    protected readonly eventBus: EventBusService,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Find all entities
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.findAll(options);
  }

  /**
   * Find entity by ID
   */
  async findById(id: string | number, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findById(id, options);
    
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    
    return entity;
  }

  /**
   * Find one entity
   */
  async findOne(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    
    if (!entity) {
      throw new NotFoundException(`Entity not found`);
    }
    
    return entity;
  }

  /**
   * Create a new entity
   */
  async create(data: DeepPartial<T>, eventType?: string): Promise<T> {
    const entity = await this.repository.create(data);

    if (eventType) {
      await this.publishEvent(eventType, entity as Partial<T> & { id?: string | number });
    }

    return entity;
  }

  /**
   * Create multiple entities
   */
  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.repository.createMany(data);
  }

  /**
   * Update an entity
   */
  async update(
    id: string | number,
    data: QueryDeepPartialEntity<T>,
    eventType?: string,
  ): Promise<T> {
    const entity = await this.repository.update(id, data);

    if (eventType) {
      await this.publishEvent(eventType, entity as Partial<T> & { id?: string | number });
    }

    return entity;
  }

  /**
   * Delete an entity
   */
  async delete(id: string | number, eventType?: string): Promise<boolean> {
    const result = await this.repository.delete(id);

    if (result && eventType) {
      await this.publishEvent(eventType, { id } as Partial<T> & { id: string | number });
    }

    return result;
  }

  /**
   * Soft delete an entity
   */
  async softDelete(id: string | number): Promise<boolean> {
    return this.repository.softDelete(id);
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  /**
   * Check if entity exists
   */
  async exists(id: string | number): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * Find with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<T>,
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.repository.findWithPagination(page, limit, options);
  }

  /**
   * Publish domain event
   */
  protected async publishEvent(eventType: string, data: Partial<T> & { id?: string | number }): Promise<void> {
    const event: DomainEvent = {
      eventType,
      aggregateId: String(data.id || 'unknown'),
      aggregateType: this.constructor.name.replace('Service', ''),
      timestamp: new Date(),
      data,
    };

    await this.eventBus.publish(event);
  }
}
