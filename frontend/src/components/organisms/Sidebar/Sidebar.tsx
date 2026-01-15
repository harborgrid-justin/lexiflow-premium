// components/layout/Sidebar.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { AppView, User } from '@/types';
import { cn } from '@/lib/cn';
import React from 'react';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onSwitchUser: () => void;
}

/**
 * Sidebar - React 18 optimized with React.memo
 */
export const Sidebar = React.memo<SidebarProps>(({ activeView, setActiveView, isOpen, onClose, currentUser, onSwitchUser }) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className={cn("fixed inset-0 backdrop-blur-sm z-40 md:hidden transition-opacity", theme.backdrop)}
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col h-full border-r transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none touch-pan-y",
        theme.surface.default,
        theme.border.default,
        // Desktop: Always static and visible
        "md:translate-x-0 md:static md:inset-auto",
        // Mobile: Toggle visibility
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>

        <SidebarHeader onClose={onClose} />

        <SidebarNav
          activeView={activeView}
          setActiveView={(view: AppView) => {
            setActiveView(view);
            if (window.innerWidth < 768) onClose();
          }}
          currentUserRole={currentUser?.role || 'user'}
        />

        {currentUser && (
          <SidebarFooter
            currentUser={currentUser}
            onSwitchUser={onSwitchUser}
            onNavigate={setActiveView}
            activeView={activeView}
          />
        )}
      </aside>
    </>
  );
});
