import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../cases/entities/case.entity';
import { Document } from '../documents/entities/document.entity';

describe('SearchService', () => {
  let service: SearchService;
  let caseRepository: Repository<Case>;
  let documentRepository: Repository<Document>;

  const mockCase = {
    id: 'case-001',
    title: 'Smith v. Johnson',
    caseNumber: 'CASE-2024-001',
    description: 'Personal injury case',
    type: 'Civil',
    status: 'Active',
  };

  const mockDocument = {
    id: 'doc-001',
    title: 'Motion to Dismiss',
    description: 'Motion to dismiss the complaint',
    fullTextContent: 'Legal content of the motion',
    caseId: 'case-001',
  };

  const mockCaseRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockDocumentRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Case), useValue: mockCaseRepository },
        { provide: getRepositoryToken(Document), useValue: mockDocumentRepository },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    caseRepository = module.get<Repository<Case>>(getRepositoryToken(Case));
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search across all entities', async () => {
      const caseQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCase]),
      };

      const documentQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDocument]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(caseQueryBuilder);
      mockDocumentRepository.createQueryBuilder.mockReturnValue(documentQueryBuilder);

      const result = await service.search('Smith');

      expect(result).toHaveProperty('cases');
      expect(result).toHaveProperty('documents');
      expect(result.cases).toEqual([mockCase]);
      expect(result.documents).toEqual([mockDocument]);
    });

    it('should return empty results for no matches', async () => {
      const caseQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      const documentQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(caseQueryBuilder);
      mockDocumentRepository.createQueryBuilder.mockReturnValue(documentQueryBuilder);

      const result = await service.search('nonexistent');

      expect(result.cases).toEqual([]);
      expect(result.documents).toEqual([]);
    });
  });

  describe('searchCases', () => {
    it('should search cases by query', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.searchCases({
        query: 'Smith',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result.data).toEqual([mockCase]);
    });

    it('should filter cases by status', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.searchCases({
        query: 'Smith',
        filters: { status: 'Active' },
        page: 1,
        limit: 10,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter cases by type', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCase], 1]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.searchCases({
        query: 'Smith',
        filters: { type: 'Civil' },
        page: 1,
        limit: 10,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by query', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
      };

      mockDocumentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.searchDocuments({
        query: 'motion',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result.data).toEqual([mockDocument]);
    });

    it('should search documents with full-text search', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
      };

      mockDocumentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.searchDocuments({
        query: 'legal content',
        fullText: true,
        page: 1,
        limit: 10,
      });

      expect(queryBuilder.orWhere).toHaveBeenCalled();
    });

    it('should filter documents by caseId', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
      };

      mockDocumentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.searchDocuments({
        query: 'motion',
        filters: { caseId: 'case-001' },
        page: 1,
        limit: 10,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      const caseQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ title: 'Smith v. Johnson' }]),
      };

      const documentQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ title: 'Motion to Dismiss' }]),
      };

      mockCaseRepository.createQueryBuilder.mockReturnValue(caseQueryBuilder);
      mockDocumentRepository.createQueryBuilder.mockReturnValue(documentQueryBuilder);

      const result = await service.getSuggestions('Smi');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRecentSearches', () => {
    it('should return recent searches for a user', async () => {
      const result = await service.getRecentSearches('user-001');

      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('saveSearch', () => {
    it('should save a search query', async () => {
      const result = await service.saveSearch('user-001', 'Smith');

      expect(result).toBeDefined();
    });
  });

  describe('clearSearchHistory', () => {
    it('should clear search history for a user', async () => {
      await service.clearSearchHistory('user-001');

      const history = await service.getRecentSearches('user-001');
      expect(history).toEqual([]);
    });
  });
});
