/**
 * UI Interaction Hooks Barrel Export
 *
 * Hooks for UI interactions, keyboard navigation, and visual effects.
 * Import from '@/hooks/ui' for better tree-shaking.
 */

// Keyboard Navigation
export { useKeyboardShortcuts } from "./ui/useKeyboardShortcuts";
export { useListNavigation } from "./ui/useListNavigation";
export type {
  NavigationMode,
  UseListNavigationConfig,
  UseListNavigationResult,
} from "./ui/useListNavigation";

// Observers & DOM
export { useIntersectionObserver } from "./ui/useIntersectionObserver";
export { useResizeObserver, type Dimensions } from "./ui/useResizeObserver";
export { useScrollLock } from "./ui/useScrollLock";

// Drag & Drop
export { useCanvasDrag } from "./ui/useCanvasDrag";
export { useDragToReorder } from "./ui/useDragToReorder";

// Pan & Zoom
export {
  useViewportTransform as usePanZoom,
  type PanZoomControls,
  type PanZoomState,
} from "./ui/useViewportTransform";

// Wizards & Forms
export { useEnhancedFormValidation } from "./ui/useEnhancedFormValidation";
export { useEnhancedWizard } from "./ui/useEnhancedWizard";
export { useFormValidation } from "./ui/useFormValidation";
export { useWizard } from "./ui/useWizard";
