/**
 * Evidence Manager Hook - Legacy Export
 *
 * This file now re-exports from the refactored modular structure.
 * The implementation has been split into:
 * - types.ts: Type definitions
 * - constants.ts: Static configuration
 * - utils.ts: Pure utility functions
 * - useEvidenceData.ts: Data fetching sub-hook
 * - useEvidenceMutations.ts: Mutation operations sub-hook
 * - useEvidenceFilters.ts: Filtering logic sub-hook
 * - useEvidenceNavigation.ts: Navigation sub-hook
 * - useEvidenceOperations.ts: Custody/intake operations sub-hook
 * - index.ts: Main hook composition (75 LOC)
 *
 * @deprecated Import from "./useEvidenceManager/index" instead for better tree-shaking
 */

export * from "./useEvidenceManager/index";
