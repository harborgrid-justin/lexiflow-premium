import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

describe('PartiesController', () => {
  let controller: PartiesController;
  let service: PartiesService;

  const mockParty = {
    id: 'party-001',
    caseId: 'case-001',
    name: 'John Doe',
    type: 'plaintiff',
    role: 'Lead Plaintiff',
    contactInfo: {
      email: 'john@example.com',
      phone: '555-0100',
    },
    attorneyId: 'attorney-001',
    isActive: true,
  };

  const mockPartiesService = {
    findAll: jest.fn(),
    findByCaseId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByType: jest.fn(),
    assignAttorney: jest.fn(),
    updateContactInfo: jest.fn(),
    setActive: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [{ provide: PartiesService, useValue: mockPartiesService }],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
    service = module.get<PartiesService>(PartiesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all parties', async () => {
      mockPartiesService.findAll.mockResolvedValue([mockParty]);

      const result = await controller.findAll();

      expect(result).toEqual([mockParty]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByCaseId', () => {
    it('should return parties for a case', async () => {
      mockPartiesService.findByCaseId.mockResolvedValue([mockParty]);

      const result = await controller.findByCaseId('case-001');

      expect(result).toEqual([mockParty]);
      expect(service.findByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findById', () => {
    it('should return a party by id', async () => {
      mockPartiesService.findById.mockResolvedValue(mockParty);

      const result = await controller.findById('party-001');

      expect(result).toEqual(mockParty);
      expect(service.findById).toHaveBeenCalledWith('party-001');
    });
  });

  describe('create', () => {
    it('should create a new party', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'Jane Smith',
        type: 'defendant',
      };
      mockPartiesService.create.mockResolvedValue({ ...mockParty, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a party', async () => {
      const updateDto = { name: 'John Smith' };
      mockPartiesService.update.mockResolvedValue({ ...mockParty, ...updateDto });

      const result = await controller.update('party-001', updateDto);

      expect(result.name).toBe('John Smith');
      expect(service.update).toHaveBeenCalledWith('party-001', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a party', async () => {
      mockPartiesService.delete.mockResolvedValue(undefined);

      await controller.delete('party-001');

      expect(service.delete).toHaveBeenCalledWith('party-001');
    });
  });

  describe('findByType', () => {
    it('should return parties by type', async () => {
      mockPartiesService.findByType.mockResolvedValue([mockParty]);

      const result = await controller.findByType('case-001', 'plaintiff');

      expect(result).toEqual([mockParty]);
    });
  });

  describe('assignAttorney', () => {
    it('should assign attorney to party', async () => {
      mockPartiesService.assignAttorney.mockResolvedValue({ ...mockParty, attorneyId: 'attorney-002' });

      const result = await controller.assignAttorney('party-001', { attorneyId: 'attorney-002' });

      expect(result.attorneyId).toBe('attorney-002');
    });
  });

  describe('search', () => {
    it('should search parties', async () => {
      mockPartiesService.search.mockResolvedValue({ data: [mockParty], total: 1 });

      const result = await controller.search({ query: 'John', page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
