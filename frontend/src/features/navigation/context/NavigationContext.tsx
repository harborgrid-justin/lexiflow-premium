/**
 * @module components/navigation/context/NavigationContext
 * @category Navigation - Context
 * @description Navigation context for managing navigation state, role-based visibility,
 * breadcrumbs, and navigation history across the application.
 *
 * =====================================================================
 * REACT V18 ARCHITECTURE - "PH.D. LEVEL" COMPLIANCE
 * =====================================================================
 *
 * 1. TUPLE RETURNS: Hook returns [state, actions]
 * 2. EXPLICIT STATUS: status union ('idle' | 'navigating') instead of booleans
 * 3. SEPARATION OF CONCERNS: State vs Actions
 *
 * =====================================================================
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';

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
 * Navigation Status Union
 */
export type NavigationStatus = 'idle' | 'navigating';

/**
 * Navigation State (Data only)
 */
export interface NavigationState {
  /** Current active navigation item */
  readonly currentItem: NavigationItem | null;
  /** Breadcrumb trail */
  readonly breadcrumbs: readonly BreadcrumbItem[];
  /** Navigation history (recent items) */
  readonly history: readonly NavigationHistoryEntry[];
  /** Current user role */
  readonly userRole: UserRole | null;
  /** Whether sidebar is open (mobile) */
  readonly isSidebarOpen: boolean;
  /** Whether command palette is open */
  readonly isCommandPaletteOpen: boolean;
  /** Current operation status */
  readonly status: NavigationStatus;
}

/**
 * Navigation Actions (Functions only)
 */
export interface NavigationActions {
  /** Navigate to a new item */
  navigateTo: (item: NavigationItem) => void;
  /** Set current user role */
  setUserRole: (role: UserRole | null) => void;
  /** Set breadcrumbs manually */
  setBreadcrumbs: (breadcrumbs: readonly BreadcrumbItem[]) => void;
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
  /** Check if user has access */
  hasAccess: (item: NavigationItem) => boolean;
  /** Get navigation history */
  getRecentItems: (limit?: number) => readonly NavigationHistoryEntry[];
}

/**
 * Internal Context Value Type
 */
export type NavigationContextValue = [NavigationState, NavigationActions];

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
  // Concurrent Mode Transition
  const [isPending, startTransition] = useTransition();

  // State
  const [currentItem, setCurrentItem] = useState<NavigationItem | null>(null);
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);
  const [history, setHistory] = useState<NavigationHistoryEntry[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(initialUserRole);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Actions
  const navigateTo = useCallback(
    (item: NavigationItem) => {
      // Immediate update for UI responsiveness
      setCurrentItem(item);

      // Transition for heavy updates (history, breadcrumbs)
      startTransition(() => {
        setHistory((prev) => {
          const newEntry: NavigationHistoryEntry = {
            item,
            timestamp: Date.now(),
          };

          const filtered = prev.filter((entry) => entry.item.id !== item.id);
          const updated = [newEntry, ...filtered];

          return updated.slice(0, maxHistoryEntries);
        });

        // Breadcrumb logic
        const newBreadcrumbs: BreadcrumbItem[] = [];
        let current: NavigationItem | null = item;

        // Simplified breadcrumb reconstruction
        const trail: NavigationItem[] = [];
        while (current) {
          trail.unshift(current);
          current = null; // No parent lookup in this simplified version
        }

        trail.forEach((navItem) => {
          newBreadcrumbs.push({
            id: navItem.id,
            label: navItem.label,
            path: navItem.path,
            allowedRoles: navItem.allowedRoles,
          });
        });

        setBreadcrumbsState(newBreadcrumbs);
      });
    },
    [maxHistoryEntries]
  );

  const setBreadcrumbs = useCallback((breadcrumbs: readonly BreadcrumbItem[]) => {
    startTransition(() => {
      setBreadcrumbsState([...breadcrumbs]);
    });
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    startTransition(() => {
      setBreadcrumbsState((prev) => [...prev, breadcrumb]);
    });
  }, []);

  const clearHistory = useCallback(() => {
    startTransition(() => {
      setHistory([]);
    });
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
      if (!item.allowedRoles || item.allowedRoles.length === 0) {
        return true;
      }
      if (!userRole) {
        return false;
      }
      return item.allowedRoles.includes(userRole);
    },
    [userRole]
  );

  const getRecentItems = useCallback(
    (limit: number = 10): readonly NavigationHistoryEntry[] => {
      return history.slice(0, limit);
    },
    [history]
  );

  const setUserRoleAction = useCallback((role: UserRole | null) => {
    startTransition(() => {
      setUserRole(role);
    });
  }, []);

  // Memoized State Object
  const state: NavigationState = useMemo(() => ({
    currentItem,
    breadcrumbs,
    history,
    userRole,
    isSidebarOpen,
    isCommandPaletteOpen,
    status: isPending ? 'navigating' : 'idle'
  }), [currentItem, breadcrumbs, history, userRole, isSidebarOpen, isCommandPaletteOpen, isPending]);

  // Memoized Actions Object
  const actions: NavigationActions = useMemo(() => ({
    navigateTo,
    setUserRole: setUserRoleAction,
    setBreadcrumbs,
    addBreadcrumb,
    clearHistory,
    toggleSidebar,
    setSidebarOpen,
    toggleCommandPalette,
    setCommandPaletteOpen,
    hasAccess,
    getRecentItems
  }), [
    navigateTo,
    setUserRoleAction,
    setBreadcrumbs,
    addBreadcrumb,
    clearHistory,
    toggleSidebar,
    setSidebarOpen,
    toggleCommandPalette,
    setCommandPaletteOpen,
    hasAccess,
    getRecentItems
  ]);

  const value = useMemo<NavigationContextValue>(
    () => [state, actions],
    [state, actions]
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
 * useNavigation - Access navigation context
 * @returns [NavigationState, NavigationActions]
 */
export const useNavigation = (): [NavigationState, NavigationActions] => {
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
 * withNavigationContext - HOC to inject navigation context
 * Updated to support tuple return type.
 */
export function withNavigationContext<P extends object>(
  Component: React.ComponentType<P & { navigation: [NavigationState, NavigationActions] }>
): React.FC<Omit<P, 'navigation'>> {
  return (props: Omit<P, 'navigation'>) => {
    const navigation = useNavigation();
    return <Component {...(props as P)} navigation={navigation} />;
  };
}
