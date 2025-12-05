
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { PATHS } from '../../constants/paths';
import { useAutoTimeCapture } from '../../hooks/useAutoTimeCapture';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  sidebar: React.ReactNode;
  headerContent: React.ReactNode;
  children: React.ReactNode;
  activeView?: string;
  onNavigate?: (view: string) => void;
  selectedCaseId?: string | null;
}

export const AppShell: React.FC<AppShellProps> = ({ sidebar, headerContent, children, activeView, onNavigate, selectedCaseId }) => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auto Time Capture Integration (Enterprise Feature)
  const { activeTime, isIdle } = useAutoTimeCapture(activeView || 'unknown', selectedCaseId);

  // Helper to inject toggle prop into Sidebar if it's a React Element
  const sidebarWithProps = React.isValidElement(sidebar) 
    ? React.cloneElement(sidebar as React.ReactElement<any>, { 
        isOpen: isSidebarOpen, 
        onClose: () => setIsSidebarOpen(false) 
      }) 
    : sidebar;

  // Helper to inject toggle handler into Header
  const headerWithProps = React.isValidElement(headerContent)
    ? React.cloneElement(headerContent as React.ReactElement<any>, {
        onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen)
      })
    : headerContent;

  return (
    <div className={cn(
      "flex h-[100dvh] w-screen font-sans overflow-hidden transition-colors duration-200", 
      theme.background, 
      theme.text.primary
    )}>
      {sidebarWithProps}
      
      <div className="flex-1 flex flex-col h-full w-full min-w-0 relative">
        {/* Passive Time Indicator */}
        {activeTime > 0 && (
            <div className={cn(
                "absolute top-0 right-0 h-0.5 bg-green-500 transition-all duration-1000 z-[60] pointer-events-none", 
                isIdle ? "opacity-0" : "opacity-100"
            )} style={{ width: `${Math.min((activeTime % 60) / 60 * 100, 100)}%` }} />
        )}

        <header className={cn("h-16 flex items-center justify-between px-4 md:px-6 shadow-sm z-40 shrink-0 border-b", theme.surface, theme.border.default)}>
          {headerWithProps}
        </header>
        
        {/* Main Content - strict overflow handling */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative isolate">
            {children}
        </main>
        
        {onNavigate && activeView && (
          <MobileBottomNav 
            activeView={activeView}
            onNavigate={onNavigate}
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
        )}
      </div>
    </div>
  );
};
