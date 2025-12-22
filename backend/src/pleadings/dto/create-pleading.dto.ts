import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  IsArray,
  IsDateString,
} from 'class-validator';
import { PleadingType, PleadingStatus } from '../entities/pleading.entity';

export class CreatePleadingDto {
  @ApiProperty({ description: 'Pleading title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Pleading description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PleadingType, description: 'Pleading type' })
  @IsEnum(PleadingType)
  @IsNotEmpty()
  type!: PleadingType;

  @ApiProperty({ description: 'Case ID' })
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @ApiPropertyOptional({ description: 'Associated document ID' })
  @IsUUID()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional({ enum: PleadingStatus, description: 'Pleading status', default: PleadingStatus.DRAFT })
  @IsEnum(PleadingStatus)
  @IsOptional()
  status?: PleadingStatus;

  @ApiPropertyOptional({ description: 'Court name' })
  @IsString()
  @IsOptional()
  courtName?: string;

  @ApiPropertyOptional({ description: 'Case number' })
  @IsString()
  @IsOptional()
  caseNumber?: string;

  @ApiPropertyOptional({ description: 'Docket number' })
  @IsString()
  @IsOptional()
  docketNumber?: string;

  @ApiPropertyOptional({ description: 'Hearing date' })
  @IsDateString()
  @IsOptional()
  hearingDate?: string;

  @ApiPropertyOptional({ description: 'Judge name' })
  @IsString()
  @IsOptional()
  judge?: string;

  @ApiPropertyOptional({ description: 'Filed by' })
  @IsString()
  @IsOptional()
  filedBy?: string;

  @ApiPropertyOptional({ description: 'Date filed' })
  @IsDateString()
  @IsOptional()
  filedDate?: string;

  @ApiPropertyOptional({ description: 'Date served' })
  @IsDateString()
  @IsOptional()
  servedDate?: string;

  @ApiPropertyOptional({ description: 'Service method' })
  @IsString()
  @IsOptional()
  serviceMethod?: string;

  @ApiPropertyOptional({ description: 'Parties involved', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  parties?: string[];

  @ApiPropertyOptional({ description: 'Summary of pleading' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom metadata fields' })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;
}
