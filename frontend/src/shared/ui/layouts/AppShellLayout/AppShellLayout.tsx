/**
 * @module components/layouts/AppShell
 * @category Layouts
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

import React, { memo } from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useAutoTimeCapture } from '@/hooks/useAutoTimeCapture';
import { useGlobalQueryStatus } from '@/hooks/useGlobalQueryStatus';
import { cn } from '@/shared/lib/cn';

interface AppShellLayoutProps {
  sidebar: React.ReactNode;
  headerContent: React.ReactNode;
  children: React.ReactNode;
  activeView?: string;
  onNavigate?: (view: string) => void;
  selectedCaseId?: string | null;
}

const PassiveTimeTracker = memo(({ activeView, selectedCaseId }: { activeView: string, selectedCaseId: string | null }) => {
    const { activeTime, isIdle } = useAutoTimeCapture(activeView, selectedCaseId);
    
    if (activeTime === 0) return null;

    return (
        <div className={cn(
            "absolute top-0 right-0 h-0.5 bg-green-500 transition-all duration-1000 z-[60] pointer-events-none", 
            isIdle ? "opacity-0" : "opacity-100"
        )} style={{ width: `${Math.min((activeTime % 60) / 60 * 100, 100)}%` }} />
    );
});
PassiveTimeTracker.displayName = 'PassiveTimeTracker';

export const AppShellLayout = React.memo<AppShellLayoutProps>(({ 
  sidebar, 
  headerContent, 
  children, 
  activeView, 
  onNavigate: _onNavigate, 
  selectedCaseId 
}) => {
  const { theme } = useTheme();
  const { isFetching } = useGlobalQueryStatus();

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
        <PassiveTimeTracker activeView={activeView || 'unknown'} selectedCaseId={selectedCaseId || null} />

        <header className={cn("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b", theme.surface.default, theme.border.default)}>
          {headerContent}
        </header>
        
        <main 
            className="flex-1 flex flex-col min-h-0 overflow-hidden relative isolate pb-0"
            style={{ contain: 'strict' }}
        >
            {children}
        </main>
      </div>
    </div>
  );
});

AppShellLayout.displayName = 'AppShellLayout';
