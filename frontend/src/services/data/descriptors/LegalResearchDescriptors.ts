import {
  draftingApi,
  type CreateTemplateDto,
  type UpdateTemplateDto,
} from "@/api/domains/drafting.api";
import { type CreateJurisdictionRuleDto } from "@/api/intelligence/jurisdiction-api";
import { analyticsApi } from "@/lib/frontend-api";
import { api } from "@/services/api";
import { JurisdictionService } from "@/services/domain/jurisdiction.service";
import { KnowledgeService } from "@/services/domain/knowledge.service";
import { ResearchService } from "@/services/domain/research.service";

export const LegalResearchDescriptors: PropertyDescriptorMap = {
  knowledge: {
    get: () => KnowledgeService,
    enumerable: true,
  },
  research: {
    get: () => ResearchService,
    enumerable: true,
  },
  playbooks: {
    get: () => ({
      getAll: () => draftingApi.getAllTemplates(),
      getById: (id: string) => draftingApi.getTemplateById(id),
      add: (item: CreateTemplateDto) => draftingApi.createTemplate(item),
      update: (id: string, item: UpdateTemplateDto) =>
        draftingApi.updateTemplate(id, item),
      delete: (id: string) => draftingApi.deleteTemplate(id),
    }),
    enumerable: true,
  },
  clauses: {
    get: () => analyticsApi.clauses,
    enumerable: true,
  },
  rules: {
    get: () => ({
      getAll: async () => {
        try {
          return (await api.jurisdiction?.getRules?.()) || [];
        } catch (error) {
          console.error("[DataService.rules] Failed to fetch rules:", error);
          return [];
        }
      },
      getById: async (id: string) => {
        try {
          return await api.jurisdiction?.getRuleById?.(id);
        } catch (error) {
          console.error("[DataService.rules] Failed to fetch rule:", error);
          return undefined;
        }
      },
      search: async (query: string, jurisdictionId?: string) => {
        try {
          return (
            (await api.jurisdiction?.searchRules?.(query, jurisdictionId)) || []
          );
        } catch (error) {
          console.error("[DataService.rules] Failed to search rules:", error);
          return [];
        }
      },
      add: async (rule: unknown) => {
        try {
          return await api.jurisdiction?.createRule?.(
            rule as CreateJurisdictionRuleDto
          );
        } catch (error) {
          console.error("[DataService.rules] Failed to create rule:", error);
          throw error;
        }
      },
      update: async (id: string, updates: unknown) => {
        try {
          return await api.jurisdiction?.updateRule?.(
            id,
            updates as Record<string, unknown>
          );
        } catch (error) {
          console.error("[DataService.rules] Failed to update rule:", error);
          throw error;
        }
      },
      delete: async (id: string) => {
        try {
          await api.jurisdiction?.deleteRule?.(id);
        } catch (error) {
          console.error("[DataService.rules] Failed to delete rule:", error);
          throw error;
        }
      },
    }),
    enumerable: true,
  },
  jurisdiction: { get: () => JurisdictionService, enumerable: true },
};
