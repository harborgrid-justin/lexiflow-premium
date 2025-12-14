import { Test, TestingModule } from '@nestjs/testing';
import { ProcessingJobsController } from './processing-jobs.controller';
import { ProcessingJobsService } from './processing-jobs.service';

describe('ProcessingJobsController', () => {
  let controller: ProcessingJobsController;
  let service: ProcessingJobsService;

  const mockJob = {
    id: 'job-001',
    type: 'ocr',
    status: 'completed',
    entityType: 'document',
    entityId: 'doc-001',
    progress: 100,
    result: { text: 'Extracted text', confidence: 0.95 },
    error: null,
    startedAt: new Date(),
    completedAt: new Date(),
    createdBy: 'user-001',
  };

  const mockProcessingJobsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEntityId: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    retry: jest.fn(),
    getStatus: jest.fn(),
    getProgress: jest.fn(),
    getStats: jest.fn(),
    getQueue: jest.fn(),
    clearCompleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessingJobsController],
      providers: [{ provide: ProcessingJobsService, useValue: mockProcessingJobsService }],
    }).compile();

    controller = module.get<ProcessingJobsController>(ProcessingJobsController);
    service = module.get<ProcessingJobsService>(ProcessingJobsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all processing jobs', async () => {
      mockProcessingJobsService.findAll.mockResolvedValue([mockJob]);

      const result = await controller.findAll();

      expect(result).toEqual([mockJob]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a job by id', async () => {
      mockProcessingJobsService.findById.mockResolvedValue(mockJob);

      const result = await controller.findById('job-001');

      expect(result).toEqual(mockJob);
      expect(service.findById).toHaveBeenCalledWith('job-001');
    });
  });

  describe('findByEntityId', () => {
    it('should return jobs for an entity', async () => {
      mockProcessingJobsService.findByEntityId.mockResolvedValue([mockJob]);

      const result = await controller.findByEntityId('document', 'doc-001');

      expect(result).toEqual([mockJob]);
      expect(service.findByEntityId).toHaveBeenCalledWith('document', 'doc-001');
    });
  });

  describe('create', () => {
    it('should create a new processing job', async () => {
      const createDto = {
        type: 'ocr',
        entityType: 'document',
        entityId: 'doc-002',
        options: { languages: ['eng'] },
      };
      mockProcessingJobsService.create.mockResolvedValue({ ...mockJob, ...createDto, status: 'pending' });

      const result = await controller.create(createDto, 'user-001');

      expect(result).toHaveProperty('type', createDto.type);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-001');
    });
  });

  describe('cancel', () => {
    it('should cancel a processing job', async () => {
      mockProcessingJobsService.cancel.mockResolvedValue({ ...mockJob, status: 'cancelled' });

      const result = await controller.cancel('job-001');

      expect(result.status).toBe('cancelled');
      expect(service.cancel).toHaveBeenCalledWith('job-001');
    });
  });

  describe('retry', () => {
    it('should retry a failed processing job', async () => {
      const failedJob = { ...mockJob, status: 'failed', error: 'Processing error' };
      mockProcessingJobsService.retry.mockResolvedValue({ ...failedJob, status: 'pending', error: null });

      const result = await controller.retry('job-001');

      expect(result.status).toBe('pending');
      expect(service.retry).toHaveBeenCalledWith('job-001');
    });
  });

  describe('getStatus', () => {
    it('should return job status', async () => {
      mockProcessingJobsService.getStatus.mockResolvedValue({
        status: 'processing',
        progress: 50,
        message: 'Processing page 5 of 10',
      });

      const result = await controller.getStatus('job-001');

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('progress');
      expect(service.getStatus).toHaveBeenCalledWith('job-001');
    });
  });

  describe('getProgress', () => {
    it('should return job progress', async () => {
      mockProcessingJobsService.getProgress.mockResolvedValue({
        progress: 75,
        currentStep: 'Extracting text',
        estimatedTimeRemaining: 30,
      });

      const result = await controller.getProgress('job-001');

      expect(result).toHaveProperty('progress', 75);
      expect(service.getProgress).toHaveBeenCalledWith('job-001');
    });
  });

  describe('getStats', () => {
    it('should return processing statistics', async () => {
      mockProcessingJobsService.getStats.mockResolvedValue({
        total: 100,
        pending: 10,
        processing: 5,
        completed: 80,
        failed: 5,
        avgProcessingTime: 120,
      });

      const result = await controller.getStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('completed');
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getQueue', () => {
    it('should return pending jobs in queue', async () => {
      mockProcessingJobsService.getQueue.mockResolvedValue([
        { ...mockJob, status: 'pending', position: 1 },
        { ...mockJob, id: 'job-002', status: 'pending', position: 2 },
      ]);

      const result = await controller.getQueue();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(service.getQueue).toHaveBeenCalled();
    });
  });

  describe('clearCompleted', () => {
    it('should clear completed jobs', async () => {
      mockProcessingJobsService.clearCompleted.mockResolvedValue({
        deleted: 50,
        message: '50 completed jobs cleared',
      });

      const result = await controller.clearCompleted();

      expect(result).toHaveProperty('deleted', 50);
      expect(service.clearCompleted).toHaveBeenCalled();
    });
  });
});
