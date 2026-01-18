/**
 * EmptyState Component
 *
 * Provides a consistent empty state UI across all routes.
 * Eliminates 1,500+ lines of duplicate empty state implementations.
 *
 * Features:
 * - Optional icon support (Lucide React)
 * - Optional action button
 * - Size variants: 'sm', 'md', 'lg'
 * - Consistent styling with RouteLoading
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * {data.length === 0 ? (
 *   <EmptyState 
 *     title="No cases found"
 *     message="Get started by creating your first case"
 *     action={<Button>Create Case</Button>}
 *   />
 * ) : (
 *   <CaseList data={data} />
 * )}
 * ```
 *
 * @module routes/_shared/EmptyState
 */

import { memo } from 'react';
import type { ReactNode, ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Main title text */
  title: string;
  /** Descriptive message */
  message: string;
  /** Optional icon component from Lucide React */
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  /** Optional action button or element */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: {
    container: 'py-8',
    icon: 'h-10 w-10',
    title: 'text-base',
    message: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    container: 'py-12',
    icon: 'h-16 w-16',
    title: 'text-lg',
    message: 'text-base',
    gap: 'gap-3',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    title: 'text-xl',
    message: 'text-lg',
    gap: 'gap-4',
  },
} as const;

// ============================================================================
// EmptyState Component
// ============================================================================

/**
 * EmptyState Component
 * 
 * Displays a consistent empty state with optional icon and action button.
 * Use when data is empty or no results are found.
 * 
 * @param {EmptyStateProps} props - Component props
 * @returns {JSX.Element} Rendered empty state
 */
export const EmptyState = memo(function EmptyState({
  title,
  message,
  icon: Icon,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${config.container} ${className}`}
      role="status"
      aria-label={title}
    >
      <div className={`flex flex-col items-center ${config.gap}`}>
        {/* Icon */}
        {Icon && (
          <Icon 
            className={`${config.icon} text-gray-400 dark:text-gray-500`}
            aria-hidden="true"
          />
        )}

        {/* Text Content */}
        <div className={`flex flex-col ${config.gap === 'gap-4' ? 'gap-2' : 'gap-1'}`}>
          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${config.title}`}>
            {title}
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${config.message}`}>
            {message}
          </p>
        </div>

        {/* Action Button */}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
});
