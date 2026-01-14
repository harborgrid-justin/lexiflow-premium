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
  ForbiddenError,
  GenericError,
  NotFoundError,
  RouteErrorBoundary,
} from "./RouteErrorBoundary";

export {
  CardSkeleton,
  PageHeaderSkeleton,
  RouteLoading,
  RouteLoadingSkeleton,
  TableSkeleton,
} from "./RouteLoading";

export { createCaseMeta, createDetailMeta, createMeta } from "./meta-utils";

export {
  createJsonResponse,
  throwForbidden,
  throwNotFound,
  throwUnauthorized,
} from "./loader-utils";

export type { RouteErrorBoundaryProps, RouteLoadingProps } from "./types";

// ============================================================================
// Shared Route Context Exports
// ============================================================================
// Cross-cutting contexts used across multiple routes

// WindowContext exports
export {
  WindowProvider,
  useWindow,
  useWindowActions,
  useWindowState,
} from "./window/WindowContext";
export type { WindowInstance } from "./window/WindowContext.types";

// SyncContext exports
export {
  SyncContext,
  SyncProvider,
  useSync,
  useSyncActions,
  useSyncState,
} from "./sync/SyncContext";
export type { SyncContextType } from "./sync/SyncContext";
export type { SyncStatus } from "./sync/SyncContext.types";
