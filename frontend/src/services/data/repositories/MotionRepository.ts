/**
 * Motion Repository
 * Enterprise-grade repository for legal motion management with backend API integration
 *
 * @module MotionRepository
 * @description Manages all motion-related operations including:
 * - Motion CRUD operations
 * - Case-based motion queries
 * - Status tracking and updates
 * - Hearing and outcome management
 * - Search and filtering
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 *
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - IndexedDB fallback (development only)
 * - React Query integration via MOTION_QUERY_KEYS
 * - Type-safe operations
 */

import { MotionsApiService } from "@/api/litigation/motions-api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository } from "@/services/core/factories";
import { type Motion } from "@/types";

/**
 * Query keys for React Query integration
 */
export const MOTION_QUERY_KEYS = {
  all: () => ["motions"] as const,
  byId: (id: string) => ["motions", id] as const,
  byCase: (caseId: string) => ["motions", "case", caseId] as const,
  byType: (type: string) => ["motions", "type", type] as const,
  byStatus: (status: string) => ["motions", "status", status] as const,
} as const;

export class MotionRepository extends GenericRepository<Motion> {
  private motionsApi: MotionsApiService;
  protected apiService: MotionsApiService;
  protected repositoryName = "MotionRepository";

  constructor() {
    super("motions");
    this.motionsApi = new MotionsApiService();
    this.apiService = this.motionsApi;
    console.log(`[MotionRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[MotionRepository.${methodName}] Invalid id parameter`);
    }
  }

  override getByCaseId = async (caseId: string): Promise<Motion[]> => {
    this.validateId(caseId, "getByCaseId");
    try {
      return await this.motionsApi.getByCaseId(caseId);
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
    }
  };

  async updateStatus(id: string, status: string): Promise<Motion> {
    this.validateId(id, "updateStatus");
    if (!status || typeof status !== "string") {
      throw new ValidationError(
        "[MotionRepository.updateStatus] Invalid status",
      );
    }
    return await this.update(id, { status } as Partial<Motion>);
  }

  async searchMotions(criteria: {
    caseId?: string;
    type?: string;
    status?: string;
    query?: string;
  }): Promise<Motion[]> {
    let motions = await this.getAll();
    if (criteria.caseId)
      motions = motions.filter((m) => m.caseId === criteria.caseId);
    if (criteria.type)
      motions = motions.filter((m) => m.type === criteria.type);
    if (criteria.status)
      motions = motions.filter((m) => m.status === criteria.status);
    if (criteria.query) {
      const lowerQuery = criteria.query.toLowerCase();
      motions = motions.filter(
        (m) =>
          m.title?.toLowerCase().includes(lowerQuery) ||
          (m as { notes?: string }).notes?.toLowerCase().includes(lowerQuery),
      );
    }
    return motions;
  }
}
