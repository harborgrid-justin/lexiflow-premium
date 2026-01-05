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

import { isBackendApiEnabled } from "@/api";
import { OperationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";

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
    if (isBackendApiEnabled()) {
      return apiClient.get<Strategy[]>("/strategies");
    }
    console.warn(
      "[StrategyService] Backend API disabled, returning empty array"
    );
    return [];
  },

  getById: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Strategy>(`/strategies/${id}`);
    }
    console.warn("[StrategyService] Backend API disabled", id);
    return null;
  },

  add: async (item: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.post("/strategies", {
        ...(item && typeof item === "object" ? item : {}),
        createdAt: new Date().toISOString(),
      });
    }
    throw new OperationError(
      "StrategyService.add",
      "Backend API required for add operation"
    );
  },

  update: async (id: string, updates: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.patch(`/strategies/${id}`, {
        ...(updates && typeof updates === "object" ? updates : {}),
        updatedAt: new Date().toISOString(),
      });
    }
    throw new OperationError(
      "StrategyService.update",
      "Backend API required for update operation"
    );
  },

  delete: async (id: string) => {
    if (isBackendApiEnabled()) {
      await apiClient.delete(`/strategies/${id}`);
      return;
    }
    throw new OperationError(
      "StrategyService.delete",
      "Backend API required for delete operation"
    );
  },

  // Strategy specific methods
  getStrategies: async (caseId?: string): Promise<Strategy[]> => {
    if (isBackendApiEnabled()) {
      const params = caseId ? { caseId } : {};
      return apiClient.get<Strategy[]>("/strategies", params);
    }
    console.warn(
      "[StrategyService] Backend API disabled, returning empty array"
    );
    return [];
  },

  createStrategy: async (strategy: Partial<Strategy>): Promise<Strategy> => {
    if (isBackendApiEnabled()) {
      const payload = {
        caseId: strategy.caseId || "",
        name: strategy.name || "New Strategy",
        description: strategy.description || "",
        objectives: strategy.objectives || [],
        risks: strategy.risks || [],
      };
      return apiClient.post<Strategy>("/strategies", payload);
    }
    throw new OperationError(
      "StrategyService.createStrategy",
      "Backend API required for createStrategy"
    );
  },

  analyzeRisks: async (strategyId: string): Promise<Risk[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<Risk[]>(`/strategies/${strategyId}/risks`);
      } catch (error) {
        console.error("[StrategyService.analyzeRisks] Backend error:", error);
      }
    }

    console.warn("[StrategyService] Backend risk analysis unavailable");
    return [];
  },

  getRecommendations: async (caseId: string): Promise<Recommendation[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<Recommendation[]>(
          "/strategies/recommendations",
          { caseId }
        );
      } catch (error) {
        console.error(
          "[StrategyService.getRecommendations] Backend error:",
          error
        );
      }
    }

    console.warn("[StrategyService] Backend recommendations unavailable");
    return [];
  },
};
