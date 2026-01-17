import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import {
  ChainOfCustodyAction,
  ChainOfCustodyEvent,
} from "./entities/chain-of-custody-event.entity";
import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
} from "./entities/evidence-item.entity";

/**
 * ╔=================================================================================================================╗
 * ║EVIDENCE                                                                                                         ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(EvidenceItem)
    private readonly evidenceRepository: Repository<EvidenceItem>,
    @InjectRepository(ChainOfCustodyEvent)
    private readonly chainOfCustodyRepository: Repository<ChainOfCustodyEvent>,
  ) {}

  async create(evidenceData: Partial<EvidenceItem>): Promise<EvidenceItem> {
    const evidence = this.evidenceRepository.create(evidenceData);
    const saved = await this.evidenceRepository.save(evidence);

    // Create initial chain of custody event
    await this.addChainOfCustodyEvent({
      evidenceId: saved.id,
      action: ChainOfCustodyAction.COLLECTED,
      eventDate: new Date(),
      handler: evidenceData.collectedBy || "System",
      location: evidenceData.storageLocation,
      notes: "Initial collection",
    });

    return saved;
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    caseId?: string;
    type?: EvidenceType;
    status?: EvidenceStatus;
    custodian?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: EvidenceItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 50,
      caseId,
      type,
      status,
      custodian,
      search,
      dateFrom,
      dateTo,
      sortBy = "collectionDate",
      sortOrder = "desc",
    } = options || {};

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<EvidenceItem> = {};

    if (caseId) where.caseId = caseId;
    if (type) where.evidenceType = type;
    if (status) where.status = status;
    if (custodian) where.currentCustodian = custodian;

    // Handle search (search in description)
    if (search) {
      where.description = Like(`%${search}%`);
    }

    // Handle date range filtering
    if (dateFrom && dateTo) {
      where.collectionDate = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.collectionDate = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      where.collectionDate = LessThanOrEqual(new Date(dateTo));
    }

    const [evidence, total] = await this.evidenceRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder.toUpperCase() as "ASC" | "DESC" },
      skip,
      take: limit,
    });

    return {
      data: evidence,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<EvidenceItem> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
      relations: ["chainOfCustodyEvents"],
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence item with ID ${id} not found`);
    }

    return evidence;
  }

  async findByCase(caseId: string): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { caseId },
      order: { collectionDate: "DESC" },
    });
  }

  async findByType(evidenceType: EvidenceType): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { evidenceType },
      order: { collectionDate: "DESC" },
    });
  }

  async findByStatus(status: EvidenceStatus): Promise<EvidenceItem[]> {
    return this.evidenceRepository.find({
      where: { status },
      order: { collectionDate: "DESC" },
    });
  }

  async update(
    id: string,
    updateData: Partial<EvidenceItem>,
  ): Promise<EvidenceItem> {
    const evidence = await this.findOne(id);
    Object.assign(evidence, updateData);
    return this.evidenceRepository.save(evidence);
  }

  async remove(id: string): Promise<void> {
    const evidence = await this.findOne(id);
    await this.evidenceRepository.remove(evidence);
  }

  async addChainOfCustodyEvent(
    eventData: Partial<ChainOfCustodyEvent>,
  ): Promise<ChainOfCustodyEvent> {
    const event = this.chainOfCustodyRepository.create(eventData);
    return this.chainOfCustodyRepository.save(event);
  }

  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustodyEvent[]> {
    return this.chainOfCustodyRepository.find({
      where: { evidenceId },
      order: { eventDate: "ASC" },
    });
  }

  async transferCustody(
    evidenceId: string,
    transferData: {
      transferredFrom: string;
      transferredTo: string;
      handler: string;
      handlerId?: string;
      location?: string;
      notes?: string;
    },
  ): Promise<ChainOfCustodyEvent> {
    await this.findOne(evidenceId);

    const event = await this.addChainOfCustodyEvent({
      evidenceId,
      action: ChainOfCustodyAction.TRANSFERRED,
      eventDate: new Date(),
      ...transferData,
    });

    // Update evidence location if provided
    if (transferData.location) {
      await this.update(evidenceId, { storageLocation: transferData.location });
    }

    return event;
  }
}
