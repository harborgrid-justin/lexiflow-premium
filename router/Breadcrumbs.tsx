/**
 * Breadcrumbs.tsx
 * Dynamic breadcrumb navigation component
 * Automatically generates breadcrumbs from route path
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  separator?: React.ReactNode;
  homeLabel?: string;
  homePath?: string;
  maxItems?: number;
  customLabels?: Record<string, string>;
  customPaths?: Record<string, string>;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  separatorClassName?: string;
}

// ============================================================================
// Breadcrumbs Component
// ============================================================================

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  separator = '/',
  homeLabel = 'Home',
  homePath = '/',
  maxItems = 5,
  customLabels = {},
  customPaths = {},
  className = '',
  itemClassName = '',
  activeClassName = '',
  separatorClassName = '',
}) => {
  const location = useLocation();

  // ============================================================================
  // Generate Breadcrumb Items
  // ============================================================================

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: homeLabel,
        path: homePath,
      },
    ];

    let currentPath = '';

    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Check for custom label
      const label = customLabels[segment] || formatSegment(segment);

      // Check for custom path
      const path = customPaths[segment] || currentPath;

      breadcrumbs.push({
        label,
        path,
      });
    });

    return breadcrumbs;
  };

  // ============================================================================
  // Format Segment
  // ============================================================================

  const formatSegment = (segment: string): string => {
    // Remove hyphens and underscores, capitalize words
    return segment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ============================================================================
  // Collapse Breadcrumbs if too many
  // ============================================================================

  const collapseBreadcrumbs = (items: BreadcrumbItem[]): BreadcrumbItem[] => {
    if (items.length <= maxItems) {
      return items;
    }

    const start = items.slice(0, 1);
    const end = items.slice(-(maxItems - 2));

    return [
      ...start,
      {
        label: '...',
        path: '#',
      },
      ...end,
    ];
  };

  // ============================================================================
  // Render
  // ============================================================================

  const breadcrumbs = collapseBreadcrumbs(generateBreadcrumbs());

  return (
    <nav aria-label="Breadcrumb" className={className} style={styles.nav}>
      <ol style={styles.list}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isEllipsis = crumb.label === '...';

          return (
            <li key={crumb.path + index} style={styles.item} className={itemClassName}>
              {!isLast ? (
                <>
                  {isEllipsis ? (
                    <span style={styles.ellipsis}>{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      style={styles.link}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.icon && <span style={styles.icon}>{crumb.icon}</span>}
                      {crumb.label}
                    </Link>
                  )}
                  <span style={styles.separator} className={separatorClassName}>
                    {separator}
                  </span>
                </>
              ) : (
                <span
                  style={styles.active}
                  className={activeClassName}
                  aria-current="page"
                >
                  {crumb.icon && <span style={styles.icon}>{crumb.icon}</span>}
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================================================
// Custom Breadcrumbs Component (with manual items)
// ============================================================================

export interface CustomBreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({
  items,
  separator = '/',
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={className} style={styles.nav}>
      <ol style={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path + index} style={styles.item}>
              {!isLast ? (
                <>
                  <Link to={item.path} style={styles.link}>
                    {item.icon && <span style={styles.icon}>{item.icon}</span>}
                    {item.label}
                  </Link>
                  <span style={styles.separator}>{separator}</span>
                </>
              ) : (
                <span style={styles.active} aria-current="page">
                  {item.icon && <span style={styles.icon}>{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================================================
// useBreadcrumbs Hook
// ============================================================================

export function useBreadcrumbs(customLabels: Record<string, string> = {}): BreadcrumbItem[] {
  const location = useLocation();

  const breadcrumbs = React.useMemo(() => {
    const pathnames = location.pathname.split('/').filter(x => x);

    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        path: '/',
      },
    ];

    let currentPath = '';

    pathnames.forEach(segment => {
      currentPath += `/${segment}`;

      items.push({
        label: customLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
      });
    });

    return items;
  }, [location.pathname, customLabels]);

  return breadcrumbs;
}

// ============================================================================
// BreadcrumbSeparator Component
// ============================================================================

export const BreadcrumbSeparator: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <span style={styles.separator}>{children || '/'}</span>;
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  nav: {
    padding: '12px 0',
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
  active: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  separator: {
    color: '#9ca3af',
    fontSize: '14px',
    userSelect: 'none',
  },
  ellipsis: {
    color: '#6b7280',
    fontSize: '14px',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '16px',
  },
};

export default Breadcrumbs;
