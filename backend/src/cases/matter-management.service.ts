import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Matter } from '@matters/entities/matter.entity';
import { Case } from './entities/case.entity';
import { CaseDeadline } from './entities/case-deadline.entity';
import { CaseRelationship } from './entities/case-relationship.entity';
import { ConflictCheck } from '@compliance/conflict-checks/entities/conflict-check.entity';

export interface MatterWithDetails extends Matter {
  caseCount?: number;
  activeDeadlines?: number;
  upcomingDeadlines?: CaseDeadline[];
  conflictStatus?: 'cleared' | 'pending' | 'issues';
  relatedMattersCount?: number;
}

export interface MatterStatistics {
  totalMatters: number;
  activeMatters: number;
  onHoldMatters: number;
  closedMatters: number;
  totalValue: number;
  averageMatterAge: number;
  mattersByPracticeArea: Record<string, number>;
  mattersByType: Record<string, number>;
  mattersByStatus: Record<string, number>;
}

export interface MatterSearchFilters {
  status?: string[];
  matterType?: string[];
  priority?: string[];
  practiceArea?: string[];
  clientId?: string;
  leadAttorneyId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  hasConflicts?: boolean;
}

/**
 * Matter Management Service
 *
 * Provides comprehensive matter/case management functionality including:
 * - Matter lifecycle management
 * - Case assignment and tracking
 * - Deadline monitoring
 * - Conflict checking integration
 * - Matter analytics and reporting
 * - Related matter management
 */
