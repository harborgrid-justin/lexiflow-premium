import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseTeamMember } from './entities/case-team.entity';
import { CreateCaseTeamDto } from './dto/create-case-team.dto';
import { UpdateCaseTeamDto } from './dto/update-case-team.dto';
import { WorkloadDistributionService } from './workload-distribution.service';

@Injectable()
export class CaseTeamsService {
  constructor(
    @InjectRepository(CaseTeamMember)
    private readonly caseTeamRepository: Repository<CaseTeamMember>,
    private readonly workloadService: WorkloadDistributionService,
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
    await this.caseTeamRepository.update(id, updateCaseTeamDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.caseTeamRepository.softDelete(id);
  }

  /**
   * Get workload metrics for a user
   */
  async getUserWorkload(userId: string) {
    return this.workloadService.calculateUserWorkload(userId);
  }

  /**
   * Get workload metrics for all team members in a case
   */
  async getCaseTeamWorkload(caseId: string) {
    return this.workloadService.getCaseTeamWorkload(caseId);
  }

  /**
   * Get team balance report
   */
  async getTeamBalanceReport(userIds?: string[]) {
    return this.workloadService.getTeamBalanceReport(userIds);
  }

  /**
   * Suggest optimal team member for assignment
   */
  async suggestTeamMember(role: string, excludeUserIds?: string[]) {
    return this.workloadService.suggestTeamMember(role, undefined, excludeUserIds);
  }

  /**
   * Get workload chart data
   */
  async getWorkloadChartData(userIds?: string[]) {
    return this.workloadService.getWorkloadChartData(userIds);
  }

  /**
   * Find team members by role
   */
  async findByRole(caseId: string, role: string): Promise<CaseTeamMember[]> {
    return this.caseTeamRepository.find({
      where: { caseId, role: role as any },
      order: { assignedDate: 'DESC' },
    });
  }

  /**
   * Find all cases for a user
   */
  async findUserCases(userId: string): Promise<CaseTeamMember[]> {
    return this.caseTeamRepository.find({
      where: { userId },
      order: { assignedDate: 'DESC' },
    });
  }
}
