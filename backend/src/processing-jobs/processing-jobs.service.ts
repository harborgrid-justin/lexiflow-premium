import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, DeepPartial } from "typeorm";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ProcessingJob } from "./entities/processing-job.entity";
import { JobType, JobStatus, JobStatusDto } from "./dto/job-status.dto";
import {
  JobQueueData,
  ProcessingResult,
  JobStatistics,
  JobStatusStatistic,
} from "./interfaces/processing-job.interfaces";

/**
 * ╔=================================================================================================================╗
 * ║PROCESSINGJOBS                                                                                                   ║
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
export class ProcessingJobsService {
  private readonly logger = new Logger(ProcessingJobsService.name);

  constructor(
    @InjectRepository(ProcessingJob)
    private jobRepository: Repository<ProcessingJob>,
    @Optional()
    @InjectQueue("document-processing")
    private documentQueue?: Queue
  ) {
    if (!this.documentQueue) {
      this.logger.warn(
        "Document processing queue not available - Redis is disabled"
      );
    }
  }

  /**
   * Create a new processing job
   */
  async createJob(
    type: JobType,
    documentId: string,
    parameters?: Record<string, unknown>,
    userId?: string
  ): Promise<ProcessingJob> {
    try {
      // Create job record
      const job = this.jobRepository.create({
        type,
        documentId,
        parameters,
        createdBy: userId,
        status: JobStatus.PENDING,
      } as unknown as DeepPartial<ProcessingJob>);

      const savedJob = await this.jobRepository.save(job);

      // Add to queue if available
      if (this.documentQueue) {
        const queueData: JobQueueData = {
          jobId: savedJob.id,
          documentId,
          parameters,
        };
        await this.documentQueue.add(type, queueData);
      } else {
        this.logger.warn(
          `Queue unavailable - job ${savedJob.id} created but not queued`
        );
      }

      this.logger.log(`Job created: ${savedJob.id} (${type})`);

      return savedJob;
    } catch (error) {
      this.logger.error("Failed to create job", error);
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
    result?: Record<string, unknown>,
    error?: string
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
    status?: JobStatus
  ): Promise<ProcessingJob[]> {
    const query = this.jobRepository.createQueryBuilder("job");

    if (documentId) {
      query.andWhere("job.documentId = :documentId", { documentId });
    }

    if (type) {
      query.andWhere("job.type = :type", { type });
    }

    if (status) {
      query.andWhere("job.status = :status", { status });
    }

    query.orderBy("job.createdAt", "DESC");

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
      throw new Error("Cannot cancel job in current status");
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
      order: { createdAt: "DESC" },
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
  async getStatistics(): Promise<JobStatistics> {
    const [total, pending, processing, completed, failed, cancelled] =
      await Promise.all([
        this.jobRepository.count(),
        this.jobRepository.count({ where: { status: JobStatus.PENDING } }),
        this.jobRepository.count({ where: { status: JobStatus.PROCESSING } }),
        this.jobRepository.count({ where: { status: JobStatus.COMPLETED } }),
        this.jobRepository.count({ where: { status: JobStatus.FAILED } }),
        this.jobRepository.count({ where: { status: JobStatus.CANCELLED } }),
      ]);

    const rawByStatus = await this.jobRepository
      .createQueryBuilder("job")
      .select("job.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("job.status")
      .getRawMany();

    const byStatus: JobStatusStatistic[] = rawByStatus.map(
      (item: { status: string; count: string }) => ({
        status: item.status as JobStatus,
        count: parseInt(item.count, 10),
      })
    );

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
      throw new Error("Progress must be between 0 and 100");
    }
    const job = await this.findOne(id);
    job.progress = progress;
    return this.jobRepository.save(job);
  }

  async setResult(
    id: string,
    result: ProcessingResult
  ): Promise<ProcessingJob> {
    await this.jobRepository.update(id, {
      result: result as any,
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
    });
    return this.findOne(id);
  }

  async setError(id: string, errorMessage: string): Promise<ProcessingJob> {
    await this.jobRepository.update(id, {
      error: errorMessage,
      status: JobStatus.FAILED,
      completedAt: new Date(),
    });
    return this.findOne(id);
  }

  async retryJob(id: string): Promise<ProcessingJob> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.FAILED && job.status !== JobStatus.CANCELLED) {
      throw new Error("Can only retry failed or cancelled jobs");
    }
    await this.jobRepository.update(id, {
      status: JobStatus.PENDING,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    });
    return this.findOne(id);
  }

  async getPendingJobs(): Promise<ProcessingJob[]> {
    return this.findByStatus(JobStatus.PENDING);
  }

  async cleanupOldJobs(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Find old completed/failed jobs
    const jobsToDelete = await this.jobRepository.find({
      where: [
        { status: JobStatus.COMPLETED, completedAt: LessThan(cutoffDate) },
        { status: JobStatus.FAILED, completedAt: LessThan(cutoffDate) },
      ],
    });

    if (jobsToDelete.length === 0) {
      return 0;
    }

    const result = await this.jobRepository.delete(
      jobsToDelete.map((job) => job.id)
    );
    return result.affected || 0;
  }
}
