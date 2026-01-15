/**
 * Layout Type Definitions
 *
 * Shared types for layout system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/layout/types
 */

export interface LayoutState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  panelOpen: boolean;
  activePanel: string | null;
}

/**
 * State value exposed to consumers
 */
export interface LayoutStateValue {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  panelOpen: boolean;
  activePanel: string | null;
}

/**
 * Actions value exposed to consumers
 */
export interface LayoutActionsValue {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openPanel: (panelId: string) => void;
  closePanel: () => void;
  togglePanel: () => void;
}

/**
 * Combined interface
 */
export interface LayoutContextValue
  extends LayoutStateValue, LayoutActionsValue {}
