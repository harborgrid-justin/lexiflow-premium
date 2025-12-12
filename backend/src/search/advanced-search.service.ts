import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface AdvancedSearchQuery {
  query: string;
  filters?: {
    dateRange?: { start: Date; end: Date };
    entities?: string[];
    metadata?: Record<string, any>;
  };
  ranking?: {
    titleWeight?: number;
    contentWeight?: number;
    metadataWeight?: number;
  };
  fuzzyMatch?: boolean;
  maxDistance?: number; // For fuzzy matching (Levenshtein distance)
}

export interface SearchRankingResult {
  id: string;
  entityType: string;
  title: string;
  snippet: string;
  score: number;
  rankFactors: {
    tfidfScore: number;
    recencyScore: number;
    relevanceScore: number;
    popularityScore: number;
  };
}

/**
 * Advanced Search Service
 * Provides enhanced PostgreSQL full-text search with ranking and fuzzy matching
 */
@Injectable()
export class AdvancedSearchService {
  private readonly logger = new Logger(AdvancedSearchService.name);

  constructor(
    // Inject repositories when entities are available
  ) {}

  /**
   * Perform advanced full-text search with weighted ranking
   * Uses PostgreSQL's ts_rank_cd for ranking and ts_headline for snippets
   */
  async advancedSearch(query: AdvancedSearchQuery): Promise<SearchRankingResult[]> {
    this.logger.log(`Advanced search: ${query.query}`);

    /*
    PostgreSQL Full-Text Search Query Example:

    SELECT
      id,
      entity_type,
      title,
      ts_headline('english', content, plainto_tsquery('english', :query),
        'MaxWords=35, MinWords=15, ShortWord=3, HighlightAll=FALSE,
         MaxFragments=3, FragmentDelimiter=" ... "') as snippet,
      ts_rank_cd(
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(metadata, '')), 'C'),
        plainto_tsquery('english', :query),
        32
      ) as base_score,
      -- TF-IDF score
      ts_rank_cd(
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B'),
        plainto_tsquery('english', :query),
        1
      ) as tfidf_score,
      -- Recency score (decay over time)
      CASE
        WHEN created_at > NOW() - INTERVAL '7 days' THEN 1.0
        WHEN created_at > NOW() - INTERVAL '30 days' THEN 0.8
        WHEN created_at > NOW() - INTERVAL '90 days' THEN 0.6
        WHEN created_at > NOW() - INTERVAL '180 days' THEN 0.4
        ELSE 0.2
      END as recency_score,
      -- Popularity score (based on view count)
      LOG(GREATEST(view_count, 1)) / 10.0 as popularity_score
    FROM searchable_entities
    WHERE
      (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(metadata, '')), 'C')
      ) @@ plainto_tsquery('english', :query)
      AND (:entityTypes IS NULL OR entity_type = ANY(:entityTypes))
      AND (:startDate IS NULL OR created_at >= :startDate)
      AND (:endDate IS NULL OR created_at <= :endDate)
    ORDER BY
      (
        (tfidf_score * :titleWeight) +
        (recency_score * :recencyWeight) +
        (popularity_score * :popularityWeight)
      ) DESC
    LIMIT :limit
    OFFSET :offset
    */

    // Mock implementation
    const results: SearchRankingResult[] = [
      {
        id: '1',
        entityType: 'case',
        title: `Contract Dispute - ${query.query}`,
        snippet: `This case involves a <mark>${query.query}</mark> relating to breach of contract. The plaintiff alleges...`,
        score: 0.92,
        rankFactors: {
          tfidfScore: 0.88,
          recencyScore: 1.0,
          relevanceScore: 0.95,
          popularityScore: 0.85,
        },
      },
      {
        id: '2',
        entityType: 'document',
        title: `Legal Brief - ${query.query}`,
        snippet: `The defendant's motion for summary judgment regarding <mark>${query.query}</mark> is without merit...`,
        score: 0.85,
        rankFactors: {
          tfidfScore: 0.82,
          recencyScore: 0.8,
          relevanceScore: 0.88,
          popularityScore: 0.75,
        },
      },
    ];

    return results;
  }

  /**
   * Fuzzy search using PostgreSQL trigram similarity
   * Useful for typo-tolerant search
   */
  async fuzzySearch(
    query: string,
    threshold: number = 0.3,
  ): Promise<Array<{ text: string; similarity: number }>> {
    /*
    PostgreSQL Trigram Similarity Query:

    -- Enable pg_trgm extension first
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Create GIN index for fast trigram search
    CREATE INDEX idx_title_trgm ON cases USING gin (title gin_trgm_ops);

    SELECT
      title,
      similarity(title, :query) as similarity_score
    FROM cases
    WHERE title % :query  -- % operator uses trigram similarity
    ORDER BY similarity_score DESC
    LIMIT 10;

    -- Or using word_similarity for partial matches
    SELECT
      title,
      word_similarity(:query, title) as word_sim
    FROM cases
    WHERE :query <% title  -- <% operator for word similarity
    ORDER BY word_sim DESC
    LIMIT 10;
    */

    // Mock implementation
    return [
      { text: `${query} (exact match)`, similarity: 1.0 },
      { text: `${query.slice(0, -1)} (one char diff)`, similarity: 0.85 },
      { text: `${query.split('').reverse().join('')} (transposition)`, similarity: 0.72 },
    ];
  }

