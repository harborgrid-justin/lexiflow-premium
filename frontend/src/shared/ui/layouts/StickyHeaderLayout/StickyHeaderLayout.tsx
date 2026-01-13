/**
 * @module components/layouts/StickyHeaderLayout
 * @category Layouts
 * @description Layout with sticky header and scrollable content.
 * Ideal for long-form content with persistent navigation.
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import React from "react";

interface StickyHeaderLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  className?: string;
}

export const StickyHeaderLayout = React.memo<StickyHeaderLayoutProps>(({
  header,
  children,
  headerClassName = '',
  contentClassName = '',
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className={cn(
        "sticky top-0 z-10 shrink-0",
        theme.surface.default,
        "border-b",
        theme.border.default,
        headerClassName
      )}>
        {header}
      </div>
      <div className={cn("flex-1 overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </div>
  );
});

StickyHeaderLayout.displayName = 'StickyHeaderLayout';
