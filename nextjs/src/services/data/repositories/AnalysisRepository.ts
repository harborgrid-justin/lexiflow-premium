/**
 * Analysis Repository
 * Enterprise-grade repository for legal analysis management with backend API integration
 */

import { analyticsApi } from "@/api/domains/analytics.api";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { ValidationError } from "@/services/core/errors";
import { STORES, db } from "@/services/data/db";
import { BriefAnalysisSession, JudgeProfile } from "@/types";
import { delay } from "@/utils/async";
import { Repository } from "../../../services/core/Repository";

export const ANALYSIS_QUERY_KEYS = {
  all: () => ["analysis"] as const,
  byId: (id: string) => ["analysis", id] as const,
  judges: () => ["analysis", "judges"] as const,
  counsel: () => ["analysis", "counsel"] as const,
  predictions: () => ["analysis", "predictions"] as const,
} as const;

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
  private readonly useBackend: boolean;

  constructor() {
    super(STORES.ANALYSIS);
    this.useBackend = isBackendApiEnabled();
    console.log(
      `[AnalysisRepository] Initialized with ${this.useBackend ? "Backend API" : "IndexedDB"}`
    );
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
    if (this.useBackend) {
      try {
        const stats = await analyticsApi.judgeStats.getAll();
        return stats.map((s) => ({
          id: s.judgeId,
          name: s.judgeName || "Unknown Judge",
          court: s.court || "Unknown Court",
          motionStats:
            s.rulings?.map((r) => ({
              motionType: r.motionType,
              granted: r.grantedCount,
              denied: r.deniedCount,
              totalRuled: r.grantedCount + r.deniedCount,
              grantRate: r.grantRate,
            })) || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "system",
        }));
      } catch (error) {
        console.error(
          "[AnalysisRepository.getJudgeProfiles] Backend fetch failed",
          error
        );
        return [];
      }
    }
    try {
      await delay(100);
      return await db.getAll<JudgeProfile>(STORES.JUDGES);
    } catch (error) {
      console.error("[AnalysisRepository.getJudgeProfiles] Error:", error);
      return [];
    }
  }

  async getCounselProfiles(): Promise<unknown[]> {
    if (this.useBackend) {
      // Currently no dedicated counsel stats API
      return [];
    }
    return [];
  }

  async getPredictionData(): Promise<unknown[]> {
    if (this.useBackend) {
      try {
        return await analyticsApi.outcomePredictions.getPredictions();
      } catch (error) {
        console.error(
          "[AnalysisRepository.getPredictionData] Backend fetch failed",
          error
        );
        return [];
      }
    }
    return [];
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
