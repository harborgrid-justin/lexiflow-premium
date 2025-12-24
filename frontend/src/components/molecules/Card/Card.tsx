/**
 * @module components/common/Card
 * @category Common Components
 * @description Reusable card container with optional header and footer.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CardProps {
  /** Card content. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
  /** Remove default padding. */
  noPadding?: boolean;
  /** Card title. */
  title?: React.ReactNode;
  /** Card subtitle. */
  subtitle?: string;
  /** Action button or element. */
  action?: React.ReactNode;
  /** Footer content. */
  footer?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  title,
  subtitle,
  action,
  footer
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      theme.surface.default,
      theme.border.default,
      "rounded-xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md",
      className
    )}>
      {(title || action) && (
        <div className={cn("px-5 py-4 border-b flex justify-between items-center shrink-0 min-h-[60px]", theme.surface.default, theme.border.default)}>
          <div className="min-w-0 flex-1 mr-4">
            {title && <h3 className={cn("text-base font-bold tracking-tight leading-tight truncate", theme.text.primary)}>{title}</h3>}
            {subtitle && <p className={cn("text-xs mt-0.5 truncate font-medium", theme.text.secondary)}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}
      
      <div className={cn("flex-1", noPadding ? 'p-0' : 'p-5')}>
        {children}
      </div>
      
      {footer && (
        <div className={cn("px-5 py-3 border-t text-xs font-medium shrink-0 bg-opacity-50", theme.surface.highlight, theme.border.subtle, theme.text.secondary)}>
          {footer}
        </div>
      )}
    </div>
  );
};
