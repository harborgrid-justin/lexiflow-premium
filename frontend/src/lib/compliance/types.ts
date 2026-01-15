/**
 * Compliance Provider Types
 * Type definitions for compliance management context
 *
 * @module lib/compliance/types
 */

import type { ConflictCheck } from "@/types/compliance";

export interface ComplianceStateValue {
  conflictChecks: ConflictCheck[];
  activeCheckId: string | null;
  activeCheck: ConflictCheck | null;
  isLoading: boolean;
  error: Error | null;
  pendingChecks: number;
}

export interface ComplianceActionsValue {
  loadConflictChecks: () => Promise<void>;
  loadCheckById: (id: string) => Promise<ConflictCheck | null>;
  createConflictCheck: (data: Partial<ConflictCheck>) => Promise<ConflictCheck>;
  updateCheck: (
    id: string,
    updates: Partial<ConflictCheck>
  ) => Promise<ConflictCheck>;
  approveCheck: (id: string) => Promise<void>;
  rejectCheck: (id: string, reason: string) => Promise<void>;
  setActiveCheck: (id: string | null) => void;
  searchConflicts: (query: string) => Promise<ConflictCheck[]>;
  refreshConflictChecks: () => Promise<void>;
}

export interface ComplianceProviderProps {
  children: React.ReactNode;
  initialChecks?: ConflictCheck[];
}
