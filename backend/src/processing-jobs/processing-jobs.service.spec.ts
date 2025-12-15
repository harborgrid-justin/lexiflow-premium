import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { ProcessingJobsService } from './processing-jobs.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { JobType, JobStatus } from './dto/job-status.dto';

describe('ProcessingJobsService', () => {
  let service: ProcessingJobsService;
  let repository: Repository<ProcessingJob>;

  const mockJob = {
    id: 'job-001',
    type: JobType.OCR,
    documentId: 'doc-001',
    status: JobStatus.PENDING,
    progress: 0,
    params: { languages: ['eng'] },
    result: null,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
    process: jest.fn(),
    getJob: jest.fn(),
    getJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessingJobsService,
        { provide: getRepositoryToken(ProcessingJob), useValue: mockRepository },
        { provide: getQueueToken('document-processing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ProcessingJobsService>(ProcessingJobsService);
    repository = module.get<Repository<ProcessingJob>>(getRepositoryToken(ProcessingJob));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a new processing job', async () => {
      mockRepository.create.mockReturnValue(mockJob);
      mockRepository.save.mockResolvedValue(mockJob);

      const result = await service.createJob(JobType.OCR, 'doc-001', { languages: ['eng'] });

      expect(result).toEqual(mockJob);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create job with default params if not provided', async () => {
      mockRepository.create.mockReturnValue({ ...mockJob, params: {} });
      mockRepository.save.mockResolvedValue({ ...mockJob, params: {} });

      const result = await service.createJob(JobType.OCR, 'doc-001');

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all jobs', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.findAll();

      expect(result).toEqual([mockJob]);
    });
  });

  describe('findById', () => {
    it('should return a job by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);

      const result = await service.findById(mockJob.id);

      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDocumentId', () => {
    it('should return jobs for a document', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.findByDocumentId('doc-001');

      expect(result).toEqual([mockJob]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { documentId: 'doc-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByStatus', () => {
    it('should return jobs by status', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.findByStatus(JobStatus.PENDING);

      expect(result).toEqual([mockJob]);
    });
  });

  describe('findByType', () => {
    it('should return jobs by type', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.findByType(JobType.OCR);

      expect(result).toEqual([mockJob]);
    });
  });

  describe('updateStatus', () => {
    it('should update job status', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({ ...mockJob, status: JobStatus.PROCESSING });

      const result = await service.updateStatus(mockJob.id, JobStatus.PROCESSING);

      expect(result.status).toBe(JobStatus.PROCESSING);
    });

    it('should set startedAt when status changes to PROCESSING', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({
        ...mockJob,
        status: JobStatus.PROCESSING,
        startedAt: expect.any(Date),
      });

      const result = await service.updateStatus(mockJob.id, JobStatus.PROCESSING);

      expect(result.startedAt).toBeDefined();
    });

    it('should set completedAt when status changes to COMPLETED', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockJob, status: JobStatus.PROCESSING });
      mockRepository.save.mockResolvedValue({
        ...mockJob,
        status: JobStatus.COMPLETED,
        completedAt: expect.any(Date),
      });

      const result = await service.updateStatus(mockJob.id, JobStatus.COMPLETED);

      expect(result.completedAt).toBeDefined();
    });
  });

  describe('updateProgress', () => {
    it('should update job progress', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({ ...mockJob, progress: 50 });

      const result = await service.updateProgress(mockJob.id, 50);

      expect(result.progress).toBe(50);
    });

    it('should clamp progress between 0 and 100', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({ ...mockJob, progress: 100 });

      const result = await service.updateProgress(mockJob.id, 150);

      expect(result.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('setResult', () => {
    it('should set job result', async () => {
      const resultData = { extractedText: 'Sample text' };
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({
        ...mockJob,
        result: resultData,
        status: JobStatus.COMPLETED,
      });

      const result = await service.setResult(mockJob.id, resultData);

      expect(result.result).toEqual(resultData);
      expect(result.status).toBe(JobStatus.COMPLETED);
    });
  });

  describe('setError', () => {
    it('should set job error', async () => {
      const errorMessage = 'OCR processing failed';
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({
        ...mockJob,
        error: errorMessage,
        status: JobStatus.FAILED,
      });

      const result = await service.setError(mockJob.id, errorMessage);

      expect(result.error).toBe(errorMessage);
      expect(result.status).toBe(JobStatus.FAILED);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job', async () => {
      mockRepository.findOne.mockResolvedValue(mockJob);
      mockRepository.save.mockResolvedValue({ ...mockJob, status: JobStatus.CANCELLED });

      const result = await service.cancelJob(mockJob.id);

      expect(result.status).toBe(JobStatus.CANCELLED);
    });

    it('should not cancel a completed job', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockJob, status: JobStatus.COMPLETED });

      await expect(service.cancelJob(mockJob.id)).rejects.toThrow();
    });
  });

  describe('retryJob', () => {
    it('should retry a failed job', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockJob, status: JobStatus.FAILED });
      mockRepository.save.mockResolvedValue({
        ...mockJob,
        status: JobStatus.PENDING,
        error: null,
        progress: 0,
      });

      const result = await service.retryJob(mockJob.id);

      expect(result.status).toBe(JobStatus.PENDING);
      expect(result.error).toBeNull();
    });

    it('should not retry a non-failed job', async () => {
      const completedJob = { ...mockJob, status: JobStatus.COMPLETED };
      mockRepository.findOne.mockResolvedValue(completedJob);

      await expect(service.retryJob(mockJob.id)).rejects.toThrow();
    });
  });

  describe('getStatistics', () => {
    it('should return job statistics', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: JobStatus.PENDING, count: 5 },
          { status: JobStatus.COMPLETED, count: 10 },
          { status: JobStatus.FAILED, count: 2 },
        ]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStatistics();

      expect(result).toHaveProperty('byStatus');
      expect(result.byStatus).toBeInstanceOf(Array);
    });
  });

  describe('getPendingJobs', () => {
    it('should return pending jobs ordered by creation', async () => {
      mockRepository.find.mockResolvedValue([mockJob]);

      const result = await service.getPendingJobs();

      expect(result).toEqual([mockJob]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: JobStatus.PENDING },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('cleanupOldJobs', () => {
    it('should delete old completed jobs', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 5 });

      const result = await service.cleanupOldJobs(30);

      expect(result).toBe(5);
    });
  });
});
