import { Test, TestingModule } from '@nestjs/testing';
import { PartiesService } from './parties.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Party } from './entities/party.entity';

describe('PartiesService', () => {
  let service: PartiesService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartiesService,
        {
          provide: getRepositoryToken(Party),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByCaseId', () => {
    it('should return parties for a case', async () => {
      const mockParties = [{ id: 'party-001', caseId: 'case-001', name: 'John Doe' }];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockParties);

      const result = await service.findAllByCaseId('case-001');

      expect(result).toEqual(mockParties);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
