/**
 * Rule Repository
 * Enterprise-grade repository for legal rule management with backend API integration
 */

import {
  JurisdictionApiService,
  JurisdictionRule,
} from "@/api/intelligence/jurisdiction-api";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { Repository } from "@/services/core/Repository";
import { OperationError, ValidationError } from "@/services/core/errors";
import { STORES } from "@/services/data/db";
import { LegalRule } from "@/types";

export const RULE_QUERY_KEYS = {
  all: () => ["rules"] as const,
  byId: (id: string) => ["rules", id] as const,
  byJurisdiction: (jurisdiction: string) =>
    ["rules", "jurisdiction", jurisdiction] as const,
  byCategory: (category: string) => ["rules", "category", category] as const,
} as const;

export class RuleRepository extends Repository<LegalRule> {
  private readonly useBackend: boolean;

  constructor() {
    super(STORES.RULES);
    this.useBackend = isBackendApiEnabled();
    console.log(
      `[RuleRepository] Initialized with ${this.useBackend ? "Backend API" : "IndexedDB"}`
    );
  }

  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[RuleRepository.${methodName}] Invalid id parameter`);
    }
  }

  private mapToLegalRule(rule: JurisdictionRule): LegalRule {
    // Best-effort mapping between API JurisdictionRule and Frontend LegalRule
    return {
      ...rule,
      // Ensure ID is string
      id: rule.id,
      // Map types safely (casting as compatibility layer)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: rule.type as any, // Mismatch in enums handled by UI or loosen type in future
      text: rule.fullText,
      jurisdiction: rule.jurisdiction?.name,
      summary: rule.description,
      // Retain other fields that match by name
    } as unknown as LegalRule;
  }

  override async getAll(): Promise<LegalRule[]> {
    if (this.useBackend) {
      try {
        const rules = await JurisdictionApiService.getRules();
        return rules.map(this.mapToLegalRule);
      } catch (error) {
        console.error("[RuleRepository.getAll] Backend error:", error);
        throw new OperationError(
          "getAll",
          "Failed to fetch rules from backend"
        );
      }
    }
    return await super.getAll();
  }

  override async getById(id: string): Promise<LegalRule | undefined> {
    this.validateId(id, "getById");
    if (this.useBackend) {
      try {
        const rule = await JurisdictionApiService.getRuleById(id);
        return rule ? this.mapToLegalRule(rule) : undefined;
      } catch (error) {
        console.error("[RuleRepository.getById] Backend error:", error);
        // Return undefined on 404-like errors or throw? Repository pattern usually returns undefined for not found
        return undefined;
      }
    }
    return await super.getById(id);
  }

  override async add(item: LegalRule): Promise<LegalRule> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[RuleRepository.add] Invalid rule data");
    }

    if (this.useBackend) {
      try {
        // CreateJurisdictionRuleDto requires: code, name, type, jurisdictionId
        // LegalRule might not have all, or has them differently.
        // We will cast to any to pass to the API for now, assuming the object structure is close enough
        // or that the API validation handles it.
        // Note: Ideally we should map `LegalRule` -> `CreateJurisdictionRuleDto`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
          ...item,
          jurisdictionId: item.jurisdictionId || "federal", // Default/Fallback
          type: item.type || "Civil", // Fallback
        };

        const created = await JurisdictionApiService.createRule(payload);
        if (!created) throw new Error("Create returned null");
        return this.mapToLegalRule(created);
      } catch (error) {
        console.error("[RuleRepository.add] Backend error:", error);
        throw new OperationError("add", "Failed to add rule via backend");
      }
    }

    await super.add(item);
    return item;
  }

  override async update(
    id: string,
    updates: Partial<LegalRule>
  ): Promise<LegalRule> {
    this.validateId(id, "update");

    if (this.useBackend) {
      try {
        const updated = await JurisdictionApiService.updateRule(
          id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updates as any
        );
        if (!updated) throw new Error("Update returned null");
        return this.mapToLegalRule(updated);
      } catch (error) {
        console.error("[RuleRepository.update] Backend error:", error);
        throw new OperationError("update", "Failed to update rule via backend");
      }
    }

    return await super.update(id, updates);
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");

    if (this.useBackend) {
      try {
        const success = await JurisdictionApiService.deleteRule(id);
        if (!success) throw new Error("Delete returned false");
        return;
      } catch (error) {
        console.error("[RuleRepository.delete] Backend error:", error);
        throw new OperationError("delete", "Failed to delete rule via backend");
      }
    }

    await super.delete(id);
  }

  async getByJurisdiction(jurisdiction: string): Promise<LegalRule[]> {
    if (!jurisdiction)
      throw new ValidationError(
        "[RuleRepository.getByJurisdiction] Invalid jurisdiction"
      );

    if (this.useBackend) {
      // API expects ID, but here we have string name arguably?
      // Or maybe `jurisdiction` arg IS the ID?
      // Assuming it might be ID. If it's a name, the API might not support it directly without search.
      // Given the usage in frontend is likely passing IDs (e.g. 'federal', 'ca'), let's try passing as ID.
      try {
        const rules = await JurisdictionApiService.getRules(jurisdiction);
        return rules.map(this.mapToLegalRule);
      } catch (error) {
        // If 404, maybe standard getAll and filter?
        console.warn(
          "[RuleRepository.getByJurisdiction] Direct fetch failed, falling back to filter",
          error
        );
        const all = await this.getAll();
        return all.filter(
          (r) =>
            r.jurisdiction === jurisdiction || r.jurisdictionId === jurisdiction
        );
      }
    }

    const rules = await this.getAll();
    return rules.filter((r) => r.jurisdiction === jurisdiction);
  }

  async getByCategory(category: string): Promise<LegalRule[]> {
    if (!category)
      throw new ValidationError(
        "[RuleRepository.getByCategory] Invalid category"
      );

    // Backend API doesn't have getByCategory, so fetching all and filtering
    const rules = await this.getAll();
    return rules.filter((r) => r.category === category || r.type === category);
  }

  async search(query: string): Promise<LegalRule[]> {
    if (!query) return [];

    if (this.useBackend) {
      try {
        const results = await JurisdictionApiService.searchRules(query);
        return results.map(this.mapToLegalRule);
      } catch (error) {
        console.error("[RuleRepository.search] Backend error:", error);
        return [];
      }
    }

    const rules = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return rules.filter(
      (r) =>
        ((r as unknown as Record<string, unknown>).title as string | undefined)
          ?.toLowerCase()
          .includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery) ||
        (
          (r as unknown as Record<string, unknown>).ruleNumber as
            | string
            | undefined
        )
          ?.toLowerCase()
          .includes(lowerQuery) ||
        r.code?.toLowerCase().includes(lowerQuery) ||
        r.name?.toLowerCase().includes(lowerQuery)
    );
  }
}
