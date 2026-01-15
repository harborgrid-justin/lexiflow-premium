/**
 * Documents Provider Types
 * Type definitions for document management context
 *
 * @module lib/documents/types
 */

import type { LegalDocument } from "@/types/documents";

export interface DocumentsStateValue {
  documents: LegalDocument[];
  activeDocumentId: string | null;
  activeDocument: LegalDocument | null;
  isLoading: boolean;
  error: Error | null;
  uploadProgress: Record<string, number>; // fileId -> percentage
}

export interface DocumentsActionsValue {
  loadDocuments: (caseId?: string) => Promise<void>;
  loadDocumentById: (id: string) => Promise<LegalDocument | null>;
  uploadDocument: (
    file: File,
    metadata: Partial<LegalDocument>
  ) => Promise<LegalDocument>;
  updateDocument: (
    id: string,
    updates: Partial<LegalDocument>
  ) => Promise<LegalDocument>;
  deleteDocument: (id: string) => Promise<void>;
  setActiveDocument: (id: string | null) => void;
  searchDocuments: (query: string, caseId?: string) => Promise<LegalDocument[]>;
  downloadDocument: (id: string) => Promise<Blob>;
  refreshDocuments: () => Promise<void>;
}

export interface DocumentsProviderProps {
  children: React.ReactNode;
  initialDocuments?: LegalDocument[];
  caseId?: string;
}