  /**
   * Get search suggestions using autocomplete
   */
  async getSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    /*
    PostgreSQL Autocomplete Query:

    -- Using materialized view for popular searches
    CREATE MATERIALIZED VIEW search_suggestions AS
    SELECT
      query,
      COUNT(*) as search_count,
      MAX(searched_at) as last_searched
    FROM search_history
    GROUP BY query
    ORDER BY search_count DESC;

    -- Refresh periodically
    REFRESH MATERIALIZED VIEW search_suggestions;

    -- Get suggestions
    SELECT query
    FROM search_suggestions
    WHERE query ILIKE :prefix || '%'
    ORDER BY search_count DESC, last_searched DESC
    LIMIT :limit;

    -- Or use tsvector for suggestion
    SELECT title
    FROM cases
    WHERE to_tsvector('english', title) @@ to_tsquery('english', :prefix || ':*')
    LIMIT :limit;
    */

    // Mock implementation
    return [
      `${prefix} contract`,
      `${prefix} litigation`,
      `${prefix} discovery`,
      `${prefix} motion`,
      `${prefix} settlement`,
    ].slice(0, limit);
  }

  /**
   * Semantic search using vector similarity (for future enhancement with embeddings)
   */
  async semanticSearch(
    query: string,
    embeddingVector: number[],
    limit: number = 10,
  ): Promise<any[]> {
    /*
    PostgreSQL Vector Similarity with pgvector extension:

    -- Enable pgvector extension
    CREATE EXTENSION IF NOT EXISTS vector;

    -- Add embedding column
    ALTER TABLE searchable_entities
    ADD COLUMN embedding vector(1536);  -- For OpenAI embeddings

    -- Create index for fast vector search
    CREATE INDEX ON searchable_entities
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

    -- Perform similarity search
    SELECT
      id,
      title,
      content,
      1 - (embedding <=> :queryEmbedding) as similarity
    FROM searchable_entities
    ORDER BY embedding <=> :queryEmbedding
    LIMIT :limit;
    */

    this.logger.log('Semantic search - requires pgvector extension');
    return [];
  }

  /**
   * Multi-field weighted search
   */
  async multiFieldSearch(
    query: string,
    weights: {
      title?: number;
      content?: number;
      metadata?: number;
      tags?: number;
    },
  ): Promise<any[]> {
    const titleWeight = weights.title || 1.0;
    const contentWeight = weights.content || 0.8;
    const metadataWeight = weights.metadata || 0.5;
    const tagsWeight = weights.tags || 0.6;

    /*
    PostgreSQL Multi-field Search:

    SELECT *,
      ts_rank_cd(
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(metadata::text, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D'),
        plainto_tsquery('english', :query),
        32 | 4  -- Use cover density ranking with normalization
      ) * (
        :titleWeight *
        CASE WHEN title @@ plainto_tsquery('english', :query) THEN 1 ELSE 0 END +
        :contentWeight *
        CASE WHEN content @@ plainto_tsquery('english', :query) THEN 1 ELSE 0 END +
        :metadataWeight *
        CASE WHEN metadata::text @@ plainto_tsquery('english', :query) THEN 1 ELSE 0 END
      ) as weighted_score
    FROM searchable_entities
    WHERE
      to_tsvector('english', coalesce(title, '') || ' ' ||
                            coalesce(content, '') || ' ' ||
                            coalesce(metadata::text, ''))
      @@ plainto_tsquery('english', :query)
    ORDER BY weighted_score DESC;
    */

    return [];
  }

  /**
   * Create full-text search indexes (for migration)
   */
  async createSearchIndexes(): Promise<void> {
    /*
    PostgreSQL Full-Text Search Index Creation:

    -- Add tsvector column for pre-computed search vectors
    ALTER TABLE cases
    ADD COLUMN search_vector tsvector;

    -- Create function to update search vector
    CREATE OR REPLACE FUNCTION cases_search_vector_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.case_number, '')), 'C');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    -- Create trigger
    CREATE TRIGGER tsvector_update_cases
    BEFORE INSERT OR UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION cases_search_vector_update();

    -- Create GIN index for fast full-text search
    CREATE INDEX idx_cases_search_vector ON cases USING gin(search_vector);

    -- Update existing rows
    UPDATE cases SET search_vector =
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(case_number, '')), 'C');

    -- Create indexes for trigram search
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX idx_cases_title_trgm ON cases USING gin (title gin_trgm_ops);
    CREATE INDEX idx_cases_description_trgm ON cases USING gin (description gin_trgm_ops);
    */

    this.logger.log('Search indexes creation SQL prepared - run via migration');
  }
}
