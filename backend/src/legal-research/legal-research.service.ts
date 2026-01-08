import { Injectable, Logger } from '@nestjs/common';
import { CaseLawSearchService, CaseLawSearchQuery } from './case-law-search.service';
import { StatuteSearchService, StatuteSearchQuery } from './statute-search.service';
import { ResearchHistoryService, CreateResearchQueryDto } from './research-history.service';
import { CitationParserService } from './citation-parser.service';
import { QueryType, SearchResult } from './entities/research-query.entity';

export interface CombinedSearchQuery {
  query: string;
  userId: string;
  searchType: 'all' | 'case_law' | 'statute';
  caseLawFilters?: Omit<CaseLawSearchQuery, 'query'>;
  statuteFilters?: Omit<StatuteSearchQuery, 'query'>;
  limit?: number;
  offset?: number;
  saveToHistory?: boolean;
}

export interface CombinedSearchResult {
  caseLaw: SearchResult[];
  statutes: SearchResult[];
  totalResults: number;
  executionTimeMs: number;
  queryId?: string;
}

/**
 * Legal Research Service
 * Main service coordinating case law, statute search, and research history
 */
@Injectable()
export class LegalResearchService {
  private readonly logger = new Logger(LegalResearchService.name);

  constructor(
    private readonly caseLawSearchService: CaseLawSearchService,
    private readonly statuteSearchService: StatuteSearchService,
    private readonly researchHistoryService: ResearchHistoryService,
    private readonly citationParserService: CitationParserService,
  ) {}

  /**
   * Perform combined search across case law and statutes
   */
  async performCombinedSearch(
    searchQuery: CombinedSearchQuery,
  ): Promise<CombinedSearchResult> {
    const startTime = Date.now();
    const { query, userId, searchType, caseLawFilters, statuteFilters, limit = 50, offset = 0, saveToHistory = true } = searchQuery;

    let caseLawResults: SearchResult[] = [];
    let statuteResults: SearchResult[] = [];

    // Search case law
    if (searchType === 'all' || searchType === 'case_law') {
      const caseLawSearchResult = await this.caseLawSearchService.searchCaseLaw({
        query,
        ...caseLawFilters,
        limit,
        offset,
      });

      caseLawResults = caseLawSearchResult.cases.map((caseLaw) => ({
        id: caseLaw.id,
        type: 'case_law' as const,
        citation: caseLaw.citation,
        title: caseLaw.title,
        snippet: caseLaw.summary || caseLaw.fullText.substring(0, 300) + '...',
        relevanceScore: caseLaw.citationCount / 100, // Simple relevance based on citations
        metadata: {
          court: caseLaw.court,
          jurisdiction: caseLaw.jurisdiction,
          decisionDate: caseLaw.decisionDate,
          treatmentSignal: caseLaw.treatmentSignal,
          isBinding: caseLaw.isBinding,
        },
      }));
    }

    // Search statutes
    if (searchType === 'all' || searchType === 'statute') {
      const statuteSearchResult = await this.statuteSearchService.searchStatutes({
        query,
        ...statuteFilters,
        limit,
        offset,
      });

      statuteResults = statuteSearchResult.statutes.map((statute) => ({
        id: statute.id,
        type: 'statute' as const,
        citation: `${statute.code} § ${statute.section}`,
        title: statute.title,
        snippet: statute.text.substring(0, 300) + '...',
        relevanceScore: statute.citationCount / 50, // Simple relevance based on citations
        metadata: {
          jurisdiction: statute.jurisdiction,
          type: statute.type,
          effectiveDate: statute.effectiveDate,
          isActive: statute.isActive,
        },
      }));
    }

    const executionTimeMs = Date.now() - startTime;

    // Combine and sort results by relevance
    const allResults = [...caseLawResults, ...statuteResults].sort(
      (a, b) => b.relevanceScore - a.relevanceScore,
    );

    const totalResults = allResults.length;

    // Save to research history if requested
    let queryId: string | undefined;
    if (saveToHistory && userId) {
      try {
        const researchQuery = await this.researchHistoryService.createResearchQuery({
          userId,
          query,
          queryType: this.getQueryType(searchType),
          results: allResults,
          resultCount: totalResults,
          executionTimeMs,
          filters: {
            ...caseLawFilters,
            ...statuteFilters,
          },
        });
        queryId = researchQuery.id;
      } catch (error) {
        this.logger.error('Failed to save research query to history', error);
      }
    }

    this.logger.log(
      `Combined search completed: ${totalResults} results in ${executionTimeMs}ms`,
    );

    return {
      caseLaw: caseLawResults,
      statutes: statuteResults,
      totalResults,
      executionTimeMs,
      queryId,
    };
  }

