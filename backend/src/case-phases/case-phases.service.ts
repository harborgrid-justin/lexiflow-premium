import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CasePhase } from './entities/case-phase.entity';
import { CreateCasePhaseDto } from './dto/create-case-phase.dto';
import { UpdateCasePhaseDto } from './dto/update-case-phase.dto';

@Injectable()
export class CasePhasesService {
  constructor(
    @InjectRepository(CasePhase)
    private readonly casePhaseRepository: Repository<CasePhase>,
  ) {}

  async findAllByCaseId(caseId: string): Promise<CasePhase[]> {
    return this.casePhaseRepository.find({
      where: { caseId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CasePhase> {
    const phase = await this.casePhaseRepository.findOne({
      where: { id },
    });

    if (!phase) {
      throw new NotFoundException(`Case phase with ID ${id} not found`);
    }

    return phase;
  }

  async create(createCasePhaseDto: CreateCasePhaseDto): Promise<CasePhase> {
    const phase = this.casePhaseRepository.create(createCasePhaseDto);
    return this.casePhaseRepository.save(phase);
  }

  async update(id: string, updateCasePhaseDto: UpdateCasePhaseDto): Promise<CasePhase> {
    await this.findOne(id);
    await this.casePhaseRepository.update(id, updateCasePhaseDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.casePhaseRepository.softDelete(id);
  }
}
