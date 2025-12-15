import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ProcessingJob } from './entities/processing-job.entity';
import { JobType, JobStatus, JobStatusDto } from './dto/job-status.dto';

@Injectable()
export class ProcessingJobsService {
  private readonly logger = new Logger(ProcessingJobsService.name);

  constructor(
    @InjectRepository(ProcessingJob)
    private jobRepository: Repository<ProcessingJob>,
    @InjectQueue('document-processing')
    private documentQueue: Queue,
  ) {}

  /**
   * Create a new processing job
   */
  async createJob(
    type: JobType,
    documentId: string,
    parameters?: Record<string, any>,
    userId?: string,
  ): Promise<ProcessingJob> {
    try {
      // Create job record
      const job = this.jobRepository.create({
        type,
        documentId,
        parameters,
        createdBy: userId,
        status: JobStatus.PENDING,
      });

      const savedJob = await this.jobRepository.save(job);

      // Add to queue
      await this.documentQueue.add(type, {
        jobId: savedJob.id,
        documentId,
        parameters,
      });

      this.logger.log(`Job created: ${savedJob.id} (${type})`);

      return savedJob;
    } catch (error) {
      this.logger.error('Failed to create job', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(id: string): Promise<JobStatusDto> {
    const job = await this.findOne(id);

    return {
      id: job.id,
      type: job.type,
      status: job.status,
      documentId: job.documentId,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      processingTime: job.processingTime,
    };
  }

  /**
   * Find a job by ID
   */
  async findOne(id: string): Promise<ProcessingJob> {
    const job = await this.jobRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    id: string,
    status: JobStatus,
    progress?: number,
    result?: Record<string, any>,
    error?: string,
  ): Promise<ProcessingJob> {
    const job = await this.findOne(id);

    job.status = status;

    if (progress !== undefined) {
      job.progress = progress;
    }

    if (result) {
      job.result = result;
    }

    if (error) {
      job.error = error;
    }

    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      job.completedAt = new Date();
      job.processingTime = job.completedAt.getTime() - job.createdAt.getTime();
    }

    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Job ${id} status updated to ${status}`);

    return updatedJob;
  }

  /**
   * Get all jobs with optional filtering
   */
  async findAll(
    documentId?: string,
    type?: JobType,
    status?: JobStatus,
  ): Promise<ProcessingJob[]> {
    const query = this.jobRepository.createQueryBuilder('job');

    if (documentId) {
      query.andWhere('job.documentId = :documentId', { documentId });
    }

    if (type) {
      query.andWhere('job.type = :type', { type });
    }

    if (status) {
      query.andWhere('job.status = :status', { status });
    }

    query.orderBy('job.createdAt', 'DESC');

    return await query.getMany();
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<ProcessingJob> {
    const job = await this.findOne(id);

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.FAILED ||
      job.status === JobStatus.CANCELLED
    ) {
      throw new Error('Cannot cancel job in current status');
    }

    job.status = JobStatus.CANCELLED;
    job.completedAt = new Date();

    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Job cancelled: ${id}`);

    return updatedJob;
  }

  /**
   * Get jobs by document ID
   */
  async findByDocumentId(documentId: string): Promise<ProcessingJob[]> {
    return await this.jobRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending jobs count
   */
  async getPendingJobsCount(): Promise<number> {
    return await this.jobRepository.count({
      where: { status: JobStatus.PENDING },
    });
  }

  /**
   * Get processing jobs count
   */
  async getProcessingJobsCount(): Promise<number> {
    return await this.jobRepository.count({
      where: { status: JobStatus.PROCESSING },
    });
  }

  /**
   * Get job statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    byStatus: Array<{ status: JobStatus; count: number }>;
  }> {
    const [total, pending, processing, completed, failed, cancelled] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({ where: { status: JobStatus.PENDING } }),
      this.jobRepository.count({ where: { status: JobStatus.PROCESSING } }),
      this.jobRepository.count({ where: { status: JobStatus.COMPLETED } }),
      this.jobRepository.count({ where: { status: JobStatus.FAILED } }),
      this.jobRepository.count({ where: { status: JobStatus.CANCELLED } }),
    ]);

    const byStatus = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      cancelled,
      byStatus,
    };
  }

  async findById(id: string): Promise<ProcessingJob> {
    return this.findOne(id);
  }

  async findByStatus(status: JobStatus): Promise<ProcessingJob[]> {
    return this.jobRepository.find({ where: { status } });
  }

  async findByType(type: JobType): Promise<ProcessingJob[]> {
    return this.jobRepository.find({ where: { type } });
  }

  async updateStatus(id: string, status: JobStatus): Promise<ProcessingJob> {
    return this.updateJobStatus(id, status);
  }

  async updateProgress(id: string, progress: number): Promise<ProcessingJob> {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    const job = await this.findOne(id);
    await this.jobRepository.update(id, { progress });
    return this.findOne(id);
  }

  async setResult(id: string, result: any): Promise<ProcessingJob> {
    const job = await this.findOne(id);
    await this.jobRepository.update(id, { result, status: JobStatus.COMPLETED, completedAt: new Date() });
    return this.findOne(id);
  }

  async setError(id: string, errorMessage: string): Promise<ProcessingJob> {
    const job = await this.findOne(id);
    await this.jobRepository.update(id, { error: errorMessage, status: JobStatus.FAILED, completedAt: new Date() });
    return this.findOne(id);
  }

  async retryJob(id: string): Promise<ProcessingJob> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.FAILED && job.status !== JobStatus.CANCELLED) {
      throw new Error('Can only retry failed or cancelled jobs');
    }
    await this.jobRepository.update(id, { 
      status: JobStatus.PENDING, 
      error: null, 
      startedAt: null, 
      completedAt: null 
    });
    return this.findOne(id);
  }

  async getPendingJobs(): Promise<ProcessingJob[]> {
    return this.findByStatus(JobStatus.PENDING);
  }

  async cleanupOldJobs(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const result = await this.jobRepository
      .createQueryBuilder()
      .delete()
      .where('completedAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', { statuses: [JobStatus.COMPLETED, JobStatus.FAILED] })
      .execute();
    return result.affected || 0;
  }
}
