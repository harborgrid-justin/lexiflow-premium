import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import * as MasterConfig from '../config/master.config';
import { calculateOffset, calculateTotalPages, calculateExecutionTime } from '../common/utils/math.utils';
import {
  SearchQueryDto,
  SearchEntityType,
  SearchSuggestionsDto,
  ReindexDto,
} from './dto/search-query.dto';
import {
  SearchResultDto,
  SearchResultItem,
  SearchHighlight,
  SearchSuggestionsResultDto,
  SearchSuggestionItem,
  ReindexResultDto,
} from './dto/search-result.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    // @InjectRepository(Case) private caseRepository: Repository<any>,
    // @InjectRepository(LegalDocument) private documentRepository: Repository<any>,
    // @InjectRepository(Client) private clientRepository: Repository<any>,
    // These will be injected when entities are available
  ) {}

  /**
   * Perform global search across all entities
   */
  async search(query: SearchQueryDto): Promise<SearchResultDto> {
    const startTime = Date.now();
    const { page = 1, limit = 20, entityType, fuzzy } = query;
    const offset = calculateOffset(page, limit);

    try {
      let results: SearchResultItem[] = [];
      let total = 0;

      switch (entityType) {
        case SearchEntityType.CASE:
          const caseResults = await this.searchCases(query);
          results = caseResults.results;
          total = caseResults.total;
          break;

        case SearchEntityType.DOCUMENT:
          const docResults = await this.searchDocuments(query);
          results = docResults.results;
          total = docResults.total;
          break;

        case SearchEntityType.CLIENT:
          const clientResults = await this.searchClients(query);
          results = clientResults.results;
          total = clientResults.total;
          break;

        case SearchEntityType.ALL:
        default:
          const allResults = await this.searchAll(query);
          results = allResults.results;
          total = allResults.total;
          break;
      }

      const executionTime = calculateExecutionTime(startTime);
      const totalPages = calculateTotalPages(total, limit);

      return {
        results,
        total,
        page,
        limit,
        totalPages,
        query: query.query,
        executionTime,
        facets: await this.generateFacets(results),
      };
    } catch (error) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search cases with full-text search
   */
  async searchCases(query: SearchQueryDto): Promise<{ results: SearchResultItem[]; total: number }> {
    const { query: searchQuery, page = 1, limit = 20, startDate, endDate, status, practiceArea, fuzzy } = query;
    const offset = calculateOffset(page, limit);

    // Mock implementation - replace with actual TypeORM query when entities are available
    // Example PostgreSQL full-text search query:
    /*
    const qb = this.caseRepository
      .createQueryBuilder('case')
      .select([
        'case.id',
        'case.caseNumber',
        'case.title',
        'case.description',
        'case.status',
        'case.practiceArea',
        'case.createdAt',
        'case.updatedAt',
        `ts_rank(
          setweight(to_tsvector('english', coalesce(case.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(case.description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(case.caseNumber, '')), 'C'),
          plainto_tsquery('english', :searchQuery)
        ) as score`,
      ])
      .where(
        new Brackets((qb) => {
          qb.where(
            `(
              setweight(to_tsvector('english', coalesce(case.title, '')), 'A') ||
              setweight(to_tsvector('english', coalesce(case.description, '')), 'B') ||
              setweight(to_tsvector('english', coalesce(case.caseNumber, '')), 'C')
            ) @@ plainto_tsquery('english', :searchQuery)`,
            { searchQuery }
          );
          if (fuzzy) {
            qb.orWhere('case.title ILIKE :fuzzyQuery', { fuzzyQuery: `%${searchQuery}%` });
            qb.orWhere('case.caseNumber ILIKE :fuzzyQuery', { fuzzyQuery: `%${searchQuery}%` });
          }
        })
      );

    if (status) {
      qb.andWhere('case.status = :status', { status });
    }

    if (practiceArea) {
      qb.andWhere('case.practiceArea = :practiceArea', { practiceArea });
    }

    if (startDate) {
      qb.andWhere('case.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('case.createdAt <= :endDate', { endDate });
    }

    const [cases, total] = await qb
      .orderBy('score', 'DESC')
      .addOrderBy('case.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const results = cases.map(c => this.mapCaseToSearchResult(c));
    */

    // Mock data for now
    const results: SearchResultItem[] = [
      {
        id: '1',
        entityType: SearchEntityType.CASE,
        title: `Case matching "${searchQuery}"`,
        description: 'Civil litigation case involving contract disputes',
        score: 0.95,
        highlights: [
          {
            field: 'title',
            snippet: `<mark>${searchQuery}</mark> in title`,
          },
        ],
        metadata: {
          caseNumber: 'CV-2024-001',
          status: status || 'active',
          practiceArea: practiceArea || 'Civil Litigation',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return { results, total: results.length };
  }

  /**
   * Search documents with full-text search
   */
  async searchDocuments(query: SearchQueryDto): Promise<{ results: SearchResultItem[]; total: number }> {
    const { query: searchQuery, page = 1, limit = 20, fuzzy } = query;

    // Mock implementation - replace with actual query
    const results: SearchResultItem[] = [
      {
        id: '1',
        entityType: SearchEntityType.DOCUMENT,
        title: `Document: ${searchQuery}`,
        description: 'Legal document with relevant content',
        score: 0.88,
        highlights: [
          {
            field: 'content',
            snippet: `...text containing <mark>${searchQuery}</mark>...`,
          },
        ],
        metadata: {
          documentType: 'Contract',
          fileSize: 1024000,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return { results, total: results.length };
  }

  /**
   * Search clients
   */
  async searchClients(query: SearchQueryDto): Promise<{ results: SearchResultItem[]; total: number }> {
    const { query: searchQuery, page = 1, limit = 20 } = query;

    // Mock implementation
    const results: SearchResultItem[] = [
      {
        id: '1',
        entityType: SearchEntityType.CLIENT,
        title: `Client: ${searchQuery}`,
        description: 'Corporate client',
        score: 0.92,
        highlights: [
          {
            field: 'name',
            snippet: `<mark>${searchQuery}</mark>`,
          },
        ],
        metadata: {
          clientType: 'corporate',
          since: '2020-01-01',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return { results, total: results.length };
  }

  /**
   * Search across all entity types
   */
  async searchAll(query: SearchQueryDto): Promise<{ results: SearchResultItem[]; total: number }> {
    const [caseResults, docResults, clientResults] = await Promise.all([
      this.searchCases({ ...query, limit: MasterConfig.SEARCH_PREVIEW_LIMIT }),
      this.searchDocuments({ ...query, limit: MasterConfig.SEARCH_PREVIEW_LIMIT }),
      this.searchClients({ ...query, limit: MasterConfig.SEARCH_PREVIEW_LIMIT }),
    ]);

    const allResults = [
      ...caseResults.results,
      ...docResults.results,
      ...clientResults.results,
    ].sort((a, b) => b.score - a.score);

    const offset = calculateOffset(query.page || 1, query.limit || 20);
    const results = allResults.slice(offset, offset + (query.limit || 20));
    const total = allResults.length;

    return { results, total };
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(dto: SearchSuggestionsDto): Promise<SearchSuggestionsResultDto> {
    const { query, limit = 10, entityType } = dto;

    // Mock implementation - would use PostgreSQL trigram similarity
    /*
    SELECT title, similarity(title, :query) as score
    FROM cases
    WHERE title % :query
    ORDER BY score DESC
    LIMIT :limit;
    */

    const suggestions: SearchSuggestionItem[] = [
      {
        text: `${query} contract`,
        type: 'query',
        score: 0.9,
        context: 'Popular search',
      },
      {
        text: `${query} litigation`,
        type: 'query',
        score: 0.85,
        context: 'Recent search',
      },
    ];

    return {
      suggestions,
      query,
    };
  }

  /**
   * Reindex search data
   */
  async reindex(dto: ReindexDto): Promise<ReindexResultDto> {
    const startTime = Date.now();
    const { entityType, force } = dto;

    this.logger.log(`Starting reindex for ${entityType || 'all'} entities`);

    // Mock implementation - would rebuild search indexes
    /*
    if (!entityType || entityType === SearchEntityType.CASE) {
      await this.caseRepository.query(`
        UPDATE cases SET search_vector =
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(case_number, '')), 'C')
      `);
    }
    */

    const duration = calculateExecutionTime(startTime);

    return {
      success: true,
      recordsIndexed: 1000,
      entityTypes: entityType ? [entityType] : ['all'],
      duration,
      message: 'Search index rebuilt successfully',
    };
  }

  /**
   * Generate facets for filtering
   */
  private async generateFacets(results: SearchResultItem[]): Promise<any> {
    const facets = {
      entityTypes: {},
      practiceAreas: {},
      statuses: {},
    };

    results.forEach((result) => {
      // Count by entity type
      facets.entityTypes[result.entityType] = (facets.entityTypes[result.entityType] || 0) + 1;

      // Count by practice area (if available)
      if (result.metadata?.practiceArea) {
        facets.practiceAreas[result.metadata.practiceArea] =
          (facets.practiceAreas[result.metadata.practiceArea] || 0) + 1;
      }

      // Count by status (if available)
      if (result.metadata?.status) {
        facets.statuses[result.metadata.status] = (facets.statuses[result.metadata.status] || 0) + 1;
      }
    });

    return facets;
  }

  /**
   * Map case entity to search result
   */
  private mapCaseToSearchResult(caseEntity: any): SearchResultItem {
    return {
      id: caseEntity.id,
      entityType: SearchEntityType.CASE,
      title: caseEntity.title || caseEntity.caseNumber,
      description: caseEntity.description,
      score: caseEntity.score || 0,
      highlights: this.generateHighlights(caseEntity),
      metadata: {
        caseNumber: caseEntity.caseNumber,
        status: caseEntity.status,
        practiceArea: caseEntity.practiceArea,
      },
      createdAt: caseEntity.createdAt,
      updatedAt: caseEntity.updatedAt,
    };
  }

  /**
   * Generate highlights for matched text
   */
  private generateHighlights(entity: any): SearchHighlight[] {
    // This would use PostgreSQL's ts_headline function
    return [
      {
        field: 'title',
        snippet: entity.title || '',
      },
    ];
  }

  async getRecentSearches(userId: string): Promise<any[]> {
    // Stub implementation - would query search_history table
    return [];
  }

  async saveSearch(userId: string, query: string): Promise<any> {
    // Stub implementation - would save to search_history table
    return { userId, query, timestamp: new Date() };
  }

  async clearSearchHistory(userId: string): Promise<void> {
    // Stub implementation - would delete from search_history table
  }

  async getStats(): Promise<{
    totalIndexed: number;
    totalSearches: number;
    avgSearchTime: number;
    popularSearches: Array<{ query: string; count: number }>;
    indexedByType: Record<string, number>;
  }> {
    this.logger.log('Fetching search statistics');

    return {
      totalIndexed: 15420,
      totalSearches: 1893,
      avgSearchTime: 0.245,
      popularSearches: [
        { query: 'contract disputes', count: 127 },
        { query: 'discovery motion', count: 89 },
        { query: 'summary judgment', count: 76 },
        { query: 'deposition transcripts', count: 64 },
        { query: 'settlement agreement', count: 52 },
      ],
      indexedByType: {
        cases: 2340,
        documents: 8765,
        clients: 1234,
        contacts: 1876,
        tasks: 1205,
      },
    };
  }
}
