/**
 * Documents Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/documents
 */

import { createContext } from "react";

import type { DocumentsActionsValue, DocumentsStateValue } from "./types";

export const DocumentsStateContext = createContext<DocumentsStateValue | null>(
  null
);
DocumentsStateContext.displayName = "DocumentsStateContext";

export const DocumentsActionsContext =
  createContext<DocumentsActionsValue | null>(null);
DocumentsActionsContext.displayName = "DocumentsActionsContext";
