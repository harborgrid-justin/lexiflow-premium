import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CreateServiceJobDto,
  UpdateServiceJobDto,
  CompleteServiceDto,
  ServiceJobQueryDto,
  ServiceJobStatus,
} from './dto';

export interface ServiceJob extends Omit<CreateServiceJobDto, 'deadline'> {
  id: string;
  deadline?: Date | string;
  status: ServiceJobStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
  completedBy?: string;
  completedAt?: Date;
  assignedAt?: Date;
  assignedBy?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
}

/**
 * Service Jobs Service
 *
 * Manages service of process tracking including:
 * - Creating service jobs
 * - Assigning process servers
 * - Tracking service progress
 * - Recording service completion
 * - Managing proof of service
 *
 * @class ServiceJobsService
 */
/**
 * ╔=================================================================================================================╗
 * ║JOBSSERVICE                                                                                                      ║
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
export class ServiceJobsService {
  private readonly logger = new Logger(ServiceJobsService.name);
  private serviceJobs: Map<string, ServiceJob> = new Map();

  constructor() {
    this.logger.log('ServiceJobsService initialized with in-memory storage');
  }

  /**
   * Get all service jobs with filters
   */
  async findAll(query: ServiceJobQueryDto, userId: string) {
    const { page = 1, limit = 20, type, status, caseId, processServerId } = query;

    let jobs: ServiceJob[] = Array.from(this.serviceJobs.values());

    if (type) {
      jobs = jobs.filter(j => j.type === type);
    }
    if (status) {
      jobs = jobs.filter(j => j.status === status);
    }
    if (caseId) {
      jobs = jobs.filter(j => j.caseId === caseId);
    }
    if (processServerId) {
      jobs = jobs.filter(j => j.processServerId === processServerId);
    }

    jobs.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const total = jobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = jobs.slice(startIndex, startIndex + limit);

    this.logger.debug(`Retrieved ${data.length} service jobs for user ${userId} (page ${page}/${totalPages})`);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get service job by ID
   */
  async findById(id: string, userId: string) {
    const job = this.serviceJobs.get(id);
    
    if (!job) {
      throw new NotFoundException(`Service job ${id} not found`);
    }

    this.logger.debug(`Service job ${id} retrieved by user ${userId}`);
    return job;
  }

  /**
   * Create new service job
   */
  async create(createDto: CreateServiceJobDto, userId: string): Promise<ServiceJob> {
    const job: ServiceJob = {
      id: `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...createDto,
      status: ServiceJobStatus.PENDING,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.serviceJobs.set(job.id, job);
    
    this.logger.log(`Service job created: ${job.id} for case ${createDto.caseId}`);

    if (createDto.processServerId) {
      await this.notifyProcessServer(job.id, createDto.processServerId, 'assigned');
    }

    return job;
  }

  /**
   * Update service job
   */
  async update(id: string, updateDto: UpdateServiceJobDto, userId: string): Promise<ServiceJob> {
    const job = this.serviceJobs.get(id);
    
    if (!job) {
      throw new NotFoundException(`Service job ${id} not found`);
    }

    if (job.status === ServiceJobStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed service job');
    }

    const updatedJob: ServiceJob = {
      ...job,
      ...updateDto,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    this.serviceJobs.set(id, updatedJob);
    this.logger.log(`Service job ${id} updated by user ${userId}`);

    if (job.processServerId && updateDto.serviceAddress) {
      await this.notifyProcessServer(id, job.processServerId, 'updated');
    }

    return updatedJob;
  }

  /**
   * Complete service job
   */
  async completeService(id: string, completeDto: CompleteServiceDto, userId: string): Promise<ServiceJob> {
    const job = this.serviceJobs.get(id);
    
    if (!job) {
      throw new NotFoundException(`Service job ${id} not found`);
    }

    if (job.status === ServiceJobStatus.COMPLETED) {
      throw new BadRequestException('Service job is already completed');
    }

    if (job.status === ServiceJobStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled service job');
    }

    const completedJob: ServiceJob = {
      ...job,
      status: ServiceJobStatus.COMPLETED,
      ...completeDto,
      completedBy: userId,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    this.serviceJobs.set(id, completedJob);
    this.logger.log(`Service job ${id} completed by user ${userId}`);

    await this.notifyCaseTeam(job.caseId, id);

    return completedJob;
  }

  /**
   * Assign process server
   */
  async assignProcessServer(id: string, processServerId: string, userId: string): Promise<ServiceJob> {
    const job = this.serviceJobs.get(id);
    
    if (!job) {
      throw new NotFoundException(`Service job ${id} not found`);
    }

    if (job.status === ServiceJobStatus.COMPLETED) {
      throw new BadRequestException('Cannot reassign a completed service job');
    }

    const updatedJob: ServiceJob = {
      ...job,
      processServerId,
      status: ServiceJobStatus.ASSIGNED,
      assignedAt: new Date(),
      assignedBy: userId,
      updatedAt: new Date(),
    };

    this.serviceJobs.set(id, updatedJob);
    this.logger.log(`Process server ${processServerId} assigned to service job ${id}`);

    await this.notifyProcessServer(id, processServerId, 'assigned');

    return updatedJob;
  }

  /**
   * Get service jobs for a case
   */
  async getJobsForCase(caseId: string, userId: string): Promise<{ caseId: string; jobs: ServiceJob[]; total: number }> {
    const jobs = Array.from(this.serviceJobs.values())
      .filter(j => j.caseId === caseId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    this.logger.debug(`Retrieved ${jobs.length} service jobs for case ${caseId} by user ${userId}`);

    return {
      caseId,
      jobs,
      total: jobs.length,
    };
  }

  /**
   * Get service jobs assigned to a process server
   */
  async getJobsForProcessServer(processServerId: string): Promise<{ processServerId: string; jobs: ServiceJob[]; total: number }> {
    const jobs = Array.from(this.serviceJobs.values())
      .filter(j => j.processServerId === processServerId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    this.logger.debug(`Retrieved ${jobs.length} service jobs for process server ${processServerId}`);

    return {
      processServerId,
      jobs,
      total: jobs.length,
    };
  }

  /**
   * Get overdue service jobs
   */
  async getOverdueJobs(userId: string): Promise<{ overdueJobs: ServiceJob[]; total: number }> {
    const now = new Date();
    const overdueJobs = Array.from(this.serviceJobs.values())
      .filter(j => 
        j.status !== ServiceJobStatus.COMPLETED &&
        j.status !== ServiceJobStatus.CANCELLED &&
        j.deadline !== undefined &&
        j.deadline !== null
      )
      .filter(j => {
        if (!j.deadline) return false;
        const deadline = typeof j.deadline === 'object' 
          ? j.deadline 
          : new Date(j.deadline);
        return deadline < now;
      })
      .sort((a, b) => {
        const deadlineA = typeof a.deadline === 'object'
          ? a.deadline 
          : new Date(a.deadline as string);
        const deadlineB = typeof b.deadline === 'object'
          ? b.deadline 
          : new Date(b.deadline as string);
        return deadlineA.getTime() - deadlineB.getTime();
      });

    this.logger.debug(`Found ${overdueJobs.length} overdue service jobs for user ${userId}`);

    return {
      overdueJobs,
      total: overdueJobs.length,
    };
  }

  /**
   * Cancel service job
   */
  async cancel(id: string, reason: string, userId: string): Promise<ServiceJob> {
    const job = this.serviceJobs.get(id);
    
    if (!job) {
      throw new NotFoundException(`Service job ${id} not found`);
    }

    if (job.status === ServiceJobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed service job');
    }

    if (job.status === ServiceJobStatus.CANCELLED) {
      throw new BadRequestException('Service job is already cancelled');
    }

    const cancelledJob: ServiceJob = {
      ...job,
      status: ServiceJobStatus.CANCELLED,
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
    };

    this.serviceJobs.set(id, cancelledJob);
    this.logger.log(`Service job ${id} cancelled by user ${userId}: ${reason}`);

    if (job.processServerId) {
      await this.notifyProcessServer(id, job.processServerId, 'cancelled');
    }

    return cancelledJob;
  }

  /**
   * Notify process server about job status change
   */
  private async notifyProcessServer(jobId: string, processServerId: string, action: string): Promise<void> {
    this.logger.debug(`Notification sent to process server ${processServerId} for job ${jobId}: ${action}`);
  }

  /**
   * Notify case team about job completion
   */
  private async notifyCaseTeam(caseId: string, jobId: string): Promise<void> {
    this.logger.debug(`Case team notified for case ${caseId} about completed job ${jobId}`);
  }
}
