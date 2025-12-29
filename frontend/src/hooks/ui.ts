/**
 * UI Interaction Hooks Barrel Export
 * 
 * Hooks for UI interactions, keyboard navigation, and visual effects.
 * Import from '@/hooks/ui' for better tree-shaking.
 */

// Keyboard Navigation
export { useListNavigation } from './useListNavigation';
export type { UseListNavigationConfig, UseListNavigationResult, NavigationMode } from './useListNavigation';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Observers & DOM
export { useResizeObserver, type Dimensions } from './useResizeObserver';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useScrollLock } from './useScrollLock';

// Drag & Drop
export { useCanvasDrag } from './useCanvasDrag';
export { useGanttDrag } from './useGanttDrag';
export { useDragToReorder } from './useDragToReorder';
export { useDocumentDragDrop } from './useDocumentDragDrop';

// Pan & Zoom
export { usePanZoom, type PanZoomState, type PanZoomControls } from './usePanZoom';

// Wizards & Forms
export { useWizard } from './useWizard';
export { useEnhancedWizard } from './useEnhancedWizard';
export { useFormValidation } from './useFormValidation';
export { useEnhancedFormValidation } from './useEnhancedFormValidation';
