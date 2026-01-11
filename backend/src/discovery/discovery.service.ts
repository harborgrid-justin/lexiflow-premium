import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Not, Repository, DeepPartial } from "typeorm";
import { Custodian } from "./custodians/entities/custodian.entity";
import {
  DiscoveryRequest,
  DiscoveryRequestStatus,
} from "./discovery-requests/entities/discovery-request.entity";
import { Evidence } from "./evidence/entities/evidence.entity";
import {
  LegalHold,
  LegalHoldStatus,
} from "./legal-holds/entities/legal-hold.entity";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                          DISCOVERY SERVICE - E-DISCOVERY & EVIDENCE ORCHESTRATION                                  ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  Legal Team / Systems               DiscoveryController                   DiscoveryService                       ║
 * ║       │                                   │                                     │                                 ║
 * ║       │  POST /discovery/requests         │                                     │                                 ║
 * ║       │  POST /legal-holds                │                                     │                                 ║
 * ║       │  POST /custodians                 │                                     │                                 ║
 * ║       │  POST /evidence                   │                                     │                                 ║
 * ║       └───────────────────────────────────┴─────────────────────────────────────▶                                 ║
 * ║                                                                                 │                                 ║
 * ║                                               ┌─────────────────────────────┴────────────────────────────┐        ║
 * ║                                               │  Service Composition Pattern          │        ║
 * ║                                               │  (Not Direct Repository Injection)    │        ║
 * ║                                               └────────────┬───────────────────────────────┘        ║
 * ║                                                             │                                                  ║
 * ║                          ┌──────────────────────────────┴──────────────────────────────────────────┐        ║
 * ║                          │                                                                  │        ║
 * ║           ┌─────────────┴───────────────┐       ┌─────────────┴────────────┐   ┌────────┴─────────┐  ║
 * ║           │                           │       │                         │   │                  │  ║
 * ║           ▼                           ▼       ▼                         ▼   ▼                  ▼  ║
 * ║  DiscoveryRequest Repo     LegalHold Repo  Custodian Repo        Evidence Repo    Production Repo       ║
 * ║           │                           │       │                         │   │                  │  ║
 * ║           ▼                           ▼       ▼                         ▼   ▼                  ▼  ║
 * ║  PostgreSQL (requests)    PostgreSQL     PostgreSQL            PostgreSQL       PostgreSQL            ║
 * ║                                                                                                                   ║
 * ║  DATA IN:  DiscoveryRequestDto { type, description, dueDate, assignedTo }                                        ║
 * ║            LegalHoldDto { custodians[], startDate, instructions }                                                ║
 * ║            CustodianDto { name, email, department, dataS ources[] }                                              ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: DiscoveryRequest { id, type, status, responses[], documents[] }                                       ║
 * ║            LegalHold { id, status, custodians[], compliance[], releaseDate }                                     ║
 * ║            Evidence { id, fileName, hash, chain-of-custody[], tags[] }                                           ║
 * ║                                                                                                                   ║
 * ║  FEATURES: • Discovery request tracking    • Legal hold management      • Custodian management                    ║
 * ║            • Evidence chain-of-custody      • Production management      • Privilege logging                        ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Discovery Service
 * Orchestrates discovery operations across all sub-modules
 * Uses service composition pattern rather than direct repository injection
 */
@Injectable()
export class DiscoveryService {
  async findAll(): Promise<any[]> {
    const result = await this.findAllRequests();
    return Array.isArray(result) ? result : result.data || [];
  }

  findOne(id: string): Promise<unknown> {
    return this.findRequestById(id);
  }

  create(createDto: unknown): Promise<unknown> {
    return this.createRequest(createDto);
  }

  constructor(
    @InjectRepository(DiscoveryRequest)
    private readonly discoveryRequestRepository: Repository<DiscoveryRequest>,
    @InjectRepository(LegalHold)
    private readonly legalHoldRepository: Repository<LegalHold>,
    @InjectRepository(Custodian)
    private readonly custodianRepository: Repository<Custodian>,
    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>
  ) {}

