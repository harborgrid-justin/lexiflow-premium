// hooks/index.ts
// ============================================================================
// Hooks Barrel Export with Deprecation Management
// ============================================================================

// ============================================================================
// NEW & RECOMMENDED HOOKS
// ============================================================================

// Unified List Navigation (replaces useKeyboardNav + useKeyboardNavigation)
export { useListNavigation } from './useListNavigation';
export type { UseListNavigationConfig, UseListNavigationResult, NavigationMode } from './useListNavigation';

// Backend Health Monitoring (replaces useBackendDiscovery)
export { useBackendHealth } from './useBackendHealth';

// ============================================================================
// CORE LOGIC & UTILITIES
// ============================================================================
export * from './useAppController';
export * from './useAutoSave';
export * from './useAutoTimeCapture';
export * from './useBlobRegistry';
export * from './useClickOutside';
export * from './useDebounce';
export * from './useGlobalQueryStatus';
export * from './useHistory'; // State-based undo/redo - see JSDoc for when to use
export * from './useHoverIntent';
export * from './useIntersectionObserver';
export * from './useInterval';
export * from './useModal';
export * from './useNotify';
export * from './useReadAnalytics';
export * from './useScrollLock';
export * from './useSelection';
export * from './useSessionStorage';
export * from './useSort';
export * from './useToggle';
export * from './useWizard';
export * from './useWorkerSearch';
export * from './useTimeTracker';
export * from './useSettlementSimulation';
export * from './useSLAMonitoring';
export * from './useFilterAndSearch';
export * from './useModalState';
export * from './useArrayState';
export * from './useSelectionState';

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
export { useGanttDependencies } from './useGanttDependencies';
export type { TaskDependency, DependencyType, GanttTask, ValidationResult, CriticalPath, UseGanttDependenciesReturn } from './useGanttDependencies';

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