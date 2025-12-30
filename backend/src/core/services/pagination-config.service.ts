import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * PaginationConfigService
 *
 * Provides globally injectable access to pagination configuration.
 * Consolidates default/max page sizes and related settings.
 */
@Injectable()
export class PaginationConfigService {
  // Default Values
  get defaultPageSize(): number {
    return MasterConfig.DEFAULT_PAGE_SIZE;
  }

  get maxPageSize(): number {
    return MasterConfig.MAX_PAGE_SIZE;
  }

  get defaultPageNumber(): number {
    return MasterConfig.DEFAULT_PAGE_NUMBER;
  }

  // Search Limits
  get searchMaxResults(): number {
    return MasterConfig.SEARCH_MAX_RESULTS;
  }

  get searchPreviewLimit(): number {
    return MasterConfig.SEARCH_PREVIEW_LIMIT;
  }

  /**
   * Validate and normalize page size
   */
  normalizePageSize(requestedSize?: number): number {
    if (!requestedSize || requestedSize < 1) {
      return this.defaultPageSize;
    }
    return Math.min(requestedSize, this.maxPageSize);
  }

  /**
   * Validate and normalize page number
   */
  normalizePageNumber(requestedPage?: number): number {
    if (!requestedPage || requestedPage < 1) {
      return this.defaultPageNumber;
    }
    return requestedPage;
  }

  /**
   * Calculate skip value for database queries
   */
  calculateSkip(page: number, pageSize: number): number {
    const normalizedPage = this.normalizePageNumber(page);
    const normalizedSize = this.normalizePageSize(pageSize);
    return (normalizedPage - 1) * normalizedSize;
  }

  /**
   * Calculate total pages
   */
  calculateTotalPages(totalItems: number, pageSize: number): number {
    const normalizedSize = this.normalizePageSize(pageSize);
    return Math.ceil(totalItems / normalizedSize);
  }

  /**
   * Get pagination metadata
   */
  getPaginationMeta(
    totalItems: number,
    page: number,
    pageSize: number
  ): PaginationMeta {
    const normalizedPage = this.normalizePageNumber(page);
    const normalizedSize = this.normalizePageSize(pageSize);
    const totalPages = this.calculateTotalPages(totalItems, normalizedSize);

    return {
      page: normalizedPage,
      pageSize: normalizedSize,
      totalItems,
      totalPages,
      hasNextPage: normalizedPage < totalPages,
      hasPreviousPage: normalizedPage > 1,
    };
  }

  /**
   * Get configuration for different list types
   */
  getListConfig(listType: string): { defaultSize: number; maxSize: number } {
    const configs: Record<string, { defaultSize: number; maxSize: number }> = {
      users: { defaultSize: 20, maxSize: 100 },
      cases: { defaultSize: 25, maxSize: 100 },
      documents: { defaultSize: 30, maxSize: 200 },
      notifications: { defaultSize: 10, maxSize: 50 },
      auditLogs: { defaultSize: 50, maxSize: 500 },
      search: { defaultSize: this.searchPreviewLimit, maxSize: this.searchMaxResults },
    };
    return configs[listType] || { defaultSize: this.defaultPageSize, maxSize: this.maxPageSize };
  }

  /**
   * Get summary of configuration
   */
  getSummary(): Record<string, unknown> {
    return {
      defaults: {
        pageSize: this.defaultPageSize,
        maxPageSize: this.maxPageSize,
        pageNumber: this.defaultPageNumber,
      },
      search: {
        maxResults: this.searchMaxResults,
        previewLimit: this.searchPreviewLimit,
      },
    };
  }
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