  async findAllRequests(
    options?: PaginationOptions
  ): Promise<PaginatedResult<unknown>> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await this.discoveryRequestRepository.findAndCount({
      take: limit,
      skip,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRequestsByCaseId(
    caseId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<unknown>> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await this.discoveryRequestRepository.findAndCount({
      where: { caseId },
      take: limit,
      skip,
      order: { createdAt: "DESC" },
      cache: {
        id: `case_${caseId}_requests`,
        milliseconds: 60000, // 1 minute
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRequestById(id: string): Promise<DiscoveryRequest | null> {
    const request = await this.discoveryRequestRepository.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Discovery request with ID ${id} not found`);
    }
    return request;
  }

  async createRequest(
    createDto: DeepPartial<DiscoveryRequest>
  ): Promise<DiscoveryRequest> {
    const request = this.discoveryRequestRepository.create(createDto);
    return this.discoveryRequestRepository.save(request);
  }

  async updateRequest(
    id: string,
    updateDto: DeepPartial<DiscoveryRequest>
  ): Promise<DiscoveryRequest> {
    const result = await this.discoveryRequestRepository
      .createQueryBuilder()
      .update(DiscoveryRequest)
      .set(updateDto)
      .where("id = :id", { id })
      .returning("*")
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Discovery request with ID ${id} not found`);
    }
    const rows = result.raw as DiscoveryRequest[];
    return rows[0];
  }

  async deleteRequest(id: string): Promise<void> {
    await this.discoveryRequestRepository.delete(id);
  }

  async getOverdueRequests(): Promise<DiscoveryRequest[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.discoveryRequestRepository.find({
      where: {
        dueDate: LessThan(today),
        status: Not(DiscoveryRequestStatus.COMPLETED),
      },
      cache: {
        id: "overdue_requests",
        milliseconds: 300000, // 5 minutes
      },
    });
  }

  async findAllHolds(): Promise<LegalHold[]> {
    return this.legalHoldRepository.find();
  }

  async findHoldsByCaseId(caseId: string): Promise<LegalHold[]> {
    return this.legalHoldRepository.find({ where: { caseId } });
  }

  async findHoldById(id: string): Promise<LegalHold> {
    const hold = await this.legalHoldRepository.findOne({ where: { id } });
    if (!hold) {
      throw new NotFoundException(`Legal hold with ID ${id} not found`);
    }
    return hold;
  }

  async createHold(createDto: DeepPartial<LegalHold>): Promise<LegalHold> {
    const hold = this.legalHoldRepository.create(createDto);
    return this.legalHoldRepository.save(hold);
  }

  async releaseHold(id: string): Promise<LegalHold> {
    const hold = await this.findHoldById(id);
    hold.status = LegalHoldStatus.RELEASED;
    hold.releaseDate = new Date();
    return this.legalHoldRepository.save(hold);
  }

  async getActiveHolds(): Promise<LegalHold[]> {
    return this.legalHoldRepository.find({
      where: { status: LegalHoldStatus.ACTIVE },
    });
  }

  async findCustodiansByHoldId(holdId: string): Promise<Custodian[]> {
    return this.custodianRepository.find({ where: { legalHoldId: holdId } });
  }

  async createCustodian(createDto: DeepPartial<Custodian>): Promise<Custodian> {
    const custodian = this.custodianRepository.create(createDto);
    return this.custodianRepository.save(custodian);
  }

  async acknowledgeCustodian(id: string): Promise<Custodian> {
    const custodian = await this.custodianRepository.findOne({ where: { id } });
    if (!custodian) {
      throw new NotFoundException(`Custodian with ID ${id} not found`);
    }
    custodian.acknowledgedAt = new Date();
    return this.custodianRepository.save(custodian);
  }

  async getUnacknowledgedCustodians(holdId: string): Promise<Custodian[]> {
    return this.custodianRepository
      .createQueryBuilder("custodian")
      .where("custodian.legalHoldId = :holdId", { holdId })
      .andWhere("custodian.acknowledgedAt IS NULL")
      .getMany();
  }

  async deleteCustodian(id: string): Promise<void> {
    await this.custodianRepository.delete(id);
  }

  async getDiscoveryStats(caseId: string): Promise<unknown> {
    const requests = await this.findRequestsByCaseId(caseId);
    const holds = await this.findHoldsByCaseId(caseId);

    const requestArray = requests.data || [];
    const totalRequests = requestArray.length;
    const completedRequests = requestArray.filter(
      (r) => r.status === DiscoveryRequestStatus.COMPLETED
    ).length;
    const pendingRequests = requestArray.filter((req) => {
      return (
        req.status !== DiscoveryRequestStatus.COMPLETED &&
        req.status !== DiscoveryRequestStatus.OBJECTED
      );
    }).length;
    const activeHolds = holds.filter(
      (h) => h.status === LegalHoldStatus.ACTIVE
    ).length;
    const totalCustodians = holds.reduce(
      (sum, hold) => sum + (hold.totalCustodians || 0),
      0
    );

    return {
      totalRequests,
      pendingRequests,
      completedRequests,
      overdueRequests: requestArray.filter((req) => {
        return (
          req.dueDate &&
          new Date(req.dueDate) < new Date() &&
          req.status !== DiscoveryRequestStatus.COMPLETED
        );
      }).length,
      activeHolds,
      totalHolds: holds.length,
      totalCustodians,
    };
  }

  async getAllEvidence(query?: {
    caseId?: string;
    type?: string;
    admissibilityStatus?: string;
  }): Promise<Evidence[]> {
    const whereClause: Record<string, unknown> = {};

    if (query?.caseId) {
      whereClause.caseId = query.caseId;
    }

    if (query?.type) {
      whereClause.type = query.type;
    }

    if (query?.admissibilityStatus) {
      whereClause.admissibilityStatus = query.admissibilityStatus;
    }

    return this.evidenceRepository.find({
      where: whereClause,
      order: { createdAt: "DESC" },
    });
  }

  async createEvidence(createDto: DeepPartial<Evidence>): Promise<Evidence> {
    const evidence = this.evidenceRepository.create(createDto);
    return this.evidenceRepository.save(evidence);
  }

  async getEvidenceByCaseId(caseId: string): Promise<Evidence[]> {
    return this.evidenceRepository.find({
      where: { caseId },
      order: { title: "ASC" },
    });
  }

  async getEvidenceById(id: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }

    return evidence;
  }

  async getFunnelStats() {
    // Return sample data for now, or aggregate from DB
    return [
      { name: "Identification", value: 1250, label: "Files Identified" },
      { name: "Preservation", value: 980, label: "Preserved" },
      { name: "Collection", value: 750, label: "Collected" },
      { name: "Processing", value: 680, label: "Processed" },
      { name: "Review", value: 420, label: "To Review" },
      { name: "Production", value: 150, label: "Produced" },
    ];
  }

  async getCustodianStats() {
    // Return sample data for now, or aggregate from DB
    return [
      { name: "Executive", value: 45 },
      { name: "Finance", value: 32 },
      { name: "Sales", value: 28 },
      { name: "IT", value: 15 },
      { name: "Legal", value: 12 },
      { name: "HR", value: 8 },
    ];
  }
}
