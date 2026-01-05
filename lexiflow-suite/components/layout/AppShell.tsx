
import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  headerContent: React.ReactNode;
  children: React.ReactNode;
  hideHeader?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ sidebar, headerContent, children, hideHeader = false }) => {
  return (
    <div 
      className="flex min-h-screen font-sans transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--color-background)', 
        color: 'var(--color-text)',
        fontFamily: 'var(--font-app)'
      }}
    >
      {/* Sticky Side Rail */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0 z-40 transition-all duration-300">
        {sidebar}
      </div>
      
      <div className="flex-1 flex flex-col transition-all min-w-0">
        {/* Dynamic Global Header */}
        {!hideHeader && (
          <header 
            className="h-16 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 sticky top-0 shrink-0 transition-colors duration-300"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fallback / Overlay
              borderColor: 'var(--color-border)',
              borderBottomWidth: '1px'
            }}
          >
            {headerContent}
          </header>
        )}
        
        {/* Natural Content Flow - No internal overflow hidden */}
        <main className="flex-1 relative">
            {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        {sidebar}
      </div>
    </div>
  );
};
