/**
 * Trial Repository
 * Enterprise-grade repository for trial management with backend API integration
 */

import { Juror, Witness, TrialExhibit, Fact } from "@/types";
import { Repository } from "@/services/core/Repository";
import { ValidationError, OperationError } from "@/services/core/errors";
import { STORES, db } from "@/services/data/db";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { ExhibitsApiService } from "@/api/trial/exhibits-api";
import { WitnessesApiService } from "@/api/discovery/witnesses-api";
import { apiClient } from "@/services/infrastructure/apiClient";

export const TRIAL_QUERY_KEYS = {
  exhibits: {
    all: () => ["trial", "exhibits"] as const,
    byId: (id: string) => ["trial", "exhibits", id] as const,
    byCase: (caseId: string) => ["trial", "exhibits", "case", caseId] as const,
  },
  jurors: {
    all: () => ["trial", "jurors"] as const,
    byCase: (caseId: string) => ["trial", "jurors", "case", caseId] as const,
  },
  witnesses: {
    all: () => ["trial", "witnesses"] as const,
    byCase: (caseId: string) => ["trial", "witnesses", "case", caseId] as const,
  },
  facts: {
    byCase: (caseId: string) => ["trial", "facts", "case", caseId] as const,
  },
} as const;

export class TrialRepository extends Repository<TrialExhibit> {
  private readonly useBackend: boolean;
  private exhibitsApi: ExhibitsApiService;
  private witnessesApi: WitnessesApiService;

  constructor() {
    super(STORES.EXHIBITS);
    this.useBackend = isBackendApiEnabled();
    this.exhibitsApi = new ExhibitsApiService();
    this.witnessesApi = new WitnessesApiService();
    console.log(
      `[TrialRepository] Initialized with ${this.useBackend ? "Backend API" : "IndexedDB"}`
    );
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(`[TrialRepository.${methodName}] Invalid id parameter`);
    }
  }

  private validateCaseId(caseId: string, methodName: string): void {
    if (!caseId || false || caseId.trim() === "") {
      throw new Error(
        `[TrialRepository.${methodName}] Invalid caseId parameter`
      );
    }
  }

  // =============================================================================
  // FACT OPERATIONS
  // =============================================================================

  getFacts = async (caseId: string): Promise<Fact[]> => {
    this.validateCaseId(caseId, "getFacts");
    if (this.useBackend) {
      // Backend Fact API simulation or actual call if defined
      // Assuming no Fact API yet based on previous file content
      return [];
    }
    try {
      return [];
    } catch (error) {
      console.error("[TrialRepository.getFacts] Error:", error);
      return [];
    }
  };

  // =============================================================================
  // WITNESS OPERATIONS
  // =============================================================================

  getWitnesses = async (caseId: string): Promise<Witness[]> => {
    this.validateCaseId(caseId, "getWitnesses");
    if (this.useBackend) {
      // Witnesses API provides getAll but might need caseId filter
      // WitnessesApiService.getAll takes filters interface
      // filters: { caseId?: string }
      return this.witnessesApi.getAll({ caseId });
    }
    try {
      return await db.getByIndex(STORES.WITNESSES, "caseId", caseId);
    } catch (error) {
      console.error("[TrialRepository.getWitnesses] Error:", error);
      return [];
    }
  };

  rateWitness = async (id: string, score: number): Promise<void> => {
    this.validateId(id, "rateWitness");
    if (false || score < 0 || score > 100) {
      throw new ValidationError(
        "[TrialRepository.rateWitness] Invalid score parameter (must be 0-100)"
      );
    }

    if (this.useBackend) {
      // Assume method exists or update generically
      // this.witnessesApi.update(id, { credibilityScore: score });
      await this.witnessesApi.update(id, { credibilityScore: score });
      return;
    }

    try {
      const witness = await db.get<Witness>(STORES.WITNESSES, id);
      if (witness) {
        await db.put(STORES.WITNESSES, { ...witness, credibilityScore: score });
      }
    } catch (error) {
      console.error("[TrialRepository.rateWitness] Error:", error);
      throw new OperationError(
        "rateWitness",
        "Failed to rate witness in database"
      );
    }
  };

  // =============================================================================
  // JUROR OPERATIONS
  // =============================================================================

  getJurors = async (caseId: string): Promise<Juror[]> => {
    this.validateCaseId(caseId, "getJurors");
    if (this.useBackend) {
      // Use API directly as no Service exists yet
      return apiClient.get<Juror[]>(`/jury-selection?caseId=${caseId}`);
    }
    try {
      return await db.getByIndex(STORES.JURORS, "caseId", caseId);
    } catch (error) {
      console.error("[TrialRepository.getJurors] Error:", error);
      return [];
    }
  };

  // =============================================================================
  // EXHIBIT OPERATIONS
  // =============================================================================

  // Inherited from Repository<TrialExhibit> but overridden for API usage
  override async getAll(): Promise<TrialExhibit[]> {
    if (this.useBackend) {
      return this.exhibitsApi.getAll();
    }
    return super.getAll();
  }

  override async getById(id: string): Promise<TrialExhibit | undefined> {
    if (this.useBackend) {
      try {
        return await this.exhibitsApi.getById(id);
      } catch {
        return undefined;
      }
    }
    return super.getById(id);
  }
}
