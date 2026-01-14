/**
 * Window Context Types
 * Type definitions for window management context
 */

export interface WindowInstance {
  id: string;
  title: string;
  component: React.ComponentType<unknown>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex?: number;
}

export interface DragState {
  isDragging: boolean;
  windowId?: string;
  offset?: { x: number; y: number };
}

export interface WindowStateValue {
  windows: WindowInstance[];
  activeWindowId?: string;
  dragState: DragState;
}

export interface WindowActionsValue {
  openWindow: (window: Omit<WindowInstance, "id">) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number }
  ) => void;
}

export interface WindowContextValue {
  state: WindowStateValue;
  actions: WindowActionsValue;
}

export interface WindowProviderProps {
  children: React.ReactNode;
}
