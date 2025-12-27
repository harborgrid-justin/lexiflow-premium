import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ClauseCategory } from '@clauses/entities/clause.entity';

export class UpdateClauseDto {
  @ApiPropertyOptional({ description: 'Clause title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Clause content/text' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Clause description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ClauseCategory, description: 'Clause category' })
  @IsEnum(ClauseCategory)
  @IsOptional()
  category?: ClauseCategory;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Variables for template substitution' })
  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Is clause active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
