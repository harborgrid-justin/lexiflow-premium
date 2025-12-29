/**
 * @module components/navigation/context/NavigationContext
 * @category Navigation - Context
 * @description Navigation context for managing navigation state, role-based visibility,
 * breadcrumbs, and navigation history across the application.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import type { UserRole } from '@/types';
import type { BreadcrumbItem } from '../components/Breadcrumbs/Breadcrumbs';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Navigation item definition
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  path: string;
  /** Parent item ID (for hierarchy) */
  parentId?: string;
  /** Roles that can access this item */
  allowedRoles?: UserRole[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  /** Navigation item */
  item: NavigationItem;
  /** Timestamp */
  timestamp: number;
}

/**
 * Navigation context state
 */
export interface NavigationContextState {
  /** Current active navigation item */
  currentItem: NavigationItem | null;
  /** Breadcrumb trail */
  breadcrumbs: BreadcrumbItem[];
  /** Navigation history (recent items) */
  history: NavigationHistoryEntry[];
  /** Current user role */
  userRole: UserRole | null;
  /** Whether sidebar is open (mobile) */
  isSidebarOpen: boolean;
  /** Whether command palette is open */
  isCommandPaletteOpen: boolean;
}

/**
 * Navigation context actions
 */
export interface NavigationContextActions {
  /** Navigate to a new item */
  navigateTo: (item: NavigationItem) => void;
  /** Set current user role */
  setUserRole: (role: UserRole | null) => void;
  /** Set breadcrumbs manually */
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  /** Add breadcrumb to trail */
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  /** Clear navigation history */
  clearHistory: () => void;
  /** Toggle sidebar (mobile) */
  toggleSidebar: () => void;
  /** Set sidebar open state */
  setSidebarOpen: (open: boolean) => void;
  /** Toggle command palette */
  toggleCommandPalette: () => void;
  /** Set command palette open state */
  setCommandPaletteOpen: (open: boolean) => void;
  /** Check if user has access to a navigation item */
  hasAccess: (item: NavigationItem) => boolean;
  /** Get navigation history */
  getRecentItems: (limit?: number) => NavigationHistoryEntry[];
}

/**
 * Combined navigation context value
 */
export interface NavigationContextValue
  extends NavigationContextState,
    NavigationContextActions {}

// ============================================================================
// CONTEXT
// ============================================================================

const NavigationContext = createContext<NavigationContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface NavigationProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Initial user role */
  initialUserRole?: UserRole | null;
  /** Maximum history entries */
  maxHistoryEntries?: number;
}

/**
 * NavigationProvider - Provides navigation context to child components
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialUserRole = null,
  maxHistoryEntries = 20,
}) => {
  // State
  const [currentItem, setCurrentItem] = useState<NavigationItem | null>(null);
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);
  const [history, setHistory] = useState<NavigationHistoryEntry[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(initialUserRole);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Actions
  const navigateTo = useCallback(
    (item: NavigationItem) => {
      setCurrentItem(item);

      // Add to history
      setHistory((prev) => {
        const newEntry: NavigationHistoryEntry = {
          item,
          timestamp: Date.now(),
        };

        // Remove duplicates and add new entry
        const filtered = prev.filter((entry) => entry.item.id !== item.id);
        const updated = [newEntry, ...filtered];

        // Limit history size
        return updated.slice(0, maxHistoryEntries);
      });

      // Auto-generate breadcrumbs from navigation hierarchy
      const newBreadcrumbs: BreadcrumbItem[] = [];
      let current: NavigationItem | null = item;

      // Build breadcrumb trail (reversed, will be flipped later)
      const trail: NavigationItem[] = [];
      while (current) {
        trail.unshift(current);
        // In a real app, you'd look up the parent from a navigation registry
        current = null; // Simplified for this example
      }

      // Convert to breadcrumb items
      trail.forEach((navItem) => {
        newBreadcrumbs.push({
          id: navItem.id,
          label: navItem.label,
          path: navItem.path,
          allowedRoles: navItem.allowedRoles,
        });
      });

      setBreadcrumbsState(newBreadcrumbs);
    },
    [maxHistoryEntries]
  );

  const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbsState(breadcrumbs);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    setBreadcrumbsState((prev) => [...prev, breadcrumb]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const setCommandPaletteOpen = useCallback((open: boolean) => {
    setIsCommandPaletteOpen(open);
  }, []);

  const hasAccess = useCallback(
    (item: NavigationItem): boolean => {
      // If no role restrictions, item is accessible
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        return true;
      }

      // If no user role set, deny access to restricted items
      if (!userRole) {
        return false;
      }

      // Check if user's role is in allowed roles
      return item.allowedRoles.includes(userRole);
    },
    [userRole]
  );

  const getRecentItems = useCallback(
    (limit: number = 10): NavigationHistoryEntry[] => {
      return history.slice(0, limit);
    },
    [history]
  );

  // Context value
  const value = useMemo<NavigationContextValue>(
    () => ({
      // State
      currentItem,
      breadcrumbs,
      history,
      userRole,
      isSidebarOpen,
      isCommandPaletteOpen,
      // Actions
      navigateTo,
      setUserRole,
      setBreadcrumbs,
      addBreadcrumb,
      clearHistory,
      toggleSidebar,
      setSidebarOpen,
      toggleCommandPalette,
      setCommandPaletteOpen,
      hasAccess,
      getRecentItems,
    }),
    [
      currentItem,
      breadcrumbs,
      history,
      userRole,
      isSidebarOpen,
      isCommandPaletteOpen,
      navigateTo,
      setBreadcrumbs,
      addBreadcrumb,
      clearHistory,
      toggleSidebar,
      setSidebarOpen,
      toggleCommandPalette,
      setCommandPaletteOpen,
      hasAccess,
      getRecentItems,
    ]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * useNavigation - Hook to access navigation context
 * @throws {Error} If used outside of NavigationProvider
 */
export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return context;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * withNavigationContext - HOC to inject navigation context as props
 */
export function withNavigationContext<P extends object>(
  Component: React.ComponentType<P & { navigation: NavigationContextValue }>
): React.FC<Omit<P, 'navigation'>> {
  return (props: Omit<P, 'navigation'>) => {
    const navigation = useNavigation();
    return <Component {...(props as P)} navigation={navigation} />;
  };
}
