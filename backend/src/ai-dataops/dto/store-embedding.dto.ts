import { IsString, IsArray, IsNumber, IsInt, IsOptional, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreEmbeddingDto {
  @ApiProperty({ description: 'Entity type (e.g., case, document, pleading)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Content being embedded' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Vector embedding array', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  embedding: number[];

  @ApiProperty({ description: 'Model name used for embedding' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Embedding dimensions' })
  @IsInt()
  dimensions: number;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  metadata?: Record<string, any>;
}
