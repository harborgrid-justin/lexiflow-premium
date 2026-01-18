/**
 * Witness Repository
 * Enterprise-grade repository for witness management with backend API integration
 */

import { type Witness, WitnessesApiService } from "@/api/discovery/witnesses-api";
import { ValidationError } from "@/services/core/errors";
import { GenericRepository, createQueryKeys, type IApiService } from "@/services/core/factories";

export const WITNESS_QUERY_KEYS = {
  ...createQueryKeys('witnesses'),
  byCase: (caseId: string) => ["witnesses", "case", caseId] as const,
  byType: (type: string) => ["witnesses", "type", type] as const,
  byStatus: (status: string) => ["witnesses", "status", status] as const,
} as const;

export class WitnessRepository extends GenericRepository<Witness> {
  protected apiService: IApiService<Witness> = new WitnessesApiService();
  protected repositoryName = 'WitnessRepository';

  constructor() {
    super('witnesses');
    console.log(`[WitnessRepository] Initialized with Backend API`);
  }

  // CRUD operations inherited from GenericRepository

  // Custom methods
  override async getByCaseId(caseId: string): Promise<Witness[]> {
    this.validateIdParameter(caseId, "getByCaseId");
    return await this.apiService.getByCaseId(caseId);
  }

  async getByType(witnessType: string): Promise<Witness[]> {
    if (!witnessType) {
      throw new ValidationError(
        "[WitnessRepository.getByType] Invalid witnessType"
      );
    }
    return await this.apiService.getByType(
      witnessType as Witness["witnessType"]
    );
  }

  async getByStatus(status: string): Promise<Witness[]> {
    if (!status) {
      throw new ValidationError(
        "[WitnessRepository.getByStatus] Invalid status"
      );
    }
    return await this.apiService.getByStatus(status as Witness["status"]);
  }

  async updateStatus(id: string, status: string): Promise<Witness> {
    this.validateIdParameter(id, "updateStatus");
    if (!status || typeof status !== "string") {
      throw new ValidationError(
        "[WitnessRepository.updateStatus] Invalid status"
      );
    }
    return await this.apiService.updateStatus(
      id,
      status as Witness["status"]
    );
  }

  async searchWitnesses(criteria: {
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
