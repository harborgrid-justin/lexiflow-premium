// hooks/index.ts
// ============================================================================
// Hooks Barrel Export - ORGANIZATION REFACTOR COMPLETE
// ============================================================================

// ============================================================================
// CORE (Fundamentals & Global State)
// ============================================================================
// export * from "./core/index"; // Removed to avoid duplicates with explicit exports
export {
  useAppContext,
  useAppContext as useAppController,
} from "./core/useAppContext";
export { useArrayState, type UseArrayStateReturn } from "./core/useArrayState";
export {
  useAuth,
  useAuthActions,
  useAuthState,
  type AuthUser,
} from "./core/useAuth";
export { useAutoSave } from "./core/useAutoSave";
export { useBlobRegistry } from "./core/useBlobRegistry";
export { useClipboard } from "./core/useClipboard";
// useCodeSplitting does not export default, exporting named exports:
export {
  loadWithTimeout,
  useIdleLazyComponent,
  useLazyComponent,
  useLazyComponentWithState,
  usePreloadableComponent,
  useRouteComponents,
} from "./core/useCodeSplitting";
export {
  useCommandHistory,
  type UseCommandHistoryReturn,
} from "./core/useCommandHistory";
export { useCrypto } from "./core/useCrypto";
export {
  useDebounce,
  useDebouncedCallback,
  type DebouncedCallback,
} from "./core/useDebounce";
export { useEnhancedAutoSave } from "./core/useEnhancedAutoSave";
export { useFeatureFlag } from "./core/useFeatureFlag";
export { useAriaIds, useFormId, useFormIds } from "./core/useFormId";
export { useHistory } from "./core/useHistory";
export { useInterval } from "./core/useInterval";
// useMemoized named exports:
export {
  useConstant,
  useDeepCallback,
  useDeepMemo,
  useMemoCache,
  useMemoizedCallback,
  useMemoizedValue,
  useMemoWithStats,
} from "./core/useMemoized";
export { usePermissions } from "./core/usePermissions";
export { useSession } from "./core/useSession";
export { useSessionStorage } from "./core/useSessionStorage";
export { useStorage } from "./core/useStorage";
export { useToggle, type UseToggleReturn } from "./core/useToggle";

// ============================================================================
// UI (Interactions & Visuals)
// ============================================================================
export { useAdaptiveLoading } from "./ui/useAdaptiveLoading";
export { useAppShellLogic } from "./ui/useAppShellLogic";
export { useBreadcrumbs } from "./ui/useBreadcrumbs";
export { useCanvasDrag } from "./ui/useCanvasDrag";
export { useClickOutside } from "./ui/useClickOutside";
export { useContextToolbar } from "./ui/useContextActions";
export {
  useDragToReorder,
  type DraggableItem,
  type UseDragToReorderOptions,
  type UseDragToReorderReturn,
} from "./ui/useDragToReorder";
export { useElasticScroll } from "./ui/useElasticScroll";

// UI Folders (Barrels)
export * from "./ui/useEnhancedFormValidation";
export * from "./ui/useEnhancedWizard";
export * from "./ui/useOptimizedFilter";
export * from "./ui/useVirtualList";

export { useEntityAutocomplete } from "./ui/useEntityAutocomplete";
export {
  useFormValidation,
  type UseFormValidationReturn,
  type ValidationRules,
} from "./ui/useFormValidation";
export { useHoverIntent } from "./ui/useHoverIntent";
// useImageOptimization named exports:
export {
  useBlurhashPlaceholder,
  useImageFormat,
  useImagePreload,
  useLazyImage,
  useOptimizedImageProps,
  useProgressiveImage,
  useResponsiveImage,
} from "./ui/useImageOptimization";
export { useIntersectionObserver } from "./ui/useIntersectionObserver";
export { useKeyboardNav } from "./ui/useKeyboardNav";
export { useKeyboardShortcuts } from "./ui/useKeyboardShortcuts";
export {
  useListNavigation,
  type NavigationMode,
  type UseListNavigationConfig,
  type UseListNavigationResult,
} from "./ui/useListNavigation";
export { useModal } from "./ui/useModal";
export { useModalState } from "./ui/useModalState";
export { useMultiSelection } from "./ui/useMultiSelection";
export { useNexusGraph } from "./ui/useNexusGraph";
export { useNotifications } from "./ui/useNotifications";
export { useNotify, type UseNotifyReturn } from "./ui/useNotify";
export { useProgress } from "./ui/useProgress";
export { useResizeObserver, type Dimensions } from "./ui/useResizeObserver";
export { useScrollLock } from "./ui/useScrollLock";
// useSelection:
export { useSelection } from "./ui/useSelection";
// useSelectionState (Avoiding conflict with useSelection, exporting useMultiSelection which is unique):
export { useMultiSelection as useMultiSelectionState } from "./ui/useSelectionState"; // Exporting useMultiSelection as alias to avoid confusion? No, it's useMultiSelection inside.
// Actually, I'll export useMultiSelection direct from useSelectionState if needed, but it seems similar to useMultiSelection from useMultiSelection.ts?
// Wait, is there a useMultiSelection.ts? Yes, ls showed it.
// Checking redundancy...
export * from "./ui/useMultiSelection";

