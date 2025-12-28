import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Matter } from './entities/matter.entity';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { MatterResponseDto } from './dto/matter-response.dto';
import {
  MatterStatistics,
  MatterKPIs,
  PipelineStage,
  CalendarEvent,
  RevenueAnalytics,
  RiskInsight,
  FinancialOverview,
} from './interfaces/analytics.interface';

@Injectable()
export class MattersService {
  constructor(
    @InjectRepository(Matter)
    private mattersRepository: Repository<Matter>,
  ) {}

  /**
   * Convert Matter entity to MatterResponseDto
   * Handles the null to undefined conversion for opposingCounsel
   */
  private toResponseDto(matter: Matter): MatterResponseDto {
    return new MatterResponseDto({
      ...matter,
      opposingCounsel: matter.opposingCounsel ?? undefined,
      relatedMatterIds: matter.relatedMatterIds ?? undefined,
    });
  }

  /**
   * Generate unique matter number in format: MAT-YYYY-NNNN
   */
  private async generateMatterNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MAT-${year}-`;
    
    // Get the last matter number for this year
    const lastMatter = await this.mattersRepository
      .createQueryBuilder('matter')
      .where('matter.matterNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('matter.matterNumber', 'DESC')
      .getOne();

    if (!lastMatter) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastMatter.matterNumber.split('-')[2] || '0', 10);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `${prefix}${newNumber}`;
  }

  async create(createMatterDto: CreateMatterDto): Promise<MatterResponseDto> {
    // Generate unique matter number
    const matterNumber = await this.generateMatterNumber();

    // Map userId to createdBy (entity expects createdBy, DTO uses userId)
    // Use system UUID (00000000-0000-0000-0000-000000000000) as default
    const { userId, opposingCounsel, ...dtoRest } = createMatterDto;
    const SYSTEM_USER_UUID = '00000000-0000-0000-0000-000000000000';

    const matter = this.mattersRepository.create({
      ...dtoRest,
      matterNumber,
      createdBy: userId || SYSTEM_USER_UUID,
      opposingCounsel: opposingCounsel ? { name: opposingCounsel } : null,
    });

    const savedMatter = await this.mattersRepository.save(matter);
    return this.toResponseDto(savedMatter);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      status?: string;
      matterType?: string;
      priority?: string;
      clientId?: string;
      leadAttorneyId?: string;
      search?: string;
    },
  ): Promise<{ matters: MatterResponseDto[]; total: number }> {
    const queryBuilder = this.mattersRepository.createQueryBuilder('matter');

    // Apply filters
    if (filters?.status) {
      queryBuilder.andWhere('matter.status = :status', { status: filters.status });
    }
    if (filters?.matterType) {
      queryBuilder.andWhere('matter.matterType = :matterType', { matterType: filters.matterType });
    }
    if (filters?.priority) {
      queryBuilder.andWhere('matter.priority = :priority', { priority: filters.priority });
    }
    if (filters?.clientId) {
      queryBuilder.andWhere('matter.clientId = :clientId', { clientId: filters.clientId });
    }
    if (filters?.leadAttorneyId) {
      queryBuilder.andWhere('matter.leadAttorneyId = :leadAttorneyId', { 
        leadAttorneyId: filters.leadAttorneyId 
      });
    }
    if (filters?.search) {
      queryBuilder.andWhere(
        '(matter.title ILIKE :search OR matter.matterNumber ILIKE :search OR matter.clientName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Note: No isArchived filter - not in current schema

    // Pagination
    queryBuilder
      .orderBy('matter.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [matters, total] = await queryBuilder.getManyAndCount();

    return {
      matters: matters.map(matter => this.toResponseDto(matter)),
      total,
    };
  }

  async findOne(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    return this.toResponseDto(matter);
  }

  async findByMatterNumber(matterNumber: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({
      where: { matterNumber }
    });

    if (!matter) {
      throw new NotFoundException(`Matter with number ${matterNumber} not found`);
    }

    return this.toResponseDto(matter);
  }

  async update(id: string, updateMatterDto: UpdateMatterDto): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Update matter
    Object.assign(matter, updateMatterDto);
    const updatedMatter = await this.mattersRepository.save(matter);

    return this.toResponseDto(updatedMatter);
  }

  async remove(id: string): Promise<void> {
    const matter = await this.mattersRepository.findOne({ where: { id } });
    
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    await this.mattersRepository.remove(matter);
  }

  async archive(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id } });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Note: isArchived field not in current schema - using soft delete instead
    await this.mattersRepository.softRemove(matter);

    return this.toResponseDto(matter);
  }

  async restore(id: string): Promise<MatterResponseDto> {
    const matter = await this.mattersRepository.findOne({ where: { id }, withDeleted: true });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Note: Using soft delete recovery instead of isArchived field
    await this.mattersRepository.recover(matter);

    return this.toResponseDto(matter);
  }

  async getStatistics(userId?: string): Promise<MatterStatistics> {
    const queryBuilder = this.mattersRepository.createQueryBuilder('matter');

    if (userId) {
      queryBuilder.where('matter.userId = :userId', { userId });
    }

    const [total, active, intake, pending, closed] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'active' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'intake' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'pending' }).getCount(),
      queryBuilder.clone().andWhere('matter.status = :status', { status: 'closed' }).getCount(),
    ]);

    return {
      total,
      byStatus: {
        active,
        intake,
        pending,
        closed,
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getKPIs(_dateRange?: string): Promise<MatterKPIs> {
    // dateRange parameter reserved for future filtering implementation
    const matters = await this.mattersRepository.find();
    const activeMatters = matters.filter(m => m.status === 'ACTIVE');
    const intakeMatters = matters.filter(m => m.status === 'INTAKE');

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = matters.filter(m => {
        if (!m.targetCloseDate) return false;
        const date = new Date(m.targetCloseDate);
        return date >= now && date <= sevenDaysFromNow;
    }).length;

    const totalValue = matters.reduce((sum, m) => sum + (Number(m.estimatedValue) || 0), 0);

    let totalAge = 0;
    let ageCount = 0;
    activeMatters.forEach(m => {
        if (m.openedDate) {
            const opened = new Date(m.openedDate);
            const age = (now.getTime() - opened.getTime()) / (1000 * 60 * 60 * 24);
            totalAge += age;
            ageCount++;
        }
    });
    const averageAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;

    return {
      totalActive: activeMatters.length,
      intakePipeline: intakeMatters.length,
      upcomingDeadlines,
      atRisk: activeMatters.filter(m => m.priority === 'HIGH').length,
      totalValue,
      utilizationRate: 0,
      averageAge,
      conversionRate: 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getPipeline(_dateRange?: string): Promise<PipelineStage[]> {
    // dateRange parameter reserved for future filtering implementation
    const matters = await this.mattersRepository.find();

    // Define stages based on status
    // Assuming status maps to stages. Adjust as needed based on actual status enum.
    const stages = [
        { name: 'Initial Contact', status: 'INTAKE' },
        { name: 'Conflict Check', status: 'CONFLICT_CHECK' },
        { name: 'Engagement', status: 'ENGAGEMENT' },
        { name: 'Active', status: 'ACTIVE' }
    ];

    return stages.map(stage => {
        const stageMatters = matters.filter(m => m.status === stage.status);
        const count = stageMatters.length;
        const value = stageMatters.reduce((sum, m) => sum + (Number(m.estimatedValue) || 0), 0);
        return {
            stage: stage.name,
            count,
            value,
            avgDaysInStage: 0,
            conversionRate: 0
        };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCalendarEvents(_startDate: string, _endDate?: string, _matterIds?: string): Promise<CalendarEvent[]> {
    // Parameters reserved for future implementation of calendar event filtering
    // Return empty array if no events found, or implement logic to fetch from tasks/deadlines
    // For now, returning empty array is better than mock data
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRevenueAnalytics(_dateRange?: string): Promise<RevenueAnalytics> {
    // dateRange parameter reserved for future filtering implementation
    const matters = await this.mattersRepository.find();

    return {
      totalRevenue: matters.reduce((sum, m) => sum + (Number(m.estimatedValue) || 0), 0),
      byPracticeArea: {},
      byMatterType: {},
      trend: [],
    };
  }

  async getRiskInsights(matterIds?: string): Promise<RiskInsight[]> {
    const matterIdArray = matterIds ? matterIds.split(',') : undefined;
    let matters: Matter[] = [];

    if (matterIdArray) {
      matters = await this.mattersRepository.findByIds(matterIdArray);
    } else {
      matters = await this.mattersRepository.find({ take: 10 });
    }

    return matters.map(matter => ({
      matterId: matter.id,
      matterTitle: matter.title,
      riskScore: 0, // Placeholder
      riskLevel: (matter.priority === 'HIGH' ? 'high' : 'medium') as 'low' | 'medium' | 'high',
      factors: [],
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFinancialOverview(_dateRange?: string): Promise<FinancialOverview> {
    // dateRange parameter reserved for future filtering implementation
    const matters = await this.mattersRepository.find();

    return {
      totalRevenue: matters.reduce((sum, m) => sum + (Number(m.estimatedValue) || 0), 0),
      billableHours: 0,
      realizationRate: 0,
      outstandingAR: 0,
      budgetPerformance: matters.map(m => ({
        matterId: m.id,
        matterTitle: m.title,
        budget: m.budgetAmount || 0,
        spent: 0,
        variance: 0,
      })),
    };
  }
}
