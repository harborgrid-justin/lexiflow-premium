import {
  SelectQueryBuilder,
  ObjectLiteral,
  Brackets,
} from 'typeorm';

/**
 * Query Filter Operator Types
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  LIKE = 'like',
  ILIKE = 'ilike',
  IN = 'in',
  NOT_IN = 'nin',
  BETWEEN = 'between',
  IS_NULL = 'null',
  NOT_NULL = 'notnull',
  CONTAINS = 'contains',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',
}

/**
 * Filter condition interface
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: unknown;
  not?: boolean;
}

/**
 * Sorting configuration
 */
export interface SortConfig {
  field: string;
  order: 'ASC' | 'DESC';
  nulls?: 'FIRST' | 'LAST';
}

/**
 * Join configuration
 */
export interface JoinConfig {
  property: string;
  alias: string;
  type?: 'inner' | 'left';
  condition?: string;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Advanced Query Builder Utility
 *
 * Provides fluent API for building complex TypeORM queries with:
 * - Dynamic filtering with multiple operators
 * - Advanced sorting with null handling
 * - Complex joins and relations
 * - Full-text search capabilities
 * - Aggregations and grouping
 * - Subqueries support
 * - Performance optimizations
 */
export class AdvancedQueryBuilder<T extends ObjectLiteral> {
  private queryBuilder: SelectQueryBuilder<T>;
  private paramCounter = 0;

  constructor(queryBuilder: SelectQueryBuilder<T>) {
    this.queryBuilder = queryBuilder;
  }

  /**
   * Apply filter conditions to the query
   */
  applyFilters(filters: FilterCondition[]): this {
    filters.forEach((filter) => {
      this.applyFilter(filter);
    });
    return this;
  }

  /**
   * Apply a single filter condition
   */
  private applyFilter(filter: FilterCondition): void {
    const { field, operator, value, not } = filter;
    const paramName = this.getParamName(field);
    const fieldPath = this.getFieldPath(field);

    switch (operator) {
      case FilterOperator.EQUALS:
        if (not) {
          this.queryBuilder.andWhere(`${fieldPath} != :${paramName}`, {
            [paramName]: value,
          });
        } else {
          this.queryBuilder.andWhere(`${fieldPath} = :${paramName}`, {
            [paramName]: value,
          });
        }
        break;

      case FilterOperator.NOT_EQUALS:
        this.queryBuilder.andWhere(`${fieldPath} != :${paramName}`, {
          [paramName]: value,
        });
        break;

      case FilterOperator.GREATER_THAN:
        this.queryBuilder.andWhere(`${fieldPath} > :${paramName}`, {
          [paramName]: value,
        });
        break;

      case FilterOperator.GREATER_THAN_OR_EQUAL:
        this.queryBuilder.andWhere(`${fieldPath} >= :${paramName}`, {
          [paramName]: value,
        });
        break;

      case FilterOperator.LESS_THAN:
        this.queryBuilder.andWhere(`${fieldPath} < :${paramName}`, {
          [paramName]: value,
        });
        break;

      case FilterOperator.LESS_THAN_OR_EQUAL:
        this.queryBuilder.andWhere(`${fieldPath} <= :${paramName}`, {
          [paramName]: value,
        });
        break;

      case FilterOperator.LIKE:
        this.queryBuilder.andWhere(`${fieldPath} LIKE :${paramName}`, {
          [paramName]: `%${value}%`,
        });
        break;

      case FilterOperator.ILIKE:
        this.queryBuilder.andWhere(`${fieldPath} ILIKE :${paramName}`, {
          [paramName]: `%${value}%`,
        });
        break;

      case FilterOperator.IN:
        if (Array.isArray(value) && value.length > 0) {
          this.queryBuilder.andWhere(`${fieldPath} IN (:...${paramName})`, {
            [paramName]: value,
          });
        }
        break;

      case FilterOperator.NOT_IN:
        if (Array.isArray(value) && value.length > 0) {
          this.queryBuilder.andWhere(`${fieldPath} NOT IN (:...${paramName})`, {
            [paramName]: value,
          });
        }
        break;

      case FilterOperator.BETWEEN:
        if (Array.isArray(value) && value.length === 2) {
          this.queryBuilder.andWhere(
            `${fieldPath} BETWEEN :${paramName}_start AND :${paramName}_end`,
            {
              [`${paramName}_start`]: value[0],
              [`${paramName}_end`]: value[1],
            },
          );
        }
        break;

      case FilterOperator.IS_NULL:
        this.queryBuilder.andWhere(`${fieldPath} IS NULL`);
        break;

      case FilterOperator.NOT_NULL:
        this.queryBuilder.andWhere(`${fieldPath} IS NOT NULL`);
        break;

      case FilterOperator.CONTAINS:
        this.queryBuilder.andWhere(`${fieldPath} ILIKE :${paramName}`, {
          [paramName]: `%${value}%`,
        });
        break;

      case FilterOperator.STARTS_WITH:
        this.queryBuilder.andWhere(`${fieldPath} ILIKE :${paramName}`, {
          [paramName]: `${value}%`,
        });
        break;

      case FilterOperator.ENDS_WITH:
        this.queryBuilder.andWhere(`${fieldPath} ILIKE :${paramName}`, {
          [paramName]: `%${value}`,
        });
        break;
    }
  }

