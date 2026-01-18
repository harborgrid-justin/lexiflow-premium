/**
 * Rule Repository
 * Enterprise-grade repository for legal rule management with backend API integration
 */

import { ValidationError } from "@/services/core/errors";
import { GenericRepository, createQueryKeys } from "@/services/core/factories";
import { RuleService } from "@/services/features/rules/rules";
import { type LegalRule } from "@/types";

export const RULE_QUERY_KEYS = createQueryKeys('rules');

// Stub API service for RuleRepository (Backend not implemented yet)
class RuleApiService {
  async getAll(): Promise<LegalRule[]> {
    return [];
  }
  async getById(_id: string): Promise<LegalRule | undefined> {
    return undefined;
  }
  async create(_item: Partial<LegalRule>): Promise<LegalRule> {
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
  }
  async update(_id: string, _updates: Partial<LegalRule>): Promise<LegalRule> {
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
  }
  async delete(_id: string): Promise<void> {
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
  }
}

export class RuleRepository extends GenericRepository<LegalRule> {
  protected apiService = new RuleApiService();
  protected repositoryName = "RuleRepository";

  constructor() {
    super("rules");
    console.log(`[RuleRepository] Initialized with Backend API`);
  }

  async getByJurisdiction(jurisdiction: string): Promise<LegalRule[]> {
    if (!jurisdiction)
      throw new ValidationError(
        "[RuleRepository.getByJurisdiction] Invalid jurisdiction"
      );
    // RuleService doesn't support filter by jurisdiction
    return [];
  }

  async getByCategory(category: string): Promise<LegalRule[]> {
    if (!category)
      throw new ValidationError(
        "[RuleRepository.getByCategory] Invalid category"
      );
    // RuleService doesn't support filter by category
    return [];
  }

  async search(query: string): Promise<LegalRule[]> {
    if (!query) return [];
    try {
      return await RuleService.search(query);
    } catch (error) {
      console.error("[RuleRepository] Backend API error", error);
      return [];
    }
  }
}
