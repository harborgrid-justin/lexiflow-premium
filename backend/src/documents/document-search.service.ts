import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentClassification } from './entities/document-classification.entity';

/**
 * Search Result
 */
export interface SearchResult {
  document: Document;
  score: number;
  highlights?: string[];
  matchedFields?: string[];
}

/**
 * Search Options
 */
export interface SearchOptions {
  query: string;
  fields?: string[];
  filters?: {
    category?: string[];
    tags?: string[];
    dateRange?: {
      start?: Date;
      end?: Date;
    };
    caseId?: string;
    creatorId?: string;
    status?: string[];
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort?: {
    field: string;
    order: 'ASC' | 'DESC';
  };
  fuzzy?: boolean;
  highlightMatches?: boolean;
}

/**
 * Facet Result
 */
export interface FacetResult {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

/**
 * Document Search Service
 *
 * Full-text search with Elasticsearch-compatible API:
 * - Multi-field search
 * - Fuzzy matching
 * - Faceted search
 * - Relevance scoring
 * - Highlighting
 * - Advanced filtering
 *
 * Note: This implementation uses PostgreSQL full-text search.
 * For production, consider integrating Elasticsearch or OpenSearch.
 */
@Injectable()
export class DocumentSearchService {
  private readonly logger = new Logger(DocumentSearchService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentClassification)
    private classificationRepository: Repository<DocumentClassification>,
  ) {}

  /**
   * Search documents
   */
  async search(options: SearchOptions): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
    facets?: FacetResult[];
  }> {
    this.logger.log(`Searching documents with query: ${options.query}`);

    const page = options.pagination?.page || 1;
    const limit = options.pagination?.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    const query = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.creator', 'creator')
      .leftJoinAndSelect('document.case', 'case');

    // Add text search
    if (options.query && options.query.trim()) {
      const searchQuery = options.query.trim();
      const searchFields = options.fields || [
        'title',
        'description',
        'fullTextContent',
      ];

      // Build OR conditions for each field
      const conditions = searchFields.map((field, idx) => {
        if (options.fuzzy) {
          return `document.${field} ILIKE :search${idx}`;
        }
        return `to_tsvector('english', document.${field}) @@ plainto_tsquery('english', :search${idx})`;
      });

      query.andWhere(`(${conditions.join(' OR ')})`, {
        ...Object.fromEntries(
          searchFields.map((_, idx) => [
            `search${idx}`,
            options.fuzzy ? `%${searchQuery}%` : searchQuery,
          ]),
        ),
      });
    }

    // Apply filters
    if (options.filters) {
      if (options.filters.caseId) {
        query.andWhere('document.caseId = :caseId', {
          caseId: options.filters.caseId,
        });
      }

      if (options.filters.creatorId) {
        query.andWhere('document.creatorId = :creatorId', {
          creatorId: options.filters.creatorId,
        });
      }

      if (options.filters.status && options.filters.status.length > 0) {
        query.andWhere('document.status IN (:...statuses)', {
          statuses: options.filters.status,
        });
      }

      if (options.filters.tags && options.filters.tags.length > 0) {
        query.andWhere('document.tags && :tags', {
          tags: options.filters.tags,
        });
      }

      if (options.filters.dateRange) {
        if (options.filters.dateRange.start) {
          query.andWhere('document.createdAt >= :startDate', {
            startDate: options.filters.dateRange.start,
          });
        }
        if (options.filters.dateRange.end) {
          query.andWhere('document.createdAt <= :endDate', {
            endDate: options.filters.dateRange.end,
          });
        }
      }

      // Filter by category (requires join with classification)
      if (options.filters.category && options.filters.category.length > 0) {
        query
          .leftJoin(
            'document_classifications',
            'classification',
            'classification.document_id = document.id',
          )
          .andWhere('classification.category IN (:...categories)', {
            categories: options.filters.category,
          });
      }
    }

    // Apply sorting
    if (options.sort) {
      query.orderBy(
        `document.${options.sort.field}`,
        options.sort.order,
      );
    } else {
      // Default sort by relevance (using created date as proxy)
      query.orderBy('document.createdAt', 'DESC');
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip(offset).take(limit);

    // Execute query
    const documents = await query.getMany();

    // Calculate relevance scores and create search results
    const results: SearchResult[] = documents.map((doc) => ({
      document: doc,
      score: this.calculateRelevanceScore(doc, options.query),
      highlights: options.highlightMatches
        ? this.extractHighlights(doc, options.query)
        : undefined,
      matchedFields: this.getMatchedFields(doc, options.query),
    }));

    // Sort by score if no explicit sort
    if (!options.sort) {
      results.sort((a, b) => b.score - a.score);
    }

    return {
      results,
      total,
      page,
      limit,
    };
  }

  /**
   * Search with facets
   */
  async searchWithFacets(
    options: SearchOptions,
    facetFields: string[],
  ): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    limit: number;
    facets: FacetResult[];
  }> {
    // Get search results
    const searchResults = await this.search(options);

    // Build facets
    const facets: FacetResult[] = [];

    for (const field of facetFields) {
      const facet = await this.buildFacet(field, options);
      if (facet) {
        facets.push(facet);
      }
    }

    return {
      ...searchResults,
      facets,
    };
  }

