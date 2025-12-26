import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateCategory, TemplateStatus, TemplateVariable, ClauseReference } from '../entities/template.entity';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TemplateCategory })
  @IsEnum(TemplateCategory)
  category!: TemplateCategory;

  @ApiProperty({ enum: TemplateStatus, default: TemplateStatus.DRAFT })
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ type: 'array', required: false })
  @IsOptional()
  @IsArray()
  variables?: TemplateVariable[];

  @ApiProperty({ type: 'array', required: false })
  @IsOptional()
  @IsArray()
  clauseReferences?: ClauseReference[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courtType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parentTemplateId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
