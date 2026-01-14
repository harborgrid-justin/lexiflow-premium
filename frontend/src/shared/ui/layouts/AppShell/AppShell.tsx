/**
 * @module components/layout/AppShell
 * @category Layout
 * @description Main application shell providing sidebar, header, and content area layout with
 * passive time tracking indicator, global fetching indicator, and viewport height handling.
 * Uses CSS containment for performance optimization.
 *
 * THEME SYSTEM USAGE:
 * - theme.background - Root background color
 * - theme.text.primary - Base text color
 * - theme.surface.default - Header background
 * - theme.border.default - Header border
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { memo } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { Breadcrumbs, BreadcrumbItem } from '@/shared/ui/molecules/Breadcrumbs';

// Hooks & Context
import { useTheme } from '@/theme';
// Note: Logic hooks (time capture, global query status, breadcrumbs) are lifted to the controller.

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ========================================
// TYPES & INTERFACES
// ========================================
export interface AppShellProps {
  sidebar: React.ReactNode;
  headerContent: React.ReactNode;
  children: React.ReactNode;
  activeView?: string;
  onNavigate?: (view: string) => void;
  selectedCaseId?: string | null;
  
  // State from Controller
  isFetching?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  timeTracker?: {
    activeTime: number;
    isIdle: boolean;
  };
}

// ========================================
// SUB-COMPONENTS
// ========================================
const PassiveTimeTracker = memo(({ activeTime, isIdle }: { activeTime: number, isIdle: boolean }) => {
  if (activeTime === 0) return null;

  return (
    <div className={cn(
      "absolute top-0 right-0 h-0.5 bg-green-500 transition-all duration-1000 z-[60] pointer-events-none",
      isIdle ? "opacity-0" : "opacity-100"
    )} style={{ width: `${Math.min((activeTime % 60) / 60 * 100, 100)}%` }} />
  );
});
PassiveTimeTracker.displayName = 'PassiveTimeTracker';

// ========================================
// COMPONENT
// ========================================
export const AppShell = memo<AppShellProps>(({ 
  sidebar, 
  headerContent, 
  children, 
  activeView, 
  onNavigate: _onNavigate, 
  selectedCaseId: _selectedCaseId,
  isFetching = false,
  breadcrumbs = [],
  timeTracker = { activeTime: 0, isIdle: true }
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "flex h-[100dvh] w-screen font-sans overflow-hidden transition-colors duration-200 relative",
      theme.background,
      theme.text.primary
    )}>
      {/* Global Fetching Indicator */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 z-[9000] bg-blue-500 transition-opacity duration-300",
        isFetching ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-inherit opacity-50 animate-pulse"></div>
      </div>

      {sidebar}

      <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
        <PassiveTimeTracker activeTime={timeTracker.activeTime} isIdle={timeTracker.isIdle} />

        <header className={cn("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b", theme.surface.default, theme.border.default)}>
          {headerContent}
        </header>

        <main
          className="flex-1 flex flex-col min-h-0 overflow-hidden relative isolate pb-0"
          style={{ contain: 'strict' }}
        >
           {/* Breadcrumbs are optional in the shell visualization, but often passed in headerContent. 
               If we wanted to render them here we could, but typically they go in the header or just below.
               Given the previous code didn't render breadcrumbs *inside* AppShell main explicitly (it just calculated them),
               we assume consuming components or headerContent might use them if passed, 
               but essentially we are just accepting them as props now to satisfy the interface.
               However, looking at the previous file, it calculated breadcrumbs but didn't seemingly render them in the JSX shown in the snippet.
               Wait, let me double check the partial file read.
           */}
           {breadcrumbs.length > 0 && (
              <div className="px-6 py-2 shrink-0">
                  <Breadcrumbs items={breadcrumbs} />
              </div>
           )}

           {children}
        </main>
      </div>
    </div>
  );
});

AppShell.displayName = 'AppShell';
