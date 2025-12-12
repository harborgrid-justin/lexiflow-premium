import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsBoolean,
  IsArray,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CreateCaseDto {
  @ApiProperty({
    description: 'Case title/name',
    example: 'Smith v. Johnson Construction',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Case number or reference identifier',
    example: 'CV-2024-12345',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  caseNumber: string;

  @ApiPropertyOptional({
    description: 'Detailed case description',
    example: 'Contract dispute arising from construction defects in commercial building project',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of case',
    enum: CaseType,
    example: CaseType.LITIGATION,
  })
  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @ApiPropertyOptional({
    description: 'Current case status',
    enum: CaseStatus,
    default: CaseStatus.ACTIVE,
  })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @ApiPropertyOptional({
    description: 'Practice area or legal specialty',
    example: 'Construction Law',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Jurisdiction where case is filed',
    example: 'State of California',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'Court name',
    example: 'Superior Court of Los Angeles County',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  court?: string;

  @ApiPropertyOptional({
    description: 'Presiding judge name',
    example: 'Hon. Margaret Williams',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  judge?: string;

  @ApiPropertyOptional({
    description: 'Date case was filed',
    example: '2024-01-15T00:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  filingDate?: Date;

  @ApiPropertyOptional({
    description: 'Scheduled trial date',
    example: '2025-06-01T00:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialDate?: Date;

  @ApiPropertyOptional({
    description: 'Date case was closed',
    example: '2025-12-15T00:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closeDate?: Date;

  @ApiPropertyOptional({
    description: 'Statute of limitations deadline',
    example: '2026-01-15T00:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  statuteOfLimitations?: Date;

  @ApiPropertyOptional({
    description: 'UUID of assigned team',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @ApiPropertyOptional({
    description: 'UUID of lead/responsible attorney',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  leadAttorneyId?: string;

  @ApiPropertyOptional({
    description: 'UUID of originating attorney',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsOptional()
  originatingAttorneyId?: string;

  @ApiPropertyOptional({
    description: 'UUID of primary client',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Estimated monetary value of case',
    example: 500000.00,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Settlement authority limit',
    example: 300000.00,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  settlementAuthority?: number;

  @ApiPropertyOptional({
    description: 'Contingency fee percentage',
    example: 33.33,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  contingencyFeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Whether case is billable to client',
    default: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether case is confidential',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Whether case is pro bono',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isProBono?: boolean;

  @ApiPropertyOptional({
    description: 'Case tags for categorization',
    type: [String],
    example: ['urgent', 'high-profile', 'settlement-likely'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Custom metadata as JSON object',
    example: { customField1: 'value1', customField2: 'value2' },
    type: 'object',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
