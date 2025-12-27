import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginatedResponseDto } from '@common/dto/api-response.dto';

export class PaginationUtil {
  /**
   * Calculate skip value for pagination
   */
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Create paginated response
   */
  static paginate<T>(
    items: T[],
    total: number,
    paginationDto: PaginationDto,
  ): PaginatedResponseDto<T> {
    const { page = 1, limit = 10 } = paginationDto;
    return new PaginatedResponseDto(items, total, page, limit);
  }

  /**
   * Get pagination metadata
   */
  static getMetadata(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
