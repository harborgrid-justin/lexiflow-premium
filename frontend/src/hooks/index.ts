// hooks/index.ts
// ============================================================================
// Hooks Barrel Export - COMPLETE (For Backward Compatibility)
// ============================================================================
//
// ⚠️ PERFORMANCE WARNING: This barrel exports ALL hooks, which can slow down
// module resolution and increase bundle size.
//
// 📦 RECOMMENDED: Import from focused sub-barrels instead:
//
//   import { useToggle, useDebounce } from '@/hooks/core';           // State & utilities
//   import { useListNavigation } from '@/hooks/ui';                  // UI interactions
//   import { useOptimizedFilter } from '@/hooks/performance';        // React 18 optimizations
//   import { useCaseList } from '@/hooks/domain';                    // Domain logic (heavy)
//   import { useBackendHealth } from '@/hooks/backend';              // Backend integration
//
// This file remains for backward compatibility. New code should use focused imports.
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
export { useViewportTransform as usePanZoom, type PanZoomState, type PanZoomControls } from './useViewportTransform';

// ============================================================================
// CORE LOGIC & UTILITIES
// ============================================================================
export { useAppContext, type UseAppControllerReturn } from './useAppContext';
export { useAppContext as useAppController } from './useAppContext'; // Backward compatibility alias
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
export { useTimeTracker, type TimeTrackerOptions, type UseTimeTrackerReturn } from './useTimeTracker';
export { useSettlementSimulation, type SettlementScenario, type UseSettlementSimulationReturn } from './useSettlementSimulation';
export { useSLAMonitoring, type SLAItem, type UseSLAMonitoringReturn } from './useSLAMonitoring';
export * from './useFilterAndSearch';
export * from './useModalState';
export { useArrayState, type UseArrayStateReturn } from './useArrayState';

// ============================================================================
// DOMAIN SPECIFIC HOOKS
// ============================================================================
export * from './useCalendarView';
export * from './useCanvasDrag';
export { useCaseDetail, type UseCaseDetailReturn } from './useCaseDetail';
export { useCaseList, type UseCaseListReturn } from './useCaseList';
export { useCaseOverview, type UseCaseOverviewReturn } from './useCaseOverview';
export { useDiscoveryPlatform, type UseDiscoveryPlatformReturn } from './useDiscoveryPlatform';
export { useDocumentManager, type UseDocumentManagerReturn } from './useDocumentManager';
export {
  useCases,
  useDocuments,
  useDocket,
  useTasks,
  useEvidence,
  useExhibits,
  useStaff,
  useClients,
  useUsers,
  useProjects,
  useConversations,
  useResearchHistory,
  useSchemaTables,
  usePipelines,
  useConnectors,
  useDataDictionary,
  type UseQueryResult
} from './useDomainData';
export { useEvidenceManager, type UseEvidenceManagerReturn } from './useEvidenceManager';
export * from './useGanttController';
export { useLitigationBuilder, type UseLitigationBuilderReturn } from './useLitigationBuilder';
export * from './useNexusGraph';
export { useRuleSearchAndSelection, type UseRuleSearchReturn } from './useRuleSearchAndSelection';
export * from './useSecureMessenger';
export * from './useWorkflowBuilder';

// Analytics & Monitoring Hooks (already exported above)
// Data Management Hooks
export { useFilterAndSearch } from './useFilterAndSearch';
export type { FilterConfig, UseFilterAndSearchOptions, UseFilterAndSearchReturn } from './useFilterAndSearch';

// ============================================================================
// STRATEGY CANVAS & COMMAND MANAGEMENT
// ============================================================================
export { useStrategyCanvas, type UseStrategyCanvasReturn } from './useStrategyCanvas';
export { useCommandHistory, type Command, type UseCommandHistoryReturn } from './useCommandHistory';
export { useKeyboardShortcuts, type KeyboardShortcutConfig, type UseKeyboardShortcutsReturn } from './useKeyboardShortcuts';

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
export {
  useLiveDocketFeed,
  type ConnectionStatus,
  type LiveDocketFeedConfig,
  type LiveDocketFeedResult
} from './useLiveDocketFeed';

// ============================================================================
// ADDITIONAL HOOKS (Previously Missing)
// ============================================================================
export { useBackendDiscovery, type BackendDiscoveryState } from './useBackendDiscovery';
export { useDataServiceCleanup } from './useDataServiceCleanup';
export { useDocumentDragDrop, type UseDocumentDragDropReturn } from './useDocumentDragDrop';
export { useEntityAutocomplete, type UseEntityAutocompleteReturn } from './useEntityAutocomplete';
export * from './useKeyboardNavigation';
export * from './usePerformanceTracking';
export { useQuery, useMutation, queryClient } from './useQueryHooks';
export type { QueryKey, QueryState, UseMutationOptions, UseQueryOptions, MutationContext } from './useQueryHooks';
export * from './useSync';
export {
  useTrustAccounts,
  useCreateTrustAccount,
  useTrustAccountValidation,
  type TrustAccountFilters
} from './useTrustAccounts';

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