  /**
   * Suggest search queries (autocomplete)
   */
  async suggest(
    prefix: string,
    field: string = 'title',
    limit: number = 10,
  ): Promise<string[]> {
    const results = await this.documentRepository
      .createQueryBuilder('document')
      .select(`DISTINCT document.${field}`, 'value')
      .where(`document.${field} ILIKE :prefix`, { prefix: `${prefix}%` })
      .limit(limit)
      .getRawMany();

    return results.map((r) => r.value);
  }

  /**
   * Find similar documents
   */
  async findSimilar(
    documentId: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    this.logger.log(`Finding similar documents to ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Use tags and content to find similar documents
    const query = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.creator', 'creator')
      .where('document.id != :documentId', { documentId })
      .andWhere('document.caseId = :caseId', { caseId: document.caseId });

    // Match by tags if available
    if (document.tags && document.tags.length > 0) {
      query.andWhere('document.tags && :tags', { tags: document.tags });
    }

    // Match by type
    query.andWhere('document.type = :type', { type: document.type });

    const similarDocs = await query.take(limit).getMany();

    return similarDocs.map((doc) => ({
      document: doc,
      score: this.calculateSimilarityScore(document, doc),
      matchedFields: ['tags', 'type'],
    }));
  }

  /**
   * Advanced search with boolean operators
   */
  async advancedSearch(
    query: string,
    options?: Omit<SearchOptions, 'query'>,
  ): Promise<{
    results: SearchResult[];
    total: number;
  }> {
    // Parse boolean query (AND, OR, NOT)
    // Simplified implementation - production would use a proper query parser

    const terms = this.parseBooleanQuery(query);

    const baseQuery = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.creator', 'creator');

    // Build WHERE clause from parsed terms
    let whereClause = '';
    const params: Record<string, unknown> = {};

    terms.forEach((term, idx) => {
      const paramKey = `term${idx}`;
      if (term.operator === 'AND') {
        whereClause +=
          whereClause.length > 0
            ? ` AND to_tsvector('english', document.fullTextContent) @@ plainto_tsquery('english', :${paramKey})`
            : `to_tsvector('english', document.fullTextContent) @@ plainto_tsquery('english', :${paramKey})`;
      } else if (term.operator === 'OR') {
        whereClause +=
          whereClause.length > 0
            ? ` OR to_tsvector('english', document.fullTextContent) @@ plainto_tsquery('english', :${paramKey})`
            : `to_tsvector('english', document.fullTextContent) @@ plainto_tsquery('english', :${paramKey})`;
      } else if (term.operator === 'NOT') {
        whereClause += ` AND NOT to_tsvector('english', document.fullTextContent) @@ plainto_tsquery('english', :${paramKey})`;
      }
      params[paramKey] = term.term;
    });

    if (whereClause) {
      baseQuery.where(whereClause, params);
    }

    const [documents, total] = await baseQuery.getManyAndCount();

    const results: SearchResult[] = documents.map((doc) => ({
      document: doc,
      score: this.calculateRelevanceScore(doc, query),
      matchedFields: ['fullTextContent'],
    }));

    return { results, total };
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<{
    totalDocuments: number;
    indexedDocuments: number;
    averageDocumentSize: number;
    topSearchTerms?: string[];
  }> {
    const total = await this.documentRepository.count();
    const indexed = await this.documentRepository.count({
      where: { fullTextContent: ILike('%') as any },
    });

    const avgSize = await this.documentRepository
      .createQueryBuilder('document')
      .select('AVG(document.fileSize)', 'avg')
      .getRawOne();

    return {
      totalDocuments: total,
      indexedDocuments: indexed,
      averageDocumentSize: parseInt(avgSize?.avg || '0'),
    };
  }

  /**
   * Reindex document for search
   */
  async reindexDocument(documentId: string): Promise<void> {
    this.logger.log(`Reindexing document ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // In a real implementation, this would trigger Elasticsearch reindexing
    // For now, we just ensure the full text content is set
    if (!document.fullTextContent) {
      document.fullTextContent = `${document.title} ${document.description || ''}`;
      await this.documentRepository.save(document);
    }
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(document: Document, query: string): number {
    if (!query) return 1.0;

    let score = 0;
    const queryLower = query.toLowerCase();

    // Title match (highest weight)
    if (document.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Description match
    if (document.description?.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Tag match
    if (document.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
      score += 7;
    }

    // Content match
    if (document.fullTextContent?.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Recency boost (newer documents get higher score)
    const daysSinceCreation =
      (Date.now() - document.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - daysSinceCreation / 365);
    score += recencyBoost * 2;

    return Math.min(score, 100);
  }

  /**
   * Calculate similarity score between two documents
   */
  private calculateSimilarityScore(doc1: Document, doc2: Document): number {
    let score = 0;

    // Tag overlap
    if (doc1.tags && doc2.tags) {
      const commonTags = doc1.tags.filter((t) => doc2.tags.includes(t));
      score += (commonTags.length / Math.max(doc1.tags.length, doc2.tags.length)) * 50;
    }

    // Same type
    if (doc1.type === doc2.type) {
      score += 30;
    }

    // Same case
    if (doc1.caseId === doc2.caseId) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Extract highlights from document
   */
  private extractHighlights(document: Document, query: string): string[] {
    const highlights: string[] = [];
    const queryLower = query.toLowerCase();
    const contextLength = 100;

    // Search in content
    if (document.fullTextContent) {
      const content = document.fullTextContent.toLowerCase();
      const index = content.indexOf(queryLower);

      if (index !== -1) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + queryLower.length + contextLength);
        let snippet = document.fullTextContent.substring(start, end);

        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet += '...';

        highlights.push(snippet);
      }
    }

    return highlights;
  }

  /**
   * Get matched fields
   */
  private getMatchedFields(document: Document, query: string): string[] {
    const fields: string[] = [];
    const queryLower = query.toLowerCase();

    if (document.title?.toLowerCase().includes(queryLower)) {
      fields.push('title');
    }
    if (document.description?.toLowerCase().includes(queryLower)) {
      fields.push('description');
    }
    if (document.fullTextContent?.toLowerCase().includes(queryLower)) {
      fields.push('content');
    }
    if (document.tags?.some((t) => t.toLowerCase().includes(queryLower))) {
      fields.push('tags');
    }

    return fields;
  }

  /**
   * Build facet for a field
   */
  private async buildFacet(
    field: string,
    options: SearchOptions,
  ): Promise<FacetResult | null> {
    // Simplified facet implementation
    const query = this.documentRepository.createQueryBuilder('document');

    // Apply same filters as main search (except the facet field itself)
    if (options.filters?.caseId) {
      query.andWhere('document.caseId = :caseId', {
        caseId: options.filters.caseId,
      });
    }

    if (field === 'status') {
      const results = await query
        .select('document.status', 'value')
        .addSelect('COUNT(*)', 'count')
        .groupBy('document.status')
        .getRawMany();

      return {
        field: 'status',
        values: results.map((r) => ({
          value: r.value,
          count: parseInt(r.count),
        })),
      };
    }

    return null;
  }

  /**
   * Parse boolean query
   */
  private parseBooleanQuery(query: string): Array<{
    term: string;
    operator: 'AND' | 'OR' | 'NOT';
  }> {
    // Simplified parser - production would use a proper parser
    const terms: Array<{
      term: string;
      operator: 'AND' | 'OR' | 'NOT';
    }> = [];

    const parts = query.split(/\s+(AND|OR|NOT)\s+/i);
    let currentOperator: 'AND' | 'OR' | 'NOT' = 'AND';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part === 'AND' || part === 'OR' || part === 'NOT') {
        currentOperator = part as 'AND' | 'OR' | 'NOT';
      } else if (part) {
        terms.push({
          term: part,
          operator: currentOperator,
        });
      }
    }

    return terms;
  }
}
