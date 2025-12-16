
export * from './types/enums';
export * from './types/models';
export * from './types/integration-types';
export * from './types/ai';
export * from './types/pleading-types';
export * from './types/pacer';
export * from './types/result';
export * from './types/parser';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
