/**
 * Discovery Provider Types
 * Type definitions for discovery/evidence management context
 *
 * @module lib/discovery/types
 */

import type { EvidenceItem } from "@/types/evidence";

export interface DiscoveryStateValue {
  evidence: EvidenceItem[];
  activeEvidenceId: string | null;
  activeEvidence: EvidenceItem | null;
  isLoading: boolean;
  error: Error | null;
  filterByCaseId: string | null;
}

export interface DiscoveryActionsValue {
  loadEvidence: (caseId?: string) => Promise<void>;
  loadEvidenceById: (id: string) => Promise<EvidenceItem | null>;
  createEvidence: (data: Partial<EvidenceItem>) => Promise<EvidenceItem>;
  updateEvidence: (
    id: string,
    updates: Partial<EvidenceItem>
  ) => Promise<EvidenceItem>;
  deleteEvidence: (id: string) => Promise<void>;
  setActiveEvidence: (id: string | null) => void;
  searchEvidence: (query: string, caseId?: string) => Promise<EvidenceItem[]>;
  updateChainOfCustody: (
    id: string,
    entry: Record<string, unknown>
  ) => Promise<EvidenceItem>;
  filterByCase: (caseId: string | null) => void;
  refreshEvidence: () => Promise<void>;
}

export interface DiscoveryProviderProps {
  children: React.ReactNode;
  initialEvidence?: EvidenceItem[];
  caseId?: string;
}
