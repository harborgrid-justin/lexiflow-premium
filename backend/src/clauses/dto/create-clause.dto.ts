import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ClauseCategory } from '../entities/clause.entity';

export class CreateClauseDto {
  @ApiProperty({ description: 'Clause title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Clause content/text' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Clause description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ClauseCategory, description: 'Clause category' })
  @IsEnum(ClauseCategory)
  @IsNotEmpty()
  category: ClauseCategory;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Variables for template substitution' })
  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Is clause active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
