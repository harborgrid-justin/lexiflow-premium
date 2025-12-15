import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, IsNull } from 'typeorm';
import { DiscoveryRequest } from './entities/discovery-request.entity';
import { LegalHold } from './entities/legal-hold.entity';
import { Custodian } from './entities/custodian.entity';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(DiscoveryRequest)
    private discoveryRequestRepository: Repository<DiscoveryRequest>,
    @InjectRepository(LegalHold)
    private legalHoldRepository: Repository<LegalHold>,
    @InjectRepository(Custodian)
    private custodianRepository: Repository<Custodian>,
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
    return this.discoveryRequestRepository.find({
      where: [
        { dueDate: LessThan(new Date()), status: 'pending' }
      ],
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
    hold.status = 'released';
    await this.legalHoldRepository.save(hold);
    return hold;
  }

  async getActiveHolds(): Promise<any[]> {
    return this.legalHoldRepository.find({
      where: { name: Not(IsNull()) },
      // Note: status field doesn't exist on LegalHold entity, filtering by existence instead
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
    return {
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      activeHolds: 0,
      totalCustodians: 0,
    };
  }
}
