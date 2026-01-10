/**
 * Trial Repository
 * Enterprise-grade repository for trial management with backend API integration
 */

import { WitnessesApiService } from "@/api/discovery/witnesses-api";
import { ExhibitsApiService } from "@/api/trial/exhibits-api";
import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { Fact, Juror, TrialExhibit, Witness } from "@/types";

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
  private exhibitsApi: ExhibitsApiService;
  private witnessesApi: WitnessesApiService;

  constructor() {
    super("exhibits");
    this.exhibitsApi = new ExhibitsApiService();
    this.witnessesApi = new WitnessesApiService();
    console.log(`[TrialRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[TrialRepository.${methodName}] Invalid id parameter`);
    }
  }

  private validateCaseId(caseId: string, methodName: string): void {
    if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
      throw new Error(
        `[TrialRepository.${methodName}] Invalid caseId parameter`
      );
    }
  }

  // =============================================================================
  // JUROR OPERATIONS
  // =============================================================================

  getJurors = async (caseId: string): Promise<Juror[]> => {
    this.validateCaseId(caseId, "getJurors");
    console.warn(
      "[TrialRepository.getJurors] Juror backend API not implemented"
    );
    return [];
  };

  addJuror = async (juror: Juror): Promise<void> => {
    if (!juror || typeof juror !== "object") {
      throw new ValidationError(
        "[TrialRepository.addJuror] Invalid juror data"
      );
    }
    console.error(
      "[TrialRepository.addJuror] Juror backend API not implemented"
    );
    throw new Error("Juror operations not yet implemented in backend");
  };

  strikeJuror = async (
    id: string,
    _party: "Plaintiff" | "Defense",
    _cause?: string
  ): Promise<void> => {
    this.validateId(id, "strikeJuror");
    console.error(
      "[TrialRepository.strikeJuror] Juror backend API not implemented"
    );
    throw new Error("Juror operations not yet implemented in backend");
  };

  // =============================================================================
  // FACT OPERATIONS
  // =============================================================================

  getFacts = async (caseId: string): Promise<Fact[]> => {
    this.validateCaseId(caseId, "getFacts");
    console.warn("[TrialRepository.getFacts] Fact backend API not implemented");
    return [];
  };

  // =============================================================================
  // WITNESS OPERATIONS
  // =============================================================================

  getWitnesses = async (caseId: string): Promise<Witness[]> => {
    this.validateCaseId(caseId, "getWitnesses");
    try {
      return (await this.witnessesApi.getByCaseId(
        caseId
      )) as unknown as Witness[];
    } catch (error) {
      console.error("[TrialRepository.getWitnesses] Error:", error);
      throw error;
    }
  };

  rateWitness = async (id: string, score: number): Promise<void> => {
    this.validateId(id, "rateWitness");
    if (typeof score !== "number" || score < 0 || score > 100) {
      throw new ValidationError(
        "[TrialRepository.rateWitness] Invalid score parameter (must be 0-100)"
      );
    }

    try {
      await this.witnessesApi.update(id, { credibilityScore: score });
    } catch (error) {
      console.error("[TrialRepository.rateWitness] Error:", error);
      throw error;
    }
  };

  // =============================================================================
  // EXHIBIT OPERATIONS
  // =============================================================================

  addExhibit = async (exhibit: TrialExhibit): Promise<TrialExhibit> => {
    if (!exhibit || typeof exhibit !== "object") {
      throw new ValidationError(
        "[TrialRepository.addExhibit] Invalid exhibit data"
      );
    }
    return await this.add(exhibit);
  };

  getExhibits = async (caseId?: string): Promise<TrialExhibit[]> => {
    try {
      if (caseId) {
        this.validateCaseId(caseId, "getExhibits");
        return await this.exhibitsApi.getByCaseId(caseId);
      }
      return await this.exhibitsApi.getAll();
    } catch (error) {
      console.error("[TrialRepository.getExhibits] Error:", error);
      throw error;
    }
  };

  override getAll = async (): Promise<TrialExhibit[]> => {
    try {
      return await this.exhibitsApi.getAll();
    } catch (error) {
      console.error("[TrialRepository.getAll] Error:", error);
      throw error;
    }
  };

  override async getById(id: string): Promise<TrialExhibit | undefined> {
    this.validateId(id, "getById");
    try {
      return await this.exhibitsApi.getById(id);
    } catch (error) {
      console.error("[TrialRepository.getById] Error:", error);
      return undefined;
    }
  }

  override async getByCaseId(caseId: string): Promise<TrialExhibit[]> {
    this.validateCaseId(caseId, "getByCaseId");
    try {
      return await this.exhibitsApi.getByCaseId(caseId);
    } catch (error) {
      console.error("[TrialRepository.getByCaseId] Error:", error);
      throw error;
    }
  }

  override async update(
    id: string,
    updates: Partial<TrialExhibit>
  ): Promise<TrialExhibit> {
    this.validateId(id, "update");
    try {
      return await this.exhibitsApi.update(id, updates);
    } catch (error) {
      console.error("[TrialRepository.update] Error:", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.exhibitsApi.delete(id);
    } catch (error) {
      console.error("[TrialRepository.delete] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // SEARCH & FILTERING
  // =============================================================================

  async search(criteria: {
    caseId?: string;
    status?: string;
    query?: string;
  }): Promise<TrialExhibit[]> {
    try {
      const filters: Record<string, string> = {};
      if (criteria.caseId) filters.caseId = criteria.caseId;
      if (criteria.status) filters.status = criteria.status;

      let exhibits = await this.exhibitsApi.getAll(filters);

      if (criteria.query) {
        const lowerQuery = criteria.query.toLowerCase();
        exhibits = exhibits.filter(
          (e) =>
            e.title?.toLowerCase().includes(lowerQuery) ||
            e.description?.toLowerCase().includes(lowerQuery) ||
            e.exhibitNumber?.toLowerCase().includes(lowerQuery)
        );
      }

      return exhibits;
    } catch (error) {
      console.error("[TrialRepository.search] Error:", error);
      return [];
    }
  }
}
