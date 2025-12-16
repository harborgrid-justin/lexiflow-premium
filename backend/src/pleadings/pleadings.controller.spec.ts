import { Test, TestingModule } from '@nestjs/testing';
import { PleadingsController } from './pleadings.controller';
import { PleadingsService } from './pleadings.service';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

describe('PleadingsController', () => {
  let controller: PleadingsController;
  let service: PleadingsService;

  const mockPleading = {
    id: 'pleading-001',
    caseId: 'case-001',
    title: 'Complaint',
    type: 'COMPLAINT',
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPleadingsService = {
    findByCaseId: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    update: jest.fn() as jest.Mock,
    remove: jest.fn() as jest.Mock,
    findAll: jest.fn() as jest.Mock,
    findOne: jest.fn() as jest.Mock,
    file: jest.fn() as jest.Mock,
    getUpcomingHearings: jest.fn() as jest.Mock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PleadingsController],
      providers: [{ provide: PleadingsService, useValue: mockPleadingsService }],
    }).compile();

    controller = module.get<PleadingsController>(PleadingsController);
    service = module.get<PleadingsService>(PleadingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByCaseId', () => {
    it('should return pleadings for a case', async () => {
      (mockPleadingsService.findByCaseId as jest.Mock).mockResolvedValue([mockPleading] as any);

      const result = await controller.findAll('case-001');

      expect(result).toEqual([mockPleading]);
      expect(service.findAll).toHaveBeenCalledWith('case-001', undefined);
    });
  });

  describe('create', () => {
    it('should create a new pleading', async () => {
      const createDto: any = {
        caseId: 'case-001',
        title: 'Answer',
        type: 'ANSWER',
      };
      (mockPleadingsService.create as jest.Mock).mockResolvedValue({ ...mockPleading, ...createDto } as any);

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a pleading', async () => {
      const updateDto = { title: 'Amended Complaint' };
      (mockPleadingsService.update as jest.Mock).mockResolvedValue({ ...mockPleading, ...updateDto } as any);

      const result = await controller.update('pleading-001', updateDto);

      expect(result.title).toBe('Amended Complaint');
      expect(service.update).toHaveBeenCalledWith('pleading-001', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a pleading', async () => {
      (mockPleadingsService.remove as jest.Mock).mockResolvedValue(undefined as any);

      await controller.remove('pleading-001');

      expect(service.remove).toHaveBeenCalledWith('pleading-001');
    });
  });
});