  /**
   * Search by citation
   * Parse the citation and retrieve the specific case or statute
   */
  async searchByCitation(citation: string, userId?: string): Promise<CombinedSearchResult> {
    const startTime = Date.now();
    const parsed = this.citationParserService.parseCitation(citation);

    let caseLawResults: SearchResult[] = [];
    let statuteResults: SearchResult[] = [];

    if (parsed.type === 'case' && parsed.isValid) {
      try {
        const caseLaw = await this.caseLawSearchService.getCaseLawByCitation(
          parsed.fullCitation,
        );

        caseLawResults = [
          {
            id: caseLaw.id,
            type: 'case_law',
            citation: caseLaw.citation,
            title: caseLaw.title,
            snippet: caseLaw.summary || caseLaw.fullText.substring(0, 300) + '...',
            relevanceScore: 1.0,
            metadata: {
              court: caseLaw.court,
              jurisdiction: caseLaw.jurisdiction,
              decisionDate: caseLaw.decisionDate,
            },
          },
        ];
      } catch (error) {
        this.logger.warn(`Case law not found for citation: ${citation}`);
      }
    } else if (parsed.type === 'statute' && parsed.isValid) {
      try {
        const statute = await this.statuteSearchService.getStatuteByCodeSection(
          parsed.reporter || '',
          parsed.page || '',
        );

        statuteResults = [
          {
            id: statute.id,
            type: 'statute',
            citation: `${statute.code} § ${statute.section}`,
            title: statute.title,
            snippet: statute.text.substring(0, 300) + '...',
            relevanceScore: 1.0,
            metadata: {
              jurisdiction: statute.jurisdiction,
              type: statute.type,
              effectiveDate: statute.effectiveDate,
            },
          },
        ];
      } catch (error) {
        this.logger.warn(`Statute not found for citation: ${citation}`);
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const allResults = [...caseLawResults, ...statuteResults];

    // Save to history if user provided
    let queryId: string | undefined;
    if (userId && allResults.length > 0) {
      try {
        const researchQuery = await this.researchHistoryService.createResearchQuery({
          userId,
          query: citation,
          queryType: QueryType.CITATION_ANALYSIS,
          results: allResults,
          resultCount: allResults.length,
          executionTimeMs,
        });
        queryId = researchQuery.id;
      } catch (error) {
        this.logger.error('Failed to save citation search to history', error);
      }
    }

    return {
      caseLaw: caseLawResults,
      statutes: statuteResults,
      totalResults: allResults.length,
      executionTimeMs,
      queryId,
    };
  }

  /**
   * Get comprehensive citation analysis for a case
   */
  async getCitationAnalysis(caseId: string, userId?: string) {
    const startTime = Date.now();
    const analysis = await this.caseLawSearchService.getCitationAnalysis(caseId);
    const executionTimeMs = Date.now() - startTime;

    // Save to history if user provided
    if (userId) {
      try {
        await this.researchHistoryService.createResearchQuery({
          userId,
          query: `Citation Analysis: ${analysis.citation}`,
          queryType: QueryType.CITATION_ANALYSIS,
          results: [],
          resultCount: analysis.totalCitations,
          executionTimeMs,
          notes: `Shepard's-style analysis for ${analysis.title}`,
        });
      } catch (error) {
        this.logger.error('Failed to save citation analysis to history', error);
      }
    }

    return {
      ...analysis,
      executionTimeMs,
    };
  }

  /**
   * Extract and analyze all citations from text
   */
  async extractAndAnalyzeCitations(text: string, userId?: string) {
    const citations = this.citationParserService.extractCitations(text);

    const results = await Promise.all(
      citations.map(async (citation) => {
        try {
          if (citation.type === 'case') {
            const caseLaw = await this.caseLawSearchService.getCaseLawByCitation(
              citation.fullCitation,
            );
            return {
              citation: citation.fullCitation,
              found: true,
              type: 'case_law',
              data: caseLaw,
            };
          } else if (citation.type === 'statute') {
            const statute = await this.statuteSearchService.getStatuteByCodeSection(
              citation.reporter || '',
              citation.page || '',
            );
            return {
              citation: citation.fullCitation,
              found: true,
              type: 'statute',
              data: statute,
            };
          }
        } catch (error) {
          // Citation not found in database
        }

        return {
          citation: citation.fullCitation,
          found: false,
          type: citation.type,
        };
      }),
    );

    // Save to history if user provided
    if (userId) {
      try {
        await this.researchHistoryService.createResearchQuery({
          userId,
          query: `Citation Extraction: ${citations.length} citations found`,
          queryType: QueryType.CITATION_ANALYSIS,
          results: [],
          resultCount: citations.length,
          notes: `Extracted and analyzed citations from document`,
        });
      } catch (error) {
        this.logger.error('Failed to save citation extraction to history', error);
      }
    }

    return {
      totalCitations: citations.length,
      foundCitations: results.filter((r) => r.found).length,
      results,
    };
  }

  /**
   * Get research recommendations based on a case or statute
   */
  async getResearchRecommendations(
    resourceId: string,
    resourceType: 'case_law' | 'statute',
    limit = 10,
  ) {
    if (resourceType === 'case_law') {
      const [similarCases, citingCases, citedCases] = await Promise.all([
        this.caseLawSearchService.getSimilarCases(resourceId, limit),
        this.caseLawSearchService.getCitingCases(resourceId, limit),
        this.caseLawSearchService.getCitedCases(resourceId, limit),
      ]);

      return {
        similarCases,
        citingCases,
        citedCases,
      };
    } else {
      const [relatedStatutes, crossReferences] = await Promise.all([
        this.statuteSearchService.getRelatedStatutes(resourceId, limit),
        this.statuteSearchService.findCrossReferences(resourceId),
      ]);

      return {
        relatedStatutes,
        crossReferences,
      };
    }
  }

  /**
   * Convert search type to query type
   */
  private getQueryType(searchType: string): QueryType {
    switch (searchType) {
      case 'case_law':
        return QueryType.CASE_LAW;
      case 'statute':
        return QueryType.STATUTE;
      case 'all':
      default:
        return QueryType.COMBINED;
    }
  }

  /**
   * Get popular searches and trending topics
   */
  async getTrendingResearch(limit = 10) {
    const [mostCitedCases, mostCitedStatutes] = await Promise.all([
      this.caseLawSearchService.getMostCitedCases(undefined, limit),
      this.statuteSearchService.getMostCitedStatutes(undefined, limit),
    ]);

    return {
      mostCitedCases,
      mostCitedStatutes,
    };
  }
}
