/**
 * Core Utility Hooks Barrel Export
 *
 * Basic hooks for state management, side effects, and utilities.
 * Import from '@/hooks/core' for better tree-shaking.
 */

// App Context
export { useAppContext, type UseAppControllerReturn } from './useAppContext';
export { useAppContext as useAppController } from './useAppContext'; // Backward compatibility alias

// State Management
export { useToggle, type UseToggleReturn } from './useToggle';
export { useArrayState, type UseArrayStateReturn } from './useArrayState';
export { useHistory } from './useHistory';
export { useSessionStorage } from './useSessionStorage';
export { useModal } from './useModal';
export { useModalState } from './useModalState';

// Selection Hooks
export { useSelection, type UseSelectionReturn } from './useSelection';
export {
  useSelection as useMultiRowSelection,
  type UseSelectionReturn as UseMultiRowSelectionReturn
} from './useSelection';
export {
  useSelection as useSingleSelection,
  useMultiSelection,
  type UseMultiSelectionReturn
} from './useSelectionState';
export type { UseSelectionReturn as UseSingleSelectionReturn } from './useSelectionState';

// Side Effects & Timing
export { useDebounce, useDebouncedCallback, type DebouncedCallback } from './useDebounce';
export { useInterval } from './useInterval';
export { useAutoSave, type UseAutoSaveOptions, type UseAutoSaveReturn, AutoSaveError } from './useAutoSave';
export { useEnhancedAutoSave } from './useEnhancedAutoSave';

// Utilities
export { useClickOutside } from './useClickOutside';
export { useHoverIntent } from './useHoverIntent';
export { useNotify, type UseNotifyReturn } from './useNotify';
export { useSort, type UseSortReturn, type SortConfig, type SortDirection } from './useSort';
export { useFilterAndSearch } from './useFilterAndSearch';

// Backend Integration Hooks
export * from '../integration';
