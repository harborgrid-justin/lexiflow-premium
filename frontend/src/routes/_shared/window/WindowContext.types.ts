/**
 * WindowContext Type Definitions
 */

import { type ReactNode } from 'react';

export interface WindowInstance {
  id: string;
  title: string;
  component: ReactNode;
  isMinimized: boolean;
  isOpen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// BP2: Narrow interface - read-only state
export interface WindowStateValue {
  windows: readonly WindowInstance[];
  currentMaxZIndex: number;
  isOrbitalEnabled: boolean;
}

// BP2: Narrow interface - actions only
export interface WindowActionsValue {
  openWindow: (id: string, title: string, component: ReactNode) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleOrbitalMode: () => void;
}

// Combined interface for backward compatibility
export interface WindowContextValue extends WindowStateValue, WindowActionsValue {}

// Provider props
export interface WindowProviderProps {
  children: ReactNode;
  // BP14: Support test-friendly overrides
  initialOrbitalMode?: boolean;
  maxWindows?: number;
  // Theme classes to avoid circular dependency with ThemeContext
  theme?: {
    surface: { default: string; muted: string };
    border: { default: string };
    accent: { primary: string };
    text: { secondary: string; tertiary: string };
    interactive: { hover: string };
  };
}

// Drag state type
export interface DragState {
  id: string | null;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
}
