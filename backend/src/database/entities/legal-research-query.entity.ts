import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * LegalResearchQuery Entity
 *
 * Tracks legal research queries performed by users, including case law searches,
 * statutory research, citation analysis, and AI-powered legal research.
 * Provides analytics and history for legal research activities.
 */
@Entity('legal_research_queries')
@Index(['userId'])
@Index(['organizationId'])
@Index(['queryType'])
@Index(['jurisdiction'])
@Index(['status'])
@Index(['createdAt'])
export class LegalResearchQuery extends BaseEntity {
  @ApiProperty({ description: 'User ID who performed the query' })
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId!: string;

  @ApiProperty({ description: 'Related case/matter ID', nullable: true })
  @Column({ name: 'case_id', type: 'uuid', nullable: true })
  @Index()
  caseId!: string;

  @ApiProperty({ description: 'Query type', enum: ['case_law', 'statutory', 'citation_analysis', 'shepards', 'full_text', 'ai_research', 'legal_memo', 'precedent_search', 'regulation', 'administrative'] })
  @Column({
    name: 'query_type',
    type: 'enum',
    enum: [
      'case_law',
      'statutory',
      'citation_analysis',
      'shepards',
      'full_text',
      'ai_research',
      'legal_memo',
      'precedent_search',
      'regulation',
      'administrative',
    ],
  })
  queryType!: string;

  @ApiProperty({ description: 'The actual search query text' })
  @Column({ name: 'query_text', type: 'text' })
  queryText!: string;

  @ApiProperty({ description: 'Natural language description of research goal', nullable: true })
  @Column({ name: 'research_goal', type: 'text', nullable: true })
  researchGoal!: string;

