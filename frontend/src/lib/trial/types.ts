/**
 * Trial Provider Types
 * Type definitions for trial preparation context
 *
 * @module lib/trial/types
 */

import type { Witness } from "@/types/trial";

export type Exhibit = {
  id: string;
  caseId: string;
  exhibitNumber: string;
  description: string;
  documentId?: string;
  admittedAt?: string;
  isAdmitted: boolean;
};

export type Examination = {
  id: string;
  witnessId: string;
  caseId: string;
  type: "Direct" | "Cross" | "Redirect" | "Recross";
  notes?: string;
  createdAt: string;
};

export interface TrialStateValue {
  exhibits: Exhibit[];
  witnesses: Witness[];
  examinations: Examination[];
  activeExhibitId: string | null;
  isLoading: boolean;
  error: Error | null;
  filterByCaseId: string | null;
}

export interface TrialActionsValue {
  loadExhibits: (caseId?: string) => Promise<void>;
  loadWitnesses: (caseId?: string) => Promise<void>;
  loadExaminations: (caseId?: string) => Promise<void>;
  createExhibit: (data: Partial<Exhibit>) => Promise<Exhibit>;
  createWitness: (data: Partial<Witness>) => Promise<Witness>;
  createExamination: (data: Partial<Examination>) => Promise<Examination>;
  updateExhibit: (id: string, updates: Partial<Exhibit>) => Promise<Exhibit>;
  deleteExhibit: (id: string) => Promise<void>;
  setActiveExhibit: (id: string | null) => void;
  filterByCase: (caseId: string | null) => void;
  refreshTrial: () => Promise<void>;
}

export interface TrialProviderProps {
  children: React.ReactNode;
  caseId?: string;
}
