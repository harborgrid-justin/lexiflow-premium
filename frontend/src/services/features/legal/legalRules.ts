/**
 * @module services/ruleService
 * @category Services - Rules Platform
 * @description Legal rules service with backend API integration. Provides CRUD operations for legal
 * rules with search filtering, connected to jurisdiction rules endpoint.
 * ✅ Backend-connected with query keys (2025-12-21)
 *
 * @example
 * ```tsx
 * import { RuleService, ruleQueryKeys } from './services/features/legal/legalRules';
 * import { useQuery, useMutation } from './hooks/useQueryHooks';
 *
 * // Fetch all rules
 * const { data: rules } = useQuery(ruleQueryKeys.all(), () => RuleService.getAll());
 *
 * // Search rules
 * const { data: searchResults } = useQuery(
 *   ruleQueryKeys.search(searchQuery),
 *   () => RuleService.search(searchQuery)
 * );
 *
 * // Create new rule
 * const createMutation = useMutation(
 *   (newRule) => RuleService.add(newRule),
 *   { onSuccess: () => queryClient.invalidate(ruleQueryKeys.all()) }
 * );
 * ```
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Errors
import { OperationError } from "@/services/core/errors";

// API & Query Keys
import { api } from "@/api";
import { queryClient } from "@/services/infrastructure/query-client.service";
import { queryKeys } from "@/utils/query-keys.service";

// Types
import type {
  CreateJurisdictionRuleDto,
  JurisdictionRule,
} from "@/api/intelligence/jurisdiction-api";
import { LegalRule } from "@/types";

// ============================================================================
// TYPE MAPPING UTILITIES
// ============================================================================
/**
 * Maps JurisdictionRule from backend to LegalRule for frontend
 */
function mapToLegalRule(rule: JurisdictionRule): LegalRule {
  return {
    id: rule.id,
    code: rule.code,
    name: rule.name,
    type: rule.type as LegalRule["type"],
    description: rule.description || "",
    jurisdiction: rule.jurisdiction?.name || rule.jurisdictionId || "Unknown",
    effectiveDate: rule.effectiveDate || new Date().toISOString(),
    source: rule.fullText || "",
    url: rule.url,
    createdAt: rule.createdAt || new Date().toISOString(),
    updatedAt: rule.updatedAt || new Date().toISOString(),
  };
}

/**
 * Maps LegalRule to CreateJurisdictionRuleDto for backend
 */
function mapToCreateDto(
  rule: Omit<LegalRule, "id">
): CreateJurisdictionRuleDto {
  return {
    jurisdictionId: rule.jurisdiction || "default",
    code: rule.code,
    name: rule.name,
    type: rule.type as JurisdictionRule["type"],
    description: rule.description,
    effectiveDate: rule.effectiveDate,
    fullText: rule.source,
    url: rule.url,
  };
}

// ============================================================================
// SERVICE
// ============================================================================
export const RuleService = {
  /**
   * Get all legal rules from backend
   */
  getAll: async (): Promise<LegalRule[]> => {
    const rules = await api.jurisdiction.getRules();
    return rules.map(mapToLegalRule);
  },

  /**
   * Search legal rules by query string
   */
  search: async (
    query: string,
    jurisdictionId?: string
  ): Promise<LegalRule[]> => {
    const rules = await api.jurisdiction.searchRules(query, jurisdictionId);
    return rules.map(mapToLegalRule);
  },

  /**
   * Get a specific rule by ID
   */
  getById: async (id: string): Promise<LegalRule | null> => {
    const rule = await api.jurisdiction.getRuleById(id);
    return rule ? mapToLegalRule(rule) : null;
  },

  /**
   * Add a new legal rule
   */
  add: async (rule: Omit<LegalRule, "id">): Promise<LegalRule> => {
    const dto = mapToCreateDto(rule);
    const created = await api.jurisdiction.createRule(dto);

    if (!created) {
      throw new OperationError("RuleService.add", "Failed to create rule");
    }

    // Invalidate relevant queries
    queryClient.invalidate(queryKeys.jurisdiction.rules());

    return mapToLegalRule(created);
  },

  /**
   * Update an existing legal rule
   */
  update: async (
    id: string,
    updates: Partial<LegalRule>
  ): Promise<LegalRule> => {
    const updateDto: Partial<
      Omit<CreateJurisdictionRuleDto, "jurisdictionId">
    > = {};

    if (updates.code) updateDto.code = updates.code;
    if (updates.name) updateDto.name = updates.name;
    if (updates.type) updateDto.type = updates.type as JurisdictionRule["type"];
    if (updates.description) updateDto.description = updates.description;
    if (updates.effectiveDate) updateDto.effectiveDate = updates.effectiveDate;
    if (updates.source) updateDto.fullText = updates.source;
    if (updates.url) updateDto.url = updates.url;

    const updated = await api.jurisdiction.updateRule(id, updateDto);

    if (!updated) {
      throw new OperationError("RuleService.update", "Failed to update rule");
    }

    // Invalidate relevant queries
    queryClient.invalidate(queryKeys.jurisdiction.rules());
    queryClient.invalidate(queryKeys.jurisdiction.detail(id));

    return mapToLegalRule(updated);
  },

  /**
   * Delete a legal rule
   */
  delete: async (id: string): Promise<void> => {
    const success = await api.jurisdiction.deleteRule(id);

    if (!success) {
      throw new OperationError("RuleService.delete", "Failed to delete rule");
    }

    // Invalidate relevant queries
    queryClient.invalidate(queryKeys.jurisdiction.rules());
  },
};

// Export query keys for use in components
export const ruleQueryKeys = {
  all: () => queryKeys.jurisdiction.rules(),
  detail: (id: string) => queryKeys.jurisdiction.detail(id),
  search: (query: string) =>
    [...queryKeys.jurisdiction.rules(), "search", query] as const,
};
