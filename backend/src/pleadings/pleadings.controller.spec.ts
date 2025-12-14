import { Test, TestingModule } from '@nestjs/testing';
import { PleadingsController } from './pleadings.controller';
import { PleadingsService } from './pleadings.service';

describe('PleadingsController', () => {
  let controller: PleadingsController;
  let service: PleadingsService;

  const mockPleading = {
    id: 'pleading-001',
    caseId: 'case-001',
    title: 'Motion to Dismiss',
    type: 'Motion',
    status: 'draft',
    content: 'Motion content...',
    filedBy: 'Defendant',
    filedDate: null,
    dueDate: new Date('2024-02-15'),
    hearingDate: new Date('2024-03-01'),
    documentId: 'doc-001',
  };

  const mockPleadingsService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    file: jest.fn(),
    findByType: jest.fn(),
    findByStatus: jest.fn(),
    getUpcomingHearings: jest.fn(),
    getOverduePleadings: jest.fn(),
    attachDocument: jest.fn(),
    setHearingDate: jest.fn(),
    getDueSoon: jest.fn(),
    search: jest.fn(),
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

  describe('findAll', () => {
    it('should return all pleadings', async () => {
      mockPleadingsService.findAll.mockResolvedValue([mockPleading]);

      const result = await controller.findAll();

      expect(result).toEqual([mockPleading]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return pleadings for a case', async () => {
      mockPleadingsService.findByCaseId.mockResolvedValue([mockPleading]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockPleading]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a pleading by id', async () => {
      mockPleadingsService.findById.mockResolvedValue(mockPleading);

      const result = await controller.findById('pleading-001');

      expect(result).toEqual(mockPleading);
      expect(service.findById).toHaveBeenCalledWith('pleading-001');
    });
  });

  describe('create', () => {
    it('should create a new pleading', async () => {
      const createDto = {
        caseId: 'case-001',
        title: 'New Motion',
        type: 'Motion',
        content: 'Motion content...',
      };
      mockPleadingsService.create.mockResolvedValue({ ...mockPleading, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('title', createDto.title);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a pleading', async () => {
      const updateDto = { title: 'Updated Motion Title' };
      mockPleadingsService.update.mockResolvedValue({ ...mockPleading, ...updateDto });

      const result = await controller.update('pleading-001', updateDto);

      expect(result.title).toBe('Updated Motion Title');
      expect(service.update).toHaveBeenCalledWith('pleading-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a pleading', async () => {
      mockPleadingsService.delete.mockResolvedValue(undefined);

      await controller.delete('pleading-001');

      expect(service.delete).toHaveBeenCalledWith('pleading-001');
    });
  });

  describe('file', () => {
    it('should mark pleading as filed', async () => {
      mockPleadingsService.file.mockResolvedValue({
        ...mockPleading,
        status: 'filed',
        filedDate: new Date(),
      });

      const result = await controller.file('pleading-001');

      expect(result.status).toBe('filed');
      expect(result.filedDate).toBeDefined();
      expect(service.file).toHaveBeenCalledWith('pleading-001');
    });
  });

  describe('findByType', () => {
    it('should return pleadings by type', async () => {
      mockPleadingsService.findByType.mockResolvedValue([mockPleading]);

      const result = await controller.findByType('case-001', 'Motion');

      expect(result).toEqual([mockPleading]);
      expect(service.findByType).toHaveBeenCalledWith('case-001', 'Motion');
    });
  });

  describe('findByStatus', () => {
    it('should return pleadings by status', async () => {
      mockPleadingsService.findByStatus.mockResolvedValue([mockPleading]);

      const result = await controller.findByStatus('case-001', 'draft');

      expect(result).toEqual([mockPleading]);
      expect(service.findByStatus).toHaveBeenCalledWith('case-001', 'draft');
    });
  });

  describe('getUpcomingHearings', () => {
    it('should return pleadings with upcoming hearings', async () => {
      mockPleadingsService.getUpcomingHearings.mockResolvedValue([mockPleading]);

      const result = await controller.getUpcomingHearings();

      expect(result).toEqual([mockPleading]);
      expect(service.getUpcomingHearings).toHaveBeenCalled();
    });
  });

  describe('getOverduePleadings', () => {
    it('should return overdue pleadings', async () => {
      mockPleadingsService.getOverduePleadings.mockResolvedValue([mockPleading]);

      const result = await controller.getOverduePleadings();

      expect(result).toEqual([mockPleading]);
      expect(service.getOverduePleadings).toHaveBeenCalled();
    });
  });

  describe('attachDocument', () => {
    it('should attach document to pleading', async () => {
      mockPleadingsService.attachDocument.mockResolvedValue({ ...mockPleading, documentId: 'doc-002' });

      const result = await controller.attachDocument('pleading-001', { documentId: 'doc-002' });

      expect(result.documentId).toBe('doc-002');
      expect(service.attachDocument).toHaveBeenCalledWith('pleading-001', 'doc-002');
    });
  });

  describe('setHearingDate', () => {
    it('should set hearing date', async () => {
      const hearingDate = new Date('2024-04-01');
      mockPleadingsService.setHearingDate.mockResolvedValue({ ...mockPleading, hearingDate });

      const result = await controller.setHearingDate('pleading-001', { hearingDate });

      expect(result.hearingDate).toEqual(hearingDate);
      expect(service.setHearingDate).toHaveBeenCalledWith('pleading-001', hearingDate);
    });
  });

  describe('getDueSoon', () => {
    it('should return pleadings due soon', async () => {
      mockPleadingsService.getDueSoon.mockResolvedValue([mockPleading]);

      const result = await controller.getDueSoon(7);

      expect(result).toEqual([mockPleading]);
      expect(service.getDueSoon).toHaveBeenCalledWith(7);
    });
  });

  describe('search', () => {
    it('should search pleadings', async () => {
      mockPleadingsService.search.mockResolvedValue({ data: [mockPleading], total: 1 });

      const result = await controller.search({
        query: 'Motion',
        caseId: 'case-001',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
