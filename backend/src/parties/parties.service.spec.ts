import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { Party } from './entities/party.entity';

describe('PartiesService', () => {
  let service: PartiesService;
  let repository: Repository<Party>;

  const mockParty = {
    id: 'party-001',
    caseId: 'case-001',
    name: 'John Doe',
    type: 'plaintiff',
    role: 'Lead Plaintiff',
    contactInfo: {
      email: 'john@example.com',
      phone: '555-0100',
      address: '123 Main St',
    },
    attorneyId: 'attorney-001',
    isActive: true,
    metadata: {},
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
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartiesService,
        { provide: getRepositoryToken(Party), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
    repository = module.get<Repository<Party>>(getRepositoryToken(Party));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all parties', async () => {
      mockRepository.find.mockResolvedValue([mockParty]);

      const result = await service.findAll();

      expect(result).toEqual([mockParty]);
    });
  });

  describe('findByCaseId', () => {
    it('should return parties for a case', async () => {
      mockRepository.find.mockResolvedValue([mockParty]);

      const result = await service.findByCaseId('case-001');

      expect(result).toEqual([mockParty]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
      });
    });
  });

  describe('findById', () => {
    it('should return a party by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockParty);

      const result = await service.findById(mockParty.id);

      expect(result).toEqual(mockParty);
    });

    it('should throw NotFoundException if party not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new party', async () => {
      const createDto = {
        caseId: 'case-001',
        name: 'Jane Smith',
        type: 'defendant',
        role: 'Primary Defendant',
      };

      mockRepository.create.mockReturnValue({ ...mockParty, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockParty, ...createDto });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('name', createDto.name);
    });
  });

  describe('update', () => {
    it('should update a party', async () => {
      const updateDto = { name: 'John Smith' };
      mockRepository.findOne.mockResolvedValue(mockParty);
      mockRepository.save.mockResolvedValue({ ...mockParty, ...updateDto });

      const result = await service.update(mockParty.id, updateDto);

      expect(result.name).toBe('John Smith');
    });

    it('should throw NotFoundException if party not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a party', async () => {
      mockRepository.findOne.mockResolvedValue(mockParty);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(mockParty.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockParty.id);
    });
  });

  describe('findByType', () => {
    it('should return parties by type', async () => {
      mockRepository.find.mockResolvedValue([mockParty]);

      const result = await service.findByType('case-001', 'plaintiff');

      expect(result).toEqual([mockParty]);
    });
  });

  describe('assignAttorney', () => {
    it('should assign attorney to party', async () => {
      mockRepository.findOne.mockResolvedValue(mockParty);
      mockRepository.save.mockResolvedValue({ ...mockParty, attorneyId: 'attorney-002' });

      const result = await service.assignAttorney(mockParty.id, 'attorney-002');

      expect(result.attorneyId).toBe('attorney-002');
    });
  });

  describe('updateContactInfo', () => {
    it('should update contact information', async () => {
      const newContact = { email: 'newemail@example.com', phone: '555-0200' };
      mockRepository.findOne.mockResolvedValue(mockParty);
      mockRepository.save.mockResolvedValue({ ...mockParty, contactInfo: newContact });

      const result = await service.updateContactInfo(mockParty.id, newContact);

      expect(result.contactInfo.email).toBe('newemail@example.com');
    });
  });

  describe('setActive', () => {
    it('should set party active status', async () => {
      mockRepository.findOne.mockResolvedValue(mockParty);
      mockRepository.save.mockResolvedValue({ ...mockParty, isActive: false });

      const result = await service.setActive(mockParty.id, false);

      expect(result.isActive).toBe(false);
    });
  });

  describe('search', () => {
    it('should search parties', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockParty], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({
        caseId: 'case-001',
        query: 'John',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
    });
  });
});