  /**
   * Apply sorting to the query
   */
  applySorting(sorts: SortConfig[]): this {
    sorts.forEach((sort, index) => {
      const fieldPath = this.getFieldPath(sort.field);
      const orderClause = sort.nulls
        ? `${fieldPath} ${sort.order} NULLS ${sort.nulls}`
        : `${fieldPath}`;

      if (index === 0) {
        this.queryBuilder.orderBy(orderClause, sort.nulls ? undefined : sort.order);
      } else {
        this.queryBuilder.addOrderBy(orderClause, sort.nulls ? undefined : sort.order);
      }
    });
    return this;
  }

  /**
   * Apply joins to the query
   */
  applyJoins(joins: JoinConfig[]): this {
    joins.forEach((join) => {
      const method = join.type === 'inner' ? 'innerJoinAndSelect' : 'leftJoinAndSelect';
      this.queryBuilder[method](
        `${this.queryBuilder.alias}.${join.property}`,
        join.alias,
        join.condition,
      );
    });
    return this;
  }

  /**
   * Apply pagination to the query
   */
  applyPagination(pagination: PaginationConfig): this {
    const offset = pagination.offset ?? (pagination.page - 1) * pagination.limit;
    this.queryBuilder.skip(offset).take(pagination.limit);
    return this;
  }

  /**
   * Apply full-text search across multiple fields
   */
  applyFullTextSearch(searchTerm: string, fields: string[]): this {
    if (!searchTerm || fields.length === 0) return this;

    this.queryBuilder.andWhere(
      new Brackets((qb) => {
        fields.forEach((field, index) => {
          const fieldPath = this.getFieldPath(field);
          const paramName = `search_${this.paramCounter++}`;

          if (index === 0) {
            qb.where(`${fieldPath} ILIKE :${paramName}`, {
              [paramName]: `%${searchTerm}%`,
            });
          } else {
            qb.orWhere(`${fieldPath} ILIKE :${paramName}`, {
              [paramName]: `%${searchTerm}%`,
            });
          }
        });
      }),
    );

    return this;
  }

  /**
   * Apply date range filter
   */
  applyDateRange(field: string, start?: Date, end?: Date): this {
    const fieldPath = this.getFieldPath(field);

    if (start) {
      const paramName = this.getParamName(`${field}_start`);
      this.queryBuilder.andWhere(`${fieldPath} >= :${paramName}`, {
        [paramName]: start,
      });
    }

    if (end) {
      const paramName = this.getParamName(`${field}_end`);
      this.queryBuilder.andWhere(`${fieldPath} <= :${paramName}`, {
        [paramName]: end,
      });
    }

    return this;
  }

