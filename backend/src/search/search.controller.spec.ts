import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { expect, jest } from '@jest/globals';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchResult = {
    results: [],
    total: 0,
    page: 1,
    limit: 10,
  };

  const mockSearchService = {
    search: jest.fn() as jest.Mock,
    getSuggestions: jest.fn() as jest.Mock,
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
    it('should perform a search', async () => {
      (mockSearchService.search as jest.Mock).mockResolvedValue(mockSearchResult);

      const result = await controller.search({ query: 'test', page: 1, limit: 10 });

      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalled();
    });
  });

  describe('searchCases', () => {
    it('should search cases', async () => {
      (mockSearchService.search as jest.Mock).mockResolvedValue(mockSearchResult);

      const result = await controller.searchCases({ query: 'test', page: 1, limit: 10 });

      expect(result).toEqual(mockSearchResult);
      expect(service.search).toHaveBeenCalled();
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      const suggestions = { suggestions: ['test1', 'test2'] };
      (mockSearchService.getSuggestions as jest.Mock).mockResolvedValue(suggestions);

      const result = await controller.getSuggestions({ query: 'tes', limit: 10 });

      expect(result).toEqual(suggestions);
      expect(service.getSuggestions).toHaveBeenCalled();
    });
  });
});
