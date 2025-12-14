import { Test, TestingModule } from '@nestjs/testing';
import { DocketController } from './docket.controller';
import { DocketService } from './docket.service';

describe('DocketController', () => {
  let controller: DocketController;
  let service: DocketService;

  const mockDocketEntry = {
    id: 'docket-001',
    caseId: 'case-001',
    entryNumber: 1,
    entryDate: new Date('2024-01-15'),
    description: 'Complaint filed',
    filedBy: 'Plaintiff',
    documentId: 'doc-001',
    category: 'Pleading',
    isPublic: true,
  };

  const mockDocketService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCategory: jest.fn(),
    findByDateRange: jest.fn(),
    getPublicEntries: jest.fn(),
    attachDocument: jest.fn(),
    detachDocument: jest.fn(),
    getNextEntryNumber: jest.fn(),
    search: jest.fn(),
    getDocketSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocketController],
      providers: [{ provide: DocketService, useValue: mockDocketService }],
    }).compile();

    controller = module.get<DocketController>(DocketController);
    service = module.get<DocketService>(DocketService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all docket entries', async () => {
      mockDocketService.findAll.mockResolvedValue([mockDocketEntry]);

      const result = await controller.findAll();

      expect(result).toEqual([mockDocketEntry]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return docket entries for a case', async () => {
      mockDocketService.findByCaseId.mockResolvedValue([mockDocketEntry]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a docket entry by id', async () => {
      mockDocketService.findById.mockResolvedValue(mockDocketEntry);

      const result = await controller.findById('docket-001');

      expect(result).toEqual(mockDocketEntry);
      expect(service.findById).toHaveBeenCalledWith('docket-001');
    });
  });

  describe('create', () => {
    it('should create a new docket entry', async () => {
      const createDto = {
        caseId: 'case-001',
        description: 'Motion filed',
        filedBy: 'Defendant',
        entryDate: new Date('2024-01-20'),
      };
      mockDocketService.create.mockResolvedValue({ ...mockDocketEntry, ...createDto, entryNumber: 2 });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('entryNumber', 2);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a docket entry', async () => {
      const updateDto = { description: 'Updated description' };
      mockDocketService.update.mockResolvedValue({ ...mockDocketEntry, ...updateDto });

      const result = await controller.update('docket-001', updateDto);

      expect(result.description).toBe('Updated description');
      expect(service.update).toHaveBeenCalledWith('docket-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a docket entry', async () => {
      mockDocketService.delete.mockResolvedValue(undefined);

      await controller.delete('docket-001');

      expect(service.delete).toHaveBeenCalledWith('docket-001');
    });
  });

  describe('findByCategory', () => {
    it('should return entries by category', async () => {
      mockDocketService.findByCategory.mockResolvedValue([mockDocketEntry]);

      const result = await controller.findByCategory('case-001', 'Pleading');

      expect(result).toEqual([mockDocketEntry]);
      expect(service.findByCategory).toHaveBeenCalledWith('case-001', 'Pleading');
    });
  });

  describe('findByDateRange', () => {
    it('should return entries within date range', async () => {
      mockDocketService.findByDateRange.mockResolvedValue([mockDocketEntry]);

      const result = await controller.findByDateRange(
        'case-001',
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );

      expect(result).toEqual([mockDocketEntry]);
      expect(service.findByDateRange).toHaveBeenCalled();
    });
  });

  describe('getPublicEntries', () => {
    it('should return public entries', async () => {
      mockDocketService.getPublicEntries.mockResolvedValue([mockDocketEntry]);

      const result = await controller.getPublicEntries('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(service.getPublicEntries).toHaveBeenCalledWith('case-001');
    });
  });

  describe('attachDocument', () => {
    it('should attach a document to docket entry', async () => {
      mockDocketService.attachDocument.mockResolvedValue({ ...mockDocketEntry, documentId: 'doc-002' });

      const result = await controller.attachDocument('docket-001', { documentId: 'doc-002' });

      expect(result.documentId).toBe('doc-002');
      expect(service.attachDocument).toHaveBeenCalledWith('docket-001', 'doc-002');
    });
  });

  describe('detachDocument', () => {
    it('should detach document from docket entry', async () => {
      mockDocketService.detachDocument.mockResolvedValue({ ...mockDocketEntry, documentId: null });

      const result = await controller.detachDocument('docket-001');

      expect(result.documentId).toBeNull();
      expect(service.detachDocument).toHaveBeenCalledWith('docket-001');
    });
  });

  describe('getNextEntryNumber', () => {
    it('should return next entry number', async () => {
      mockDocketService.getNextEntryNumber.mockResolvedValue(11);

      const result = await controller.getNextEntryNumber('case-001');

      expect(result).toBe(11);
      expect(service.getNextEntryNumber).toHaveBeenCalledWith('case-001');
    });
  });

  describe('search', () => {
    it('should search docket entries', async () => {
      mockDocketService.search.mockResolvedValue({ data: [mockDocketEntry], total: 1 });

      const result = await controller.search({
        caseId: 'case-001',
        query: 'Complaint',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });

  describe('getDocketSummary', () => {
    it('should return docket summary', async () => {
      mockDocketService.getDocketSummary.mockResolvedValue({
        totalEntries: 10,
        byCategory: { Pleading: 5, Motion: 3, Order: 2 },
        latestEntry: mockDocketEntry,
      });

      const result = await controller.getDocketSummary('case-001');

      expect(result).toHaveProperty('totalEntries');
      expect(result).toHaveProperty('byCategory');
      expect(service.getDocketSummary).toHaveBeenCalledWith('case-001');
    });
  });
});
