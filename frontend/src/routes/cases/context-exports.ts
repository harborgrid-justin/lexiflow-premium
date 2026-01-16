/**
 * Context Exports for Cases Domain
 *
 * This file re-exports context providers and hooks from the CaseProvider.
 * Separated from index.tsx to avoid conflicts with React Router's file-based routing.
 */

export {
  CaseProvider,
  useCaseActions,
  useCaseContext,
  useCaseState,
} from "./CaseProvider";
export type { CaseContextValue } from "./CaseProvider";
