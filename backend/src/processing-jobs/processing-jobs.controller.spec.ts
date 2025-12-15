import { Test, TestingModule } from '@nestjs/testing';
import { ProcessingJobsController } from './processing-jobs.controller';
import { ProcessingJobsService } from './processing-jobs.service';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

describe('ProcessingJobsController', () => {
  let controller: ProcessingJobsController;
  let service: ProcessingJobsService;

  const mockJob = {
    id: 'job-001',
    type: 'OCR',
    status: 'PROCESSING',
    progress: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProcessingJobsService = {
    findAll: jest.fn(),
    getJob: jest.fn(),
    getJobStatus: jest.fn(),
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
      (mockProcessingJobsService.findAll as jest.Mock).mockResolvedValue([mockJob]);

      const result = await controller.findAll();

      expect(result).toEqual([mockJob]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getJob', () => {
    it('should return a job by id', async () => {
      (mockProcessingJobsService.getJobStatus as jest.Mock).mockResolvedValue(mockJob);

      const result = await controller.getJobStatus('job-001');

      expect(result).toEqual(mockJob);
      expect(service.getJobStatus).toHaveBeenCalledWith('job-001');
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const status = { id: 'job-001', status: 'PROCESSING', progress: 50 };
      (mockProcessingJobsService.getJobStatus as jest.Mock).mockResolvedValue(status);

      const result = await controller.getJobStatus('job-001');

      expect(result).toEqual(status);
      expect(service.getJobStatus).toHaveBeenCalledWith('job-001');
    });
  });
});
