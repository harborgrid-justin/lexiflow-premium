import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party } from './entities/party.entity';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { ConflictCheckService } from './conflict-check.service';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
    private readonly conflictCheckService: ConflictCheckService,
  ) {}

  async findAllByCaseId(caseId: string): Promise<Party[]> {
    return this.partyRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Party> {
    const party = await this.partyRepository.findOne({
      where: { id },
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }

    return party;
  }

  async create(createPartyDto: CreatePartyDto, skipConflictCheck = false): Promise<Party> {
    // Perform conflict check unless explicitly skipped
    if (!skipConflictCheck) {
      const conflictResult = await this.conflictCheckService.checkConflicts(
        createPartyDto.name,
        createPartyDto.type,
        createPartyDto.caseId,
      );

      if (conflictResult.hasConflict) {
        throw new BadRequestException({
          message: 'Conflict detected when adding party',
          conflicts: conflictResult.conflicts,
          warnings: conflictResult.warnings,
        });
      }
    }

    const party = this.partyRepository.create(createPartyDto);
    return this.partyRepository.save(party);
  }

  async update(id: string, updatePartyDto: UpdatePartyDto): Promise<Party> {
    await this.findOne(id);
    await this.partyRepository.update(id, updatePartyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.partyRepository.softDelete(id);
  }

  /**
   * Check conflicts for a party
   */
  async checkConflicts(
    name: string,
    type: string,
    caseId: string,
    excludePartyId?: string,
  ) {
    return this.conflictCheckService.checkConflicts(
      name,
      type as any,
      caseId,
      excludePartyId,
    );
  }

  /**
   * Get conflict summary for a case
   */
  async getConflictSummary(caseId: string) {
    return this.conflictCheckService.getCaseConflictSummary(caseId);
  }

  /**
   * Find parties by role
   */
  async findByRole(caseId: string, role: string): Promise<Party[]> {
    return this.partyRepository.find({
      where: { caseId, role: role as any },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find parties by type
   */
  async findByType(caseId: string, type: string): Promise<Party[]> {
    return this.partyRepository.find({
      where: { caseId, type: type as any },
      order: { createdAt: 'DESC' },
    });
  }
}
