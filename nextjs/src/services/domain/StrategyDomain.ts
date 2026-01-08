/**
 * +---------------------------------------------------------------------------+
 *                     LEXIFLOW STRATEGY DOMAIN SERVICE
 *                  Enterprise Litigation Strategy Layer v2.0
 *                        PhD-Level Systems Architecture
 * +---------------------------------------------------------------------------+
 *
 * @module services/domain/StrategyDomain
 * @architecture Backend-First Strategy Management
 * @author LexiFlow Engineering Team
 * @since 2025-12-29
 * @status PRODUCTION READY
 *
 * Provides litigation strategy creation, risk assessment, and tactical recommendations
 * with backend API integration for persistent storage and analytics.
 */

import { litigationApi } from "@/api/domains/litigation.api";
import {
  Recommendation,
  Risk,
  Strategy,
} from "@/api/litigation/strategies-api";

export const StrategyService = {
  getAll: async (): Promise<Strategy[]> => {
    return litigationApi.strategies.getAll();
  },

  getById: async (id: string): Promise<Strategy> => {
    return litigationApi.strategies.getById(id);
  },

  add: async (item: unknown): Promise<Strategy> => {
    return litigationApi.strategies.create(item as Partial<Strategy>);
  },

  update: async (id: string, updates: unknown): Promise<Strategy> => {
    return litigationApi.strategies.update(id, updates as Partial<Strategy>);
  },

  analyzeRisks: async (strategyId: string): Promise<Risk[]> => {
    return litigationApi.strategies.getRisks(strategyId);
  },

  getRecommendations: async (caseId: string): Promise<Recommendation[]> => {
    return litigationApi.strategies.getRecommendations(caseId);
  },
};
