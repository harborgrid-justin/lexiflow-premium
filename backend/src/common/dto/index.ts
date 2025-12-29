/**
 * Common DTOs Index
 * Central export point for all common data transfer objects
 */

// Base DTOs - Export first to avoid conflicts
export * from './base.dto';

// Pagination DTOs
export { SortOrderEnum, PaginationDto as PaginationQueryDto } from './pagination.dto';
export { QueryPaginationDto } from './query-pagination.dto';

// Response DTOs - Primary response structures
export {
  ErrorDetails,
  ApiResponseDto,
  PaginatedResponseDto as PaginatedApiResponseDto,
} from './api-response.dto';

export { StandardErrorDto, StandardResponseDto } from './standard-response.dto';

// Enhanced Response DTOs from response.dto (using aliases to avoid conflicts)
export {
  SuccessResponseDto,
  ErrorResponseDto,
  ApiErrorDto,
  ResponseMetaDto,
  PaginatedResponseDto,
  PaginationMetaDto,
  BatchOperationResponseDto,
  BatchOperationErrorDto,
  HealthCheckResponseDto,
  ComponentHealthDto,
} from './response.dto';
