import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchService } from './search.service';
import { Case } from '../cases/entities/case.entity';
import { Document } from '../documents/entities/document.entity';
import { SearchQueryDto, SearchEntityType } from './dto/search-query.dto';

describe('SearchService', () => {
  let service: SearchService;
  let caseRepository: Repository<Case>;
  let documentRepository: Repository<Document>;

  const mockCase = {
    id: 'case-001',
    title: 'Smith vs Jones',
    caseNumber: 'CASE-001',
  };

  const mockDocument = {
    id: 'doc-001',
    title: 'Smith Contract',
    filePath: '/path/to/doc.pdf',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Case),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Document),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    caseRepository = module.get<Repository<Case>>(getRepositoryToken(Case));
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search and return results', async () => {
      const queryDto: SearchQueryDto = {
        query: 'Smith',
        entityType: SearchEntityType.ALL,
        page: 1,
        limit: 20,
      };

      const result = await service.search(queryDto);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      const result = await service.getSuggestions({ query: 'Smi', limit: 5 });

      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });
});
