/**
 * MainLayout Component
 * Main application layout shell with header, sidebar, and content area
 */

import React, { useState, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  sidebarContent?: ReactNode;
  fluid?: boolean;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = false,
  showSidebar = true,
  headerContent,
  footerContent,
  sidebarContent,
  fluid = false,
  className,
}) => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className={cn('min-h-screen flex flex-col', theme.surface.primary)}>
      {/* Header */}
      {showHeader && (
        <header
          className={cn(
            'sticky top-0 z-40 border-b',
            theme.surface.secondary,
            theme.border.default
          )}
        >
          {headerContent || (
            <Header
              onToggleSidebar={() => {
                if (window.innerWidth < 768) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
            />
          )}
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside
              className={cn(
                'hidden md:block border-r transition-all duration-300',
                theme.surface.secondary,
                theme.border.default,
                isSidebarOpen ? 'w-64' : 'w-0'
              )}
            >
              {isSidebarOpen && (sidebarContent || <Sidebar />)}
            </aside>

            {/* Mobile Sidebar */}
            {isMobileSidebarOpen && (
              <>
                {/* Overlay */}
                <div
                  className="md:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside
                  className={cn(
                    'md:hidden fixed inset-y-0 left-0 z-50 w-64 border-r',
                    'transform transition-transform duration-300',
                    theme.surface.secondary,
                    theme.border.default,
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  )}
                >
                  {sidebarContent || (
                    <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
                  )}
                </aside>
              </>
            )}
          </>
        )}

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            theme.surface.primary,
            className
          )}
        >
          <div className={cn(!fluid && 'container mx-auto', 'h-full')}>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && (
        <footer
          className={cn(
            'border-t',
            theme.surface.secondary,
            theme.border.default
          )}
        >
          {footerContent || <Footer />}
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
