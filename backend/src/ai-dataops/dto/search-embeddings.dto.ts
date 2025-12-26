import { IsArray, IsNumber, IsInt, IsOptional, IsString, Min, Max, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchEmbeddingsDto {
  @ApiProperty({ description: 'Query embedding vector', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  embedding!: number[];

  @ApiPropertyOptional({ description: 'Maximum number of results', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