  /**
   * Add WHERE condition with OR logic
   */
  addOrConditions(conditions: FilterCondition[]): this {
    this.queryBuilder.andWhere(
      new Brackets((qb) => {
        conditions.forEach((condition, index) => {
          const { field, operator, value } = condition;
          const paramName = this.getParamName(field);
          const fieldPath = this.getFieldPath(field);

          let whereClause: string;
          let params: Record<string, unknown> = {};

          switch (operator) {
            case FilterOperator.EQUALS:
              whereClause = `${fieldPath} = :${paramName}`;
              params = { [paramName]: value };
              break;
            case FilterOperator.LIKE:
            case FilterOperator.CONTAINS:
              whereClause = `${fieldPath} ILIKE :${paramName}`;
              params = { [paramName]: `%${value}%` };
              break;
            case FilterOperator.IN:
              whereClause = `${fieldPath} IN (:...${paramName})`;
              params = { [paramName]: value };
              break;
            default:
              return;
          }

          if (index === 0) {
            qb.where(whereClause, params);
          } else {
            qb.orWhere(whereClause, params);
          }
        });
      }),
    );

    return this;
  }

  /**
   * Add GROUP BY clause
   */
  addGroupBy(fields: string[]): this {
    fields.forEach((field, index) => {
      const fieldPath = this.getFieldPath(field);
      if (index === 0) {
        this.queryBuilder.groupBy(fieldPath);
      } else {
        this.queryBuilder.addGroupBy(fieldPath);
      }
    });
    return this;
  }

  /**
   * Add HAVING clause
   */
  addHaving(condition: string, parameters?: ObjectLiteral): this {
    this.queryBuilder.having(condition, parameters);
    return this;
  }

  /**
   * Add SELECT for specific fields (optimize query performance)
   */
  selectFields(fields: string[]): this {
    const selections = fields.map((field) => {
      const fieldPath = this.getFieldPath(field);
      return fieldPath;
    });
    this.queryBuilder.select(selections);
    return this;
  }

  /**
   * Add aggregation (COUNT, SUM, AVG, MIN, MAX)
   */
  addAggregation(
    type: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX',
    field: string,
    alias: string,
  ): this {
    const fieldPath = field === '*' ? field : this.getFieldPath(field);
    this.queryBuilder.addSelect(`${type}(${fieldPath})`, alias);
    return this;
  }

  /**
   * Apply soft delete filter (exclude deleted records)
   */
  excludeDeleted(): this {
    this.queryBuilder.andWhere(
      `${this.queryBuilder.alias}.deleted_at IS NULL`,
    );
    return this;
  }

  /**
   * Include soft deleted records
   */
  includeDeleted(): this {
    this.queryBuilder.withDeleted();
    return this;
  }

  /**
   * Apply distinct to prevent duplicate results
   */
  applyDistinct(): this {
    this.queryBuilder.distinct(true);
    return this;
  }

  /**
   * Add subquery as a filter
   */
  addSubqueryFilter(
    field: string,
    operator: 'IN' | 'NOT IN' | 'EXISTS' | 'NOT EXISTS',
    subquery: (qb: SelectQueryBuilder<ObjectLiteral>) => SelectQueryBuilder<ObjectLiteral>,
  ): this {
    const fieldPath = this.getFieldPath(field);
    const subQueryBuilder = subquery(
      this.queryBuilder.subQuery() as SelectQueryBuilder<ObjectLiteral>,
    );

    if (operator === 'EXISTS' || operator === 'NOT EXISTS') {
      this.queryBuilder.andWhere(`${operator} (${subQueryBuilder.getQuery()})`);
    } else {
      this.queryBuilder.andWhere(
        `${fieldPath} ${operator} (${subQueryBuilder.getQuery()})`,
      );
    }

    return this;
  }

  /**
   * Lock rows for update (FOR UPDATE)
   */
  lockForUpdate(): this {
    this.queryBuilder.setLock('pessimistic_write');
    return this;
  }

  /**
   * Lock rows for share (FOR SHARE)
   */
  lockForShare(): this {
    this.queryBuilder.setLock('pessimistic_read');
    return this;
  }

