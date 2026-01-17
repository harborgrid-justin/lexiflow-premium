/**
 * ================================================================================
 * LAYOUT PROVIDER - APPLICATION LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Layout State Management + Persistence
 *
 * RESPONSIBILITIES:
 * • Global layout state (sidebar, panels, windows)
 * • Layout preferences (collapsed, expanded)
 * • Window/panel configurations
 * • Responsive layout adjustments
 * • Persistent user preferences (localStorage)
 *
 * REACT 18 PATTERNS:
 * ✓ BP7: Memoized context values for stable references
 * ✓ BP8: useCallback for stable action functions
 * ✓ BP10: startTransition for localStorage persistence
 * ✓ BP14: SSR-safe initialization with fallbacks
 * ✓ StrictMode compatible with proper cleanup
 *
 * INTEGRATION:
 * • Consumed by /layouts/AppShellLayout for sidebar control
 * • Persists to localStorage with lexiflow- prefix
 * • Coordinates layout state across route changes
 * • Provides stable actions to prevent re-renders
 *
 * CROSS-CUTTING CAPABILITY:
 * • StateProvider manages app-level bookmarks/recent items
 * • LayoutProvider manages structural layout state
 * • ThemeProvider affects layout density/colors
 * • All providers coordinate via ApplicationLayer
 *
 * ENTERPRISE INVARIANTS:
 * • No business logic (purely layout concerns)
 * • Observable state for UI coordination
 * • User preference driven with persistence
 * • No direct API calls (state management only)
 *
 * @module providers/application/layoutprovider
 */

import { type ReactNode, useCallback, useContext, useEffect, useMemo, useState, startTransition } from 'react';

import { LayoutContext } from '@/lib/layout/contexts';

import type { LayoutContextValue, LayoutStateValue } from '@/lib/layout/types';

// ============================================================================
// Constants
// ============================================================================

const SIDEBAR_OPEN_KEY = 'lexiflow-sidebar-open';
const SIDEBAR_COLLAPSED_KEY = 'lexiflow-sidebar-collapsed';
const ACTIVE_PANEL_KEY = 'lexiflow-active-panel';

// ============================================================================
// Helper Functions
// ============================================================================

function loadBooleanFromStorage(key: string, defaultValue: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === 'true' : defaultValue;
  } catch {
    return defaultValue;
  }
}

function loadStringFromStorage(key: string, defaultValue: string | null): string | null {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  } catch {
    return defaultValue;
  }
}

export interface LayoutProviderProps {
  children: ReactNode;
  initialState?: Partial<LayoutStateValue>;
}

/**
 * Layout Provider
 * Provides global layout state management for application-level UI
 * Persists preferences to localStorage with lexiflow- prefix
 */
export function LayoutProvider({ children, initialState }: LayoutProviderProps) {
  // Initialize from localStorage or initialState (BP14: SSR-safe)
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    initialState?.sidebarOpen ?? loadBooleanFromStorage(SIDEBAR_OPEN_KEY, true)
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    initialState?.sidebarCollapsed ?? loadBooleanFromStorage(SIDEBAR_COLLAPSED_KEY, false)
  );
  const [panelOpen, setPanelOpen] = useState(initialState?.panelOpen ?? false);
  const [activePanel, setActivePanel] = useState<string | null>(() =>
    initialState?.activePanel ?? loadStringFromStorage(ACTIVE_PANEL_KEY, null)
  );

  // Persist sidebar open state (BP10: Use transitions for non-urgent updates)
  useEffect(() => {
    startTransition(() => {
      try {
        localStorage.setItem(SIDEBAR_OPEN_KEY, String(sidebarOpen));
      } catch (err) {
        console.error('[LayoutProvider] Failed to persist sidebarOpen:', err);
      }
    });
  }, [sidebarOpen]);

  // Persist sidebar collapsed state
  useEffect(() => {
    startTransition(() => {
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
      } catch (err) {
        console.error('[LayoutProvider] Failed to persist sidebarCollapsed:', err);
      }
    });
  }, [sidebarCollapsed]);

  // Persist active panel
  useEffect(() => {
    startTransition(() => {
      try {
        if (activePanel) {
          localStorage.setItem(ACTIVE_PANEL_KEY, activePanel);
        } else {
          localStorage.removeItem(ACTIVE_PANEL_KEY);
        }
      } catch (err) {
        console.error('[LayoutProvider] Failed to persist activePanel:', err);
      }
    });
  }, [activePanel]);

  // BP8: Memoized stable callbacks
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  const togglePanel = useCallback(() => setPanelOpen(prev => !prev), []);

  const openPanel = useCallback((panelId: string) => {
    setActivePanel(panelId);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setActivePanel(null);
  }, []);

  // BP7: Memoized context value for stable reference
  const value = useMemo<LayoutContextValue>(() => ({
    sidebarOpen,
    sidebarCollapsed,
    panelOpen,
    activePanel,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    openPanel,
    closePanel,
    togglePanel,
  }), [sidebarOpen, sidebarCollapsed, panelOpen, activePanel, toggleSidebar, toggleSidebarCollapsed, openPanel, closePanel, togglePanel]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

/**
 * Hook to access layout context
 */
export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
}

export default LayoutProvider;

// Re-export types for consumers
export type { LayoutActionsValue, LayoutContextValue, LayoutStateValue } from '@/lib/layout/types';
