import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchResult = {
    cases: [{ id: 'case-001', title: 'Smith v. Jones', type: 'civil' }],
    documents: [{ id: 'doc-001', title: 'Contract.pdf', caseId: 'case-001' }],
    parties: [{ id: 'party-001', name: 'John Smith', type: 'plaintiff' }],
    total: 3,
  };

  const mockSearchService = {
    search: jest.fn(),
    searchCases: jest.fn(),
    searchDocuments: jest.fn(),
    searchParties: jest.fn(),
    searchAll: jest.fn(),
    getSuggestions: jest.fn(),
    getRecentSearches: jest.fn(),
    saveSearch: jest.fn(),
    deleteSearch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockSearchService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return search results', async () => {
      mockSearchService.search.mockResolvedValue(mockSearchResult);

      const result = await controller.search({
        query: 'Smith',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('cases');
      expect(result).toHaveProperty('documents');
      expect(service.search).toHaveBeenCalled();
    });
  });

  describe('searchCases', () => {
    it('should search only cases', async () => {
      mockSearchService.searchCases.mockResolvedValue({
        data: mockSearchResult.cases,
        total: 1,
      });

      const result = await controller.searchCases({
        query: 'Smith',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(service.searchCases).toHaveBeenCalled();
    });
  });

  describe('searchDocuments', () => {
    it('should search only documents', async () => {
      mockSearchService.searchDocuments.mockResolvedValue({
        data: mockSearchResult.documents,
        total: 1,
      });

      const result = await controller.searchDocuments({
        query: 'Contract',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(service.searchDocuments).toHaveBeenCalled();
    });
  });

  describe('searchParties', () => {
    it('should search only parties', async () => {
      mockSearchService.searchParties.mockResolvedValue({
        data: mockSearchResult.parties,
        total: 1,
      });

      const result = await controller.searchParties({
        query: 'John',
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(service.searchParties).toHaveBeenCalled();
    });
  });

  describe('searchAll', () => {
    it('should search across all entity types', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockSearchResult);

      const result = await controller.searchAll({
        query: 'legal',
        entityTypes: ['cases', 'documents', 'parties'],
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('total');
      expect(service.searchAll).toHaveBeenCalled();
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      mockSearchService.getSuggestions.mockResolvedValue([
        'Smith v. Jones',
        'Smith contract',
        'Smith deposition',
      ]);

      const result = await controller.getSuggestions('Smi');

      expect(result).toBeInstanceOf(Array);
      expect(service.getSuggestions).toHaveBeenCalledWith('Smi');
    });
  });

  describe('getRecentSearches', () => {
    it('should return recent searches for user', async () => {
      mockSearchService.getRecentSearches.mockResolvedValue([
        { query: 'Smith', timestamp: new Date() },
        { query: 'Contract', timestamp: new Date() },
      ]);

      const result = await controller.getRecentSearches('user-001');

      expect(result).toBeInstanceOf(Array);
      expect(service.getRecentSearches).toHaveBeenCalledWith('user-001');
    });
  });

  describe('saveSearch', () => {
    it('should save a search', async () => {
      mockSearchService.saveSearch.mockResolvedValue({
        id: 'saved-001',
        name: 'Important Cases',
        query: 'important',
      });

      const result = await controller.saveSearch({
        name: 'Important Cases',
        query: 'important',
      }, 'user-001');

      expect(result).toHaveProperty('id');
      expect(service.saveSearch).toHaveBeenCalled();
    });
  });

  describe('deleteSearch', () => {
    it('should delete a saved search', async () => {
      mockSearchService.deleteSearch.mockResolvedValue(undefined);

      await controller.deleteSearch('saved-001', 'user-001');

      expect(service.deleteSearch).toHaveBeenCalledWith('saved-001', 'user-001');
    });
  });
});
