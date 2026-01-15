/**
 * @module components/layouts/ManagerLayout
 * @category Layouts
 * @description Manager layout with header, optional sidebar, and content area.
 * Ideal for management interfaces with filtering and list/detail views.
 *
 * THEME SYSTEM USAGE:
 * - theme.background - Page background
 * - theme.surface.default - Sidebar background
 * - theme.border.default - Border colors
 */

import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { useTheme } from '@/theme';
import React from "react";

interface ManagerLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filterPanel?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
}

const sidebarWidthClasses = {
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-80',
};

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({
  title,
  subtitle,
  actions,
  filterPanel,
  children,
  sidebar,
  className,
  sidebarWidth = 'md'
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background, className)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={actions}
        />
        {filterPanel && (
          <div className="mb-4">
            {filterPanel}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6 min-h-0">
        {sidebar && (
          <div className={cn(
            sidebarWidthClasses[sidebarWidth],
            "border rounded-lg shadow-sm flex-col shrink-0 hidden md:flex overflow-y-auto",
            theme.surface.default,
            theme.border.default
          )}>
            {sidebar}
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
