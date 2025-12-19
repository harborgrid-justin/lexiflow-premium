import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSearchQueryDto {
  @ApiPropertyOptional({ 
    description: 'User ID performing the search'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ 
    description: 'Search query text',
    example: 'contract dispute'
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ 
    description: 'Entity type being searched',
    example: 'case',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  entityType?: string;

  @ApiPropertyOptional({ 
    description: 'Number of results returned',
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  resultsCount?: number;

  @ApiPropertyOptional({ 
    description: 'Search filters applied'
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Response time in milliseconds'
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  responseTimeMs?: number;
}
