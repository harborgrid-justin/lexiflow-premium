import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';
import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
import { validateSortOrder } from '../utils/query-validation.util';

/**
 * Pagination Types
 */
export enum PaginationType {
  OFFSET = 'offset',
  CURSOR = 'cursor',
}

export interface OffsetPaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CursorPaginationDto {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page?: number;
  limit: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

/**
 * Pagination Service
 * Provides enterprise-grade pagination with offset and cursor support
 * Optimized for performance with large datasets
 * 
 * @example Offset Pagination
 * const result = await paginationService.paginateOffset(
 *   repository,
 *   { page: 1, limit: 10 }
 * );
 * 
 * @example Cursor Pagination
 * const result = await paginationService.paginateCursor(
 *   queryBuilder,
 *   { cursor: 'abc123', limit: 10 }
 * );
 */
import { ObjectLiteral } from 'typeorm';

@Injectable()
export class PaginationService {
  private readonly DEFAULT_LIMIT = MasterConfig.DEFAULT_PAGE_SIZE;
  private readonly MAX_LIMIT = MasterConfig.MAX_PAGE_SIZE;

  /**
   * Offset-based pagination (traditional page/limit)
   * Best for: Small to medium datasets, UI with page numbers
   */
  async paginateOffset<T extends ObjectLiteral>(
    repository: Repository<T>,
    dto: OffsetPaginationDto,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, dto.page || 1);
    const limit = this.validateLimit(dto.limit);
    const skip = (page - 1) * limit;

    const [data, total] = await repository.findAndCount({
      ...options,
      skip,
      take: limit,
      order: dto.sortBy
        ? { [dto.sortBy]: dto.sortOrder || 'ASC' }
        : options?.order,
    } as FindManyOptions<T>);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Cursor-based pagination (keyset pagination)
   * Best for: Large datasets, infinite scroll, real-time data
   * Advantages: Consistent performance, handles insertions/deletions
   */
  async paginateCursor<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
    cursorField: string = 'id',
  ): Promise<PaginatedResult<T>> {
    const limit = this.validateLimit(dto.limit);
    // SQL injection protection - validate sort order
    const sortOrder = validateSortOrder(dto.sortOrder);

    // Note: cursorField should be validated by the calling service
    // using validateSortField() before passing it to this method

    // Apply cursor condition if provided
    if (dto.cursor) {
      const decodedCursor = this.decodeCursor(dto.cursor);
      const operator = sortOrder === 'ASC' ? '>' : '<';
      queryBuilder.andWhere(`${cursorField} ${operator} :cursor`, {
        cursor: decodedCursor,
      });
    }

    // Fetch limit + 1 to determine if there's a next page
    const data = await queryBuilder
      .orderBy(cursorField, sortOrder)
      .take(limit + 1)
      .getMany();

    const hasNextPage = data.length > limit;
    if (hasNextPage) {
      data.pop(); // Remove extra item
    }

    const nextCursor = hasNextPage
      ? this.encodeCursor((data[data.length - 1] as any)[cursorField])
      : undefined;

    const previousCursor = dto.cursor
      ? this.encodeCursor((data[0] as any)[cursorField])
      : undefined;

    // Note: Total count is expensive with cursor pagination
    // Only calculate if absolutely necessary
    const total = await queryBuilder.getCount();

    return {
      data,
      meta: {
        total,
        limit,
        hasNextPage,
        hasPreviousPage: !!dto.cursor,
        nextCursor,
        previousCursor,
      },
    };
  }

  /**
   * Paginate array in memory (for non-DB data)
   */
  paginateArray<T>(
    items: T[],
    dto: OffsetPaginationDto,
  ): PaginatedResult<T> {
    const page = Math.max(1, dto.page || 1);
    const limit = this.validateLimit(dto.limit);
    const skip = (page - 1) * limit;

    const data = items.slice(skip, skip + limit);
    const total = items.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private validateLimit(limit?: number): number {
    if (!limit) return this.DEFAULT_LIMIT;
    return Math.min(Math.max(1, limit), this.MAX_LIMIT);
  }

  private encodeCursor(value: any): string {
    return Buffer.from(String(value)).toString('base64');
  }

  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, 'base64').toString('utf-8');
  }
}
