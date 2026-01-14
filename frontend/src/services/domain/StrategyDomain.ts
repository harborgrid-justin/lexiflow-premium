/**
 * +---------------------------------------------------------------------------+
 * �                    LEXIFLOW STRATEGY DOMAIN SERVICE                       �
 * �                 Enterprise Litigation Strategy Layer v2.0                 �
 * �                       PhD-Level Systems Architecture                      �
 * +---------------------------------------------------------------------------+
 *
 * @module services/domain/StrategyDomain
 * @architecture Backend-First Strategy Management
 * @author LexiFlow Engineering Team
 * @since 2025-12-22
 * @status PRODUCTION READY
 *
 * Provides litigation strategy creation, risk assessment, and tactical recommendations
 * with backend API integration for persistent storage and analytics.
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import { Citation, Defense, LegalArgument } from "@/types";

interface Strategy {
  id: string;
  caseId: string;
  name: string;
  description: string;
  objectives: string[];
  risks: Risk[];
  createdAt: string;
  updatedAt: string;
}

interface Risk {
  id: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  probability: number;
  mitigation?: string;
}

interface Recommendation {
  id: string;
  type: "motion" | "discovery" | "settlement" | "trial";
  title: string;
  description: string;
  priority: number;
  rationale: string;
}

export const StrategyService = {
  getAll: async () => {
    return apiClient.get<Strategy[]>("/strategies");
  },

  getById: async (id: string) => {
    return apiClient.get<Strategy>(`/strategies/${id}`);
  },

  add: async (item: unknown) => {
    // Extract only the fields that the backend DTO expects
    const payload = item && typeof item === "object" ? item : {};
    const cleanPayload: Record<string, unknown> = {};

    // Only include fields that are part of CreateStrategyItemDto
    const allowedFields = [
      "type",
      "caseId",
      "title",
      "citation",
      "description",
      "defenseType",
      "status",
      "court",
      "year",
    ];

    for (const key of allowedFields) {
      if (key in payload) {
        cleanPayload[key] = (payload as Record<string, unknown>)[key];
      }
    }

    return apiClient.post("/strategies", cleanPayload);
  },

  update: async (id: string, updates: unknown) => {
    // Extract only the fields that the backend DTO expects
    const payload = updates && typeof updates === "object" ? updates : {};
    const cleanPayload: Record<string, unknown> = {};

    // Only include fields that are part of UpdateStrategyItemDto
    const allowedFields = [
      "type",
      "caseId",
      "title",
      "citation",
      "description",
      "defenseType",
      "status",
      "court",
      "year",
    ];

    for (const key of allowedFields) {
      if (key in payload) {
        cleanPayload[key] = (payload as Record<string, unknown>)[key];
      }
    }

    return apiClient.patch(`/strategies/${id}`, cleanPayload);
  },

  delete: async (id: string, type?: string) => {
    let url = `/strategies/${id}`;
    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }
    await apiClient.delete(url);
    return;
  },

  // Strategy specific methods
  getCaseStrategy: async (caseId: string) => {
    return apiClient.get<{
      arguments: LegalArgument[];
      defenses: Defense[];
      citations: Citation[];
    }>("/strategies", { params: { caseId } });
  },

  getStrategies: async (caseId?: string): Promise<Strategy[]> => {
    const params = caseId ? { caseId } : {};
    return apiClient.get<Strategy[]>("/strategies", { params });
  },

  createStrategy: async (strategy: Partial<Strategy>): Promise<Strategy> => {
    const payload = {
      caseId: strategy.caseId || "",
      name: strategy.name || "New Strategy",
      description: strategy.description || "",
      objectives: strategy.objectives || [],
      risks: strategy.risks || [],
    };
    return apiClient.post<Strategy>("/strategies", payload);
  },

  analyzeRisks: async (strategyId: string): Promise<Risk[]> => {
    try {
      return await apiClient.get<Risk[]>(`/strategies/${strategyId}/risks`);
    } catch (error) {
      console.error("[StrategyService.analyzeRisks] Backend error:", error);
      return [];
    }
  },

  getRecommendations: async (caseId: string): Promise<Recommendation[]> => {
    try {
      return await apiClient.get<Recommendation[]>(
        "/strategies/recommendations",
        { params: { caseId } }
      );
    } catch (error) {
      console.error(
        "[StrategyService.getRecommendations] Backend error:",
        error
      );
      return [];
    }
  },
};
