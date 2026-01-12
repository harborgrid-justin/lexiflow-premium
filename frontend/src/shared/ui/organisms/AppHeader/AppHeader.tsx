/**
 * @module components/layout/AppHeader
 * @category Layout
 * @description Application header with neural command bar, quick action menu, connectivity HUD,
 * notifications, system heartbeat indicator, and user profile menu. Provides global search and
 * AI-powered command execution via NeuralCommandBar.
 *
 * THEME SYSTEM USAGE:
 * - theme.text.primary/secondary/tertiary - Header text and icons
 * - theme.surface.default/highlight - Header background and button hover states
 * - theme.border.default - Dividers and dropdown borders
 * - theme.primary colors for active states
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { Clock, FileText, Menu, PlusCircle, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { NotificationCenter } from '@/shared/ui/molecules/NotificationCenter';
import { UserAvatar } from '@/shared/ui/molecules/UserAvatar';
import { ConnectionStatus } from '../ConnectionStatus/ConnectionStatus';
import { ConnectivityHUD } from '../ConnectivityHUD/ConnectivityHUD';
import { NeuralCommandBar } from '../NeuralCommandBar/NeuralCommandBar';
import { GlobalCaseSelector } from '../GlobalCaseSelector/GlobalCaseSelector';

// Services & Data
import { IntentResult } from '@/services/features/research/geminiService';
import { GlobalSearchResult } from '@/services/search/searchService';

// Hooks & Context
import { useTheme } from '@/features/theme';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useInterval } from '@/shared/hooks/useInterval';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// Types
import { User as UserType } from '@/types';

// ========================================
// TYPES & INTERFACES
// ========================================
interface AppHeaderProps {
  onToggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onGlobalSearch: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  currentUser?: UserType;
  onSwitchUser: () => void;
  onSearchResultClick?: (result: GlobalSearchResult) => void;
  onNeuralCommand?: (intent: IntentResult) => void;
}

// ========================================
// COMPONENT
// ========================================
export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar, globalSearch, setGlobalSearch, onGlobalSearch, currentUser, onSwitchUser, onSearchResultClick, onNeuralCommand
}) => {
  const { theme } = useTheme();
  const [pulse, setPulse] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const quickActionRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(quickActionRef as React.RefObject<HTMLElement>, () => setIsQuickActionOpen(false));

  // System Heartbeat Visual
  useInterval(() => setPulse(p => !p), 2000);

  return (
    <header role="banner" className="flex-1 flex items-center justify-between h-full">
      <div className="flex items-center flex-1 gap-4">
        <button
          onClick={onToggleSidebar}
          className={cn("md:hidden p-2 -ml-2 rounded-lg focus:outline-none transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <NeuralCommandBar
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onGlobalSearch={onGlobalSearch}
          onSearchResultClick={onSearchResultClick}
          onNeuralCommand={onNeuralCommand}
        />

        {/* Global Case Selector */}
        <div className="hidden lg:block ml-2">
          <GlobalCaseSelector />
        </div>

        {/* Connection Status - Shows IndexedDB vs PostgreSQL */}
        <ConnectionStatus className="hidden lg:flex" />

        {/* System Heartbeat Dot - Desktop only */}
        <div className={cn("hidden xl:flex items-center gap-2 px-3 py-1 rounded border", theme.surface.highlight, theme.border.default)}>
          <div className={cn("w-2 h-2 rounded-full transition-opacity duration-1000 bg-success", pulse ? "opacity-100" : "opacity-40")}></div>
          <span className={cn("text-[9px] font-mono uppercase tracking-widest", theme.text.tertiary)}>System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all text-xs font-bold shadow-sm", theme.surface.default, theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
          >
            <PlusCircle className={cn("h-4 w-4", theme.primary.text)} /> Quick Add
          </button>

          {isQuickActionOpen && (
            <div className={cn("absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface.default, theme.border.default)}>
              <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <Clock className={cn("h-4 w-4", theme.status.success.icon)} /> Log Time
              </button>
              <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <FileText className={cn("h-4 w-4", theme.primary.text)} /> New Document
              </button>
              <button className={cn("w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors", theme.text.primary, `hover:${theme.surface.highlight}`)}>
                <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" /> New Client
              </button>
            </div>
          )}
        </div>

        <ConnectivityHUD />

        <NotificationCenter
          notifications={[
            {
              id: '1',
              type: 'info',
              title: 'New Case Assigned',
              message: 'Smith v. Johnson case has been assigned to you.',
              timestamp: new Date(Date.now() - 5 * 60000),
              read: false
            },
            {
              id: '2',
              type: 'warning',
              title: 'Deadline Approaching',
              message: 'Discovery deadline in 3 days for Case #2024-001',
              timestamp: new Date(Date.now() - 30 * 60000),
              read: false
            },
          ]}
          onNotificationClick={(notification) => console.log('Notification clicked:', notification)}
          onNotificationDismiss={(id) => console.log('Dismiss notification:', id)}
          onMarkAllRead={() => console.log('Mark all as read')}
          onClearAll={() => console.log('Clear all notifications')}
        />

        <div className={cn("h-8 w-px mx-1", theme.border.default)}></div>

        <button
          className={cn("flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg transition-colors group", `hover:${theme.surface.highlight}`)}
          onClick={onSwitchUser}
          title="Switch User Profile"
        >
          <div className="text-right hidden md:block">
            <p className={cn("text-xs font-bold leading-tight", theme.text.primary)}>{currentUser?.name || 'Guest'}</p>
            <p className={cn("text-[10px] uppercase font-medium tracking-wide", theme.text.secondary)}>{currentUser?.role || 'User'}</p>
          </div>
          <UserAvatar user={currentUser ? { ...currentUser, name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() } : undefined} size="sm" showStatus={true} isOnline={true} className="shadow-sm" />
        </button>
      </div>
    </header>
  );
};
