import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum QueryType {
  CASE_LAW = 'case_law',
  STATUTE = 'statute',
  COMBINED = 'combined',
  CITATION_ANALYSIS = 'citation_analysis',
}

export enum QueryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface SearchFilters {
  jurisdiction?: string[];
  court?: string[];
  dateFrom?: string;
  dateTo?: string;
  topics?: string[];
  keyNumber?: string;
  citationTreatment?: string[];
  isBinding?: boolean;
  sortBy?: 'relevance' | 'date' | 'citations';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  type: 'case_law' | 'statute';
  citation: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  metadata?: Record<string, unknown>;
}

@Entity('research_queries')
@Index(['userId'])
@Index(['queryType'])
@Index(['status'])
@Index(['timestamp'])
export class ResearchQuery extends BaseEntity {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User who performed the search',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ApiProperty({
    example: 'qualified immunity section 1983',
    description: 'Search query text',
  })
  @Column({ type: 'text' })
  query!: string;

  @ApiProperty({
    example: 'case_law',
    description: 'Type of research query',
  })
  @Column({
    name: 'query_type',
    type: 'enum',
    enum: QueryType,
  })
  queryType!: QueryType;

  @ApiProperty({
    example: { jurisdiction: ['Federal'], dateFrom: '2020-01-01' },
    description: 'Applied search filters',
  })
  @Column({ type: 'jsonb', nullable: true })
  filters?: SearchFilters;

  @ApiProperty({
    description: 'Search results',
  })
  @Column({ type: 'jsonb' })
  results!: SearchResult[];

  @ApiProperty({
    example: 42,
    description: 'Total number of results found',
  })
  @Column({ name: 'result_count', type: 'int', default: 0 })
  resultCount!: number;

  @ApiProperty({
    example: 'completed',
    description: 'Status of the query',
  })
  @Column({
    type: 'enum',
    enum: QueryStatus,
    default: QueryStatus.COMPLETED,
  })
  status!: QueryStatus;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'When the query was executed',
  })
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @ApiProperty({
    example: 1250,
    description: 'Query execution time in milliseconds',
  })
  @Column({ name: 'execution_time_ms', type: 'int', nullable: true })
  executionTimeMs?: number;

  @ApiProperty({
    example: 'Important case for litigation strategy',
    description: 'User notes on this research query',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Whether this query is bookmarked',
  })
  @Column({ name: 'is_bookmarked', type: 'boolean', default: false })
  isBookmarked!: boolean;

  @ApiProperty({
    example: ['Case 123', 'Matter 456'],
    description: 'Tags for organizing research',
  })
  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @ApiProperty({
    description: 'Additional metadata',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({
    example: 'Failed to connect to search index',
    description: 'Error message if query failed',
  })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;
}
