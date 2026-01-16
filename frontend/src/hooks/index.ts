/**
 * Shared Hooks - Generic React Hooks
 *
 * Business-agnostic hooks for common UI patterns.
 * Zero dependencies on domain models or business logic.
 *
 * @module shared/hooks
 */

// ============================================================================
// PROVIDER HOOKS (Application & Infrastructure Layer)
// ============================================================================

/**
 * Centralized provider hooks for routes
 * Import from here rather than individual provider directories
 */
export * from "./provider-hooks";

// ============================================================================
// UI HOOKS (Generic React Patterns)
// ============================================================================

// State management
export * from "./useArrayState";
export * from "./useMemoized";
export * from "./useToggle";

// Performance & optimization
export * from "./useDebounce";
export * from "./useInterval";

// DOM interactions
export * from "./useClickOutside";
export * from "./useHoverIntent";
export * from "./useScrollLock";

// Observers
export * from "./useIntersectionObserver";
export * from "./useResizeObserver";

// Forms & accessibility
export * from "./useFormId";

// Keyboard
export * from "./useKeyboardNav";

// ============================================================================
// DOMAIN HOOKS (Operations)
// ============================================================================
export {
  useSLAMonitoring,
  type SLAItem,
  type UseSLAMonitoringReturn,
} from "./useSLAMonitoring";

export {
  useScheduleController,
  type DragMode,
  type UseGanttDragReturn,
} from "./useScheduleController";
