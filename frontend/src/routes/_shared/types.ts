/**
 * Shared Types for Route Components
 *
 * @module routes/_shared/types
 */

import type { } from 'react';

/**
 * Props for route error boundary components
 */
export interface RouteErrorBoundaryProps {
  /** The error that was thrown */
  error: unknown;
  /** Optional custom title */
  title?: string;
  /** Optional custom message */
  message?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional back navigation path */
  backTo?: string;
  /** Optional back navigation label */
  backLabel?: string;
}

/**
 * Props for route loading components
 */
export interface RouteLoadingProps {
  /** Loading message to display */
  message?: string;
  /** Whether to show a full-page loader */
  fullPage?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Props for skeleton loaders
 */
export interface SkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Custom class name */
  className?: string;
}

/**
 * Meta tag configuration for routes
 */
export interface MetaConfig {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Standard loader return type for list routes
 */
export interface ListLoaderData<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Standard loader return type for detail routes
 */
export interface DetailLoaderData<T> {
  data: T;
  relatedItems?: unknown[];
}

/**
 * Standard action response type
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: any;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
