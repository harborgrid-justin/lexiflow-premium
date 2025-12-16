import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { DocketService } from './docket.service';
import { DocketEntry } from './entities/docket-entry.entity';
import { describe, expect, jest, beforeEach } from '@jest/globals';

describe('DocketService', () => {
  let service: DocketService;
  let repository: Repository<DocketEntry>;

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
    count: jest.fn(),
  } as unknown as Repository<DocketEntry>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocketService,
        { provide: getRepositoryToken(DocketEntry), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DocketService>(DocketService);
    repository = module.get<Repository<DocketEntry>>(getRepositoryToken(DocketEntry));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all docket entries', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([mockDocketEntry]);

      const result = await service.findAll();

      expect(result).toEqual([mockDocketEntry]);
    });
  });

  describe('findAllByCaseId', () => {
    it('should return docket entries for a case', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([mockDocketEntry]);

      const result = await service.findAllByCaseId('case-001');

      expect(result).toEqual([mockDocketEntry]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { caseId: 'case-001' },
        order: { sequenceNumber: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a docket entry by id', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockDocketEntry);

      const result = await service.findOne(mockDocketEntry.id);

      expect(result).toEqual(mockDocketEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new docket entry', async () => {
      const createDto = {
        caseId: 'case-001',
        sequenceNumber: 2,
        description: 'Motion filed',
        filedBy: 'Defendant',
        entryDate: new Date('2024-01-20'),
      };

      mockRepository.create.mockReturnValue({ ...mockDocketEntry, ...createDto } as any);
      (mockRepository.save as jest.Mock).mockResolvedValue({ ...mockDocketEntry, ...createDto } as any);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('sequenceNumber', 2);
    });
  });

  describe('update', () => {
    it('should update a docket entry', async () => {
      const updateDto = { description: 'Updated description' };
      const updatedEntry = { ...mockDocketEntry, ...updateDto };
      (mockRepository.findOne as jest.Mock).mockResolvedValue(updatedEntry as any);
      (mockRepository.update as jest.Mock).mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(mockDocketEntry.id, updateDto);

      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException if entry not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null as any);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a docket entry', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockDocketEntry as any);
      (mockRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockDocketEntry.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockDocketEntry.id);
    });
  });
});
