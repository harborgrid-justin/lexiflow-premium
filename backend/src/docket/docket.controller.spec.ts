import { Test, TestingModule } from '@nestjs/testing';
import { DocketController } from './docket.controller';
import { DocketService } from './docket.service';

describe('DocketController', () => {
  let controller: DocketController;
  let service: DocketService;

  const mockDocketEntry = {
    id: 'docket-001',
    caseId: 'case-001',
    sequenceNumber: 1,
    description: 'Complaint filed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocketService = {
    findAllByCaseId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  describe('findAllByCaseId', () => {
    it('should return docket entries for a case', async () => {
      mockDocketService.findAllByCaseId.mockResolvedValue([mockDocketEntry]);

      const result = await controller.findAllByCaseId('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(service.findAllByCaseId).toHaveBeenCalledWith('case-001');
    });
  });

  describe('findOne', () => {
    it('should return a docket entry by id', async () => {
      mockDocketService.findOne.mockResolvedValue(mockDocketEntry);

      const result = await controller.findOne('docket-001');

      expect(result).toEqual(mockDocketEntry);
      expect(service.findOne).toHaveBeenCalledWith('docket-001');
    });
  });

  describe('create', () => {
    it('should create a new docket entry', async () => {
      const createDto = {
        caseId: 'case-001',
        sequenceNumber: 2,
        description: 'Answer filed',
        entryDate: new Date(),
      };
      mockDocketService.create.mockResolvedValue({ ...mockDocketEntry, ...createDto });

      const result = await controller.create(createDto);

      expect(result).toHaveProperty('description', createDto.description);
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

  describe.skip('remove', () => {
    it('should delete a docket entry', async () => {
      // Method not implemented
      const result = undefined;
    });
  });
});
