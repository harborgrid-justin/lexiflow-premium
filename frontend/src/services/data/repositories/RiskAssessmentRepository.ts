/**
 * Risk Repository
 * Enterprise-grade repository for risk management with backend API integration
 */

import { RisksApiService } from "@/api/workflow/risk-assessments-api";
import { GenericRepository, createQueryKeys } from "@/services/core/factories";
import { IntegrationEventPublisher } from "@/services/data/integration/IntegrationEventPublisher";
import { type Risk } from "@/types";
import { SystemEventType } from "@/types/integration-types";

export const RISK_QUERY_KEYS = createQueryKeys('risks');

export class RiskRepository extends GenericRepository<Risk> {
  protected apiService = new RisksApiService();
  protected repositoryName = "RiskRepository";

  constructor() {
    super("risks");
    console.log(`[RiskRepository] Initialized with Backend API`);
  }

  // Override add to include risk escalation event
  override async add(item: Risk): Promise<Risk> {
    const result = await super.add(item);

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

  override async getByCaseId(caseId: string): Promise<Risk[]> {
    this.validateIdParameter(caseId, "getByCaseId");
    try {
      const risks = await this.apiService.getAll({ caseId });
      return risks as unknown as Risk[];
    } catch (error) {
      console.warn("[RiskRepository] Backend API unavailable", error);
      return await this.getByIndex("caseId", caseId);
    }
  }

  async getByImpact(impact: string): Promise<Risk[]> {
    return this.executeWithErrorHandling(async () => {
      const risks = await this.getAll();
      return risks.filter((r) => r.impact === impact);
    }, 'getByImpact');
  }

  async getByProbability(probability: string): Promise<Risk[]> {
    return this.executeWithErrorHandling(async () => {
      const risks = await this.getAll();
      return risks.filter((r) => r.probability === probability);
    }, 'getByProbability');
  }

  async search(criteria: {
    caseId?: string;
    impact?: string;
    probability?: string;
    query?: string;
  }): Promise<Risk[]> {
    return this.executeWithErrorHandling(async () => {
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
    }, 'search');
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
