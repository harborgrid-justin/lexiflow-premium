import { IsString, IsArray, IsNumber, IsOptional, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetEmbeddingsQueryDto {
  @ApiPropertyOptional({ description: 'Entity type filter' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID filter' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Model name filter' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class StoreAiOpsEmbeddingDto {
  @ApiProperty({ description: 'Entity type' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Embedding vector', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  embedding: number[];

  @ApiProperty({ description: 'Model name' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ description: 'Metadata', type: Object })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class SearchSimilarDto {
  @ApiProperty({ description: 'Query embedding', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  embedding: number[];

  @ApiPropertyOptional({ description: 'Max results', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
