
import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PATHS } from '../../constants/paths';
import { useAutoTimeCapture } from '../../hooks/useAutoTimeCapture';
import { useGlobalQueryStatus } from '../../hooks/useGlobalQueryStatus';

interface AppShellProps {
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

export const AppShell: React.FC<AppShellProps> = ({ sidebar, headerContent, children, activeView, onNavigate, selectedCaseId }) => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isFetching } = useGlobalQueryStatus();
  
  const sidebarWithProps = React.isValidElement(sidebar) 
    ? React.cloneElement(sidebar as React.ReactElement<any>, { 
        isOpen: isSidebarOpen, 
        onClose: () => setIsSidebarOpen(false) 
      }) 
    : sidebar;

  const headerWithProps = React.isValidElement(headerContent)
    ? React.cloneElement(headerContent as React.ReactElement<any>, {
        onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen)
      })
    : headerContent;

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
      
      {sidebarWithProps}
      
      <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
        <PassiveTimeTracker activeView={activeView || 'unknown'} selectedCaseId={selectedCaseId || null} />

        <header className={cn("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b", theme.surface.default, theme.border.default)}>
          {headerWithProps}
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
};
