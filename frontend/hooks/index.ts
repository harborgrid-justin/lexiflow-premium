// hooks/index.ts

// Core Logic & Utilities
export * from './useAppController';
export * from './useAutoSave';
export * from './useAutoTimeCapture';
export * from './useBlobRegistry';
export * from './useClickOutside';
export * from './useDebounce';
export * from './useGlobalQueryStatus';
export * from './useHistory';
export * from './useHoverIntent';
export * from './useIntersectionObserver';
export * from './useInterval';
export * from './useKeyboardNav';
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

// Domain Specific Hooks
export * from './useCalendarView';
export * from './useCanvasDrag';
export * from './useCaseDetail';
export * from './useCaseList';
export * from './useCaseOverview';
export * from './useDiscoveryPlatform';
export * from './useDocumentDragDrop';
export * from './useDocumentManager';
export * from './useDomainData'; // Aggregated Domain Data
export * from './useEvidenceVault';
export * from './useGanttDrag';
export * from './useLitigationBuilder';
export * from './useNexusGraph';
export * from './useRuleSearchAndSelection';
export * from './useSecureMessenger';
export * from './useWorkflowBuilder';

// Strategy Canvas & Command Management
export * from './useStrategyCanvas';
export * from './useCommandHistory';
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

// Docket-Specific Hooks
export * from './useVirtualizedDocket';
export * from './useKeyboardNavigation';
export * from './useLiveDocketFeed';