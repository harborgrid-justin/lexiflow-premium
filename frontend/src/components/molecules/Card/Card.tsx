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
import React, { useId } from 'react';
import { cn } from '@/lib/cn';

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
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card - React 18 optimized with React.memo
 */
export const Card = React.memo<CardProps>(({
  children,
  className = '',
  noPadding = false,
  title,
  subtitle,
  action,
  footer,
  onClick
}) => {
  const titleId = useId();

  return (
    <div
      aria-labelledby={title ? titleId : undefined}
      onClick={onClick}
      className={cn(
        "bg-surface border-border",
        "rounded-xl border shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md",
        className
      )}>
      {(title || action) && (
        <div className={cn("px-5 py-4 border-b border-border flex justify-between items-center shrink-0 min-h-[60px] bg-surface")}>
          <div className="min-w-0 flex-1 mr-4">
            {title && <h3 id={titleId} className={cn("text-base font-bold tracking-tight leading-tight truncate text-text")}>{title}</h3>}
            {subtitle && <p className={cn("text-xs mt-0.5 truncate font-medium text-text-muted")}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}

      <div className={cn("flex-1 min-h-0", noPadding ? 'p-0' : 'p-5')}>
        {children}
      </div>

      {footer && (
        <div className={cn("px-5 py-3 border-t border-border-light text-xs font-medium shrink-0 bg-opacity-50 bg-primary-light text-text-muted")}>
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
