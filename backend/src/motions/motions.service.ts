import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motion } from './entities/motion.entity';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { DeadlineTrackingService, CreateDeadlineDto } from './deadline-tracking.service';

@Injectable()
export class MotionsService {
  constructor(
    @InjectRepository(Motion)
    private readonly motionRepository: Repository<Motion>,
    private readonly deadlineService: DeadlineTrackingService,
  ) {}

  async findAllByCaseId(caseId: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId },
      order: { filedDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Motion> {
    const motion = await this.motionRepository.findOne({
      where: { id },
    });

    if (!motion) {
      throw new NotFoundException(`Motion with ID ${id} not found`);
    }

    return motion;
  }

  async create(createMotionDto: CreateMotionDto): Promise<Motion> {
    const motion = this.motionRepository.create(createMotionDto);
    return this.motionRepository.save(motion);
  }

  async update(id: string, updateMotionDto: UpdateMotionDto): Promise<Motion> {
    await this.findOne(id);
    await this.motionRepository.update(id, updateMotionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.motionRepository.softDelete(id);
  }

  /**
   * Create a deadline for a motion
   */
  async createDeadline(createDto: CreateDeadlineDto) {
    await this.findOne(createDto.motionId); // Ensure motion exists
    return this.deadlineService.create(createDto);
  }

  /**
   * Get deadlines for a motion
   */
  async getDeadlines(motionId: string) {
    await this.findOne(motionId);
    return this.deadlineService.findByMotionId(motionId);
  }

  /**
   * Get all deadlines for a case
   */
  async getCaseDeadlines(caseId: string) {
    return this.deadlineService.findByCaseId(caseId);
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(days: number = 7, userId?: string) {
    return this.deadlineService.getUpcomingDeadlines(days, userId);
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(userId?: string) {
    return this.deadlineService.getOverdueDeadlines(userId);
  }

  /**
   * Complete a deadline
   */
  async completeDeadline(id: string, userId: string, notes?: string) {
    return this.deadlineService.completeDeadline(id, userId, notes);
  }

  /**
   * Get deadline alerts
   */
  async getDeadlineAlerts(userId?: string, days: number = 7) {
    return this.deadlineService.getDeadlineAlerts(userId, days);
  }

  /**
   * Get deadline statistics
   */
  async getDeadlineStatistics(params: { caseId?: string; userId?: string }) {
    return this.deadlineService.getDeadlineStatistics(params);
  }

  /**
   * Find motions by status
   */
  async findByStatus(caseId: string, status: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, status: status as any },
      order: { filedDate: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find motions by type
   */
  async findByType(caseId: string, type: string): Promise<Motion[]> {
    return this.motionRepository.find({
      where: { caseId, type: type as any },
      order: { filedDate: 'DESC', createdAt: 'DESC' },
    });
  }
}