  @ApiProperty({ description: 'Jurisdiction(s) searched', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  jurisdiction!: string[];

  @ApiProperty({ description: 'Court level filter', enum: ['supreme', 'appellate', 'district', 'federal', 'state', 'all'], nullable: true })
  @Column({
    name: 'court_level',
    type: 'enum',
    enum: ['supreme', 'appellate', 'district', 'federal', 'state', 'all'],
    nullable: true,
  })
  courtLevel!: string;

  @ApiProperty({ description: 'Date range start for search', nullable: true })
  @Column({ name: 'date_from', type: 'date', nullable: true })
  dateFrom!: Date;

  @ApiProperty({ description: 'Date range end for search', nullable: true })
  @Column({ name: 'date_to', type: 'date', nullable: true })
  dateTo!: Date;

  @ApiProperty({ description: 'Practice areas/topics', type: 'array' })
  @Column({ name: 'practice_areas', type: 'text', array: true, default: '{}' })
  practiceAreas!: string[];

  @ApiProperty({ description: 'Specific citation being analyzed', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  citation!: string;

  @ApiProperty({ description: 'Citation format', enum: ['bluebook', 'alwd', 'universal', 'custom'], nullable: true })
  @Column({
    name: 'citation_format',
    type: 'enum',
    enum: ['bluebook', 'alwd', 'universal', 'custom'],
    nullable: true,
  })
  citationFormat!: string;

  @ApiProperty({ description: 'Advanced search filters (JSON)', nullable: true })
  @Column({ name: 'search_filters', type: 'jsonb', nullable: true })
  searchFilters!: Record<string, unknown>;

  @ApiProperty({ description: 'Boolean search operators used', nullable: true })
  @Column({ name: 'boolean_operators', type: 'text', nullable: true })
  booleanOperators!: string;

  @ApiProperty({ description: 'Number of results returned' })
  @Column({ name: 'results_count', type: 'integer', default: 0 })
  resultsCount!: number;

  @ApiProperty({ description: 'Results data (JSON) - summarized', nullable: true })
  @Column({ name: 'results_summary', type: 'jsonb', nullable: true })
  resultsSummary!: Record<string, unknown>;

  @ApiProperty({ description: 'Top result IDs', type: 'array' })
  @Column({ name: 'top_result_ids', type: 'text', array: true, default: '{}' })
  topResultIds!: string[];

  @ApiProperty({ description: 'Query execution time in milliseconds' })
  @Column({ name: 'execution_time_ms', type: 'integer', default: 0 })
  executionTimeMs!: number;

  @ApiProperty({ description: 'Search engine used', example: 'lexiflow_engine' })
  @Column({ name: 'search_engine', type: 'varchar', length: 100, default: 'lexiflow_engine' })
  searchEngine!: string;

  @ApiProperty({ description: 'External API used (if any)', nullable: true })
  @Column({ name: 'external_api', type: 'varchar', length: 100, nullable: true })
  externalApi!: string;

  @ApiProperty({ description: 'API cost for this query', nullable: true })
  @Column({ name: 'api_cost', type: 'decimal', precision: 10, scale: 4, nullable: true })
  apiCost!: number;

  @ApiProperty({ description: 'Query status', enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'] })
  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: string;

  @ApiProperty({ description: 'Error message if query failed', nullable: true })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string;

  @ApiProperty({ description: 'AI model used for AI-powered research', nullable: true })
  @Column({ name: 'ai_model', type: 'varchar', length: 100, nullable: true })
  aiModel!: string;

  @ApiProperty({ description: 'AI-generated summary of results', nullable: true })
  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary!: string;

  @ApiProperty({ description: 'AI confidence score (0-100)', nullable: true })
  @Column({ name: 'ai_confidence_score', type: 'integer', nullable: true })
  aiConfidenceScore!: number;

  @ApiProperty({ description: 'Shepardization results (JSON)', nullable: true })
  @Column({ name: 'shepard_results', type: 'jsonb', nullable: true })
  shepardResults!: Record<string, unknown>;

  @ApiProperty({ description: 'Treatment analysis (overruled, followed, distinguished, etc.)', nullable: true })
  @Column({ name: 'treatment_analysis', type: 'jsonb', nullable: true })
  treatmentAnalysis!: Record<string, unknown>;

  @ApiProperty({ description: 'Relevance score (0-100)', nullable: true })
  @Column({ name: 'relevance_score', type: 'integer', nullable: true })
  relevanceScore!: number;

  @ApiProperty({ description: 'User rated this query as helpful' })
  @Column({ name: 'user_helpful_rating', type: 'boolean', nullable: true })
  userHelpfulRating!: boolean;

  @ApiProperty({ description: 'User feedback on query results', nullable: true })
  @Column({ name: 'user_feedback', type: 'text', nullable: true })
  userFeedback!: string;

  @ApiProperty({ description: 'Query was saved for future reference' })
  @Column({ name: 'is_saved', type: 'boolean', default: false })
  isSaved!: boolean;

  @ApiProperty({ description: 'Query was shared with team' })
  @Column({ name: 'is_shared', type: 'boolean', default: false })
  isShared!: boolean;

  @ApiProperty({ description: 'Shared with user IDs', type: 'array' })
  @Column({ name: 'shared_with_users', type: 'text', array: true, default: '{}' })
  sharedWithUsers!: string[];

  @ApiProperty({ description: 'Related document IDs that cite these results', type: 'array' })
  @Column({ name: 'cited_in_document_ids', type: 'text', array: true, default: '{}' })
  citedInDocumentIds!: string[];

  @ApiProperty({ description: 'Export format if results were exported', enum: ['pdf', 'word', 'excel', 'csv', 'json'], nullable: true })
  @Column({
    name: 'export_format',
    type: 'enum',
    enum: ['pdf', 'word', 'excel', 'csv', 'json'],
    nullable: true,
  })
  exportFormat!: string;

  @ApiProperty({ description: 'Exported at timestamp', nullable: true })
  @Column({ name: 'exported_at', type: 'timestamp', nullable: true })
  exportedAt!: Date;

  @ApiProperty({ description: 'Billing code for this research (LEDES)', nullable: true })
  @Column({ name: 'billing_code', type: 'varchar', length: 50, nullable: true })
  billingCode!: string;

  @ApiProperty({ description: 'Time spent on this research in minutes', nullable: true })
  @Column({ name: 'time_spent_minutes', type: 'integer', nullable: true })
  timeSpentMinutes!: number;

  @ApiProperty({ description: 'Billable flag' })
  @Column({ name: 'is_billable', type: 'boolean', default: true })
  isBillable!: boolean;

  @ApiProperty({ description: 'Client ID if billable', nullable: true })
  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string;

  @ApiProperty({ description: 'Source of query', enum: ['web_app', 'mobile_app', 'api', 'cli', 'integration'] })
  @Column({
    type: 'enum',
    enum: ['web_app', 'mobile_app', 'api', 'cli', 'integration'],
    default: 'web_app',
  })
  source!: string;

  @ApiProperty({ description: 'IP address of requester', nullable: true })
  @Column({ name: 'ip_address', type: 'varchar', length: 100, nullable: true })
  ipAddress!: string;

  @ApiProperty({ description: 'User agent string', nullable: true })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string;

  @ApiProperty({ description: 'Session ID', nullable: true })
  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId!: string;

  @ApiProperty({ description: 'Tags for categorization', type: 'array' })
  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @ApiProperty({ description: 'Notes about this research query', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ApiProperty({ description: 'Query metadata (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ description: 'Analytics data (JSON)', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  analytics!: Record<string, unknown>;
}
