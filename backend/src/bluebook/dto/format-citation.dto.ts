import { IsString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BluebookCitationType {
  CASE = 'CASE',
  STATUTE = 'STATUTE',
  CONSTITUTION = 'CONSTITUTION',
  REGULATION = 'REGULATION',
  BOOK = 'BOOK',
  LAW_REVIEW = 'LAW_REVIEW',
  JOURNAL = 'JOURNAL',
  WEB_RESOURCE = 'WEB_RESOURCE',
}

export enum CitationFormat {
  FULL = 'FULL',
  SHORT_FORM = 'SHORT_FORM',
  ID = 'ID',
  SUPRA = 'SUPRA',
}

export class FormatCitationDto {
  @ApiProperty({ description: 'Raw citation text to format' })
  @IsString()
  citation!: string;

  @ApiPropertyOptional({ enum: CitationFormat, default: CitationFormat.FULL })
  @IsOptional()
  @IsEnum(CitationFormat)
  format?: CitationFormat;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  italicizeCaseNames?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  useSmallCaps?: boolean;
}

export class BatchFormatDto {
  @ApiProperty({ description: 'Array of citations to format', type: [String] })
  @IsArray()
  @IsString({ each: true })
  citations!: string[];

  @ApiPropertyOptional({ enum: CitationFormat, default: CitationFormat.FULL })
  @IsOptional()
  @IsEnum(CitationFormat)
  format?: CitationFormat;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  italicizeCaseNames?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  useSmallCaps?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;
}

export class ValidateCitationDto {
  @ApiProperty({ description: 'Citation to validate' })
  @IsString()
  citation!: string;

  @ApiPropertyOptional({ enum: BluebookCitationType })
  @IsOptional()
  @IsEnum(BluebookCitationType)
  expectedType?: BluebookCitationType;
}
