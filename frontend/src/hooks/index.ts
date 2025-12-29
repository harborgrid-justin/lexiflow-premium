// hooks/index.ts
// ============================================================================
// Hooks Barrel Export with Deprecation Management
// ============================================================================

// ============================================================================
// NEW & RECOMMENDED HOOKS
// ============================================================================

// React 18 Optimizations
export { useFormId, useFormIds, useAriaIds } from './useFormId';
export { useOptimizedFilter, useMultiFilter, useOptimizedSort } from './useOptimizedFilter';
export type { OptimizedFilterConfig, OptimizedFilterReturn } from './useOptimizedFilter';

// Unified List Navigation (replaces useKeyboardNav + useKeyboardNavigation)
export { useListNavigation } from './useListNavigation';
export type { UseListNavigationConfig, UseListNavigationResult, NavigationMode } from './useListNavigation';

// Backend Health Monitoring (replaces useBackendDiscovery)
export { useBackendHealth } from './useBackendHealth';

// UI Interaction Hooks (Best Practices Applied)
export { useResizeObserver, type Dimensions } from './useResizeObserver';
export { usePanZoom, type PanZoomState, type PanZoomControls } from './usePanZoom';

// ============================================================================
// CORE LOGIC & UTILITIES
// ============================================================================
export * from './useAppController';
export { useAutoSave, type UseAutoSaveOptions, type UseAutoSaveReturn, AutoSaveError } from './useAutoSave';
export * from './useAutoTimeCapture';
export * from './useBlobRegistry';
export * from './useClickOutside';
export { useDebounce, useDebouncedCallback, type DebouncedCallback } from './useDebounce';
export * from './useGlobalQueryStatus';
export * from './useHistory'; // State-based undo/redo - see JSDoc for when to use
export * from './useHoverIntent';
export * from './useIntersectionObserver';
export * from './useInterval';
export * from './useModal';
export { useNotify, type UseNotifyReturn } from './useNotify';
export * from './useReadAnalytics';
export * from './useScrollLock';
// Multi-selection hook (primary selection hook with shift-click support)
export {
  useSelection as useMultiRowSelection,
  type UseSelectionReturn as UseMultiRowSelectionReturn
} from './useSelection';
// Single-item selection hooks
export { useSelection as useSingleSelection, useMultiSelection, type UseMultiSelectionReturn } from './useSelectionState';
export type { UseSelectionReturn as UseSingleSelectionReturn } from './useSelectionState';

export * from './useSessionStorage';
export { useSort, type UseSortReturn, type SortConfig, type SortDirection } from './useSort';
export { useToggle, type UseToggleReturn } from './useToggle';
export * from './useWizard';
export * from './useWorkerSearch';
export * from './useTimeTracker';
export * from './useSettlementSimulation';
export * from './useSLAMonitoring';
export * from './useFilterAndSearch';
export * from './useModalState';
export { useArrayState, type UseArrayStateReturn } from './useArrayState';

// ============================================================================
// DOMAIN SPECIFIC HOOKS
// ============================================================================
export * from './useCalendarView';
export * from './useCanvasDrag';
export * from './useCaseDetail';
export * from './useCaseList';
export * from './useCaseOverview';
export * from './useDiscoveryPlatform';
export * from './useDocumentManager'; // Now includes optional drag-drop
export * from './useDomainData'; // Aggregated Domain Data
export * from './useEvidenceVault';
export * from './useGanttDrag';
export * from './useLitigationBuilder';
export * from './useNexusGraph';
export * from './useRuleSearchAndSelection';
export * from './useSecureMessenger';
export * from './useWorkflowBuilder';

// Analytics & Monitoring Hooks
export { useTimeTracker } from './useTimeTracker';
export { useSettlementSimulation } from './useSettlementSimulation';
export { useSLAMonitoring } from './useSLAMonitoring';
export type { SLAItem } from './useSLAMonitoring';

// Data Management Hooks
export { useFilterAndSearch } from './useFilterAndSearch';
export type { FilterConfig, UseFilterAndSearchOptions, UseFilterAndSearchReturn } from './useFilterAndSearch';

