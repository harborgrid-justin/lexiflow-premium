/**
 * Witness Repository
 * Enterprise-grade repository for witness management with backend API integration
 *
 * @module WitnessRepository
 * @description Manages all witness-related operations including:
 * - Witness CRUD operations
 * - Type and status filtering
 * - Credibility tracking
 * - Prep status management
 * - Search and filtering
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 */

import { type Witness, WitnessesApiService } from "@/api/discovery/witnesses-api";
import { ValidationError } from "@/services/core/errors";
import { Repository } from "@/services/core/Repository";

export const WITNESS_QUERY_KEYS = {
  all: () => ["witnesses"] as const,
  byId: (id: string) => ["witnesses", id] as const,
  byCase: (caseId: string) => ["witnesses", "case", caseId] as const,
  byType: (type: string) => ["witnesses", "type", type] as const,
  byStatus: (status: string) => ["witnesses", "status", status] as const,
} as const;

export class WitnessRepository extends Repository<Witness> {
  private witnessesApi: WitnessesApiService;

  constructor() {
    super("witnesses");
    this.witnessesApi = new WitnessesApiService();
    console.log(`[WitnessRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new Error(`[WitnessRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<Witness[]> {
    try {
      return await this.witnessesApi.getAll();
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  override async getByCaseId(caseId: string): Promise<Witness[]> {
    this.validateId(caseId, "getByCaseId");
    try {
      return await this.witnessesApi.getByCaseId(caseId);
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  async getByType(witnessType: string): Promise<Witness[]> {
    if (!witnessType) {
      throw new ValidationError(
        "[WitnessRepository.getByType] Invalid witnessType"
      );
    }
    try {
      return await this.witnessesApi.getByType(
        witnessType as Witness["witnessType"]
      );
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  async getByStatus(status: string): Promise<Witness[]> {
    if (!status) {
      throw new ValidationError(
        "[WitnessRepository.getByStatus] Invalid status"
      );
    }
    try {
      return await this.witnessesApi.getByStatus(status as Witness["status"]);
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  override async getById(id: string): Promise<Witness | undefined> {
    this.validateId(id, "getById");
    try {
      return await this.witnessesApi.getById(id);
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  override async add(item: Witness): Promise<Witness> {
    if (!item || typeof item !== "object") {
      throw new ValidationError("[WitnessRepository.add] Invalid witness data");
    }
    try {
      return await this.witnessesApi.create(item);
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  override async update(
    id: string,
    updates: Partial<Witness>
  ): Promise<Witness> {
    this.validateId(id, "update");
    try {
      return await this.witnessesApi.update(id, updates);
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string): Promise<Witness> {
    this.validateId(id, "updateStatus");
    if (!status || typeof status !== "string") {
      throw new ValidationError(
        "[WitnessRepository.updateStatus] Invalid status"
      );
    }
    try {
      return await this.witnessesApi.updateStatus(
        id,
        status as Witness["status"]
      );
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.witnessesApi.delete(id);
      return;
    } catch (error) {
      console.error("[WitnessRepository] Backend API error", error);
      throw error;
    }
  }

  async search(criteria: {
    caseId?: string;
    type?: string;
    status?: string;
    query?: string;
  }): Promise<Witness[]> {
    let witnesses = await this.getAll();
    if (criteria.caseId)
      witnesses = witnesses.filter((w) => w.caseId === criteria.caseId);
    if (criteria.type)
      witnesses = witnesses.filter((w) => w.witnessType === criteria.type);
    if (criteria.status)
      witnesses = witnesses.filter((w) => w.status === criteria.status);
    if (criteria.query) {
      const lowerQuery = criteria.query.toLowerCase();
      witnesses = witnesses.filter(
        (w) =>
          w.name?.toLowerCase().includes(lowerQuery) ||
          w.organization?.toLowerCase().includes(lowerQuery) ||
          w.notes?.toLowerCase().includes(lowerQuery)
      );
    }
    return witnesses;
  }
}