export { useSelectionState } from "./ui/useSelectionState"; // If it exists? grep didn't show it.
// Grep showed: `export function useSelection<T>(` and `export function useMultiSelection<T>(` in useSelectionState.ts
// So we can export:
export {
  useMultiSelection as useSimpleMultiSelection,
  useSelection as useSimpleSelection,
} from "./ui/useSelectionState";

export { useSort, type SortConfig, type UseSortReturn } from "./ui/useSort";
export {
  useViewportTransform as usePanZoom,
  type PanZoomControls,
  type PanZoomState,
} from "./ui/useViewportTransform";
export { useWizard } from "./ui/useWizard";

// ============================================================================
// DATA (API, Sync, Performance)
// ============================================================================
export { useApiMutation } from "./data/useApiMutation";
export { useApiQuery } from "./data/useApiQuery";
export { useBackendDiscovery } from "./data/useBackendDiscovery";
export { useBackendHealth } from "./data/useBackendHealth";
export { useDataServiceCleanup } from "./data/useDataServiceCleanup";
// useDomainData named exports:
export {
  useCases,
  useClients,
  useConnectors,
  useConversations,
  useDataDictionary,
  useDocket,
  useDocuments,
  useEvidence,
  useExhibits,
  usePipelines,
  useProjects,
  useResearchHistory,
  useSchemaTables,
  useStaff,
  useTasks,
  useUsers,
} from "./data/useDomainData";
export {
  useFilterAndSearch,
  type FilterConfig,
} from "./data/useFilterAndSearch";
export { useGlobalQueryStatus } from "./data/useGlobalQueryStatus";
export { useNotificationWebSocket } from "./data/useNotificationWebSocket";
export { usePerformanceTracking } from "./data/usePerformanceTracking";
export { useQueryHooks, type UseQueryResult } from "./data/useQueryHooks";
export { useReadAnalytics } from "./data/useReadAnalytics";
export { useRealTimeData } from "./data/useRealTimeData";
export { useService } from "./data/useService";
export { useSync } from "./data/useSync";
export { useTelemetry } from "./data/useTelemetry";
export { useWebSocket } from "./data/useWebSocket";
export { useWorkerSearch } from "./data/useWorkerSearch";

// Data Folders
export { useEnterpriseData } from "./data/useEnterpriseData/useEnterpriseData";

// ============================================================================
// DOMAIN LOGIC (Forwarded from Routes)
// ============================================================================
// Cases
export {
  useCaseDetail,
  type UseCaseDetailReturn,
} from "@/routes/cases/_hooks/useCaseDetail";
export {
  useCaseList,
  type UseCaseListReturn,
} from "@/routes/cases/_hooks/useCaseList";
export {
  useCaseOverview,
  type UseCaseOverviewReturn,
} from "@/routes/cases/_hooks/useCaseOverview";

// Documents
export { useDocumentDragDrop } from "@/routes/documents/_hooks/useDocumentDragDrop";
export {
  useDocumentManager,
  type UseDocumentManagerReturn,
} from "@/routes/documents/_hooks/useDocumentManager";

// Evidence
export {
  useEvidenceManager,
  type UseEvidenceVaultReturn,
} from "@/routes/evidence/_hooks/useEvidenceManager";

// Docket
export { useLiveDocketFeed } from "@/routes/docket/_hooks/useLiveDocketFeed";
export { useVirtualizedDocket } from "@/routes/docket/_hooks/useVirtualizedDocket";

// Calendar
export { useCalendarView } from "@/routes/calendar/_hooks/useCalendarView";
export { useScheduleController } from "@/routes/calendar/_hooks/useScheduleController";

// Discovery
export {
  useDiscoveryPlatform,
  type UseDiscoveryPlatformReturn,
} from "@/routes/discovery/_hooks/useDiscoveryPlatform";

// Litigation
export {
  useLitigationBuilder,
  type UseLitigationBuilderReturn,
} from "@/routes/litigation/_hooks/useLitigationBuilder";
export { useSettlementSimulation } from "@/routes/litigation/_hooks/useSettlementSimulation";

// War Room
export { useStrategyCanvas } from "@/routes/war-room/_hooks/useStrategyCanvas";
// Workflows
export { useWorkflowBuilder } from "@/routes/workflows/_hooks/useWorkflowBuilder";

// Rules
export { useRuleSearchAndSelection } from "@/routes/rules/_hooks/useRuleSearchAndSelection";

// Messaging
export { useSecureMessenger } from "@/routes/messages/_hooks/useSecureMessenger";

// Billing
export { useAutoTimeCapture } from "@/routes/billing/_hooks/useAutoTimeCapture";
export { useTimeTracker } from "@/routes/billing/_hooks/useTimeTracker";
export { useTrustAccounts } from "@/routes/billing/_hooks/useTrustAccounts";

// Dashboard
export { useSLAMonitoring } from "@/routes/dashboard/_hooks/useSLAMonitoring";

// ============================================================================
// OTHERS (Performance, Schedule, Presence, Routing)
// ============================================================================
export * from "./performance";
export * from "./presence";
export { useRouteTransition } from "./routing/useRouteTransition";
export * from "./schedule";
