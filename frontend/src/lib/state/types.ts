/**
 * Global State Provider Types
 * Type definitions for global application state management
 *
 * @module lib/state/types
 */

export interface AppPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface StateValue {
  preferences: AppPreferences;
  sidebarCollapsed: boolean;
  activeView: string | null;
  recentItems: string[];
  bookmarks: string[];
  isOnline: boolean;
  lastSync: string | null;
}

export interface StateActionsValue {
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  toggleSidebar: () => void;
  setActiveView: (view: string | null) => void;
  addRecentItem: (itemId: string) => void;
  addBookmark: (itemId: string) => void;
  removeBookmark: (itemId: string) => void;
  clearRecentItems: () => void;
  updateOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
}

export interface StateProviderProps {
  children: React.ReactNode;
  initialPreferences?: Partial<AppPreferences>;
}