  /**
   * Enable query result cache
   */
  enableCache(milliseconds: number, id?: string | number): this {
    const cacheId = typeof id === 'string' ? undefined : id;
    this.queryBuilder.cache(milliseconds, cacheId);
    return this;
  }

  /**
   * Get the underlying query builder
   */
  getQueryBuilder(): SelectQueryBuilder<T> {
    return this.queryBuilder;
  }

  /**
   * Execute query and get results
   */
  async getMany(): Promise<T[]> {
    return this.queryBuilder.getMany();
  }

  /**
   * Execute query and get one result
   */
  async getOne(): Promise<T | null> {
    return this.queryBuilder.getOne();
  }

  /**
   * Execute query and count results
   */
  async getManyAndCount(): Promise<[T[], number]> {
    return this.queryBuilder.getManyAndCount();
  }

  /**
   * Execute query and get count only
   */
  async getCount(): Promise<number> {
    return this.queryBuilder.getCount();
  }

  /**
   * Execute query and get raw results
   */
  async getRawMany(): Promise<Record<string, unknown>[]> {
    return this.queryBuilder.getRawMany();
  }

  /**
   * Execute query and get raw and entities
   */
  async getRawAndEntities(): Promise<{ entities: T[]; raw: Record<string, unknown>[] }> {
    return this.queryBuilder.getRawAndEntities();
  }

  /**
   * Get SQL query string (for debugging)
   */
  getSql(): string {
    return this.queryBuilder.getSql();
  }

  /**
   * Get query parameters (for debugging)
   */
  getParameters(): ObjectLiteral {
    return this.queryBuilder.getParameters();
  }

  /**
   * Generate unique parameter name
   */
  private getParamName(field: string): string {
    return `${field.replace(/\./g, '_')}_${this.paramCounter++}`;
  }

  /**
   * Get field path with alias
   */
  private getFieldPath(field: string): string {
    if (field.includes('.')) {
      return field;
    }
    return `${this.queryBuilder.alias}.${field}`;
  }
}

/**
 * Create an advanced query builder instance
 */
export function createAdvancedQueryBuilder<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
): AdvancedQueryBuilder<T> {
  return new AdvancedQueryBuilder(queryBuilder);
}

/**
 * Query Builder Factory for common patterns
 */
export class QueryBuilderFactory {
  /**
   * Create a paginated query with filters and sorting
   */
  static createPaginatedQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: {
      filters?: FilterCondition[];
      sorts?: SortConfig[];
      pagination: PaginationConfig;
      search?: { term: string; fields: string[] };
      joins?: JoinConfig[];
    },
  ): AdvancedQueryBuilder<T> {
    const builder = new AdvancedQueryBuilder(queryBuilder);

    if (options.joins) {
      builder.applyJoins(options.joins);
    }

    if (options.filters) {
      builder.applyFilters(options.filters);
    }

    if (options.search) {
      builder.applyFullTextSearch(options.search.term, options.search.fields);
    }

    if (options.sorts) {
      builder.applySorting(options.sorts);
    }

    builder.applyPagination(options.pagination);

    return builder;
  }

  /**
   * Create a query for active records (not soft deleted)
   */
  static createActiveRecordsQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
  ): AdvancedQueryBuilder<T> {
    const builder = new AdvancedQueryBuilder(queryBuilder);
    return builder.excludeDeleted();
  }

  /**
   * Create an aggregation query
   */
  static createAggregationQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: {
      groupBy: string[];
      aggregations: Array<{
        type: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
        field: string;
        alias: string;
      }>;
      filters?: FilterCondition[];
      having?: { condition: string; parameters?: ObjectLiteral };
    },
  ): AdvancedQueryBuilder<T> {
    const builder = new AdvancedQueryBuilder(queryBuilder);

    if (options.filters) {
      builder.applyFilters(options.filters);
    }

    builder.addGroupBy(options.groupBy);

    options.aggregations.forEach((agg) => {
      builder.addAggregation(agg.type, agg.field, agg.alias);
    });

    if (options.having) {
      builder.addHaving(options.having.condition, options.having.parameters);
    }

    return builder;
  }
}
