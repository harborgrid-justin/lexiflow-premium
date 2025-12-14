import { Test, TestingModule } from '@nestjs/testing';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';

describe('MotionsController', () => {
  let controller: MotionsController;
  let service: MotionsService;

  const mockMotion = {
    id: 'motion-001',
    caseId: 'case-001',
    title: 'Motion to Dismiss',
    type: 'dispositive',
    status: 'pending',
    filedBy: 'defendant',
    filedDate: new Date('2024-01-15'),
    hearingDate: new Date('2024-02-15'),
    documentId: 'doc-001',
  };

  const mockMotionsService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    file: jest.fn(),
    setHearingDate: jest.fn(),
    recordRuling: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    getUpcomingHearings: jest.fn(),
    getPendingResponses: jest.fn(),
    attachDocument: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotionsController],
      providers: [{ provide: MotionsService, useValue: mockMotionsService }],
    }).compile();

    controller = module.get<MotionsController>(MotionsController);
    service = module.get<MotionsService>(MotionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all motions', async () => {
      mockMotionsService.findAll.mockResolvedValue([mockMotion]);

      const result = await controller.findAll();

      expect(result).toEqual([mockMotion]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return motions for a case', async () => {
      mockMotionsService.findByCaseId.mockResolvedValue([mockMotion]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockMotion]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a motion by id', async () => {
      mockMotionsService.findById.mockResolvedValue(mockMotion);

      const result = await controller.findById('motion-001');

      expect(result).toEqual(mockMotion);
      expect(service.findById).toHaveBeenCalledWith('motion-001');
    });
  });

  describe('create', () => {
    it('should create a new motion', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'Motion for Summary Judgment',
        type: 'dispositive',
        filedBy: 'plaintiff',
      };
      mockMotionsService.create.mockResolvedValue({ ...mockMotion, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a motion', async () => {
      const updateDto = { title: 'Amended Motion to Dismiss' };
      mockMotionsService.update.mockResolvedValue({ ...mockMotion, ...updateDto });

      const result = await controller.update('motion-001', updateDto);

      expect(result.title).toBe('Amended Motion to Dismiss');
      expect(service.update).toHaveBeenCalledWith('motion-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a motion', async () => {
      mockMotionsService.delete.mockResolvedValue(undefined);

      await controller.delete('motion-001');

      expect(service.delete).toHaveBeenCalledWith('motion-001');
    });
  });

  describe('file', () => {
    it('should mark motion as filed', async () => {
      mockMotionsService.file.mockResolvedValue({
        ...mockMotion,
        status: 'filed',
        filedDate: new Date(),
      });

      const result = await controller.file('motion-001');

      expect(result.status).toBe('filed');
      expect(service.file).toHaveBeenCalledWith('motion-001');
    });
  });

  describe('setHearingDate', () => {
    it('should set hearing date', async () => {
      const hearingDate = new Date('2024-03-01');
      mockMotionsService.setHearingDate.mockResolvedValue({ ...mockMotion, hearingDate });

      const result = await controller.setHearingDate('motion-001', { hearingDate });

      expect(result.hearingDate).toEqual(hearingDate);
      expect(service.setHearingDate).toHaveBeenCalledWith('motion-001', hearingDate);
    });
  });

  describe('recordRuling', () => {
    it('should record ruling', async () => {
      const ruling = { decision: 'granted', reasoning: 'Court finds merit' };
      mockMotionsService.recordRuling.mockResolvedValue({
        ...mockMotion,
        status: 'decided',
        ruling,
      });

      const result = await controller.recordRuling('motion-001', ruling);

      expect(result.status).toBe('decided');
      expect(service.recordRuling).toHaveBeenCalledWith('motion-001', ruling);
    });
  });

  describe('getUpcomingHearings', () => {
    it('should return motions with upcoming hearings', async () => {
      mockMotionsService.getUpcomingHearings.mockResolvedValue([mockMotion]);

      const result = await controller.getUpcomingHearings();

      expect(result).toEqual([mockMotion]);
      expect(service.getUpcomingHearings).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search motions', async () => {
      mockMotionsService.search.mockResolvedValue({ data: [mockMotion], total: 1 });

      const result = await controller.search({
        caseId: 'case-001',
        query: 'dismiss',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
