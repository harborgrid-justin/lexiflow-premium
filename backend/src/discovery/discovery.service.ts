import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, IsNull } from 'typeorm';
import { DiscoveryRequest, DiscoveryRequestStatus } from './discovery-requests/entities/discovery-request.entity';
import { LegalHold, LegalHoldStatus } from './legal-holds/entities/legal-hold.entity';
import { Custodian } from './custodians/entities/custodian.entity';
import { Evidence } from './evidence/entities/evidence.entity';

@Injectable()
export class DiscoveryService {
  findAll(): Promise<any[]> {
    return this.findAllRequests();
  }

  findOne(id: string): Promise<any> {
    return this.findRequestById(id);
  }

  create(createDto: any): Promise<any> {
    return this.createRequest(createDto);
  }
  constructor(
    @InjectRepository(DiscoveryRequest)
    private discoveryRequestRepository: Repository<DiscoveryRequest>,
    @InjectRepository(LegalHold)
    private legalHoldRepository: Repository<LegalHold>,
    @InjectRepository(Custodian)
    private custodianRepository: Repository<Custodian>,
    @InjectRepository(Evidence)
    private evidenceRepository: Repository<Evidence>,
  ) {}

  async findAllRequests(): Promise<any[]> {
    return this.discoveryRequestRepository.find();
  }

  async findRequestsByCaseId(caseId: string): Promise<any[]> {
    return this.discoveryRequestRepository.find({ where: { caseId } });
  }

  async findRequestById(id: string): Promise<any> {
    const request = await this.discoveryRequestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Discovery request with ID ${id} not found`);
    }
    return request;
  }

  async createRequest(createDto: any): Promise<any> {
    const request = this.discoveryRequestRepository.create(createDto);
    return this.discoveryRequestRepository.save(request);
  }

  async updateRequest(id: string, updateDto: any): Promise<any> {
    await this.findRequestById(id);
    await this.discoveryRequestRepository.update(id, updateDto);
    return this.findRequestById(id);
  }

  async deleteRequest(id: string): Promise<void> {
    await this.discoveryRequestRepository.delete(id);
  }

  async getOverdueRequests(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.discoveryRequestRepository.find({
      where: {
        dueDate: LessThan(today),
        status: Not(DiscoveryRequestStatus.COMPLETED),
      },
    });
  }

  async findAllHolds(): Promise<any[]> {
    return this.legalHoldRepository.find();
  }

  async findHoldsByCaseId(caseId: string): Promise<any[]> {
    return this.legalHoldRepository.find({ where: { caseId } });
  }

  async findHoldById(id: string): Promise<any> {
    const hold = await this.legalHoldRepository.findOne({ where: { id } });
    if (!hold) {
      throw new NotFoundException(`Legal hold with ID ${id} not found`);
    }
    return hold;
  }

  async createHold(createDto: any): Promise<any> {
    const hold = this.legalHoldRepository.create(createDto);
    return this.legalHoldRepository.save(hold);
  }

  async releaseHold(id: string): Promise<any> {
    const hold = await this.findHoldById(id);
    hold.status = LegalHoldStatus.RELEASED;
    hold.releaseDate = new Date();
    await this.legalHoldRepository.save(hold);
    return hold;
  }

  async getActiveHolds(): Promise<any[]> {
    return this.legalHoldRepository.find({
      where: { status: LegalHoldStatus.ACTIVE },
    });
  }

  async findCustodiansByHoldId(holdId: string): Promise<any[]> {
    return this.custodianRepository.find({ where: { legalHoldId: holdId } });
  }

  async createCustodian(createDto: any): Promise<any> {
    const custodian = this.custodianRepository.create(createDto);
    return this.custodianRepository.save(custodian);
  }

  async acknowledgeCustodian(id: string): Promise<any> {
    const custodian = await this.custodianRepository.findOne({ where: { id } });
    if (!custodian) {
      throw new NotFoundException(`Custodian with ID ${id} not found`);
    }
    custodian.acknowledgedAt = new Date();
    return this.custodianRepository.save(custodian);
  }

  async getUnacknowledgedCustodians(holdId: string): Promise<any[]> {
    return this.custodianRepository
      .createQueryBuilder('custodian')
      .where('custodian.legalHoldId = :holdId', { holdId })
      .andWhere('custodian.acknowledgedAt IS NULL')
      .getMany();
  }

  async deleteCustodian(id: string): Promise<void> {
    await this.custodianRepository.delete(id);
  }

  async getDiscoveryStats(caseId: string): Promise<any> {
    const requests = await this.findRequestsByCaseId(caseId);
    const holds = await this.findHoldsByCaseId(caseId);
    
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === DiscoveryRequestStatus.COMPLETED).length;
    const pendingRequests = requests.filter(r => 
      r.status !== DiscoveryRequestStatus.COMPLETED && 
      r.status !== DiscoveryRequestStatus.OBJECTED
    ).length;
    const activeHolds = holds.filter(h => h.status === LegalHoldStatus.ACTIVE).length;
    const totalCustodians = holds.reduce((sum, hold) => sum + (hold.totalCustodians || 0), 0);

    return {
      totalRequests,
      pendingRequests,
      completedRequests,
      overdueRequests: requests.filter(r => 
        r.dueDate && new Date(r.dueDate) < new Date() && 
        r.status !== DiscoveryRequestStatus.COMPLETED
      ).length,
      activeHolds,
      totalHolds: holds.length,
      totalCustodians,
    };
  }

  async getAllEvidence(query?: any): Promise<Evidence[]> {
    const whereClause: any = {};
    
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
      order: { createdAt: 'DESC' },
    });
  }

  async getEvidenceByCaseId(caseId: string): Promise<Evidence[]> {
    return this.evidenceRepository.find({
      where: { caseId },
      order: { title: 'ASC' },
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
}
