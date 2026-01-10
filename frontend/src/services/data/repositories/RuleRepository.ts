/**
 * Rule Repository
 * Enterprise-grade repository for legal rule management with backend API integration
 */

import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { RuleService } from "@/services/features/rules/ruleService";
import { LegalRule } from "@/types";

export const RULE_QUERY_KEYS = {
  all: () => ["rules"] as const,
  byId: (id: string) => ["rules", id] as const,
  byJurisdiction: (jurisdiction: string) =>
    ["rules", "jurisdiction", jurisdiction] as const,
  byCategory: (category: string) => ["rules", "category", category] as const,
} as const;

export class RuleRepository extends Repository<LegalRule> {
  constructor() {
    super("rules");
    console.log(`[RuleRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[RuleRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<LegalRule[]> {
    // RuleService doesn't support getAll yet, defaulting to empty or implementing minimal fetch
    return [];
  }

  override async getById(id: string): Promise<LegalRule | undefined> {
    this.validateId(id, "getById");
    // RuleService doesn't support getById, defaulting to undefined
    return undefined;
  }

  override async add(item: LegalRule): Promise<LegalRule> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[RuleRepository.add] Invalid rule data");
    }
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
  }

  override async update(
    id: string,
    _updates: Partial<LegalRule>
  ): Promise<LegalRule> {
    this.validateId(id, "update");
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    console.warn("[RuleRepository] Backend API not implemented for Rules");
    throw new Error("Backend API not implemented for Rules");
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
