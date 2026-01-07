/**
 * Document Manager Hook - Legacy Export
 *
 * This file now re-exports from the refactored modular structure.
 * The implementation has been split into:
 * - types.ts: Type definitions
 * - constants.ts: Static configuration
 * - utils.ts: Pure utility functions
 * - useDocumentData.ts: Data fetching sub-hook
 * - useDocumentMutations.ts: Mutation operations sub-hook
 * - useDocumentFilters.ts: Filtering logic sub-hook
 * - useDocumentOperations.ts: Tag/version/bulk operations sub-hook
 * - useDragDropHandlers.ts: Drag-and-drop sub-hook
 * - index.ts: Main hook composition (90 LOC)
 *
 * @deprecated Import from "./useDocumentManager" instead for better tree-shaking
 */

export * from "./useDocumentManager";
