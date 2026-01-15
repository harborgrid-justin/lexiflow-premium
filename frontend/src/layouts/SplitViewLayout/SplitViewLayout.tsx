/**
 * @module components/layouts/SplitViewLayout
 * @category Layouts
 * @description Split view layout with sidebar and content area.
 * Ideal for list/detail views, inbox-style interfaces, and master/detail patterns.
 * 
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Content background
 * - theme.surface.highlight - Sidebar background
 * - theme.border.default - Border colors
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import React from "react";

interface SplitViewLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  showSidebarOnMobile?: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sidebarWidthClasses = {
  sm: 'md:w-64',
  md: 'md:w-80',
  lg: 'md:w-96',
  xl: 'md:w-[28rem]',
};

export const SplitViewLayout = React.memo<SplitViewLayoutProps>(({ 
  sidebar, 
  content, 
  showSidebarOnMobile = true,
  sidebarPosition = 'left',
  sidebarWidth = 'lg',
  className = '' 
}) => {
  const { theme } = useTheme();

  const sidebarElement = (
    <div className={cn(
      "w-full flex flex-col h-full",
      sidebarWidthClasses[sidebarWidth],
      sidebarPosition === 'left' ? 'border-r' : 'border-l',
      theme.border.default,
      theme.surface.highlight,
      showSidebarOnMobile ? 'flex' : 'hidden md:flex'
    )}>
      {sidebar}
    </div>
  );

  const contentElement = (
    <div className={cn(
      "flex-1 flex flex-col min-w-0 h-full",
      theme.surface.default,
      !showSidebarOnMobile ? 'flex' : 'hidden md:flex'
    )}>
      {content}
    </div>
  );

  return (
    <div className={cn(
      "flex-1 flex flex-col md:flex-row rounded-lg overflow-hidden min-h-0",
      theme.surface.default,
      theme.border.default,
      "border shadow-sm",
      className
    )}>
      {sidebarPosition === 'left' ? (
        <>
          {sidebarElement}
          {contentElement}
        </>
      ) : (
        <>
          {contentElement}
          {sidebarElement}
        </>
      )}
    </div>
  );
});

SplitViewLayout.displayName = 'SplitViewLayout';
