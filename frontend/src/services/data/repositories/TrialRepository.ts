/**
 * Trial Repository
 * Enterprise-grade repository for trial management with backend API integration
 */

import { WitnessesApiService } from "@/api/discovery/witnesses-api";
import { ExhibitsApiService } from "@/api/trial/exhibits-api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository, createQueryKeys } from "@/services/core/factories";
import { type Fact, type Juror, type TrialExhibit, type Witness } from "@/types";

export const TRIAL_QUERY_KEYS = {
  exhibits: createQueryKeys('exhibits'),
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

export class TrialRepository extends GenericRepository<TrialExhibit> {
  protected apiService = new ExhibitsApiService();
  protected repositoryName = "TrialRepository";

  private witnessesApi: WitnessesApiService;

  constructor() {
    super("exhibits");
    this.witnessesApi = new WitnessesApiService();
    console.log(`[TrialRepository] Initialized with Backend API`);
  }

  // Override getByCaseId for exhibits
  override async getByCaseId(caseId: string): Promise<TrialExhibit[]> {
    this.validateIdParameter(caseId, "getByCaseId");
    return this.executeWithErrorHandling(
      () => this.apiService.getByCaseId(caseId),
      'getByCaseId'
    );
  }

  // =============================================================================
  // JUROR OPERATIONS
  // =============================================================================

  getJurors = async (caseId: string): Promise<Juror[]> => {
    this.validateIdParameter(caseId, "getJurors");
    console.warn(
      "[TrialRepository.getJurors] Juror backend API not implemented",
    );
    return [];
  };

  addJuror = async (juror: Juror): Promise<void> => {
    if (!juror || typeof juror !== "object") {
      throw new ValidationError(
        "[TrialRepository.addJuror] Invalid juror data",
      );
    }
    console.error(
      "[TrialRepository.addJuror] Juror backend API not implemented",
    );
    throw new Error("Juror operations not yet implemented in backend");
  };

  strikeJuror = async (
    id: string,
    _party: "Plaintiff" | "Defense",
    _cause?: string,
  ): Promise<void> => {
    this.validateIdParameter(id, "strikeJuror");
    console.error(
      "[TrialRepository.strikeJuror] Juror backend API not implemented",
    );
    throw new Error("Juror operations not yet implemented in backend");
  };

  // =============================================================================
  // FACT OPERATIONS
  // =============================================================================

  getFacts = async (caseId: string): Promise<Fact[]> => {
    this.validateIdParameter(caseId, "getFacts");
    console.warn("[TrialRepository.getFacts] Fact backend API not implemented");
    return [];
  };

  // =============================================================================
  // WITNESS OPERATIONS
  // =============================================================================

  getWitnesses = async (caseId: string): Promise<Witness[]> => {
    this.validateIdParameter(caseId, "getWitnesses");
    return this.executeWithErrorHandling(
      () => this.witnessesApi.getByCaseId(caseId) as unknown as Promise<Witness[]>,
      'getWitnesses'
    );
  };

  rateWitness = async (id: string, score: number): Promise<void> => {
    this.validateIdParameter(id, "rateWitness");
    if (typeof score !== "number" || score < 0 || score > 100) {
      throw new ValidationError(
        "[TrialRepository.rateWitness] Invalid score parameter (must be 0-100)",
      );
    }

    return this.executeWithErrorHandling(
      () => this.witnessesApi.update(id, { credibilityScore: score }),
      'rateWitness'
    );
  };

  // =============================================================================
  // EXHIBIT OPERATIONS
  // =============================================================================

  addExhibit = async (exhibit: TrialExhibit): Promise<TrialExhibit> => {
    return await this.add(exhibit);
  };

  getExhibits = async (caseId?: string): Promise<TrialExhibit[]> => {
    if (caseId) {
      return await this.getByCaseId(caseId);
    }
    return await this.getAll();
  };

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
      if (criteria.caseId) filters["caseId"] = criteria.caseId;
      if (criteria.status) filters["status"] = criteria.status;

      let exhibits = await this.apiService.getAll(filters);

      if (criteria.query) {
        const lowerQuery = criteria.query.toLowerCase();
        exhibits = exhibits.filter(
          (e) =>
            e.title?.toLowerCase().includes(lowerQuery) ||
            e.description?.toLowerCase().includes(lowerQuery) ||
            e.exhibitNumber?.toLowerCase().includes(lowerQuery),
        );
      }

      return exhibits;
    } catch (error) {
      console.error("[TrialRepository.search] Error:", error);
      return [];
    }
  }
}
