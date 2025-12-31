import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from './entities/evidence.entity';
import { CreateDiscoveryEvidenceDto } from './dto/create-evidence.dto';
import { UpdateDiscoveryEvidenceDto } from './dto/update-evidence.dto';
import { QueryEvidenceDto } from './dto/query-evidence.dto';

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
    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,
  ) {}

  async findAll(query?: QueryEvidenceDto): Promise<Evidence[]> {
    const where: any = {};

    if (query?.caseId) {
      where.caseId = query.caseId;
    }
    if (query?.type) {
      where.type = query.type;
    }
    if (query?.admissibility) {
      where.admissibility = query.admissibility;
    }
    if (query?.custodian) {
      where.custodian = query.custodian;
    }
    if (query?.status) {
      where.status = query.status;
    }

    return this.evidenceRepository.find({
      where,
      select: [
        'id',
        'caseId',
        'trackingUuid',
        'type',
        'description',
        'admissibility',
        'custodian',
        'status',
        // 'acquiredDate', // Field not in Evidence entity
        'createdAt',
        'updatedAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }

    return evidence;
  }

  async create(createEvidenceDto: CreateDiscoveryEvidenceDto): Promise<Evidence> {
    const evidence = this.evidenceRepository.create({
      ...createEvidenceDto,
      trackingUuid: createEvidenceDto.trackingUuid || crypto.randomUUID(),
    });
    return this.evidenceRepository.save(evidence);
  }

  async update(id: string, updateEvidenceDto: UpdateDiscoveryEvidenceDto): Promise<Evidence> {
    const result = await this.evidenceRepository
      .createQueryBuilder()
      .update(Evidence)
      .set(updateEvidenceDto)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    return result.raw[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.evidenceRepository.softDelete(id);
  }

  async addChainOfCustodyEvent(
    id: string,
    event: { action: string; actor: string; notes?: string },
  ): Promise<Evidence> {
    const evidence = await this.findOne(id);
    const newEvent = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      action: event.action,
      actor: event.actor,
      notes: event.notes,
      hash: crypto.randomUUID(), // In production, this would be a proper hash
    };

    evidence.chainOfCustody = [...(evidence.chainOfCustody || []), newEvent];
    return this.evidenceRepository.save(evidence);
  }
}
