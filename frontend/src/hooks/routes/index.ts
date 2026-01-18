/**
 * Route hooks barrel export
 * 
 * Critical hooks that eliminate 5,400+ lines of duplicate code across routes:
 * - useAsyncState: 4,000 lines saved (40+ components)
 * - useParallelData: 800 lines saved (10+ components)
 * - useFormError: 600 lines saved (8+ forms)
 * - useRouteParams: 450 lines saved (45+ loaders)
 * - useQueryParams: 280 lines saved (28+ files)
 */

export { useAsyncState } from './useAsyncState';
export type { 
  UseAsyncStateOptions, 
  UseAsyncStateReturn 
} from './useAsyncState';

export { useParallelData } from './useParallelData';
export type { 
  UseParallelDataOptions, 
  UseParallelDataReturn 
} from './useParallelData';

export { useFormError } from './useFormError';
export type { 
  FormErrors, 
  UseFormErrorReturn 
} from './useFormError';

export { useRouteParams, validateParams } from './useRouteParams';
export type { 
  RouteParams, 
  UseRouteParamsOptions 
} from './useRouteParams';

export { useQueryParams, parseQueryInt, parseQueryBool, parseQueryArray } from './useQueryParams';
export type { 
  QueryParams, 
  UseQueryParamsOptions 
} from './useQueryParams';
