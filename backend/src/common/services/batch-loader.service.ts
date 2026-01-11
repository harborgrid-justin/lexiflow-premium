import { Injectable, Logger } from '@nestjs/common';
import { Repository, In, ObjectLiteral } from 'typeorm';

/**
 * Batch Loader Service
 * Prevents N+1 query problems in REST endpoints
 *
 * Features:
 * - Automatic batching of entity lookups
 * - In-memory caching for request scope
 * - Support for any entity type
 * - Configurable batch size
 *
 * Usage:
 * Instead of:
 *   for (const item of items) {
 *     item.user = await userRepo.findOne({ where: { id: item.userId } });
 *   }
 *
 * Use:
 *   const userIds = items.map(i => i.userId);
 *   const users = await batchLoader.loadMany(userRepo, userIds);
 *   items.forEach(item => item.user = users.get(item.userId));
 */
/**
 * ╔=================================================================================================================╗
 * ║BATCHLOADER                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class BatchLoaderService {
  private readonly logger = new Logger(BatchLoaderService.name);
  private readonly DEFAULT_BATCH_SIZE = 1000;

  /**
   * Load multiple entities by IDs in a single query
   * Returns a Map for O(1) lookup
   */
  async loadMany<T extends ObjectLiteral>(
    repository: Repository<T>,
    ids: unknown[],
    options: {
      batchSize?: number;
      relations?: string[];
      cache?: boolean;
    } = {},
  ): Promise<Map<unknown, T>> {
    if (ids.length === 0) {
      return new Map();
    }

    // Remove duplicates
    const uniqueIds = [...new Set(ids.filter((id) => id != null))];

    if (uniqueIds.length === 0) {
      return new Map();
    }

    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const allEntities: T[] = [];

    // Process in batches to avoid query size limits
    for (let i = 0; i < uniqueIds.length; i += batchSize) {
      const batch = uniqueIds.slice(i, i + batchSize);

      const findOptions: unknown = {
        where: { id: In(batch) },
      };

      if (options.relations) {
        findOptions.relations = options.relations;
      }

      if (options.cache) {
        findOptions.cache = 60000; // 1 minute
      }

      const entities = await repository.find(findOptions);
      allEntities.push(...entities);
    }

    // Create map for efficient lookup
    const entityMap = new Map<unknown, T>();
    allEntities.forEach((entity: unknown) => {
      const ent = entity as any;
      entityMap.set(ent.id, entity as T);
    });

    this.logger.debug(
      `Batch loaded ${allEntities.length}/${uniqueIds.length} entities from ${repository.metadata.name}`,
    );

    return entityMap;
  }

  /**
   * Load entities by a specific field (not just ID)
   */
  async loadManyByField<T extends ObjectLiteral>(
    repository: Repository<T>,
    fieldName: string,
    values: unknown[],
    options: {
      batchSize?: number;
      relations?: string[];
      cache?: boolean;
    } = {},
  ): Promise<Map<unknown, T[]>> {
    if (values.length === 0) {
      return new Map();
    }

    const uniqueValues = [...new Set(values.filter((v) => v != null))];

    if (uniqueValues.length === 0) {
      return new Map();
    }

    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const allEntities: T[] = [];

    for (let i = 0; i < uniqueValues.length; i += batchSize) {
      const batch = uniqueValues.slice(i, i + batchSize);

      const queryBuilder = repository.createQueryBuilder('entity');

      queryBuilder.where(`entity.${fieldName} IN (:...values)`, {
        values: batch,
      });

      if (options.relations) {
        options.relations.forEach((relation) => {
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }

      if (options.cache) {
        queryBuilder.cache(60000); // 1 minute
      }

      const entities = await queryBuilder.getMany();
      allEntities.push(...entities);
    }

    // Group by field value
    const entityMap = new Map<unknown, T[]>();
    allEntities.forEach((entity: unknown) => {
      const ent = entity as any;
      const key = ent[fieldName];
      if (!entityMap.has(key)) {
        entityMap.set(key, []);
      }
      entityMap.get(key)!.push(entity as T);
    });

    this.logger.debug(
      `Batch loaded ${allEntities.length} entities by ${fieldName} from ${repository.metadata.name}`,
    );

    return entityMap;
  }

  /**
   * Load with custom where conditions
   */
  async loadManyWithConditions<T extends ObjectLiteral>(
    repository: Repository<T>,
    conditions: unknown[],
    options: {
      batchSize?: number;
      relations?: string[];
    } = {},
  ): Promise<T[]> {
    if (conditions.length === 0) {
      return [];
    }

    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const allEntities: T[] = [];

    for (let i = 0; i < conditions.length; i += batchSize) {
      const batch = conditions.slice(i, i + batchSize);

      const queryBuilder = repository.createQueryBuilder('entity');

      // Build OR conditions
      batch.forEach((condition, idx) => {
        const whereClause = Object.entries(condition)
          .map(([key, _value]) => `entity.${key} = :${key}_${idx}`)
          .join(' AND ');

        const parameters = Object.entries(condition).reduce(
          (acc, [key, value]) => {
            acc[`${key}_${idx}`] = value;
            return acc;
          },
          {} as any,
        );

        if (idx === 0) {
          queryBuilder.where(whereClause, parameters);
        } else {
          queryBuilder.orWhere(whereClause, parameters);
        }
      });

      if (options.relations) {
        options.relations.forEach((relation) => {
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }

      const entities = await queryBuilder.getMany();
      allEntities.push(...entities);
    }

    this.logger.debug(
      `Batch loaded ${allEntities.length} entities with conditions from ${repository.metadata.name}`,
    );

    return allEntities;
  }

  /**
   * Efficiently load counts for multiple IDs
   */
  async loadCounts<T extends ObjectLiteral>(
    repository: Repository<T>,
    fieldName: string,
    values: unknown[],
  ): Promise<Map<unknown, number>> {
    if (values.length === 0) {
      return new Map();
    }

    const uniqueValues = [...new Set(values.filter((v) => v != null))];

    if (uniqueValues.length === 0) {
      return new Map();
    }

    const results = await repository
      .createQueryBuilder('entity')
      .select(`entity.${fieldName}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .where(`entity.${fieldName} IN (:...values)`, { values: uniqueValues })
      .groupBy(`entity.${fieldName}`)
      .getRawMany();

    const countMap = new Map<unknown, number>();
    results.forEach((row: unknown) => {
      const r = row as { key: unknown; count: string };
      countMap.set(r.key, parseInt(r.count));
    });

    // Fill in zeros for values with no results
    uniqueValues.forEach((value) => {
      if (!countMap.has(value)) {
        countMap.set(value, 0);
      }
    });

    return countMap;
  }
}
