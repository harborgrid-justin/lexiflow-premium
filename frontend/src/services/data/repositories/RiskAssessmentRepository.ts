/**
 * Risk Repository
 * Enterprise-grade repository for risk management with backend API integration
 */

import { RisksApiService } from "@/api/workflow/risk-assessments-api";
import { ValidationError } from "@/services/core/errors";
import { Repository } from "@/services/core/Repository";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { type Risk } from "@/types";
import { SystemEventType } from "@/types/integration-types";

export const RISK_QUERY_KEYS = {
  all: () => ["risks"] as const,
  byId: (id: string) => ["risks", id] as const,
  byCase: (caseId: string) => ["risks", "case", caseId] as const,
  byImpact: (impact: string) => ["risks", "impact", impact] as const,
  byProbability: (probability: string) =>
    ["risks", "probability", probability] as const,
} as const;

export class RiskRepository extends Repository<Risk> {
  private risksApi: RisksApiService;

  constructor() {
    super("risks");
    this.risksApi = new RisksApiService();
    console.log(`[RiskRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(`[RiskRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<Risk[]> {
    try {
      return (await this.risksApi.getAll()) as unknown as Risk[];
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  override async getByCaseId(caseId: string): Promise<Risk[]> {
    this.validateId(caseId, "getByCaseId");
    // Removed legacy useBackend check
    try {
      const risks = await this.risksApi.getAll({ caseId });
      return risks as unknown as Risk[];
    } catch (error) {
      console.warn("[RiskRepository] Backend API unavailable", error);
      return await this.getByIndex("caseId", caseId);
    }
  }

  override async getById(id: string): Promise<Risk | undefined> {
    this.validateId(id, "getById");
    try {
      return (await this.risksApi.getById(id)) as unknown as Risk;
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  override async add(item: Risk): Promise<Risk> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[RiskRepository.add] Invalid risk data");
    }

    let result: Risk;
    try {
      result = (await this.risksApi.create(item)) as unknown as Risk;
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }

    if (result.impact === "High" && result.probability === "High") {
      try {
        await IntegrationEventPublisher.publish(
          SystemEventType.RISK_ESCALATED,
          { risk: result }
        );
      } catch (eventError) {
        console.warn(
          "[RiskRepository] Failed to publish escalation event",
          eventError
        );
      }
    }
    return result;
  }

  override async update(id: string, updates: Partial<Risk>): Promise<Risk> {
    this.validateId(id, "update");
    try {
      return (await this.risksApi.update(id, updates)) as unknown as Risk;
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.risksApi.delete(id);
      return;
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  async getByImpact(impact: string): Promise<Risk[]> {
    try {
      const risks = await this.getAll();
      return risks.filter((r) => r.impact === impact);
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  async getByProbability(probability: string): Promise<Risk[]> {
    try {
      const risks = await this.getAll();
      return risks.filter((r) => r.probability === probability);
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }

  async search(criteria: {
    caseId?: string;
    impact?: string;
    probability?: string;
    query?: string;
  }): Promise<Risk[]> {
    try {
      // Ideally should filter on backend
      // For now using client side filter on getAll
      let risks = await this.getAll();
      if (criteria.caseId)
        risks = risks.filter((r) => r.caseId === criteria.caseId);
      if (criteria.impact)
        risks = risks.filter((r) => r.impact === criteria.impact);
      if (criteria.probability)
        risks = risks.filter((r) => r.probability === criteria.probability);
      if (criteria.query) {
        const lowerQuery = criteria.query.toLowerCase();
        risks = risks.filter(
          (r) =>
            r.title?.toLowerCase().includes(lowerQuery) ||
            r.description?.toLowerCase().includes(lowerQuery)
        );
      }
      return risks;
    } catch (error) {
      console.error("[RiskRepository] Backend API error", error);
      throw error;
    }
  }
}