// ============================================================================
// STRATEGY CANVAS & COMMAND MANAGEMENT
// ============================================================================
export * from './useStrategyCanvas';
export * from './useCommandHistory'; // Imperative command pattern - see JSDoc for when to use
export * from './useKeyboardShortcuts';

// Form Validation
export { useFormValidation, ValidationRules } from './useFormValidation';
export type { ValidationRule, FieldValidation, FormValidationState, ValidationSchema, UseFormValidationOptions, UseFormValidationReturn } from './useFormValidation';

// Progress Tracking
export { useProgress } from './useProgress';
export type { ProgressStep, ProgressStatus, UseProgressOptions, UseProgressReturn } from './useProgress';

// Drag and Drop
export { useDragToReorder } from './useDragToReorder';
export type { DraggableItem, UseDragToReorderOptions, UseDragToReorderReturn } from './useDragToReorder';

// Gantt Dependencies
export { useGanttDependencies } from './gantt';
export type { TaskDependency, DependencyType, GanttTask, ValidationResult, CriticalPath, UseGanttDependenciesReturn } from './gantt';

// Context Toolbar
export { useContextToolbar } from './useContextToolbar';
export type { ToolbarAction, ToolbarContext, UseContextToolbarOptions, UseContextToolbarReturn } from './useContextToolbar';

// Elastic Scroll
export { useElasticScroll } from './useElasticScroll';
export type { ElasticScrollConfig, ScrollState, UseElasticScrollReturn } from './useElasticScroll';

// Adaptive Loading
export { useAdaptiveLoading } from './useAdaptiveLoading';
export type { LoadingState, UseAdaptiveLoadingOptions, UseAdaptiveLoadingReturn } from './useAdaptiveLoading';

// ============================================================================
// DOCKET-SPECIFIC HOOKS
// ============================================================================
export * from './useVirtualizedDocket';
export * from './useLiveDocketFeed';

// ============================================================================
// ADDITIONAL HOOKS (Previously Missing)
// ============================================================================
export * from './useBackendDiscovery';
export * from './useDataServiceCleanup';
export * from './useDocumentDragDrop';
export * from './useEntityAutocomplete';
export * from './useKeyboardNavigation';
export * from './usePerformanceTracking';
export * from './useQueryHooks';
export * from './useSync';
export * from './useTrustAccounts';

// ============================================================================
// PERFORMANCE OPTIMIZATION HOOKS
// ============================================================================
export {
  useMemoizedValue,
  useMemoizedCallback,
  useDeepMemo,
  useDeepCallback,
  useConstant,
  useMemoCache,
  useMemoWithStats,
  type MemoizationConfig,
  type MemoStats,
} from './useMemoized';

export {
  useLazyComponent,
  useLazyComponentWithState,
  usePreloadableComponent,
  useRouteComponents,
  useIdleLazyComponent,
  loadWithTimeout,
  loadWithRetry,
  prefetchComponents,
  type ComponentImportFunc,
  type LazyComponentState,
  type PreloadableComponent,
} from './useCodeSplitting';

export {
  useProgressiveImage,
  useLazyImage,
  useResponsiveImage,
  useImagePreload,
  useImageFormat,
  useBlurhashPlaceholder,
  useOptimizedImageProps,
  type ImageLoadState,
  type ResponsiveSource,
} from './useImageOptimization';

export {
  useVirtualList,
  useVirtualGrid,
  useInfiniteVirtualList,
  type VirtualItem,
  type VirtualListConfig,
  type VirtualListState,
  type ScrollToOptions,
} from './useVirtualList';

// ============================================================================
// WEBSOCKET & REAL-TIME COMMUNICATION HOOKS
// ============================================================================
export {
  useWebSocket,
  useWebSocketEvent,
  ConnectionStatus,
  type WebSocketOptions,
  type EventListener,
} from './useWebSocket';

export {
  useRealTimeData,
  useNotifications,
  useDashboard,
  useTypingIndicator,
  type RealTimeDataOptions,
  type RealTimeDataState,
} from './useRealTimeData';

export {
  usePresence,
  useUserPresence,
  useMultiUserPresence,
  getPresenceStatusDisplay,
  formatLastSeen,
  PresenceStatus,
  type UserPresence,
  type PresenceOptions,
} from './usePresence';
