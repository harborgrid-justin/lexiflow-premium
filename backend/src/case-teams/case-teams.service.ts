import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseTeamMember } from './entities/case-team.entity';
import { CreateCaseTeamDto } from './dto/create-case-team.dto';
import { UpdateCaseTeamDto } from './dto/update-case-team.dto';

@Injectable()
export class CaseTeamsService {
  constructor(
    @InjectRepository(CaseTeamMember)
    private readonly caseTeamRepository: Repository<CaseTeamMember>,
  ) {}

  async findAllByCaseId(caseId: string): Promise<CaseTeamMember[]> {
    return this.caseTeamRepository.find({
      where: { caseId },
      order: { assignedDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CaseTeamMember> {
    const teamMember = await this.caseTeamRepository.findOne({
      where: { id },
    });

    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return teamMember;
  }

  async create(createCaseTeamDto: CreateCaseTeamDto): Promise<CaseTeamMember> {
    const teamMember = this.caseTeamRepository.create(createCaseTeamDto);
    return this.caseTeamRepository.save(teamMember);
  }

  async update(id: string, updateCaseTeamDto: UpdateCaseTeamDto): Promise<CaseTeamMember> {
    await this.findOne(id);
    const { permissions, metadata, ...restDto } = updateCaseTeamDto;
    await this.caseTeamRepository.update(id, {
      ...restDto,
      ...(permissions ? { permissions: JSON.stringify(permissions) as any } : {}),
      ...(metadata ? { metadata: JSON.stringify(metadata) as any } : {})
    } as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.caseTeamRepository.softDelete(id);
  }
}
