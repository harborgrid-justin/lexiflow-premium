import { ApiProperty } from '@nestjs/swagger';
import { SearchEntityType } from './search-query.dto';

export class SearchHighlight {
  @ApiProperty({ description: 'Field name where match was found' })
  field: string;

  @ApiProperty({ description: 'Matched text with highlighting' })
  snippet: string;
}

export class SearchResultItem {
  @ApiProperty({ description: 'Entity ID' })
  id: string;

  @ApiProperty({ description: 'Entity type', enum: SearchEntityType })
  entityType: SearchEntityType;

  @ApiProperty({ description: 'Title or name of the entity' })
  title: string;

  @ApiProperty({ description: 'Brief description or excerpt' })
  description?: string;

  @ApiProperty({ description: 'Relevance score' })
  score: number;

  @ApiProperty({ description: 'Highlighted matches', type: [SearchHighlight] })
  highlights: SearchHighlight[];

  @ApiProperty({ description: 'Additional metadata' })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;
}

export class SearchResultDto {
  @ApiProperty({ description: 'Search results', type: [SearchResultItem] })
  results: SearchResultItem[];

  @ApiProperty({ description: 'Total number of results' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Search query used' })
  query: string;

  @ApiProperty({ description: 'Search execution time in ms' })
  executionTime: number;

  @ApiProperty({ description: 'Facets for filtering' })
  facets?: {
    entityTypes?: { [key: string]: number };
    practiceAreas?: { [key: string]: number };
    statuses?: { [key: string]: number };
  };
}

export class SearchSuggestionItem {
  @ApiProperty({ description: 'Suggested text' })
  text: string;

  @ApiProperty({ description: 'Suggestion type' })
  type: string;

  @ApiProperty({ description: 'Relevance score' })
  score: number;

  @ApiProperty({ description: 'Additional context' })
  context?: string;
}

export class SearchSuggestionsResultDto {
  @ApiProperty({ description: 'Search suggestions', type: [SearchSuggestionItem] })
  suggestions: SearchSuggestionItem[];

  @ApiProperty({ description: 'Query used for suggestions' })
  query: string;
}

export class ReindexResultDto {
  @ApiProperty({ description: 'Reindex success status' })
  success: boolean;

  @ApiProperty({ description: 'Number of records indexed' })
  recordsIndexed: number;

  @ApiProperty({ description: 'Entity types reindexed' })
  entityTypes: string[];

  @ApiProperty({ description: 'Time taken in ms' })
  duration: number;

  @ApiProperty({ description: 'Status message' })
  message: string;
}