@Injectable()
export class MatterManagementService {
  constructor(
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseDeadline)
    private deadlineRepository: Repository<CaseDeadline>,
    @InjectRepository(CaseRelationship)
    private relationshipRepository: Repository<CaseRelationship>,
    @InjectRepository(ConflictCheck)
    private conflictCheckRepository: Repository<ConflictCheck>,
  ) {}

  /**
   * Get matter with detailed information including cases, deadlines, and conflicts
   */
  async getMatterWithDetails(matterId: string): Promise<MatterWithDetails> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    // Get associated cases count
    const caseCount = await this.caseRepository.count({
      where: { clientId: matter.clientId },
    });

    // Get active deadlines
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const upcomingDeadlines = await this.deadlineRepository
      .createQueryBuilder('deadline')
      .innerJoin('deadline.case', 'case')
      .where('case.clientId = :clientId', { clientId: matter.clientId })
      .andWhere('deadline.deadlineDate BETWEEN :now AND :sevenDaysFromNow', {
        now,
        sevenDaysFromNow,
      })
      .andWhere('deadline.status != :completed', { completed: 'completed' })
      .orderBy('deadline.deadlineDate', 'ASC')
      .take(5)
      .getMany();

    const activeDeadlines = await this.deadlineRepository.count({
      where: {
        status: In(['pending', 'upcoming', 'due_today']),
      },
    });

    // Get conflict check status
    const conflictChecks = await this.conflictCheckRepository.find({
      where: { potentialClientId: matter.clientId },
      order: { checkDate: 'DESC' },
      take: 1,
    });

    let conflictStatus: 'cleared' | 'pending' | 'issues' = 'pending';
    if (conflictChecks.length > 0) {
      const latestCheck = conflictChecks[0];
      if (latestCheck.status === 'no_conflict') {
        conflictStatus = 'cleared';
      } else if (latestCheck.status === 'conflict_identified') {
        conflictStatus = 'issues';
      }
    }

    // Get related matters count
    const relatedMattersCount = matter.relatedMatterIds?.length || 0;

    return {
      ...matter,
      caseCount,
      activeDeadlines,
      upcomingDeadlines,
      conflictStatus,
      relatedMattersCount,
    };
  }

  /**
   * Search matters with advanced filtering
   */
  async searchMatters(
    filters: MatterSearchFilters,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<{ matters: MatterWithDetails[]; total: number }> {
    const queryBuilder = this.matterRepository.createQueryBuilder('matter');

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      queryBuilder.andWhere('matter.status IN (:...statuses)', {
        statuses: filters.status,
      });
    }

    // Apply matter type filter
    if (filters.matterType && filters.matterType.length > 0) {
      queryBuilder.andWhere('matter.matterType IN (:...types)', {
        types: filters.matterType,
      });
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      queryBuilder.andWhere('matter.priority IN (:...priorities)', {
        priorities: filters.priority,
      });
    }

    // Apply practice area filter
    if (filters.practiceArea && filters.practiceArea.length > 0) {
      queryBuilder.andWhere('matter.practiceArea IN (:...areas)', {
        areas: filters.practiceArea,
      });
    }

    // Apply client filter
    if (filters.clientId) {
      queryBuilder.andWhere('matter.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }

    // Apply attorney filter
    if (filters.leadAttorneyId) {
      queryBuilder.andWhere('matter.leadAttorneyId = :attorneyId', {
        attorneyId: filters.leadAttorneyId,
      });
    }

    // Apply date range filter
    if (filters.startDate) {
      queryBuilder.andWhere('matter.openedDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('matter.openedDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Apply search filter
    if (filters.search) {
      queryBuilder.andWhere(
        '(matter.title ILIKE :search OR matter.matterNumber ILIKE :search OR matter.clientName ILIKE :search OR matter.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply conflict filter
    if (filters.hasConflicts !== undefined) {
      queryBuilder.andWhere('matter.conflictCheckCompleted = :hasConflicts', {
        hasConflicts: filters.hasConflicts,
      });
    }

    // Pagination
    const total = await queryBuilder.getCount();
    queryBuilder
      .orderBy('matter.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const matters = await queryBuilder.getMany();

    // Enrich with details
    const enrichedMatters = await Promise.all(
      matters.map((matter) => this.getMatterWithDetails(matter.id)),
    );

    return { matters: enrichedMatters, total };
  }

  /**
   * Get matter statistics and analytics
   */
  async getMatterStatistics(filters?: MatterSearchFilters): Promise<MatterStatistics> {
    const queryBuilder = this.matterRepository.createQueryBuilder('matter');

    // Apply filters if provided
    if (filters?.clientId) {
      queryBuilder.andWhere('matter.clientId = :clientId', {
        clientId: filters.clientId,
      });
    }
    if (filters?.leadAttorneyId) {
      queryBuilder.andWhere('matter.leadAttorneyId = :attorneyId', {
        attorneyId: filters.leadAttorneyId,
      });
    }

    const allMatters = await queryBuilder.getMany();

    const statistics: MatterStatistics = {
      totalMatters: allMatters.length,
      activeMatters: allMatters.filter((m) => m.status === 'ACTIVE').length,
      onHoldMatters: allMatters.filter((m) => m.status === 'ON_HOLD').length,
      closedMatters: allMatters.filter((m) => m.status === 'CLOSED').length,
      totalValue: allMatters.reduce(
        (sum, m) => sum + (Number(m.estimatedValue) || 0),
        0,
      ),
      averageMatterAge: 0,
      mattersByPracticeArea: {},
      mattersByType: {},
      mattersByStatus: {},
    };

    // Calculate average matter age
    const now = new Date();
    let totalAge = 0;
    let ageCount = 0;
    allMatters.forEach((matter) => {
      if (matter.openedDate) {
        const age =
          (now.getTime() - new Date(matter.openedDate).getTime()) /
          (1000 * 60 * 60 * 24);
        totalAge += age;
        ageCount++;
      }
    });
    statistics.averageMatterAge = ageCount > 0 ? totalAge / ageCount : 0;

    // Group by practice area
    allMatters.forEach((matter) => {
      if (matter.practiceArea) {
        statistics.mattersByPracticeArea[matter.practiceArea] =
          (statistics.mattersByPracticeArea[matter.practiceArea] || 0) + 1;
      }
    });

    // Group by type
    allMatters.forEach((matter) => {
      statistics.mattersByType[matter.matterType] =
        (statistics.mattersByType[matter.matterType] || 0) + 1;
    });

    // Group by status
    allMatters.forEach((matter) => {
      statistics.mattersByStatus[matter.status] =
        (statistics.mattersByStatus[matter.status] || 0) + 1;
    });

    return statistics;
  }

  /**
   * Link a case to a matter
   */
  async linkCaseToMatter(caseId: string, matterId: string): Promise<void> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    // Update case to link to matter's client
    caseEntity.clientId = matter.clientId;
    await this.caseRepository.save(caseEntity);
  }

  /**
   * Get all cases associated with a matter
   */
  async getMatterCases(matterId: string): Promise<Case[]> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    return this.caseRepository.find({
      where: { clientId: matter.clientId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Archive a matter
   */
  async archiveMatter(matterId: string, userId: string): Promise<Matter> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    matter.status = 'ARCHIVED' as any;
    matter.updatedBy = userId;

    return this.matterRepository.save(matter);
  }

  /**
   * Close a matter
   */
  async closeMatter(
    matterId: string,
    userId: string,
    closureNotes?: string,
  ): Promise<Matter> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    if (matter.status === 'CLOSED') {
      throw new BadRequestException(`Matter ${matterId} is already closed`);
    }

    matter.status = 'CLOSED' as any;
    matter.closedDate = new Date();
    matter.updatedBy = userId;

    if (closureNotes) {
      matter.internalNotes = matter.internalNotes
        ? `${matter.internalNotes}\n\nClosure Notes: ${closureNotes}`
        : `Closure Notes: ${closureNotes}`;
    }

    return this.matterRepository.save(matter);
  }

  /**
   * Reopen a closed matter
   */
  async reopenMatter(matterId: string, userId: string): Promise<Matter> {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
    });

    if (!matter) {
      throw new NotFoundException(`Matter ${matterId} not found`);
    }

    if (matter.status !== 'CLOSED') {
      throw new BadRequestException(`Matter ${matterId} is not closed`);
    }

    matter.status = 'ACTIVE' as any;
    matter.closedDate = null as any;
    matter.updatedBy = userId;

    return this.matterRepository.save(matter);
  }

  /**
   * Get matters by responsible attorney
   */
  async getMattersByAttorney(
    attorneyId: string,
    includeArchived: boolean = false,
  ): Promise<Matter[]> {
    const queryBuilder = this.matterRepository
      .createQueryBuilder('matter')
      .where('matter.leadAttorneyId = :attorneyId', { attorneyId });

    if (!includeArchived) {
      queryBuilder.andWhere('matter.status != :archived', {
        archived: 'ARCHIVED',
      });
    }

    return queryBuilder.orderBy('matter.openedDate', 'DESC').getMany();
  }

  /**
   * Get workload distribution across attorneys
   */
  async getAttorneyWorkload(): Promise<
    { attorneyId: string; attorneyName: string; matterCount: number; totalValue: number }[]
  > {
    const matters = await this.matterRepository.find({
      where: { status: 'ACTIVE' as any },
    });

    const workloadMap = new Map<
      string,
      { attorneyId: string; attorneyName: string; matterCount: number; totalValue: number }
    >();

    matters.forEach((matter) => {
      if (matter.leadAttorneyId) {
        const existing = workloadMap.get(matter.leadAttorneyId);
        if (existing) {
          existing.matterCount++;
          existing.totalValue += Number(matter.estimatedValue) || 0;
        } else {
          workloadMap.set(matter.leadAttorneyId, {
            attorneyId: matter.leadAttorneyId,
            attorneyName: matter.leadAttorneyName || 'Unknown',
            matterCount: 1,
            totalValue: Number(matter.estimatedValue) || 0,
          });
        }
      }
    });

    return Array.from(workloadMap.values()).sort(
      (a, b) => b.matterCount - a.matterCount,
    );
  }
}
