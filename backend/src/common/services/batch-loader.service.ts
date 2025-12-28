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
    ids: any[],
    options: {
      batchSize?: number;
      relations?: string[];
      cache?: boolean;
    } = {},
  ): Promise<Map<any, T>> {
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

      const findOptions: any = {
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
    const entityMap = new Map<any, T>();
    allEntities.forEach((entity: any) => {
      entityMap.set(entity.id, entity);
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
    values: any[],
    options: {
      batchSize?: number;
      relations?: string[];
      cache?: boolean;
    } = {},
  ): Promise<Map<any, T[]>> {
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
    const entityMap = new Map<any, T[]>();
    allEntities.forEach((entity: any) => {
      const key = entity[fieldName];
      if (!entityMap.has(key)) {
        entityMap.set(key, []);
      }
      entityMap.get(key)!.push(entity);
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
    conditions: any[],
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
    values: any[],
  ): Promise<Map<any, number>> {
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

    const countMap = new Map<any, number>();
    results.forEach((row: any) => {
      countMap.set(row.key, parseInt(row.count));
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
