import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsObject,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EmbeddingModelType {
  OPENAI_ADA = 'openai-ada-002',
  OPENAI_EMBEDDING_3_SMALL = 'openai-embedding-3-small',
  OPENAI_EMBEDDING_3_LARGE = 'openai-embedding-3-large',
  COHERE = 'cohere-embed',
  CUSTOM = 'custom',
}

export class CreateVectorEmbeddingDto {
  @ApiProperty({ description: 'Content that was embedded' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Vector embedding values', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  embedding!: number[];

  @ApiProperty({ enum: EmbeddingModelType, description: 'Model used to generate embedding' })
  @IsEnum(EmbeddingModelType)
  @IsNotEmpty()
  modelType!: EmbeddingModelType;

  @ApiPropertyOptional({ description: 'Model version' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  modelVersion?: string;

  @ApiPropertyOptional({ description: 'Source document ID' })
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional({ description: 'Case ID if applicable' })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Chunk index for multi-part documents' })
  @IsNumber()
  @IsOptional()
  chunkIndex?: number;

  @ApiPropertyOptional({ description: 'Entity type (document, case, pleading, etc.)' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
