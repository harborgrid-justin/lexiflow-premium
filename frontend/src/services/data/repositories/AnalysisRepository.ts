/**
 * Analysis Repository
 * Enterprise-grade repository for legal analysis management with backend API integration
 */

import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { STORES, db } from "@/services/data/db";
import { BriefAnalysisSession, CounselProfile, JudgeProfile } from "@/types";

export const ANALYSIS_QUERY_KEYS = {
  all: () => ["analysis"] as const,
  byId: (id: string) => ["analysis", id] as const,
  judges: () => ["analysis", "judges"] as const,
  counsel: () => ["analysis", "counsel"] as const,
  predictions: () => ["analysis", "predictions"] as const,
} as const;

export interface PredictionData {
  id: string;
  type: string;
  probability: number;
  factors: string[];
}

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
  // private readonly useBackend: boolean; // Unused currently

  constructor() {
    super(STORES.ANALYSIS);
    // this.useBackend = isBackendApiEnabled(); // Unused currently
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(
        `[AnalysisRepository.${methodName}] Invalid id parameter`
      );
    }
  }

  override async getAll(): Promise<BriefAnalysisSession[]> {
    return await super.getAll();
  }

  override async getById(
    id: string
  ): Promise<BriefAnalysisSession | undefined> {
    this.validateId(id, "getById");
    return await super.getById(id);
  }

  override async add(
    item: BriefAnalysisSession
  ): Promise<BriefAnalysisSession> {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        "[AnalysisRepository.add] Invalid analysis session data"
      );
    }
    await super.add(item);
    return item;
  }

  override async update(
    id: string,
    updates: Partial<BriefAnalysisSession>
  ): Promise<BriefAnalysisSession> {
    this.validateId(id, "update");
    return await super.update(id, updates);
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    await super.delete(id);
  }

  async getJudgeProfiles(): Promise<JudgeProfile[]> {
    try {
      return await db.getAll<JudgeProfile>(STORES.JUDGES);
    } catch (error) {
      console.error("[AnalysisRepository.getJudgeProfiles] Error:", error);
      return [];
    }
  }

  async getCounselProfiles(): Promise<CounselProfile[]> {
    try {
      // Return empty array - this would typically fetch from a COUNSEL_PROFILES store
      return [] as CounselProfile[];
    } catch (error) {
      console.error("[AnalysisRepository.getCounselProfiles] Error:", error);
      return [];
    }
  }

  async getPredictionData(): Promise<PredictionData[]> {
    try {
      // Return empty array - this would typically fetch from a PREDICTIONS store
      return [] as PredictionData[];
    } catch (error) {
      console.error("[AnalysisRepository.getPredictionData] Error:", error);
      return [];
    }
  }

  async search(query: string): Promise<BriefAnalysisSession[]> {
    if (!query) return [];
    const sessions = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return sessions.filter(
      (s) =>
        s.id?.toLowerCase().includes(lowerQuery) ||
        ((s as unknown as Record<string, unknown>).title as string | undefined)
          ?.toLowerCase()
          .includes(lowerQuery) ||
        ((s as unknown as Record<string, unknown>).caseId as string | undefined)
          ?.toLowerCase()
          .includes(lowerQuery)
    );
  }
}
