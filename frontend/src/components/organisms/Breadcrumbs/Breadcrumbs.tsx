/**
 * @module components/navigation/Breadcrumbs
 * @category Navigation
 * @description Enterprise breadcrumb navigation component with role-based visibility,
 * dynamic path generation, and accessibility support. Provides hierarchical navigation
 * context and supports custom separators, icons, and actions.
 *
 * THEME SYSTEM USAGE:
 * - theme.text.primary/secondary/tertiary - Breadcrumb text colors
 * - theme.surface.highlight - Hover states
 * - theme.border.default - Separators
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ChevronRight, Home } from 'lucide-react';
import React, { useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils & Constants
import { cn } from '@/lib/cn';

import * as styles from './Breadcrumbs.styles';

// Types
import type { UserRole } from '@/types';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Represents a single breadcrumb item in the navigation path
 */
export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb */
  id: string;
  /** Display label for the breadcrumb */
  label: string;
  /** Navigation path or route */
  path?: string;
  /** Optional icon to display before the label */
  icon?: LucideIcon;
  /** Roles that can view this breadcrumb (undefined = all roles) */
  allowedRoles?: UserRole[];
  /** Whether this breadcrumb is clickable */
  isClickable?: boolean;
  /** Optional metadata for analytics or custom behavior */
  metadata?: Record<string, unknown>;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Callback when a breadcrumb is clicked */
  onNavigate?: (item: BreadcrumbItem) => void;
  /** Current user's role for filtering */
  currentUserRole?: UserRole;
  /** Custom separator component or character */
  separator?: React.ReactNode;
  /** Show home icon as first item */
  showHomeIcon?: boolean;
  /** Maximum number of visible items (rest collapsed) */
  maxItems?: number;
  /** Custom className for styling */
  className?: string;
  /** Whether to show icons for items */
  showIcons?: boolean;
  /** Accessibility label for the breadcrumb navigation */
  ariaLabel?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Breadcrumbs - Enterprise navigation breadcrumb component
 * Optimized with React.memo for performance
 */
export const Breadcrumbs = React.memo<BreadcrumbsProps>(function Breadcrumbs({
  items,
  onNavigate,
  currentUserRole,
  separator = <ChevronRight className="h-3.5 w-3.5" />,
  showHomeIcon = true,
  maxItems,
  className,
  showIcons = true,
  ariaLabel = 'Breadcrumb navigation',
}: BreadcrumbsProps) {
  const { theme } = useTheme();

  // Filter items based on role permissions
  const visibleItems = useMemo(() => {
    return items.filter(item => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        return true;
      }
      if (!currentUserRole) {
        return false;
      }
      return item.allowedRoles.includes(currentUserRole);
    });
  }, [items, currentUserRole]);

  // Handle collapsed items when maxItems is set
  const displayItems = useMemo(() => {
    if (!maxItems || visibleItems.length <= maxItems) {
      return visibleItems;
    }

    // Keep first and last items, collapse middle ones
    const firstItems = visibleItems.slice(0, 1);
    const lastItems = visibleItems.slice(-(maxItems - 1));

    return [
      ...firstItems,
      {
        id: 'collapsed',
        label: '...',
        isClickable: false,
      } as BreadcrumbItem,
      ...lastItems,
    ];
  }, [visibleItems, maxItems]);

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    // Don't navigate if it's the last item (current page) or not clickable
    if (index === displayItems.length - 1 || item.isClickable === false) {
      return;
    }

    if (onNavigate && item.path) {
      onNavigate(item);
    }
  };

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(styles.getBreadcrumbsContainer(theme), className)}
    >
      <ol className={styles.breadcrumbsList}>
        {/* Optional Home Icon */}
        {showHomeIcon && (
          <>
            <li className={styles.breadcrumbItem}>
              <button
                onClick={() => onNavigate?.({ id: 'home', label: 'Home', path: '/' })}
                className={styles.getBreadcrumbButton(theme, false, true)}
                aria-label="Navigate to home"
              >
                <Home className="h-4 w-4" />
              </button>
            </li>
            <li className={styles.separator} aria-hidden="true">
              {separator}
            </li>
          </>
        )}

        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isClickable = !isLast && item.isClickable !== false && item.path;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              <li className={styles.breadcrumbItem}>
                {isClickable ? (
                  <button
                    onClick={() => handleItemClick(item, index)}
                    className={styles.getBreadcrumbButton(theme, isLast, false)}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {showIcons && Icon && <Icon className={styles.itemIcon} />}
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                ) : (
                  <span
                    className={styles.getBreadcrumbText(theme, isLast)}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {showIcons && Icon && <Icon className={styles.itemIcon} />}
                    <span className={styles.itemLabel}>{item.label}</span>
                  </span>
                )}
              </li>

              {/* Separator */}
              {!isLast && (
                <li className={styles.separator} aria-hidden="true">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';
