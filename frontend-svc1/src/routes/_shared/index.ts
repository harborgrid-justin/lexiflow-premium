/**
 * Shared Route Utilities for React Router v7
 *
 * This module provides reusable components and utilities for all route files:
 * - ErrorBoundary components with consistent styling
 * - Loading/Skeleton components for Suspense fallbacks
 * - HydrateFallback for SSR hydration
 * - Common meta tag generators
 * - Type-safe loader utilities
 *
 * @module routes/_shared
 */

export {
  RouteErrorBoundary,
  NotFoundError,
  ForbiddenError,
  GenericError,
} from './RouteErrorBoundary';

export {
  RouteLoading,
  RouteLoadingSkeleton,
  CardSkeleton,
  TableSkeleton,
  PageHeaderSkeleton,
} from './RouteLoading';

export {
  createMeta,
  createCaseMeta,
  createDetailMeta,
} from './meta-utils';

export {
  throwNotFound,
  throwForbidden,
  throwUnauthorized,
  createJsonResponse,
} from './loader-utils';

export type {
  RouteErrorBoundaryProps,
  RouteLoadingProps,
} from './types';
