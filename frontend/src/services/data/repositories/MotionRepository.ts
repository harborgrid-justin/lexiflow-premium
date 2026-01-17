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
import { Repository } from "@/services/core/Repository";
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

export class MotionRepository extends Repository<Motion> {
  private motionsApi: MotionsApiService;

  constructor() {
    super("motions");
    this.motionsApi = new MotionsApiService();
    console.log(`[MotionRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[MotionRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<Motion[]> {
    try {
      return await this.motionsApi.getAll();
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
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

  override async getById(id: string): Promise<Motion | undefined> {
    this.validateId(id, "getById");
    try {
      return await this.motionsApi.getById(id);
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
    }
  }

  override async add(item: Motion): Promise<Motion> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[MotionRepository.add] Invalid motion data");
    }
    try {
      return await this.motionsApi.create(item);
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
    }

    return item;
  }

  override async update(id: string, updates: Partial<Motion>): Promise<Motion> {
    this.validateId(id, "update");
    try {
      return await this.motionsApi.update(id, updates);
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.motionsApi.delete(id);
      return;
    } catch (error) {
      console.error("[MotionRepository] Backend API error", error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string): Promise<Motion> {
    this.validateId(id, "updateStatus");
    if (!status || typeof status !== "string") {
      throw new ValidationError(
        "[MotionRepository.updateStatus] Invalid status"
      );
    }
    return await this.update(id, { status } as Partial<Motion>);
  }

  async search(criteria: {
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
          (m as { notes?: string }).notes?.toLowerCase().includes(lowerQuery)
      );
    }
    return motions;
  }
}
